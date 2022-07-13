//Tasks:
    //Make goals (DONE):
    //  Boots and hats will likely be like goals (which we think will be instances??)- switch this to goals
    //
    //Make states (DONE):
    //A state is a collection of objectives which are filled with goals
    //
    //Make power on and off nodes (TODO):
    //State nodes, goal nodes, power on node, power off node (goals will have multiple iterations)

    //Questions:
    //Where do functions come into play within the framework we are developing?

    //Multiple groups of goals:
    //  Cartesian Control Goals
    //    Position (X, Y, Z)
    //  Joint Control Goals
    //    Rotate (yaw, pitch, roll)
    //  General Goals
    //    Collision avooidance, smoothness (jerk, velocity, accelartion minimzation) 
    //  Liveliness Goals
    //    Sway

    //state has all of the joint values at a given that time that satisfy the goal (with certain weights)
    //goal would be the cartesian values

    //When you create a solver, you have to pass in all the objectives

    //each objective has a type of goal it accepts

    //The length of objectives has to equal the length of goals and weights

    //The goals that user provide are a hybrid of the goals and objectives


import { DATA_TYPES, CONNECTIONS, EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "simple-vp";
import {
    FiClipboard,
    FiBriefcase,
    FiGrid,
    FiBox,
    FiLogOut,
    FiMoreHorizontal,
    FiFeather
  } from "react-icons/fi";
import { merge } from 'lodash';

const behaviorPropertyTemplate = {
  type: TYPES.OBJECT,
  // referenceBlock: {
  //   onCanvas: false,
  //   // icon: FiGrid,
  //   extras: [
  //     EXTRA_TYPES.LOCKED_INDICATOR,
  //     {
  //       icon: FiMoreHorizontal,
  //       type: EXTRA_TYPES.DROPDOWN,
  //       contents: [
  //         EXTRA_TYPES.DELETE_BUTTON,
  //         EXTRA_TYPES.DEBUG_TOGGLE,
  //         EXTRA_TYPES.NAME_EDIT_TOGGLE,
  //         EXTRA_TYPES.SELECTION_TOGGLE,
  //       ],
  //     },
  //   ],
  // },
  instanceBlock: {
    onCanvas: false,
    // color: "#bdb655",
    // icon: FiGrid,
    extras: [
      EXTRA_TYPES.LOCKED_INDICATOR,
      {
        icon: FiMoreHorizontal,
        type: EXTRA_TYPES.DROPDOWN,
        contents: [
          EXTRA_TYPES.DELETE_BUTTON,
          EXTRA_TYPES.DEBUG_TOGGLE,
          EXTRA_TYPES.NAME_EDIT_TOGGLE,
          EXTRA_TYPES.SELECTION_TOGGLE,
        ],
      },
    ],
  },
  properties: {

  }
}

const positionMatchBehaviorData = {
  name: 'Position Match Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: "#bdb655"
  },
  properties: {
    link: {
      name: "Link",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [/* We will generate these based on the robot */],
      default: '', // This will probably just be the first option.
    }
    /* 
    There will be other properties that will need to be specified. 
    See struct information in files like src/objectives/core/base.rs for more detail on what needs to be included. 
    For now, you can ignore 'name' and 'weight' fields, but generally look at the 'new()' 
    methods in those files, and you should see the initialization fields.
    For example, the PositionMatchObjective (src/objectives/core/matching.rs)
    looks like this:

    #[repr(C)]
    #[derive(Serialize,Deserialize,Clone,Debug,Default)]
    pub struct PositionMatchObjective {
      pub name: String,
      pub weight: f64,
      pub link: String,
      // Goal Value
      #[serde(skip)]
      pub goal: Vector3<f64>
    }

    impl PositionMatchObjective {

      pub fn new(name: String, weight: f64, link: String) -> Self {
          Self { name, weight, link, goal: vector![0.0,0.0,0.0] }
      }

      pub fn call(
        &self,
        _v: &Vars,
        state: &State,
        _is_core: bool,
      ) -> f64 {
        // Get the link transform from frames
        let link_translation = state.get_link_transform(&self.link).translation.vector;

        let x_val = (link_translation - self.goal).norm();

        return self.weight * groove_loss(x_val, 0., 2, 0.1, 10.0, 2)
      }
    }

    The 'new' method in the "impl" block takes 3 inputs, 'name', 'weight', and 'link'.
    So we really only need to add 'link' for this one.
    */
  }
}


