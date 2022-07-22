import create from "zustand";
import produce from "immer";
import { SceneSlice } from "robot-scene";
import { ProgrammingSlice, instanceTemplateFromSpec } from "simple-vp";
import { programSpec } from "./programSpec";
import { subscribeWithSelector } from "zustand/middleware";
import { DEFAULTS } from "./defaults";
import * as Comlink from 'comlink';
import SolverWorker from './solver-worker?worker';
import { shape2item, state2tfs } from "./helpers/InfoParsing";
import shallow from 'zustand/shallow'

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
  setUrdf: (urdf) => set({urdf}),
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
  setTfs: (tfstate) => set(state=>{
    const tfs = state2tfs(tfstate)
    // console.log(tfs)
    state.tfs = tfs
  })
});

const immerStore = immer(store);

const useStore = create(subscribeWithSelector(immerStore));

const setTfProxy = Comlink.proxy(useStore.getState().setTfs);

useStore.subscribe((state)=>state.solverWorker,
  async v=>{
    console.log('change in worker instance',v)
    const isValid = await v.urdf;
    // console.log(isValid)
    await v.setStateSetter(setTfProxy)
  }
)

// Handle cascading listeners to update the solver
useStore.subscribe(
  (state) => state.urdf,
  async (v) => {
    console.log("creating a new solver due to change in urdf");
    const worker = useStore.getState().solverWorker;

    const {isValid,links,joints} = await worker.setUrdf(v,setTfProxy);
    // console.log({isValid,links,joints})
    useStore.setState({isValid,links,joints});
  }
);

useStore.subscribe(
  (state) => state.links,
  (links) => {
    let robotMeshes = {};
    links.forEach(link=>{
      link.visuals.forEach((visual,i) => {
        robotMeshes[`visual-${link.name}-${i}`] = shape2item(visual,false)
      })
      link.collisions.forEach((collision,i) => {
        robotMeshes[`collision-${link.name}-${i}`] = shape2item(collision,true)
      })
    })
    useStore.setState({robotMeshes})
  }
)

useStore.subscribe(
  (state) => ({robotMeshes:state.robotMeshes,feedbackMeshes:state.feedbackMeshes}),
  ({robotMeshes,feedbackMeshes})=>{
    useStore.setState({items:{...robotMeshes,...feedbackMeshes}})
  },
  {equalityFn: shallow}
)

useStore.subscribe(state=>state.programData,console.log)


// Finally, set the program based on the spec and solver instance
const solverWorker = new SolverWorker();
const solverWorkerInstance = Comlink.wrap(solverWorker);
useStore.setState({ programSpec, solverWorker: solverWorkerInstance });
// useStore.setState({programData: {'s':instanceTemplateFromSpec('stateType',programSpec.objectTypes.stateType,false)}})

export default useStore;
