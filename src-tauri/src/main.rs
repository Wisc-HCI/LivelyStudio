#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
// mod plugin_lively_tk;
use lively_tk_lib::lively_tk::Solver;
use lively_tk_lib::objectives::objective::*;
use lively_tk_lib::utils::goals::*;
use lively_tk_lib::utils::info::*;
use lively_tk_lib::utils::shapes::*;
use lively_tk_lib::utils::state::State;
use serde::{Deserialize, Serialize};
use std::{
  collections::HashMap,
  sync::Mutex,
  thread::{sleep, spawn},
  time::{Instant,Duration},
};
use tauri::Manager;
use std::sync::Arc;
use urdf_rs::read_from_string;

struct Storage(Mutex<HashMap<String,String>>);

// #[derive(Clone)]
struct LivelyHandler {
  pub urdf: String,
  pub solver: Option<Solver>,
  pub last_solved_state: Option<State>,
  pub objectives: HashMap<String,Objective>,
  pub goals: HashMap<String,Goal>,
  pub weights: HashMap<String,f64>,
  pub robot_info: Option<RobotInfo>,
  pub root_bounds: Option<Vec<(f64, f64)>>,
  pub shapes: Vec<Shape>,
  pub initial_time: Instant,
  pub shape_updates: Vec<ShapeUpdate>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct RobotInfo {
  pub links: Vec<LinkInfo>,
  pub joints: Vec<JointInfo>,
}

impl LivelyHandler {
  pub fn new() -> Self {
    return Self {
      urdf: "<xml></xml>".into(),
      solver: None,
      last_solved_state: None,
      objectives: HashMap::new(),
      goals: HashMap::new(),
      weights: HashMap::new(),
      robot_info: None,
      root_bounds: None,
      shapes: vec![],
      initial_time: Instant::now(),
      shape_updates: vec![],
    };
  }

  pub fn solve(&mut self) -> Option<State> {
    // println!("Running solver");
    let elapsed_time = self.initial_time.elapsed();
    let time = elapsed_time.as_secs_f64();
    // println!("Solving {:?} | {:?}",self.goals,self.weights);
    match &mut self.solver {
      Some(solver) => {
        // println!("Solver Valid, solving with {:?} {:?}",self.goals,self.weights);
        // let instant = Instant::now();
        let new_state = solver.solve(
          self.goals.clone(),
          self.weights.clone(),
          time,
          None,
        );
        // println!("{:?}",instant.elapsed());
        // println!("proximity {:?}",solver.get_current_state().proximity);
        self.last_solved_state = Some(new_state)
      }
      None => {
        // println!("Solver Invalid, skipping...")
      }
    }
    self.shape_updates = vec![];
    // println!("Running solver finished");
    return self.last_solved_state.clone();
  }

  pub fn update_solver(&mut self) {
    match read_from_string(&self.urdf.as_str()) {
      Ok(_) => {
        // println!("Creating new solver {:?} | {:?} | {:?}",self.objectives,self.goals,self.weights);
        // let instant = Instant::now();
        let mut solver = Solver::new(
          self.urdf.clone(),
          self.objectives.clone(),
          self.root_bounds.clone(),
          Some(self.shapes.clone()),
          self.last_solved_state.clone(),
          None,
          None,
          None,
          None
        );
        solver.compute_average_distance_table();
        // println!("Created solver");
        self.last_solved_state = Some(solver.get_current_state());
        // println!("Created in {:?}",instant.elapsed());
        let links = solver.robot_model.links.clone();
        let joints = solver.robot_model.joints.clone();
        self.solver = Some(solver);
        self.robot_info = Some(RobotInfo {
          links,
          joints,
        });
      }
      _ => {
        self.solver = None;
        self.last_solved_state = None;
        self.robot_info = None;
      }
    }
    return;
  }

  pub fn update_urdf(&mut self, urdf: String) -> Option<RobotInfo> {
    self.last_solved_state = None;
    self.urdf = urdf;
    self.objectives = HashMap::new();
    self.goals = HashMap::new();
    self.weights = HashMap::new();
    // println!("Updating urdf");
    self.update_solver();
    return self.robot_info.clone();
  }

