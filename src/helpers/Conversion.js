import {
  behaviorPropertyLookup,
  behaviorPropertyDrawerBase,
  behaviorPropertyColorMatching,
} from "../Constants";
import { quaternionFromEuler } from "./Geometry";
import { toNumber } from "lodash";

// const RAD_2_DEG = 180 / Math.PI;
const DEG_2_RAD = Math.PI / 180;

export const bp2lik = (bp) => {
  let goal = null;
  let objective = {
    type: behaviorPropertyLookup[bp.type],
    weight: 0,
    name: behaviorPropertyLookup[bp.type],
  };
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
    goal = {
      ScalarRange: { value: bp.properties.scalar, delta: bp.properties.delta },
    };
  }

  // Handle Logic around Objectives
  ["link", "link1", "link2", "joint", "joint1", "joint2", "frequency"].forEach(
    (property) => {
      // console.log(bp.properties)
      if (bp.properties[property] !== undefined) {
        if (property === "frequency") {
          objective[property] = toNumber(bp.properties[property]);
        } else {
          objective[property] = bp.properties[property];
        }
      }
    }
  );

  return { goal, objective };
};

export const bp2vis = (bp) => {
  switch (behaviorPropertyLookup[bp.type]) {
    case "PositionBounding":
      return {
        [bp.id]: {
          name: bp.name,
          frame: 'world',
          position: {
            x: bp.properties.translation[0],
            y: bp.properties.translation[1],
            z: bp.properties.translation[2],
          },
          rotation: {
            w: 1,
            x: 0,
            y: 0,
            z: 0,
          },
          color: {...hexToRgb(behaviorPropertyColorMatching),a:0.5},
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          transformMode: "translate",
          shape:'sphere'
        },
      };
    case "OrientationMatch":
        return {
            [bp.id]: {
                name: bp.name,
                frame: bp.properties.link,
                position: {
                  x: 0,
                  y: 0,
                  z: 0,
                },
                rotation: {
                  w: 1,
                  x: 0,
                  y: 0,
                  z: 0,
                },
                color: {...hexToRgb(behaviorPropertyColorMatching),a:0.5},
                scale: { x: 0.1, y: 0.1, z: 0.1 },
                transformMode: "rotate",
                shape:'sphere'
              },
        }
    default:
        return null
  }
};

export function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}