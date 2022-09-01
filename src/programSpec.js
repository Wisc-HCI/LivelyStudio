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
    // minified: true,
    // color: "#bdb655",
    // icon: FiGrid,
    hideNewPrefix: true,
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
const DEFAULT_FREQUENCY = {
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

const DEFAULT_TRANSLATION = {
  name: "Translation",
  type: SIMPLE_PROPERTY_TYPES.VECTOR3,
  default: [0.0, 0.0, 0.0],
  min: [0.0,0.0,0.0],
  step: 0.01
}

const DEFAULT_ROTATION = {
  name: "Rotation",
  type: SIMPLE_PROPERTY_TYPES.VECTOR3,
  default: [0.0, 0.0, 0.0],
  min: [-360.0,-360.0,-360.0],
  min: [360.0,360.0,360.0],
  step: 1
}

const DEFAULT_SIZE = {
  name: "Size",
  type: SIMPLE_PROPERTY_TYPES.VECTOR3,
  default: [0.0, 0.0, 0.0],
  min: [0.0,0.0,0.0],
  step: 0.01
}

const DEFAULT_SCALAR = {
  name: "Value",
  type: SIMPLE_PROPERTY_TYPES.NUMBER,
  default: 0.0,
  step: 0.01
}



//Name, weight, link, translation
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
      options: [],
      default: '',
    },
    translation: DEFAULT_TRANSLATION
  }
}

//Name, weight, link, rotation
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
    },
    rotation: DEFAULT_ROTATION
  }
}

//Name, weight, link, frequency, size
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
    frequency: DEFAULT_FREQUENCY,
    size: DEFAULT_SIZE
  }
}

//Name, weight, link, frequency, size
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
    frequency: DEFAULT_FREQUENCY,
    size: DEFAULT_SIZE
  }
}

//Name, weight, link1, link2, translation
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
    },
    translation: {...DEFAULT_TRANSLATION,name:'Offset'}
  }
}

//Name, weight, link1, link2, rotation
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
    },
    rotation: {...DEFAULT_ROTATION,name:'Offset'}
  }
}

//Name, weight, link, elipse
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
    },
    translation: {...DEFAULT_TRANSLATION,name:'Ellipse Translation'},
    rotation: {...DEFAULT_ROTATION,name:'Ellipse Rotation'},
    size: {...DEFAULT_SIZE,name:'Ellipse Size'}
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
    },
    rotation: {...DEFAULT_ROTATION,name:'Rotation Center'},
    scalar: {...DEFAULT_SCALAR,name:'Rotation Offset'}
  }
}

//Name, weight, joint, scalar
const jointMatchBehaviorData = {
  name: 'Joint Match Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorMatching
  },
  properties: {
    joint: {
      name: "Joint",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    scalar: DEFAULT_SCALAR
  }
}

//Name, weight, link, frequency, scalar
const jointLivelinessBehaviorData = {
  name: 'Joint Liveliness Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorLiveliness
  },
  properties: {
    joint: {
      name: "Joint",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    frequency: DEFAULT_FREQUENCY,
    scalar: {...DEFAULT_SCALAR,name:'Amplitude'}
  }
}

//Name, weight, joint1, joint2, scalar
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
    },
    scalar: {...DEFAULT_SCALAR,name:'Offset'}
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

//Name, weight, joint, scalar range
const jointBoundingBehaviorData = {
  name: 'Joint Bounding Behavior',
  instanceBlock: {
    icon: FiGrid,
    color: behaviorPropertyColorBounding
  },
  properties: {
    joint: {
      name: "Joint",
      type: SIMPLE_PROPERTY_TYPES.OPTIONS,
      options: [],
      default: '',
    },
    scalar: DEFAULT_SCALAR,
    delta: {...DEFAULT_SCALAR,name:'Delta'}
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

//Name, weight, link 1, link 2, frequency, scalar
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
    frequency: DEFAULT_FREQUENCY,
    scalar: {...DEFAULT_SCALAR,name:'Amplitude'}
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

//Name, weight, link1, link2, scalar
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
    },
    scalar: {...DEFAULT_SCALAR,name:'Distance'}
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