export const programSpec = {
  drawers: [
    {
      title: "Structures",
      dataType: DATA_TYPES.INSTANCE,
      objectTypes: ["stateType", "powerOnType", "powerOffType"],
      icon: FiClipboard,
    },
    //Moved "States" to structures, but kept old function code for reference
    //{
    //  title: "Functions",
    //  dataType: DATA_TYPES.CALL,
    //  objectType: "functionType",
    //  icon: FiLogOut,
    //},
    {
      //Changed "Hat" to "Goals" and added two goal types.
      title: "Positions",
      dataType: DATA_TYPES.INSTANCE,
      objectTypes: ["positionMatchBehaviorProperty", "goalTypePos"],
      icon: FiGrid, //
    },
    //Commented out Boots as this will no longer be needed.
    //{
    //  title: "Boots", //Can get rid of boots
    //  dataType: DATA_TYPES.INSTANCE,
    //  objectTypes: ["bootType"],
    //  icon: FiBox,
    //},
  ],
  objectTypes: {
    programType: {
      name: "Root",
      type: TYPES.OBJECT,
      instanceBlock: {
        onCanvas: true,
        color: "#3f3f3f",
        icon: FiBriefcase,
        connections: {
          bottom: {
            direction: CONNECTIONS.OUTBOUND,
            allowed: ["operationType"],
          },
        },
        extras: [
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            label: "Custom More...",
            contents: [
              EXTRA_TYPES.NAME_EDIT_TOGGLE,
              EXTRA_TYPES.LOCKED_INDICATOR,
              EXTRA_TYPES.SELECTION_TOGGLE,
              EXTRA_TYPES.DIVIDER,
              {
                // icon: FiMoreHorizontal,
                label: "More Options",
                type: EXTRA_TYPES.DROPDOWN,
                contents: [
                  EXTRA_TYPES.NAME_EDIT_TOGGLE,
                  EXTRA_TYPES.COLLAPSE_TOGGLE,
                  EXTRA_TYPES.LOCKED_INDICATOR,
                  {
                    type: EXTRA_TYPES.FUNCTION_BUTTON,
                    onClick: "updateItemBlockColors",
                    label: "Cycle Color",
                    icon: FiFeather,
                  }
                ],
              },
            ],
          },
          EXTRA_TYPES.DIVIDER,
          EXTRA_TYPES.LOCKED_INDICATOR,
        ],
      },
      referenceBlock: null,
    },
    functionType: {
      name: "Function",
      type: TYPES.FUNCTION,
      instanceBlock: {
        onCanvas: true,
        color: "#62869e",
        icon: FiLogOut,
        extras: [
          EXTRA_TYPES.LOCKED_INDICATOR,
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            contents: [
              EXTRA_TYPES.SELECTION_TOGGLE,
              EXTRA_TYPES.NAME_EDIT_TOGGLE,
              EXTRA_TYPES.DELETE_BUTTON,
              EXTRA_TYPES.LOCKED_INDICATOR,
              EXTRA_TYPES.DEBUG_TOGGLE,
              {
                type: EXTRA_TYPES.ADD_ARGUMENT_GROUP,
                allowed: ["hatType", "bootType"],
              },
              {
                type: EXTRA_TYPES.ADD_ARGUMENT,
                argumentType: "hatType",
              },
            ],
          },
          {
            type: EXTRA_TYPES.ADD_ARGUMENT_GROUP,
            allowed: ["hatType", "bootType"],
          },
        ],
      },
      callBlock: {
        onCanvas: false,
        color: "#62869e",
        icon: FiLogOut,
        extras: [
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            contents: [EXTRA_TYPES.DEBUG_TOGGLE],
          },
        ],
      },
      properties: {
        children: {
          name: "Children",
          accepts: ["functionType", "blockType", "operationType"],
          default: [],
          isList: true,
          fullWidth: true,
        },
      },
    },
    // operationType: {
    //   name: "Operation",
    //   type: TYPES.OBJECT,
    //   instanceBlock: {
    //     onCanvas: true,
    //     color: "#629e6c",
    //     icon: FiClipboard,
    //     connections: {
    //       bottom: {
    //         direction: CONNECTIONS.OUTBOUND,
    //         allowed: ["operationType"],
    //         limitOne: true,
    //       },
    //       top: {
    //         direction: CONNECTIONS.INBOUND,
    //         allowed: ["operationType", "programType"],
    //         limitOne: false,
    //       },
    //     },
    //     extras: [
    //       EXTRA_TYPES.LOCKED_INDICATOR,
    //       {
    //         icon: FiMoreHorizontal,
    //         type: EXTRA_TYPES.DROPDOWN,
    //         contents: [
    //           EXTRA_TYPES.DELETE_BUTTON,
    //           EXTRA_TYPES.DEBUG_TOGGLE,
    //           EXTRA_TYPES.SELECTION_TOGGLE,
    //         ],
    //       },
    //     ],
    //     hideNewPrefix: true,
    //   },
    //   properties: {
    //     hat: {
    //       name: "Hat",
    //       accepts: ["hatType"],
    //       default: null,
    //       isList: false,
    //     },
    //     boot: {
    //       name: "Boot",
    //       accepts: ["bootType"],
    //       default: null,
    //       isList: false,
    //     },
    //     speed: {
    //       name: "Speed",
    //       type: SIMPLE_PROPERTY_TYPES.NUMBER,
    //       default: 1,
    //       min: 0,
    //       max: 20,
    //       step: 0.1,
    //       units: "m/s",
    //       visualScaling: 0.1,
    //       visualPrecision: 1,
    //     },
    //     doFunky: {
    //       name: "Do Funky",
    //       type: SIMPLE_PROPERTY_TYPES.BOOLEAN,
    //       default: false,
    //     },
    //     greeting: {
    //       name: "Greeting",
    //       type: SIMPLE_PROPERTY_TYPES.STRING,
    //       default: "",
    //     },
    //     time: {
    //       name: "Time",
    //       type: SIMPLE_PROPERTY_TYPES.OPTIONS,
    //       options: [
    //         { value: "am", label: "AM" },
    //         { value: "pm", label: "PM" },
    //       ],
    //       default: "am",
    //     },
    //   },
    // },
    // hatType: {
    //   name: "Hat",
    //   type: TYPES.OBJECT,
    //   referenceBlock: {
    //     onCanvas: false,
    //     color: "#AD1FDE",
    //     icon: FiGrid,
    //     extras: [
    //       EXTRA_TYPES.LOCKED_INDICATOR,
    //       {
    //         icon: FiMoreHorizontal,
    //         type: EXTRA_TYPES.DROPDOWN,
    //         contents: [
    //           EXTRA_TYPES.DELETE_BUTTON,
    //           EXTRA_TYPES.DEBUG_TOGGLE,
    //           EXTRA_TYPES.NAME_EDIT_TOGGLE,
    //           EXTRA_TYPES.SELECTION_TOGGLE,
    //         ],
    //       },
    //     ],
    //   },
    //   instanceBlock: {
    //     onCanvas: true,
    //     color: "#AD1FDE",
    //     icon: FiGrid,
    //     extras: [
    //       EXTRA_TYPES.LOCKED_INDICATOR,
    //       {
    //         icon: FiMoreHorizontal,
    //         type: EXTRA_TYPES.DROPDOWN,
    //         contents: [
    //           EXTRA_TYPES.DELETE_BUTTON,
    //           EXTRA_TYPES.DEBUG_TOGGLE,
    //           EXTRA_TYPES.NAME_EDIT_TOGGLE,
    //           EXTRA_TYPES.SELECTION_TOGGLE,
    //         ],
    //       },
    //     ],
    //   },
    // },
    // bootType: {
    //   name: "Boot",
    //   type: TYPES.OBJECT,
    //   referenceBlock: {
    //     onCanvas: false,
    //     color: "#B3A533",
    //     icon: FiGrid,
    //     extras: [
    //       EXTRA_TYPES.LOCKED_INDICATOR,
    //       {
    //         icon: FiMoreHorizontal,
    //         type: EXTRA_TYPES.DROPDOWN,
    //         contents: [
    //           EXTRA_TYPES.DELETE_BUTTON,
    //           EXTRA_TYPES.DEBUG_TOGGLE,
    //           EXTRA_TYPES.SELECTION_TOGGLE,
    //         ],
    //       },
    //     ],
    //   },
    //   instanceBlock: {
    //     onCanvas: true,
    //     color: "#B3A533",
    //     icon: FiGrid,
    //     extras: [
    //       EXTRA_TYPES.LOCKED_INDICATOR,
    //       {
    //         icon: FiMoreHorizontal,
    //         type: EXTRA_TYPES.DROPDOWN,
    //         contents: [
    //           EXTRA_TYPES.DELETE_BUTTON,
    //           EXTRA_TYPES.DEBUG_TOGGLE,
    //           EXTRA_TYPES.SELECTION_TOGGLE,
    //         ],
    //       },
    //     ],
    //   },
    // },
    //New goal, rotate: this can be one of several goal type.------------------------------------------
    goalTypeRot: {
      name: "Goal: Rotate",
      type: TYPES.OBJECT,
      referenceBlock: {
        onCanvas: false,
        color: "#bdb655",
        icon: FiGrid,
        extras: [
          EXTRA_TYPES.LOCKED_INDICATOR,
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            contents: [
              EXTRA_TYPES.DELETE_BUTTON,
              EXTRA_TYPES.DEBUG_TOGGLE,
              EXTRA_TYPES.NAME_EDIT_TOGGLE,
              EXTRA_TYPES.SELECTION_TOGGLE,
            ],
          },
        ],
      },
      instanceBlock: {
        onCanvas: false,
        color: "#bdb655",
        icon: FiGrid,
        extras: [
          EXTRA_TYPES.LOCKED_INDICATOR,
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            contents: [
              EXTRA_TYPES.DELETE_BUTTON,
              EXTRA_TYPES.DEBUG_TOGGLE,
              EXTRA_TYPES.NAME_EDIT_TOGGLE,
              EXTRA_TYPES.SELECTION_TOGGLE,
            ],
          },
        ],
      },
    },
    // Add a new positionMatchBehaviorProperty
    positionMatchBehaviorProperty: merge(positionMatchBehaviorData,behaviorPropertyTemplate),
    //New goal, position.------------------------------------------------------------------------------
    goalTypePos: {
      name: "Goal: Position",
      type: TYPES.OBJECT,
      referenceBlock: {
        onCanvas: false,
        color: "#bdb655",
        icon: FiGrid,
        extras: [
          EXTRA_TYPES.LOCKED_INDICATOR,
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            contents: [
              EXTRA_TYPES.DELETE_BUTTON,
              EXTRA_TYPES.DEBUG_TOGGLE,
              EXTRA_TYPES.NAME_EDIT_TOGGLE,
              EXTRA_TYPES.SELECTION_TOGGLE,
            ],
          },
        ],
      },
      instanceBlock: {
        onCanvas: false,
        color: "#bdb655",
        icon: FiGrid,
        extras: [
          EXTRA_TYPES.LOCKED_INDICATOR,
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            contents: [
              EXTRA_TYPES.DELETE_BUTTON,
              EXTRA_TYPES.DEBUG_TOGGLE,
              EXTRA_TYPES.NAME_EDIT_TOGGLE,
              EXTRA_TYPES.SELECTION_TOGGLE,
            ],
          },
        ],
      },
    },
    //State type----------------------------------------------------------------------------------------
    stateType: {
      name: "State",
      type: TYPES.OBJECT,
      instanceBlock: {
        onCanvas: true,
        color: "#7dd6ff",
        icon: FiClipboard,
        connections: {
          bottom: {
            direction: CONNECTIONS.OUTBOUND,
            allowed: ["stateType", "powerOffType"],
            limitOne: false,
          },
          top: {
            direction: CONNECTIONS.INBOUND,
            allowed: ["stateType", "operationType", "programType", "powerOnType"],
            limitOne: false,
          },
        },
        extras: [
          EXTRA_TYPES.LOCKED_INDICATOR,
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            contents: [
              EXTRA_TYPES.DELETE_BUTTON,
              EXTRA_TYPES.DEBUG_TOGGLE,
              EXTRA_TYPES.SELECTION_TOGGLE,
            ],
          },
        ],
        hideNewPrefix: true,
      },
      properties: {
        children: {
          name: "Children",
          accepts: ["positionMatchBehaviorProperty", "goalTypeRot"],
          default: [],
          isList: true,
          fullWidth: true,
        },
      },
    },
    //Power On Node--------------------------------------------------------------------------------------
    powerOnType: {
      name: "PowerOn",
      type: TYPES.OBJECT,
      instanceBlock: {
        onCanvas: true,
        color: "#eb4444",
        icon: FiClipboard,
        connections: {
          bottom: {
            direction: CONNECTIONS.OUTBOUND,
            allowed: ["stateType"],
            limitOne: false,
          },
        },
        extras: [
          EXTRA_TYPES.LOCKED_INDICATOR,
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            contents: [
              EXTRA_TYPES.DELETE_BUTTON,
              EXTRA_TYPES.DEBUG_TOGGLE,
              EXTRA_TYPES.SELECTION_TOGGLE,
            ],
          },
        ],
        hideNewPrefix: true,
      },
    },
    //Power Off Node-------------------------------------------------------------------------------------
    powerOffType: {
      name: "Power Off",
      type: TYPES.OBJECT,
      instanceBlock: {
        onCanvas: true,
        color: "#7d746f",
        icon: FiClipboard,
        connections: {
          top: {
            direction: CONNECTIONS.INBOUND,
            allowed: ["stateType", "operationType", "programType"],
            limitOne: false,
          },
        },
        extras: [
          EXTRA_TYPES.LOCKED_INDICATOR,
          {
            icon: FiMoreHorizontal,
            type: EXTRA_TYPES.DROPDOWN,
            contents: [
              EXTRA_TYPES.DELETE_BUTTON,
              EXTRA_TYPES.DEBUG_TOGGLE,
              EXTRA_TYPES.SELECTION_TOGGLE,
            ],
          },
        ],
        hideNewPrefix: true,
      },
    }
  },
};
