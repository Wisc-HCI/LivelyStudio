import create from "zustand";
import produce from "immer";
import { SceneSlice } from "robot-scene";
import { ProgrammingSlice } from "simple-vp";
import { programSpec } from "./programSpec";

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
  ...SceneSlice(set, get), // default robot-scene slice
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
  ...ProgrammingSlice(set, get), // default programming slice for simple-vp
});

const immerStore = immer(store);

const useStore = create(immerStore);

useStore.setState({ programSpec });

export default useStore;
