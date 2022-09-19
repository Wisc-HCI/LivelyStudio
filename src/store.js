import create from "zustand";
// import produce from "immer";
import { SceneSlice } from "robot-scene";
import { ProgrammingSlice } from "simple-vp";
import { programSpec } from "./programSpec";
import { subscribeWithSelector, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { DEFAULTS } from "./defaults";
import { shape2item, state2Lines, state2tfs } from "./helpers/InfoParsing";
import shallow from "zustand/shallow";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import {
  allBehaviorProperties,
  behaviorPropertyLookup,
  STATE_TYPES,
} from "./Constants";
import {
  mapValues,
  pickBy,
  pick,
  uniqWith,
  isEqual,
  last,
  cloneDeep,
  fromPairs,
  findKey,
} from "lodash";
import { bp2lik, bp2vis, rs2bp } from "./helpers/Conversion";
import { indexOf } from "./helpers/Comparison";
import { Vector3 } from "three";

// import { Timer } from "./Timer";
// import init from "puppeteer-rust";

// const immer = (config) => (set, get, api) =>
//   config(
//     (partial, replace) => {
//       const nextState =
//         typeof partial === "function" ? produce(partial) : partial;
//       return set(nextState, replace);
//     },
//     get,
//     api
//   );

const DEFAULT_OBJECTIVE = {
  type: "SmoothnessMacro",
  name: "SmoothnessMacro",
  weight: 10,
};

const store = (set, get) => ({
  loaded: true,
  setLoaded: (loaded) => {
    // console.log('new loaded',loaded);
    set({ loaded });
    // console.log('new loaded test',get().loaded);
  },
  showCollision: false,
  setShowCollision: (showCollision) => set({ showCollision }),
  currentState: null,
  stateGoals: {},
  stateWeights: {},
  initiateTransition: (fromNode, toNode) =>
    set((state) => {
      // Should do checking to see whether this is a valid transition,
      // and do any relevant interpolations.
      // For now just immediately transition
      console.log(`initiating transition ${fromNode} -> ${toNode}`);
      state.programData[fromNode].selected = false;
      state.programData[toNode].selected = true;
      state.currentState = toNode;
    }),
  teleport: (data,other) => {
    const currentState = get().currentState;
    console.log(other)
    get().initiateTransition(currentState,data.id);
  },
  isValid: false,
  urdf: DEFAULTS.urdf,
  setUrdf: (urdf) => set({ urdf }),
  rootBounds: [
    { value: 0.0, delta: 0.0 },
    { value: 0.0, delta: 0.0 },
    { value: 0.0, delta: 0.0 }, // Translational
    { value: 0.0, delta: 0.0 },
    { value: 0.0, delta: 0.0 },
    { value: 0.0, delta: 0.0 }, // Rotational
  ],
  setRootBound: (value, idx, isValue) =>
    set((state) => {
      state.rootBounds[idx][isValue ? "value" : "delta"] = Number(value);
    }),
  persistentShapes: [],
  objectives: {},
  goals: {},
  weights: {},
  links: [],
  joints: [],
  ...SceneSlice(set, get), // default robot-scene slice
  robotMeshes: {},
  feedbackMeshes: {},
  proximityLines: {},
  texts: {
    onload: {
      value: "Configure URDF to Begin",
      frame: "world",
      position: { x: 0, y: 0, z: (time) => 0.25 * Math.sin(time / 2000) + 0.5 },
      color: { r: 255, g: 255, b: 255, a: 1 },
    },
  },
  ...ProgrammingSlice(set, get), // default programming slice for simple-vp,
  programSpec,
  setTfs: (robotstate) =>
    set((state) => {
      const tfs = state2tfs(robotstate);
      const proximityLines = state2Lines(robotstate);
      // console.log("setting tfs")
      state.tfs = tfs;
      state.proximityLines = proximityLines;
    }),
  setDefault: () =>
    set({
      loaded: true,
      programSpec,
      currentState: "powerOnType-2c880f27-1777-48b8-852e-861cc5c2ed0a",
      programData: {
        "powerOnType-2c880f27-1777-48b8-852e-861cc5c2ed0a": {
          argumentBlockData: [],
          canDelete: false,
          canEdit: true,
          dataType: "INSTANCE",
          editing: undefined,
          id: "powerOnType-2c880f27-1777-48b8-852e-861cc5c2ed0a",
          name: "PowerOn",
          position: { x: 100, y: 0 },
          properties: {},
          refData: null,
          selected: true,
          type: "powerOnType",
        },
      },
    }),
  updateProgramSpec: (links, joints) =>
    set((state) => {
      console.log("updating programSpec");
      const objectTypes = programSpec.objectTypes;
      const jointOptions = joints.map((j) => ({
        label: j.name,
        value: j.name,
      }));
      const linkOptions = links.map((l) => ({ label: l.name, value: l.name }));
      // console.log(objectTypes)
      state.programSpec.objectTypes = mapValues(
        objectTypes,
        (objectType, key) => {
          let newObjectType = cloneDeep(objectType);
          if (allBehaviorProperties.includes(key)) {
            ["link", "link1", "link2"].forEach((prop) => {
              if (newObjectType?.properties[prop] !== undefined) {
                newObjectType.properties[prop].options = linkOptions;
                newObjectType.properties[prop].default =
                  last(linkOptions).value || "";
              }
            });
            ["joint", "joint1", "joint2"].forEach((prop) => {
              if (newObjectType?.properties[prop] !== undefined) {
                newObjectType.properties[prop].options = jointOptions;
                newObjectType.properties[prop].default =
                  last(jointOptions).value || "";
              }
            });
          }
          // console.log('new',newObjectType)
          return newObjectType;
        }
      );
      // set({loaded:true,programSpec:{drawers:programSpec.drawers,objectTypes:newObjectTypes}})
    }),
  onMove: (id, source, worldTransform, localTransform) =>
    set((state) => {
      let bpId = id;
      let shapeFlag = null;
      ['-top','-bottom'].forEach(flag=>{
        if (id.includes(flag)) {
          id = id.replace(flag,'');
          shapeFlag = flag.replace('-','')
        }
      })
      const newBp = rs2bp({current:state.programData[bpId],worldTransform,localTransform,source,flag:shapeFlag});
      if (newBp) {
        state.programData[bpId] = newBp;
      }
      // if (source === "items") {
      //   switch (behaviorPropertyLookup[state.programData[id].type]) {
      //     case "PositionMatch":
      //       state.programData[id] = 
      //       break;
      //     case "OrientationMatch":
      //       state.programData[id].properties.rotation = [

      //       ]
      //   }
      // }
      // console.log(localTransform)
      // state.[source][id].position = {...localTransform.position};
      // state[source][id].rotation = localTransform.quaternion;
      // state[source][id].rotation.x = localTransform.quaternion.x;
      // state[source][id].rotation.y = localTransform.quaternion.y;
      // state[source][id].rotation.z = localTransform.quaternion.z;
      // state[source][id].rotation.w = localTransform.quaternion.w;
      // state[source][id].scale = {...localTransform.scale};
    }),
});

const immerStore = immer(store);

// const persistStore = persist(immerStore,{
//   name:'puppeteer-store',
//   partialize: (state) => ({
//     ...state,
//     loaded: false,
//     programSpec: {objectTypes:mapValues(state.programSpec.objectTypes,(objectType)=>({properties:objectType.properties}))}
//   }),
//   deserialize: (string) => {
//     console.log("INCOMING", JSON.parse(string))
//     console.log('MERGED',merge({state:{programSpec,clock:new Timer()}},JSON.parse(string)))
//     return merge({state:{programSpec,clock:new Timer()}},JSON.parse(string))
//   },
//   onRehydrateStorage: (state) => {
//     console.log("hydration starts");
//     // optional
//     return (state, error) => {
//       // if (error) {
//       //   console.log("An error happened during hydration. Reloading with Default", error);
//       //   state.setDefault();
//       // } else {
//       //   console.log("hydration finished");
//       //   state.updateProgramSpec(state.links,state.joints)
//       // }
//       console.log('rehydrated state',state);
//       setTimeout(()=>state.setLoaded(true),50)
//     };
//   },
// })

const useStore = create(subscribeWithSelector(immerStore));

const setTfs = useStore.getState().setTfs;

const unlisten = await listen("solution-calculated", (event) => {
  if (event.payload) {
    setTfs(event.payload);
  }
});

const initiateTransition = useStore.getState().initiateTransition;

// Handle Transitioning between states
useStore.subscribe(
  (state) =>
    mapValues(
      pickBy(state.programData, (d) => STATE_TYPES.includes(d.type)),
      (d) => d.selected
    ),
  (currentSelected, pastSelected) => {
    let fromNode = null;
    let toNode = null;
    Object.keys(currentSelected).some((key) => {
      if (currentSelected[key] && pastSelected[key]) {
        fromNode = key;
      } else if (currentSelected[key] && !pastSelected[key]) {
        toNode = key;
      }
      return toNode && fromNode;
    });
    if (toNode && fromNode) {
      initiateTransition(fromNode, toNode);
    }
  },
  { equalityFn: shallow }
);

// Update feedback/input meshes when goals/state change
useStore.subscribe(
  (state) =>
  state.programData[state.currentState]?.properties?.children?.map(
    (child) => state.programData[child]
  ) || [],
  (activeBehaviorProperties) => {
    const joints = useStore.getState().joints;
    // Create feedback meshes
    let feedbackMeshes = {};
    let lines = {};
    let hulls = {};
    activeBehaviorProperties.forEach((bp) => {
      const goalFeedbackItems = bp2vis(bp,joints);
      goalFeedbackItems.forEach(({group,id,data})=>{
        if (group === 'items') {
          feedbackMeshes[id] = data;
        } else if (group === 'lines') {
          lines[id] = data;
        } else if (group === 'hulls') {
          hulls[id] = data;
        }
      })
    });
    console.log("feedbackMeshes", feedbackMeshes);
    useStore.setState({ feedbackMeshes, lines, hulls });
    // console.log('',state.feedbackMeshes)
  },
  { equalityFn: shallow }
);

//Making new subscriber to track unique objectives-------------------------------------------------
useStore.subscribe(
  (state) =>
    mapValues(state.programData, (v) => ({
      type: v.type,
      properties: v.properties,
      id: v.id,
    })),
  (programData) => {
    // let behaviorProperties = [];
    // let states = [];

    const behaviorProperties = pickBy(programData, (d) =>
      allBehaviorProperties.includes(d.type)
    );
    const states = pickBy(programData, (d) => STATE_TYPES.includes(d.type));
    const likValues = {
      default: { objective: DEFAULT_OBJECTIVE, goal: null },
      ...mapValues(behaviorProperties, bp2lik),
    };
    // Creates a new object with only unique values;
    const objectives = mapValues(
      fromPairs(
        uniqWith(Object.entries(likValues), ([_k1, v1], [_k2, v2]) =>
          isEqual(v1.objective, v2.objective)
        )
      ),
      (v) => v.objective
    );

    // Generate a lookup of state goals that can be sent to livelytk
    const stateGoals = mapValues(states, (state) => {
      let currentStateGoals = {};
      state.properties?.children?.forEach((key) => {
        const childData = bp2lik(programData[key]);
        if (!childData.goal) return;
        let matchedObjKey = findKey(objectives, (objective) =>
          isEqual(objective, childData.objective)
        );
        if (matchedObjKey) {
          currentStateGoals[matchedObjKey] = childData.goal;
        }
      });
      return currentStateGoals;
    });

    // Generate a lookup of state weights that can be sent to livelytk
    const stateWeights = mapValues(states, (state) => {
      let currentStateWeights = {};
      state.properties?.children?.forEach((key, idx) => {
        const childData = bp2lik(programData[key]);
        let matchedObjKey = findKey(objectives, (objective) =>
          isEqual(objective, childData.objective)
        );
        if (matchedObjKey) {
          currentStateWeights[matchedObjKey] =
            50 / Math.pow(Math.E, idx / state.properties.children.length);
        } else {
          return 0;
        }
      });
      return currentStateWeights;
    });

    console.log("stateInfo", { objectives, stateGoals, stateWeights });

    useStore.setState({
      objectives,
      stateGoals,
      stateWeights,
    });
    // console.log('uniqueObjectives',{uniqueObjectives,stateGoals,stateWeights})
  },
  { equalityFn: isEqual }
);

// Handle updating the urdf
useStore.subscribe(
  (state) => state.urdf,
  async (urdf) => {
    const rootBounds = useStore.getState().rootBounds;
    const result = await invoke("update_urdf", { urdf });
    // console.log(rootBounds.map(b=>(b.value,b.delta)))
    await invoke("update_root_bounds", {
      rootBounds: rootBounds.map((b) => [b.value, b.delta]),
    });
    // const worker = useStore.getState().solverWorker;
    if (result) {
      const initialState = await invoke("solve");
      setTfs(initialState);
      useStore.setState({
        links: result.links,
        joints: result.joints,
        isValid: true,
      });
    } else {
      useStore.setState({ links: [], joints: [], isValid: false });
    }
  },
  { equalityFn: shallow }
);

// Handle updating robot meshes when links change
useStore.subscribe(
  (state) => ({ links: state.links, showCollision: state.showCollision }),
  ({ links, showCollision }) => {
    let robotMeshes = {};
    links.forEach((link) => {
      link.visuals.forEach((visual, i) => {
        robotMeshes[`visual-${link.name}-${i}`] = shape2item(visual, false);
      });
      if (showCollision) {
        link.collisions.forEach((collision, i) => {
          robotMeshes[`collision-${link.name}-${i}`] = shape2item(
            collision,
            true
          );
        });
      }
    });
    useStore.setState({ robotMeshes });
  },
  { equalityFn: shallow }
);

// Update the program spec when links/joints change
useStore.subscribe(
  (state) => ({ links: state.links, joints: state.joints }),
  ({ links, joints }) => useStore.getState().updateProgramSpec(links, joints),
  { equalityFn: shallow }
);

// Merge feedback/robot meshes when either updates
useStore.subscribe(
  (state) => ({
    robotMeshes: state.robotMeshes,
    feedbackMeshes: state.feedbackMeshes,
    proximityLines: state.proximityLines,
  }),
  ({ robotMeshes, feedbackMeshes, proximityLines }) => {
    useStore.setState({
      items: {
        ...robotMeshes,
        ...feedbackMeshes,
        // collision: {
        //   shape: "cube",
        //   frame: "world",
        //   name: "Table",
        //   scale: { x: 0.5, y: 0.7, z: 0.2 },
        //   position: { x: 0.5, y: 0, z: 0 },
        //   rotation: { w: 1, x: 0, y: 0, z: 0 },
        //   color: { r: 255, g: 0, b: 0, a: 1 },
        //   wireframe: true,
        // },
      },
      texts: {},
      lines: proximityLines,
    });
  },
  { equalityFn: shallow }
);

// When the goals/weights change, assign them to the new overarching target
useStore.subscribe(
  (state) => ({
    // currentState: state.currentState,
    goals: state.stateGoals[state.currentState],
    weights: state.stateWeights[state.currentState],
    // objectives: state.objectives,
  }),
  (newValues) => {
    // console.log('new goals/weights')
    if (newValues.goals && newValues.weights) {
      useStore.setState({
        goals: newValues.goals,                       //will say nextGoals  CHANGED
        weights: newValues.weights,                   //will say nextWeights  CHANGED
        // goals:newValues.goals, weights:newValues.weights // We will remove this when the function below is finished
      });
    }
  },
  { equalityFn: shallow }
);

//Subsriber to update------------------------------------------------------------------------------
// useStore.subscribe(
//   (state) => ({
//     goals: state.goals,
//     weights: state.weights,
//     nextGoals: state.nextGoals,
//     nextWeights: state.nextWeights
//   }),
//   (newValues) => {
//     if (newValues.nextGoals && newValues.nextWeights) {
//       //console.log('new goals/weights to interp',{newValues});
//       //console.log("Goals: ", newValues.goals)
//       //console.log("Weights: ", newValues.weights)
//       //console.log("nextGoals: ", newValues.nextGoals)
//       //console.log("nextWeights: ", newValues.nextWeights)

//       //Check if goals are in nextGoals (if so, interpolate between them)
//       for (let i in newValues.goals){
//         for (let j in newValues.nextGoals){
//           //Check if element in goals is in nextGoals
//           if (newValues.goals[i] == newValues.nextGoals[j]){
//             let tempInterp;
//             let tempOldGoalValue;
//             let tempNewGoalValue;
//             let stepSize = 0.5;
//             let oldQuat = 0;//Convert tempOld to quaternion
//             let newQuat = 0;
//             //console.log("DAK PRINT: ", newValues.goals[i])
//             if (Object.keys(newValues.goals[i])[0] == "Translation"){
//               //Translation- Use converstion I spoke with Andy about (make a 1 vector)
//               tempOldGoalValue = Object.values(newValues.goals[i])[0]
//               tempNewGoalValue = Object.values(newValues.goals[j])[0]
//               //Interpolate
//               tempInterp = tempOldGoalValue.add(tempNewGoalValue.sub(tempOldGoalValue) * stepSize)
              
//             }
//             else if (Object.keys(newValues.goals[i])[0] == "Rotation"){
//               //Rotation- 3 vector (convert to quaternion and use rotateTowards)
//               tempOldGoalValue = Object.values(newValues.goals[i])[0]
//               tempNewGoalValue = Object.values(newValues.goals[j])[0]
//               oldQuat = 0; //Convert tempOld to quaternion
//               newQuat = 0; //Convert tempNew to quaternion
//               //Interpolate
//               tempInterp = oldQuat.rotateTowards(newQuat, stepSize)

//             }
//             else if (Object.keys(newValues.goals[i])[0] == "Size"){
//               //Size- 3 vector (three linear interpolations)
//               tempOldGoalValue = Object.values(newValues.goals[i])[0]
//               tempNewGoalValue = Object.values(newValues.goals[j])[0]
//               //Interpolate
//               tempInterp = tempOldGoalValue.lerp(tempNewGoalValue, stepSize)

//             }
//             else if (Object.keys(newValues.goals[i])[0] == "Ellipse"){
//               //Elipse- translate, rotate, size
//               tempOldGoalValue = Object.values(newValues.goals[i])[0]
//               tempNewGoalValue = Object.values(newValues.goals[j])[0]
//               //Interpolate
//               //tempInterp = 

//             }
//             else if (Object.keys(newValues.goals[i])[0] == "ScalarRange"){
//               //Scalar Range- two linearly interpolate
//               tempOldGoalValue = Object.values(newValues.goals[i])[0]
//               tempNewGoalValue = Object.values(newValues.goals[j])[0]

//             }
//           }
//           //Interpolate between weights
//         }
//       }

//       //Check if nextGoals are in goals (if not, add nextGoal values to interpolation values)
//       for (let x in newValues.nextGoal){
//         for (let y in newValues.goals){
//           //Check if element in nextGoals is in goals
//           if (newValues.goals[x] = newValues.nextGoals[y]){
//             break;
//           }
//           //Add nextGoal values and weights to interpolation values
//         }
//       }
      
//       // Do interpolation here
//       // useStore.setState({ goals: interpolatedGoals, weights: interpolatedWeights });
//        useStore.setState({ goals: newValues.nextGoals, weights: newValues.nextWeights });
//     }
//   },
//   { equalityFn: shallow }
// );
//-------------------------------------------------------------------------------------------------

// Listen for changes to goals, weights, objectives and send them to the backend
useStore.subscribe(
  (state) => ({
    goals: state.goals,
    weights: state.weights,
    objectives: state.objectives,
  }),
  (newValues, pastValues) => {
    console.log("new values to invoke");
    if (
      newValues.goals &&
      newValues.weights &&
      newValues.objectives === pastValues.objectives
    ) {
      console.log("Updating solver goals/weights", {
        goals: newValues.goals,
        weights: newValues.weights,
      });
      // useStore.setState({ goals: newValues.goals, weights: newValues.weights });
      invoke("update_goals_and_weights", {
        goals: newValues.goals,
        weights: newValues.weights,
      });
    } else if (
      newValues.goals &&
      newValues.weights &&
      newValues.objectives !== pastValues.objectives
    ) {
      console.log("Updating solver props", newValues);
      // useStore.setState({ goals: newValues.goals, weights: newValues.weights });
      invoke("update_objectives_and_goals_and_weights", {
        objectives: newValues.objectives,
        goals: newValues.goals,
        weights: newValues.weights,
      });
    } else if (newValues.stateType !== "stateType") {
      console.log("Ignoring because not stateType");
    }
  },
  { equalityFn: shallow }
);

// Update root bounds
useStore.subscribe(
  (state) => state.rootBounds,
  (rootBounds) => {
    console.log('updating root bounds')
    invoke("update_root_bounds", {
      rootBounds: rootBounds.map((b) => [Number(b.value), Number(b.delta)]),
    })},
  { equalityFn: shallow }
);

useStore.subscribe(
  (state) => state.persistentShapes,
  (shapes) => {
    invoke("update_shapes", { shapes });
  },
  { equalityFn: shallow }
);

// Log current values
useStore.subscribe(
  (state) => pick(state, ["currentState", "goals", "weights", "objectives"]),
  (c, _) => {
    console.log(pick(c, ["currentState", "goals", "weights", "objectives"]));
  },
  { equalityFn: shallow }
);

// Finally, set the program based on the spec and solver instance
// const solverWorker = new SolverWorker();
// const solverWorkerInstance = Comlink.wrap(solverWorker);
// useStore.setState({ programSpec, solverWorker: solverWorkerInstance });
// useStore.setState({programData: {'s':instanceTemplateFromSpec('stateType',programSpec.objectTypes.stateType,false)}})
useStore.setState({
  loaded: true,
  programSpec,
  currentState: "powerOnType-2c880f27-1777-48b8-852e-861cc5c2ed0a",
  persistentShapes: [
    // {
    //   type: "Box",
    //   name: "Table",
    //   frame: "world",
    //   physical: true,
    //   x: 0.5,
    //   y: 0.7,
    //   z: 0.2,
    //   localTransform: { translation: [0.5, 0, 0], rotation: [0, 0, 0, 1] },
    // },
  ],
  programData: {
    "powerOnType-2c880f27-1777-48b8-852e-861cc5c2ed0a": {
      argumentBlockData: [],
      canDelete: false,
      canEdit: true,
      dataType: "INSTANCE",
      editing: undefined,
      id: "powerOnType-2c880f27-1777-48b8-852e-861cc5c2ed0a",
      name: "Power On",
      position: { x: 100, y: 0 },
      properties: {},
      refData: null,
      selected: true,
      type: "powerOnType",
    },
    "powerOffType-sefess-sesff-r454-0f9f-1089dsisdis": {
      argumentBlockData: [],
      canDelete: false,
      canEdit: true,
      dataType: "INSTANCE",
      editing: undefined,
      id: "powerOffType-sefess-sesff-r454-0f9f-1089dsisdis",
      name: "Power Off",
      position: { x: 100, y: 200 },
      properties: {},
      refData: null,
      selected: false,
      type: "powerOffType",
    },
  },
});

export default useStore;

// Object.keys(programSpec.objectTypes).filter(o=>allBehaviorProperties.includes(o)).forEach(bp=>console.log(bp,bp2lik(instanceTemplateFromSpec(bp,programSpec.objectTypes[bp],false))))
