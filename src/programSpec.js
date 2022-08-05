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
import { behaviorPropertyColorBase, behaviorPropertyColorBounding, behaviorPropertyColorMatching, behaviorPropertyColorMirroring, behaviorPropertyColorForces, behaviorPropertyColorLiveliness, behaviorPropertyDrawerBase, behaviorPropertyDrawerBounding, behaviorPropertyDrawerMatching, behaviorPropertyDrawerMirroring, behaviorPropertyDrawerForces, behaviorPropertyDrawerLiveliness } from './Constants.js'

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

//Defining Behavioral Properties------------------------------------------------------------------------
const defaultFrequency = {
  name: "Frequency",
  type: SIMPLE_PROPERTY_TYPES.NUMBER,
  min: 0,
  max: 20,
  step: 0.1,
  units: 'm/s',
  visualScaling: 1,
  visualPrecision: 1,
  default: 1,
}

const defaultWeight = {
  name: "Weight",
  default: 1
}

//Name, weight, link
const positionMatchBehaviorData = {
  name: 'Position Match Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMatching
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

//Name, weight, link
const orientationMatchBehaviorData = {
  name: 'Orientation Match Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMatching
  },
  properties: {
    link: {
      name: "Link",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    }
  }
}

//Name, weight, link, frequency
const positionLivelinessBehaviorData = {
  name: 'Position Liveliness Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorLiveliness
  },
  properties: {
    link: {
      name: "Link",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    frequency: defaultFrequency,
  }
}

//Name, weight, link, frequency
const orientationLivelinessBehaviorData = {
  name: 'Orientation Liveliness Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorLiveliness
  },
  properties: {
    link: {
      name: "Link",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    frequency: defaultFrequency,
  }
}

//Name, weight, link1, link2
const positionMirroringBehaviorData = {
  name: 'Position Mirroring Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMirroring
  },
  properties: {
    link1: {
      name: "Link 1",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    link2: {
      name: "Link 2",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    }
  }
}

//Name, weight, link1, link2
const orientationMirroringBehaviorData = {
  name: 'Orientation Mirroring Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMirroring
  },
  properties: {
    link1: {
      name: "Link 1",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    link2: {
      name: "Link 2",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    }
  }
}

//Name, weight, link
const positionBoundingBehaviorData = {
  name: 'Position Bounding Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBounding
  },
  properties: {
    link: {
      name: "Link",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    }
  }
}

//Name, weight, link
const orientationBoundingBehaviorData = {
  name: 'Orientation Bounding Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBounding
  },
  properties: {
    link: {
      name: "Link",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    }
  }
}

//Name, weight, joint
const jointMatchBehaviorData = {
  name: 'Joint Match Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMatching
  },
  properties: {
    link: {
      name: "Joiint",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    }
  }
}

//Name, weight, link, frequency
const jointLivelinessBehaviorData = {
  name: 'Joint Liveliness Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorLiveliness
  },
  properties: {
    link: {
      name: "Link",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    frequency: defaultFrequency,
  }
}

//Name, weight, joint1, joint2
const jointMirroringBehaviorData = {
  name: 'Joint Mirroring Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMirroring
  },
  properties: {
    joint1: {
      name: "Joint 1",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    joint2: {
      name: "Joint 2",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    }
  }
}

//Name, weight
const jointLimitsBehaviorData = {
  name: 'Joint Limits Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBase
  },
  properties: {
  }
}

//Name, weight, joint
const jointBoundingBehaviorData = {
  name: 'Joint Bounding Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBounding
  },
  properties: {
    link: {
      name: "Joint",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    }
  }
}

//Name, weight
const collisionAvoidanceBehaviorData = {
  name: 'Collision Avoidance Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBase
  },
  properties: {
  }
}

//Name, weight
const velocityMinimizationBehaviorData = {
  name: 'Velocity Minimization Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBase
  },
  properties: {
  }
}

//Name, weight
const accelerationMinimizationBehaviorData = {
  name: 'Acceleration Minimization Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBase
  },
  properties: {
  }
}

//Name, weight
const jerkMinimizationBehaviorData = {
  name: 'Jerk Minimization Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBase
  },
  properties: {
  }
}

