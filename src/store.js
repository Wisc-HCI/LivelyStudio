import create from "zustand";
import produce from "immer";
import { SceneSlice } from "robot-scene";
import { ProgrammingSlice } from "simple-vp";
import { programSpec } from "./programSpec";
import { subscribeWithSelector } from "zustand/middleware";
import { DEFAULTS } from "./defaults";
import * as Comlink from 'comlink';
import SolverWorker from './solver-worker?worker';
import { shape2item, state2tfs } from "./helpers/InfoParsing";
import shallow from 'zustand/shallow'
import { allBehaviorProperties, behaviorPropertyLookup } from './Constants'

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

const store = (set, get) => ({
  isValid: false,
  solverWorker: null,
  urdf: DEFAULTS.urdf,
  setUrdf: (urdf) => set({ urdf }),
  rootBounds: [
    { value: 0.0, delta: 0.0 }, { value: 0.0, delta: 0.0 }, { value: 0.0, delta: 0.0 }, // Translational
    { value: 0.0, delta: 0.0 }, { value: 0.0, delta: 0.0 }, { value: 0.0, delta: 0.0 }  // Rotational
  ],
  persistentShapes: [],
  objectives: [],
  goals: [],
  weights: [],
  links: [],
  joints: [],
  ...SceneSlice(set, get), // default robot-scene slice
  robotMeshes: {},
  feedbackMeshes: {},
  items: {
    box: {
      shape: "cube",
      name: "Opacity",
      frame: "world",
      position: { x: 0, y: 0, z: 0 },
      rotation: { w: 1, x: 0, y: 0, z: 0 },
      color: {
        r: 10,
        g: 10,
        b: 10,
        a: (time) => Math.sin(time / 1000) / 2 + 0.5,
      },
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      highlighted: false,
    },
  },
  ...ProgrammingSlice(set, get), // default programming slice for simple-vp,
  setTfs: (tfstate) => set(state => {
    const tfs = state2tfs(tfstate)
    // console.log(tfs)
    state.tfs = tfs
  })
});

const immerStore = immer(store);

const useStore = create(subscribeWithSelector(immerStore));

const setTfProxy = Comlink.proxy(useStore.getState().setTfs);

useStore.subscribe((state) => state.solverWorker,
  async v => {
    console.log('change in worker instance', v)
    const isValid = await v.urdf;
    // console.log(isValid)
    await v.setStateSetter(setTfProxy)
  }
)

//Making new subscriber to track unique objectives------------------------------------------------------
useStore.subscribe(
  (state) => state.programData,
  (v) => {

    //Creates a list of objects (one object for each node in programData)
    const unfilteredList = Object.values(v);

    //Removes any nodes that are not behavior properties
    const filteredList = unfilteredList.filter((item) => allBehaviorProperties.includes(item.type));

    // Map that set into objectives
    const behaviorProperties = filteredList.map((item) => {
      let objective = {
        type: behaviorPropertyLookup[item.type],
        name: '',
        weight: 1
      }
      //Add additional properties if they exist for a given objective
      if (item.properties.link !== undefined) {
        objective.link = item.properties.link
      }
      if (item.properties.link1 !== undefined) {
        objective.link1 = item.properties.link1
      }
      if (item.properties.link2 !== undefined) {
        objective.link2 = item.properties.link2
      }
      if (item.properties.joint !== undefined) {
        objective.joint = item.properties.joint
      }
      if (item.properties.joint1 !== undefined) {
        objective.joint1 = item.properties.joint1
      }
      if (item.properties.joint2 !== undefined) {
        objective.joint2 = item.properties.joint2
      }
      if (item.properties.frequency !== undefined) {
        objective.frequency = item.properties.frequency
      }
      return objective
    });

    //Remove duplicates (Lodash would not work comparing a list of dictionaries)
    let uniqueBPs = [];
    let i;
    let j;

    for (i = behaviorProperties.length - 1; i >= 1; i--) {
      for (j = i - 1; j >= 0; j--) {
        //If the compared objectives are the same, move on to the next objective
        if (JSON.stringify(behaviorProperties[i]) == JSON.stringify(behaviorProperties[j])) {
          break;
        }
        //The current comparison is not equivalent to any others, so it must be unique
        if (j == 0) {
          uniqueBPs.push(behaviorProperties[i])
        }
      }
    }
    //Final objective in list so it must be unique
    if (behaviorProperties.length != 0) {
      uniqueBPs.push(behaviorProperties[0])
    }

    //Printing output
    console.log(uniqueBPs);
  }
)

//Next Steps (Dakota Notes):
//Figure out what the current set of goals are, which depends on which state is selected
//  --> Create a new variable within store called "currentState" which will store the ID of whichever 
//      state node is currently selected

//In store, we need to track the currently slected block (state) and if that changes, then goals would change,
//which would then presumably cause the robot to move
//  --> Based on the "currentState", we can access programData and define a unique set of behavioral properties
//      and determine the relevant goals (we could create a lookup table in constants using the BPs as keys)

//We also need to generate a function that can generate the goal values what will be sent to livelyTK
//  --> I'm not familiar with what the goal values actually are (are they the weights and other such values?)
//-------------------------------------------------------------------------------------------------------


// Handle cascading listeners to update the solver
useStore.subscribe(
  (state) => state.urdf,
  async (v) => {
    console.log("creating a new solver due to change in urdf");
    const worker = useStore.getState().solverWorker;

    const { isValid, links, joints } = await worker.setUrdf(v, setTfProxy);
    // console.log({isValid,links,joints})
    useStore.setState({ isValid, links, joints });
  }
);

useStore.subscribe(
  (state) => state.links,
  (links) => {
    let robotMeshes = {};
    links.forEach(link => {
      link.visuals.forEach((visual, i) => {
        robotMeshes[`visual-${link.name}-${i}`] = shape2item(visual, false)
      })
      link.collisions.forEach((collision, i) => {
        robotMeshes[`collision-${link.name}-${i}`] = shape2item(collision, true)
      })
    })
    useStore.setState({ robotMeshes })
  }
)

useStore.subscribe(
  (state) => ({ robotMeshes: state.robotMeshes, feedbackMeshes: state.feedbackMeshes }),
  ({ robotMeshes, feedbackMeshes }) => {
    useStore.setState({ items: { ...robotMeshes, ...feedbackMeshes } })
  },
  { equalityFn: shallow }
)

//useStore.subscribe(state=>state.programData,console.log)

// Finally, set the program based on the spec and solver instance
const solverWorker = new SolverWorker();
const solverWorkerInstance = Comlink.wrap(solverWorker);
useStore.setState({ programSpec, solverWorker: solverWorkerInstance });

export default useStore;
