import * as Comlink from "comlink";
import { DEFAULTS } from "./defaults";
import init, { Solver } from "puppeteer-rust";
import { XMLParser } from "fast-xml-parser";
import { invoke } from '@tauri-apps/api/tauri';

// console.log(xpj)
// const urdfPattern = new XsdPattern(urdfXsd);
// console.log(urdfPattern)
const parser = new XMLParser({ ignoreAttributes: false }, true);

await init();

const obj = {
  running: false,
  // isValid: false,
  // urdf: DEFAULTS.urdf,
  // objectives: DEFAULTS.objectives,
  // rootBounds: DEFAULTS.rootBounds,
  // persistantShapes: DEFAULTS.persistantShapes,
  // stateSetter: (tfstate) => {},
  // setStateSetter(stateSetter) {
  //   console.log("stateSetter", stateSetter);
  //   this.stateSetter = stateSetter;
  // },
  // solver: null,
  // process: null,
  // links: [],
  // joints: [],
  // goals: [],
  // weights: [],
  startSolver(stateSetter) {
    this.running = false;
    console.log("starting solver");
    // while (this.solver && this.running) {
    //   console.log('in loop')
    //   const time = Date.now() / 1000;
    //   let state = this.solver.solve(this.goals, this.weights, time, []);
    //   // console.log(state)
    //   stateSetter(state);
    // }
    this.process = setInterval(async () => {
      if (!this.running) {
        console.log("solving");
        this.running = true;
        // const time = Date.now() / 1000;
        // let state = this.solver.solve(this.goals, this.weights, time, []);
        const state = await invoke('solve');
        // console.log(state)
        stateSetter(state);
        this.running = false;
      }
    }, 50);
  },
  stopSolver() {
    if (this.process) {
      clearInterval(this.process);
    }
    // this.running = false
  },
  // setUrdf(urdf, stateSetter) {
  //   console.log(stateSetter), this.stopSolver();
  //   this.urdf = urdf;
  //   this.objectives = DEFAULTS.objectives;
  //   this.rootBounds = DEFAULTS.rootBounds;
  //   this.persistantShapes = DEFAULTS.persistentShapes;
  //   // const parseResult = urdfPattern.test(this.urdf);
  //   // console.log(parser.parse(this.urdf));
  //   // console.log('parseResult',parseResult)
  //   const result = parser.parse(this.urdf);
  //   if (result.robot) {
  //     try {
  //       this.solver = new Solver(
  //         this.urdf,
  //         this.objectives,
  //         this.rootBounds,
  //         this.persistantShapes
  //       );
  //       this.links = this.solver.links;
  //       this.joints = this.solver.joints;
  //       this.startSolver(stateSetter);
  //       // console.log("started solver loop");
  //     } catch {
  //       console.log("failed to parse");
  //       this.solver = null;
  //     }
  //   } else {
  //     console.log("failed to parse");
  //     this.solver = null;
  //     this.links = [];
  //     this.joints = [];
  //   }
  //   this.isValid = this.solver !== null;
  //   return { isValid: this.isValid, links: this.links, joints: this.joints };
  // },
  // setObjectives(objectives) {
  //   this.stopSolver();
  //   this.objectives = objectives;
  //   // Create a new solver, but rehydrate using the current state
  //   this.solver = new Solver(
  //     this.urdf,
  //     this.objectives,
  //     this.rootBounds,
  //     this.persistantShapes,
  //     this.solver.currentState
  //   );
  //   this.startSolver();
  // },
  // setPersistantShapes(persistantShapes) {
  //   this.stopSolver();
  //   this.persistantShapes = persistantShapes;
  //   // Create a new solver, but rehydrate using the current state
  //   this.solver = new Solver(
  //     this.urdf,
  //     this.objectives,
  //     this.rootBounds,
  //     this.persistantShapes,
  //     this.solver.currentState
  //   );
  //   this.startSolver();
  // },
};

Comlink.expose(obj);
