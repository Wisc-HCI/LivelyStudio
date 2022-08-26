import {
  behaviorPropertyLookup,
  behaviorPropertyDrawerBase,
} from "../Constants";
import { quaternionFromEuler } from "./Geometry";

// const RAD_2_DEG = 180 / Math.PI;
const DEG_2_RAD = Math.PI / 180;

export const bp2lik = (bp) => {
  let goal = null;
  let objective = { type: behaviorPropertyLookup[bp.type], weight: 0 };
  // let weight = 0;

  if (behaviorPropertyDrawerBase.includes(bp.type)) {
    return { goal, objective };
  }

  // Handle Logic around Goals
  if (["PositionMatch", "PositionMirroring"].includes(objective.type)) {
    goal = { Translation: bp.properties.translation };
  } else if (
    ["OrientationMatch", "OrientationMirroring"].includes(objective.type)
  ) {
    const wxyz = quaternionFromEuler(
      bp.properties.rotation.map((v) => v * DEG_2_RAD)
    );
    goal = { Rotation: [wxyz[1], wxyz[2], wxyz[3], wxyz[0]] };
  } else if (
    [
      "JointMatch",
      "JointMirroring",
      "DistanceMatch",
      "JointLiveliness",
      "RelativeMotionLiveliness",
    ].includes(objective.type)
  ) {
    goal = { Scalar: bp.properties.scalar };
  } else if (
    ["PositionLiveliness", "OrientationLiveliness"].includes(objective.type)
  ) {
    goal = { Size: bp.properties.size };
  } else if (["PositionBounding"].includes(objective.type)) {
    const wxyz = quaternionFromEuler(
      bp.properties.rotation.map((v) => v * DEG_2_RAD)
    );
    goal = {
      Ellipse: {
        pose: {
          translation: bp.properties.translation,
          rotation: [wxyz[1], wxyz[2], wxyz[3], wxyz[0]],
        },
        size: bp.properties.size,
      },
    };
  } else if (["OrientationBounding"].includes(objective.type)) {
    const wxyz = quaternionFromEuler(
      bp.properties.rotation.map((v) => v * DEG_2_RAD)
    );
    goal = {
      RotationRange: {
        rotation: [wxyz[1], wxyz[2], wxyz[3], wxyz[0]], // [x, y, z, w] ordering for quaternion
        delta: bp.properties.scalar,
      },
    };
  } else if (["JointBounding"].includes(objective.type)) {
    goal = {ScalarRange: {value:bp.properties.scalar,delta:bp.properties.delta}}
  }

  // Handle Logic around Objectives
  ['link','link1','link2','joint','joint1','joint2','frequency'].forEach(property=>{
    // console.log(bp.properties)
    if (bp.properties[property]!==undefined) {
        objective[property] = bp.properties[property]
    }
  })

  return { goal, objective };
};
