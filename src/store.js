import create from "zustand";
// import produce from "immer";
import { SceneSlice } from "robot-scene";
import { ProgrammingSlice } from "simple-vp";
import { programSpec } from "./programSpec";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { DEFAULTS } from "./defaults";
import { shape2item, state2tfs } from "./helpers/InfoParsing";
import shallow from "zustand/shallow";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import {
  allBehaviorProperties,
  behaviorPropertyLookup,
  STATE_TYPES,
} from "./Constants";
import { mapValues, pickBy, pick, uniqWith, isEqual, last, cloneDeep } from "lodash";
import { bp2lik } from "./helpers/Conversion";
import { indexOf } from "./helpers/Comparison";
import { useState } from "react";
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

const store = (set, get) => ({
  currentState: null,
  stateGoals:{},
  stateWeights:{},
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
  isValid: false,
  solverWorker: null,
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
  setRootBound: (value,idx,isValue) => set(state=>{
    state.rootBounds[idx][isValue?'value':'delta'] = Number(value);
  }),
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
  setTfs: (tfstate) =>
    set((state) => {
      const tfs = state2tfs(tfstate);
      // console.log(tfs)
      state.tfs = tfs;
    }),
});

const immerStore = immer(store);

const useStore = create(subscribeWithSelector(immerStore));

const setTfs = useStore.getState().setTfs;

const unlisten = await listen("solution-calculated", (event) => {
  if (event.payload) {
    setTfs(event.payload);
  }
});

//Remove duplicates function-----------------------------------------------------------------------
// function removeDup(objectList) {
//   //Remove duplicates from each state's list of objectives
//   let uniqueObjects = [];
//   let i;
//   let j;
//   //Compare each item against those before it
//   for (i = objectList.length - 1; i >= 1; i--) {
//     for (j = i - 1; j >= 0; j--) {
//       //If the compared objectives are the same, move on to the next objective
//       if (JSON.stringify(objectList[i]) == JSON.stringify(objectList[j])) {
//         break;
//       }
//       //The current comparison is not equivalent to any others, so it must be unique
//       if (j == 0) {
//         uniqueObjects.unshift(objectList[i]);
//       }
//     }
//   }
//   //If only objective in list so it must be unique
//   if (objectList.length != 0) {
//     uniqueObjects.unshift(objectList[0]);
//   }
//   return uniqueObjects;
// }

const initiateTransition = useStore.getState().initiateTransition;

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
    const states = pickBy(programData, (d) => d.type === "stateType");
    const likValues = mapValues(behaviorProperties, bp2lik);
    const objectives = Object.values(likValues).map((v) => v.objective);
    const uniqueObjectives = uniqWith(objectives, isEqual);

    // Generate a lookup of state goals that can be sent to livelytk
    const stateGoals = mapValues(states, (state) => {
      const stateLikValues = state.properties.children.map(
        (bp) => likValues[bp]
      );
      const stateObjectives = stateLikValues.map((v) => v.objective);
      return uniqueObjectives.map((uniqueObjective) => {
        const objIndex = indexOf(stateObjectives, uniqueObjective);
        if (objIndex >= 0) {
          return stateLikValues[objIndex].goal;
        } else {
          return null;
        }
      });
    });

    // Generate a lookup of state weights that can be sent to livelytk
    const stateWeights = mapValues(states, (state) => {
      const stateLikValues = state.properties.children.map(
        (bp) => likValues[bp]
      );
      const stateObjectives = stateLikValues.map((v) => v.objective);
      return uniqueObjectives.map((uniqueObjective) => {
        const objIndex = indexOf(stateObjectives, uniqueObjective);
        if (objIndex >= 0) {
          return 50 / Math.pow(Math.E, objIndex / stateObjectives.length);
        } else {
          return 0;
        }
      });
    });

    useStore.setState({
      objectives: uniqueObjectives,
      stateGoals,
      stateWeights,
    });
    // console.log('uniqueObjectives',{uniqueObjectives,stateGoals,stateWeights})
  },
  { equalityFn: isEqual }
);
// useStore.subscribe(
//   (state) => state.programData,
//   (v) => {
//     //GOALS:
//     //Create a dictionary of lists containing unique objectives in each state
//     //Create a list of all unique objectives in all states
//     //Create a set of goals

//     //Instantiate variables
//     let stateList = [];
//     let stateBPsDict = {};
//     let stateObjDict = {};
//     let objectiveDict = {};

//     //Creates a list of objects (one object for each node in programData)
//     const unfilteredList = Object.values(v);

//     //Use unfilteredList to make a list of states and a list of behavior properties
//     for (let k = 0; k < unfilteredList.length; k++) {
//       //States
//       if (unfilteredList[k].type == "stateType") {
//         stateList.push(unfilteredList[k]);
//       }
//       //Behavior properties
//       else if (allBehaviorProperties.includes(unfilteredList[k].type)) {
//         stateBPsDict[unfilteredList[k].id] = unfilteredList[k];
//       }
//     }

