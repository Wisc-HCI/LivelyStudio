import create from 'zustand';
import produce from "immer";
// import { SceneSlice } from 'robot-scene';
import { ProgrammingSlice } from 'simple-vp';
import { programSpec } from './programSpec';

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
    // ...SceneSlice(set,get), // default robot-scene slice
    ...ProgrammingSlice(set,get), // default programming slice for simple-vp
})

const immerStore = immer(store);

const useStore = create(immerStore);

useStore.setState({programSpec})

export default useStore;