//Name, weight
const originVelocityMinimizationBehaviorData = {
  name: 'Origin Velocity Minimization Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBase
  },
  properties: {
  }
}

//Name, weight
const originAccelerationMinimizationBehaviorData = {
  name: 'Origin Acceleration Minimization Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBase
  },
  properties: {
  }
}

//Name, weight
const originJerkMinimizationBehaviorData = {
  name: 'Origin Jerk Minimization Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBase
  },
  properties: {
  }
}

//Name, weight, link 1, link 2, frequency
const relativeMotionLivelinessBehaviorData = {
  name: 'Relative Motion Liveliness Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorLiveliness
  },
  properties: {
    link1: {
      name: "Link 1",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    link2: {
      name: "Link 2",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    frequency: defaultFrequency,
  }
}

//Name, weight, frequency
const originPositionLivelinessBehaviorData = {
  name: 'Origin Position Liveliness Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorLiveliness
  },
  properties: {
    frequency: defaultFrequency,
  }
}

//Name, weight, frequency
const originOrientationLivelinessBehaviorData = {
  name: 'Origin Orientation Liveliness Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorLiveliness
  },
  properties: {
    frequency: defaultFrequency,
  }
}

//Name, weight
const originPositionMatchBehaviorData = {
  name: 'Origin Position Match Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMatching
  },
  properties: {
  }
}

//Name, weight
const originOrientationMatchBehaviorData = {
  name: 'Origin Orientation Match Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMatching
  },
  properties: {
  }
}

//Name, weight, link
const gravityBehaviorData = {
  name: 'Gravity Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorForces
  },
  properties: {
    link: {
      name: "Link",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
  }
}

//Name, weight
const smoothnessMacroBehaviorData = {
  name: 'Smoothness Macro Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBase
  },
  properties: {
  }
}