//     //Add state ID and their children (BPs) IDs to state/goal structure
//     for (let k = 0; k < stateList.length; k++) {
//       stateObjDict[stateList[k].id] = stateList[k].properties.children;
//     }

//     //Replace all child (BPs) IDs with objectives within state/goal structure
//     //Iterate through each state
//     for (let stateKey in stateObjDict) {
//       objectiveDict[stateKey] = [];

//       //Skip remainder if there are no BPs in the current state
//       if (stateObjDict.length == 0) {
//         break;
//       }

//       //Iterate through each list of BP IDs
//       let tempObjList = [];
//       for (let l = 0; l < stateObjDict[stateKey].length; l++) {
//         let tempBPID = stateObjDict[stateKey][l];
//         let tempBP = stateBPsDict[tempBPID];

//         //Convert BP objects to objectives
//         let tempObjective = {
//           type: behaviorPropertyLookup[tempBP.type],
//           name: "",
//           weight: 1,
//           stateIDs: [],
//         };

//         //Add additional properties if they exist for a given objective
//         if (tempBP.properties.link !== undefined) {
//           tempObjective.link = tempBP.properties.link;
//         }
//         if (tempBP.properties.link1 !== undefined) {
//           tempObjective.link1 = tempBP.properties.link1;
//         }
//         if (tempBP.properties.link2 !== undefined) {
//           tempObjective.link2 = tempBP.properties.link2;
//         }
//         if (tempBP.properties.joint !== undefined) {
//           tempObjective.joint = tempBP.properties.joint;
//         }
//         if (tempBP.properties.joint1 !== undefined) {
//           tempObjective.joint1 = tempBP.properties.joint1;
//         }
//         if (tempBP.properties.joint2 !== undefined) {
//           tempObjective.joint2 = tempBP.properties.joint2;
//         }
//         if (tempBP.properties.frequency !== undefined) {
//           tempObjective.frequency = tempBP.properties.frequency;
//         }
//         if (tempBP.properties.goal !== undefined) {
//           tempObjective.goal = tempBP.properties.goal;
//         }

//         //Add the objective to its state
//         tempObjList.push(tempObjective);
//       }

//       //Remove duplicate objectives for each state
//       let uniqueObjectives = removeDup(tempObjList);

//       //Add unique objectives to state/goal structure
//       objectiveDict[stateKey].push(uniqueObjectives);
//     }

//     //Creating a unique set of all objectives in the UI
//     let allStateObjectives = Object.values(objectiveDict).flat(2);
//     let allUniqueObjectives = removeDup(allStateObjectives);

//     //Determine states in which each unique objective is included
//     //Iterate through each uniqueObjective
//     for (let x = 0; x < allUniqueObjectives.length; x++) {
//       //Iterate through each state in objectiveDict
//       for (let key in objectiveDict) {
//         //Check if the current objective is present in the current state
//         if (
//           JSON.stringify(objectiveDict[key]).includes(
//             allUniqueObjectives[x].type
//           )
//         ) {
//           //If so, save that stateID to that objective in allUniqueObjectives
//           allUniqueObjectives[x].stateIDs.push(key);
//         }
//       }
//     }

//     //Add unique objectives list to store
//     // store.objectives = allUniqueObjectives;

//     //Create a set of goals for each state
//     let goalDict = {};
//     //Iterate through each state
//     for (let key in objectiveDict) {
//       //Skip remainder if there are no objectives in the current state
//       if (allUniqueObjectives.length == 0) {
//         break;
//       }
//       //Iterate through each unique objective
//       goalDict[key] = [];
//       for (
//         let objIndex = 0;
//         objIndex < allUniqueObjectives.length;
//         objIndex++
//       ) {
//         let subGoal = {};
//         //Add meaningful weight and data to states containing the current objective
//         if (allUniqueObjectives[objIndex].stateIDs.includes(key)) {
//           subGoal["index"] = objIndex;
//           subGoal["weight"] = allUniqueObjectives[objIndex].weight;
//           //Add goal data if present
//           if (allUniqueObjectives[objIndex].goal != undefined) {
//             subGoal["goal"] = allUniqueObjectives[objIndex].goal;
//           }
//           goalDict[key].push(subGoal);
//         }
//         //Add weight of zero to states not containing the current objective
//         else {
//           subGoal["index"] = objIndex;
//           subGoal["weight"] = 0;
//           goalDict[key].push(subGoal);
//         }
//       }
//     }

//     //console.log(objectiveDict)
//     // console.log("Objectives Dictionary: ", objectiveDict);
//     // console.log("All Unique Objectives: ", allUniqueObjectives);
//     // console.log("Goal Dictionary: ", goalDict);

//     useStore.setState({
//       objectiveDict,
//       allUniqueObjectives,
//       goalDict,
//     });
//   },
//   { equalityFn: shallow }
// );

//Next Steps:
//Done

