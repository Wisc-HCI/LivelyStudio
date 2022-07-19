import create from 'zustand-store-addons';
import produce from "immer";
import { persist } from "zustand/middleware";
import { shape2item, state2tfs } from './InfoParsing';
import { ComputedSlice } from './computed';
import { DEFAULTS } from './defaults';

const immer = (config) => (set, get, api) =>
  config(
    (partial, replace) => {
      const nextState =
        typeof partial === "function" ? produce(partial) : partial;
      return set(nextState, replace);
    },
    get,
    api
);

export const store = (set, get) => ({
    focusItem: null,
    setFocusItem: (type,item) => set(state=>{state.focusItem = {type,item}}),
    clearFocusItem: () => set({focusItem:null}),
    tab: 'urdf',
    setTab: (tab) => set(state=>{state.tab = tab}),
    showMeshes: true,
    setShowMeshes: (show) => set(state=>{state.showMeshes = show}),
    showCollision: true,
    setShowCollision: (show) => set(state=>{state.showCollision = show}),
    showZones: false,
    setShowZones: (show) => set(state=>{state.showZones = show}),
    urdf: '<xml></xml>',
    setUrdf: (urdf) => set(state=>{
        state.urdf = urdf;
        state.showMeshes = true;
        try {
            let solver = new state.livelyTK.Solver(
              state.urdf,
              DEFAULTS.objectives,
              DEFAULTS.rootBounds,
              []
            );
            let links = solver.links;
            let joints = solver.joints;
            state.solver = solver;
            state.links = links;
            state.joints = joints;
            // console.log(links)
            state.tfs = {};
            // console.log(state.items.goal)
            state.persistentShapes = DEFAULTS.persistentShapes;
            state.objectives = DEFAULTS.objectives;
            state.weights = DEFAULTS.weights;
            state.goals = DEFAULTS.goals;
            links.forEach(linkInfo=>{
              if (solver.currentState.frames[linkInfo.name]) {
                state.tfs[linkInfo.name] = {
                  frame: 'world',
                  translation: { 
                    x: solver.currentState.frames[linkInfo.name].translation[0], 
                    y: solver.currentState.frames[linkInfo.name].translation[1], 
                    z: solver.currentState.frames[linkInfo.name].translation[2] 
                  },
                  rotation: { 
                    w: solver.currentState.frames[linkInfo.name].rotation[3], 
                    x: solver.currentState.frames[linkInfo.name].rotation[0], 
                    y: solver.currentState.frames[linkInfo.name].rotation[1], 
                    z: solver.currentState.frames[linkInfo.name].rotation[2] 
                  }
                }
              }
            })

        } catch {
            state.solver = null
        }
    }),
    objectives: DEFAULTS.objectives,
    setObjectives: (objectives) => set(state=>{
      state.objectives = objectives;
      state.weights = objectives.map(objective=>objective.weight);
      try {
        let solver = new state.livelyTK.Solver(
          state.urdf,
          objectives,
          state.rootBounds,
          state.persistentShapes);
        let links = solver.links;
        let joints = solver.joints;
        state.solver = solver;
        state.links = links;
        state.joints = joints;
      } catch {
        state.solver = null;
        state.links = [];
        state.joints = [];
      }
    }),
    rootBounds: DEFAULTS.rootBounds,
    setRootBounds: (rootBounds) => set(state=>{
      state.rootBounds = rootBounds;
      try {
        let solver = new state.livelyTK.Solver(
          state.urdf,
          state.objectives,
          rootBounds,
          state.persistentShapes);
        let links = solver.links;
        let joints = solver.joints;
        state.solver = solver;
        state.links = links;
        state.joints = joints;
      } catch {
        state.solver = null;
        state.links = [];
        state.joints = [];
      }
    }),
    persistentShapes: DEFAULTS.persistentShapes,
    setPersistentShapes: (shapes) => set(state=>{
      state.persistentShapes = shapes;
      try {
        let solver = new state.livelyTK.Solver(state.urdf,[]);
        let links = solver.links;
        let joints = solver.joints;
        state.solver = solver;
        state.links = links;
        state.joints = joints;
      } catch {
        state.solver = null;
        state.links = [];
        state.joints = [];
      }
    }),
    addPersistentShape: (parent, type) => set(state=>{state.persistentShapes.push({...DEFAULTS[type],frame:parent})}),
    shapeUpdates: DEFAULTS.shapeUpdates,
    setShapeUpdates: (updates) => set(state=>{state.shapeUpdates = updates}),
    goals: DEFAULTS.goals,
    setGoals: (goals) => set(state=>{state.goals = goals}),
    updateGoalAtIdx: (goal, idx) => set(state=>{
      state.goals[idx] = goal
    }),
    updateItem: (key, property, value) => set(state=>{state.items[key][property] = value}),
    links: [],
    joints: [],
    livelyTK: null,
    solver: null,
    robotState: null,
    solve: () => {
      let solver = get().solver;
      if (solver && solver.solve) {
        // console.log('solving')
        const goals = get().goals;
        const weights = get().weights;
        const time = Date.now()/1000;
        const shapeUpdates = get().shapeUpdates;
        // console.log({solver, goals, weights, time, shapeUpdates});
        const robotState = solver.solve(
          goals, // Current Goals
          weights, // Current Weights
          time, // Current Time
          shapeUpdates
        ); // Current Transient Shapes
        // console.log({proximity:robotState.proximity})
        // console.log(robotState)
        set({tfs:state2tfs(robotState),robotState})
      }
    },
    loadModule: async () => {
        const livelyTK = await import('@people_and_robots/lively_tk');
        set({livelyTK})
    },
    // Robot-Scene
    items:{},
    lines:{},
    tfs:{},
    lines:{},
    hulls:{},
})

const useStore = create(store,{...ComputedSlice,middleware:[immer, persist]});
useStore.getState().loadModule();
const solveFn = useStore.getState().solve;
setInterval(() => {
  solveFn()
}, 100);



export default useStore;