//Name, weight, link1, link2
const distanceMatchBehaviorData = {
  name: 'Distance Match Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMatching
  },
  properties: {
    link1: {
      name: "Link 1",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    link2: {
      name: "Link 2",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    }
  }
}
//---------------------------------------------------------------------------------------------------

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
      //Changed "Hat" to "Goals" and added all new behavioral properties.
      title: "Base Behavior Properties",
      dataType: DATA_TYPES.INSTANCE,
      objectTypes: behaviorPropertyDrawerBase,
      icon: FiGrid,
    },
    {
      title: "Bounding Behavior Properties",
      dataType: DATA_TYPES.INSTANCE,
      objectTypes: behaviorPropertyDrawerBounding,
      icon: FiGrid,
    },
    {
      title: "Matching Behavior Properties",
      dataType: DATA_TYPES.INSTANCE,
      objectTypes: behaviorPropertyDrawerMatching,
      icon: FiGrid,
    },
    {
      title: "Mirroring Behavior Properties",
      dataType: DATA_TYPES.INSTANCE,
      objectTypes: behaviorPropertyDrawerMirroring,
      icon: FiGrid,
    },
    {
      title: "Forces Behavior Properties",
      dataType: DATA_TYPES.INSTANCE,
      objectTypes: behaviorPropertyDrawerForces,
      icon: FiGrid,
    },
    {
      title: "Liveliness Behavior Properties",
      dataType: DATA_TYPES.INSTANCE,
      objectTypes: behaviorPropertyDrawerLiveliness,
      icon: FiGrid,
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

    // Add all new behavior properties-----------------------------------------------------------------
    positionMatchBehaviorProperty: merge(positionMatchBehaviorData, behaviorPropertyTemplate),
    orientationMatchBehaviorProperty: merge(orientationMatchBehaviorData, behaviorPropertyTemplate),
    positionLivelinessBehaviorProperty: merge(positionLivelinessBehaviorData, behaviorPropertyTemplate),
    orientationLivelinessBehaviorProperty: merge(orientationLivelinessBehaviorData, behaviorPropertyTemplate),
    positionMirroringBehaviorProperty: merge(positionMirroringBehaviorData, behaviorPropertyTemplate),
    orientationMirroringBehaviorProperty: merge(orientationMirroringBehaviorData, behaviorPropertyTemplate),
    positionBoundingBehaviorProperty: merge(positionBoundingBehaviorData, behaviorPropertyTemplate),
    orientationBoundingBehaviorProperty: merge(orientationBoundingBehaviorData, behaviorPropertyTemplate),
    jointMatchBehaviorProperty: merge(jointMatchBehaviorData, behaviorPropertyTemplate),
    jointLivelinessBehaviorProperty: merge(jointLivelinessBehaviorData, behaviorPropertyTemplate),
    jointMirroringBehaviorProperty: merge(jointMirroringBehaviorData, behaviorPropertyTemplate),
    jointLimitsBehaviorProperty: merge(jointLimitsBehaviorData, behaviorPropertyTemplate),
    jointBoundingBehaviorProperty: merge(jointBoundingBehaviorData, behaviorPropertyTemplate),
    collisionAvoidanceBehaviorProperty: merge(collisionAvoidanceBehaviorData, behaviorPropertyTemplate),
    velocityMinimizationBehaviorProperty: merge(velocityMinimizationBehaviorData, behaviorPropertyTemplate),
    accelerationMinimizationBehaviorProperty: merge(accelerationMinimizationBehaviorData, behaviorPropertyTemplate),
    jerkMinimizationBehaviorProperty: merge(jerkMinimizationBehaviorData, behaviorPropertyTemplate),
    originVelocityMinimizationBehaviorProperty: merge(originVelocityMinimizationBehaviorData, behaviorPropertyTemplate),
    originAccelerationMinimizationBehaviorProperty: merge(originAccelerationMinimizationBehaviorData, behaviorPropertyTemplate),
    originJerkMinimizationBehaviorProperty: merge(originJerkMinimizationBehaviorData, behaviorPropertyTemplate),
    relativeMotionLivelinessBehaviorProperty: merge(relativeMotionLivelinessBehaviorData, behaviorPropertyTemplate),
    originPositionLivelinessBehaviorProperty: merge(originPositionLivelinessBehaviorData, behaviorPropertyTemplate),
    originOrientationLivelinessBehaviorProperty: merge(originOrientationLivelinessBehaviorData, behaviorPropertyTemplate),
    originPositionMatchBehaviorProperty: merge(originPositionMatchBehaviorData, behaviorPropertyTemplate),
    originOrientationMatchBehaviorProperty: merge(originOrientationMatchBehaviorData, behaviorPropertyTemplate),
    gravityBehaviorProperty: merge(gravityBehaviorData, behaviorPropertyTemplate),
    smoothnessMacroBehaviorProperty: merge(smoothnessMacroBehaviorData, behaviorPropertyTemplate),
    distanceMatchBehaviorProperty: merge(distanceMatchBehaviorData, behaviorPropertyTemplate),

    //State Node----------------------------------------------------------------------------------------
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
          accepts: ["positionMatchBehaviorProperty",
            "orientationMatchBehaviorProperty",
            "positionLivelinessBehaviorProperty",
            "orientationLivelinessBehaviorProperty",
            "positionMirroringBehaviorProperty",
            "orientationMirroringBehaviorProperty",
            "positionBoundingBehaviorProperty",
            "orientationBoundingBehaviorProperty",
            "jointMatchBehaviorProperty",
            "jointLivelinessBehaviorProperty",
            "jointMirroringBehaviorProperty",
            "jointLimitsBehaviorProperty",
            "jointBoundingBehaviorProperty",
            "collisionAvoidanceBehaviorProperty",
            "velocityMinimizationBehaviorProperty",
            "accelerationMinimizationBehaviorProperty",
            "jerkMinimizationBehaviorProperty",
            "originVelocityMinimizationBehaviorProperty",
            "originAccelerationMinimizationBehaviorProperty",
            "originJerkMinimizationBehaviorProperty",
            "relativeMotionLivelinessBehaviorProperty",
            "originPositionLivelinessBehaviorProperty",
            "originOrientationLivelinessBehaviorProperty",
            "originPositionMatchBehaviorProperty",
            "originOrientationMatchBehaviorProperty",
            "gravityBehaviorProperty",
            "smoothnessMacroBehaviorProperty",
            "distanceMatchBehaviorProperty"
          ],
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