//Changes made:
//Fixed issue with order of objectives
//Fixed issue with only some goals being added to goalDict
//Added goal fields to BP properties in programSpec
//Piped goal data to goalDict

//Updates/Questions:
//If we want to add weights based on order, we should implement those weights before goalDict
//The Elipse and ScalarRange documentation is missing a bracket at the end of the JS example
//When should we add weights to properties in programSpec?
//Rotation bounding is an objective mentioned in the LivelyTK documentation, but it's not used?
//There are many BPs that do not have goals within the LivelyTK documentation. Is that correct?

//-------------------------------------------------------------------------------------------------

// Handle cascading listeners to update the solver

useStore.subscribe(
  (state) => state.urdf,
  async (urdf) => {
    const rootBounds = useStore.getState().rootBounds;
    const result = await invoke("update_urdf", { urdf });
    // console.log(rootBounds.map(b=>(b.value,b.delta)))
    await invoke('update_root_bounds',{rootBounds:rootBounds.map(b=>([b.value,b.delta]))});
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

useStore.subscribe(
  (state) => state.links,
  (links) => {
    let robotMeshes = {};
    links.forEach((link) => {
      link.visuals.forEach((visual, i) => {
        robotMeshes[`visual-${link.name}-${i}`] = shape2item(visual, false);
      });
      link.collisions.forEach((collision, i) => {
        robotMeshes[`collision-${link.name}-${i}`] = shape2item(
          collision,
          true
        );
      });
    });
    useStore.setState({ robotMeshes });
  },
  { equalityFn: shallow }
);

useStore.subscribe(
  state=>({links:state.links,joints:state.joints}),
  ({links,joints}) => {
    const objectTypes = useStore.getState().programSpec.objectTypes;
    const jointOptions = joints.map(j=>({label:j.name,value:j.name}));
    const linkOptions = links.map(l=>({label:l.name,value:l.name}));
    // console.log(objectTypes)
    const newObjectTypes = mapValues(objectTypes,(objectType,key)=>{
      let newObjectType = cloneDeep(objectType);
      if (allBehaviorProperties.includes(key)) {
        ['link','link1','link2'].forEach((prop)=>{
          if (newObjectType?.properties[prop] !== undefined) {
            newObjectType.properties[prop].options = linkOptions;
            newObjectType.properties[prop].default = last(linkOptions).value || ''
          }
        });
        ['joint','joint1','joint2'].forEach((prop)=>{
          if (newObjectType?.properties[prop] !== undefined) {
            newObjectType.properties[prop].options = jointOptions;
            newObjectType.properties[prop].default = last(jointOptions).value || ''
          }
        });
      }
      console.log('new',newObjectType)
      return newObjectType;
    });
    console.log(newObjectTypes)
    useStore.setState(state=>({programSpec:{...state.programSpec,objectTypes:newObjectTypes}}))
  },
  { equalityFn: shallow }
)

useStore.subscribe(
  (state) => ({
    robotMeshes: state.robotMeshes,
    feedbackMeshes: state.feedbackMeshes,
  }),
  ({ robotMeshes, feedbackMeshes }) => {
    useStore.setState({ items: { ...robotMeshes, ...feedbackMeshes } });
  },
  { equalityFn: shallow }
);

useStore.subscribe(
  (state) => ({
    currentState: state.currentState,
    goals: state.stateGoals[state.currentState],
    weights: state.stateWeights[state.currentState],
    objectives: state.objectives,
  }),
  (newValues) => {
    if (newValues.goals && newValues.weights) {
      useStore.setState({ goals: newValues.goals, weights: newValues.weights });
      invoke("update_objectives_and_goals_and_weights", {
        objectives: newValues.objectives,
        goals: newValues.goals,
        weights: newValues.weights,
      });
    }
  },
  { equalityFn: shallow }
);

useStore.subscribe(
  (state) => pick(state, ["currentState", "goals", "weights", "objectives"]),
  (c, _) => {
    console.log(pick(c, ["currentState", "goals", "weights", "objectives"]));
  },
  { equalityFn: shallow }
);

useStore.subscribe(
  (state) => state.rootBounds,
  (rootBounds) => invoke('update_root_bounds',{rootBounds:rootBounds.map(b=>([b.value,b.delta]))}),
  { equalityFn: shallow }
)

// Finally, set the program based on the spec and solver instance
// const solverWorker = new SolverWorker();
// const solverWorkerInstance = Comlink.wrap(solverWorker);
// useStore.setState({ programSpec, solverWorker: solverWorkerInstance });
// useStore.setState({programData: {'s':instanceTemplateFromSpec('stateType',programSpec.objectTypes.stateType,false)}})
useStore.setState({
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
});

export default useStore;

// Object.keys(programSpec.objectTypes).filter(o=>allBehaviorProperties.includes(o)).forEach(bp=>console.log(bp,bp2lik(instanceTemplateFromSpec(bp,programSpec.objectTypes[bp],false))))