  pub fn update_objectives_and_goals_and_weights(
    &mut self,
    objectives: HashMap<String,Objective>,
    goals: HashMap<String,Goal>,
    weights: HashMap<String,f64>,
  ) {
    self.objectives = objectives;
    self.goals = goals;
    self.weights = weights;
    self.update_solver();
    return;
  }

  pub fn update_shapes(&mut self, shapes: Vec<Shape>) -> Option<RobotInfo> {
    self.shapes = shapes;
    self.update_solver();
    return self.robot_info.clone();
  }

  pub fn update_goals_and_weights(&mut self, goals: HashMap<String,Goal>, weights: HashMap<String,f64>) {
    self.goals = goals;
    self.weights = weights;
    return;
  }

  pub fn update_root_bounds(&mut self, root_bounds: Vec<(f64, f64)>) {
    self.root_bounds = Some(root_bounds);
    // println!("Updating root bounds");
    self.update_solver();
    return;
  }
}

struct Runner(Mutex<LivelyHandler>);

#[tauri::command]
fn solve(state: tauri::State<Arc<Runner>>) -> Option<State> {
  return state.0.lock().unwrap().solve();
}

#[tauri::command]
fn update_urdf(state: tauri::State<Arc<Runner>>, urdf: String) -> Option<RobotInfo> {
  return state.0.lock().unwrap().update_urdf(urdf);
}

#[tauri::command]
fn update_shapes(state: tauri::State<Arc<Runner>>, shapes: Vec<Shape>) -> Option<RobotInfo> {
  return state.0.lock().unwrap().update_shapes(shapes);
}

#[tauri::command]
fn update_root_bounds(state: tauri::State<Arc<Runner>>, root_bounds: Vec<(f64, f64)>) {
  state.0.lock().unwrap().update_root_bounds(root_bounds);
  return;
}

#[tauri::command]
fn update_objectives_and_goals_and_weights(
  state: tauri::State<Arc<Runner>>,
  objectives: HashMap<String,Objective>,
  goals: HashMap<String,Goal>,
  weights: HashMap<String,f64>
) {
  state
    .0
    .lock()
    .unwrap()
    .update_objectives_and_goals_and_weights(objectives, goals, weights);
  return;
}

#[tauri::command]
fn update_goals_and_weights(
  state: tauri::State<Arc<Runner>>,
  goals: HashMap<String,Goal>,
  weights: HashMap<String,f64>,
) {
  state
    .0
    .lock()
    .unwrap()
    .update_goals_and_weights(goals, weights);
  return;
}

#[tauri::command]
fn set_item(state: tauri::State<Storage>, key: String, value: String) {
  println!("Setting item for {:?}", key);
  state.0.lock().unwrap().insert(key,value);
  return
}

#[tauri::command]
fn get_item(state: tauri::State<Storage>, key: String) -> Option<String> {
  // return state.0.lock().unwrap_or(None)//.get(&key).map(|result| result.clone());
  println!("Getting item for {:?}", key);
  return state.0.lock().unwrap().get(&key).map(|result| result.clone());
}

#[tauri::command]
fn remove_item(state: tauri::State<Storage>, key: String) {
  println!("Deleting item for {:?}", key);
  state.0.lock().unwrap().remove(&key);
  return
}

impl Runner {
  pub fn new() -> Self {
    return Self(Mutex::new(LivelyHandler::new()));
  }
}

fn main() {

  let runner = Arc::new(Runner::new());
  let managed_runner = Arc::clone(&runner);

  tauri::Builder::default()
    // .plugin(plugin_lively_tk::init())
    .setup(|app| {
      let main_window = app.get_window("main").unwrap();
      spawn(move || {
        let loop_runner = Arc::clone(&runner);
        loop {
          // let instant = Instant::now();
          let solution = loop_runner.0.lock().unwrap().solve();
          // println!("{:?}",instant.elapsed());
          main_window.emit("solution-calculated",solution).unwrap();
          sleep(Duration::from_millis(4));
        };
      });
      Ok(())
    })
    .manage(managed_runner)
    .manage(Storage(Mutex::new(HashMap::new())))
    .invoke_handler(tauri::generate_handler![
      solve,
      update_urdf,
      update_shapes,
      update_root_bounds,
      update_objectives_and_goals_and_weights,
      update_goals_and_weights,
      set_item,
      get_item,
      remove_item
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
