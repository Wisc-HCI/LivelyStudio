import {
  behaviorPropertyLookup,
  behaviorPropertyDrawerBase,
  behaviorPropertyColorMatching,
  behaviorPropertyColorLiveliness,
  behaviorPropertyColorMirroring,
  behaviorPropertyColorBounding,
} from "../Constants";
import { eulerFromQuaternion, quaternionFromEuler } from "./Geometry";
import { clamp, max, toNumber,range } from "lodash";
import { Quaternion, Euler, Vector3 } from "three";

const RAD_2_DEG = 180 / Math.PI;
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
  } else if (objective.type === "PositionLiveliness") {
    goal = { Size: bp.properties.size };
  } else if (objective.type === "OrientationLiveliness") {
    bp.properties.size.map((v) => v * DEG_2_RAD);
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
          objective[property] = max([0.5,toNumber(bp.properties[property])]);
        } else {
          objective[property] = bp.properties[property];
        }
      }
    }
  );

  return { goal, objective };
};

export const bp2vis = (bp, joints) => {
  console.log(joints);
  let feedbackItems = [];
  let wxyz = [1,0,0,0];
  let jointInfo = {};
  let jointInfos = [null,null];
  switch (behaviorPropertyLookup[bp.type]) {
    case "PositionMatch":
      feedbackItems.push({
        group: "items",
        id: bp.id,
        data: {
          name: bp.name,
          frame: "world",
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
          color: { ...hexToRgb(behaviorPropertyColorMatching), a: 0.5 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          transformMode: bp.selected ? "translate" : undefined,
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      break;
    case "OrientationMatch":
      wxyz = quaternionFromEuler(
        bp.properties.rotation.map((v) => v * DEG_2_RAD)
      );
      feedbackItems.push({
        group: "items",
        id: bp.id,
        data: {
          name: bp.name,
          frame: bp.properties.link + "-translation",
          position: {
            x: 0,
            y: 0,
            z: 0,
          },
          rotation: {
            w: wxyz[0],
            x: wxyz[1],
            y: wxyz[2],
            z: wxyz[3],
          },
          color: { ...hexToRgb(behaviorPropertyColorMatching), a: 0.5 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          transformMode: bp.selected ? "rotate" : undefined,
          highlighted: bp.selected,
          shape: "arrow",
        },
      });
      break;
    case "JointMatch":
      jointInfo = {};
      joints.some((j) => {
        if (j.name === bp.properties.joint) {
          jointInfo = j;
          return true;
        } else {
          return false;
        }
      });
      scalarInputItems(
        bp.id,
        jointInfo.childLink+'-translation',
        bp.selected,
        [jointInfo.lowerBound, jointInfo.upperBound],
        bp.properties.scalar,
        0.1,
        hexToRgb(behaviorPropertyColorMatching)
      ).forEach((item) => feedbackItems.push(item));
      break;
    case "PositionLiveliness":
      feedbackItems.push({
        group: "items",
        id: bp.id,
        data: {
          name: bp.name,
          frame: bp.properties.link + "-translation",
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
          color: { ...hexToRgb(behaviorPropertyColorLiveliness), a: 0.5 },
          scale: {
            x: bp.properties.size[0],
            y: bp.properties.size[1],
            z: bp.properties.size[2],
          },
          transformMode: bp.selected ? "scale" : undefined,
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      break;
    case "OrientationLiveliness":
      feedbackItems.push({
        group: "hulls",
        id: bp.id,
        data: {
          name: bp.name,
          frame: bp.properties.link,
          vertices: conicalHullVerticesVariable(0.5, {
            x: bp.properties.size[0],
            y: bp.properties.size[1],
            z: bp.properties.size[2],
          }),
          color: { ...hexToRgb(behaviorPropertyColorLiveliness), a: 0.5 },
          highlighted: bp.selected,
        },
      });
      break;
    case "JointLiveliness":
      jointInfo = {};
      joints.some((j) => {
        if (j.name === bp.properties.joint) {
          jointInfo = j;
          return true;
        } else {
          return false;
        }
      });
      scalarInputItems(
        bp.id,
        jointInfo.childLink,
        bp.selected,
        [0, (jointInfo.upperBound - jointInfo.lowerBound) / 2],
        bp.properties.scalar,
        0.05,
        hexToRgb(behaviorPropertyColorLiveliness)
      ).forEach((item) => feedbackItems.push(item));
      break;
    case "PositionMirroring":
      feedbackItems.push({
        group: "items",
        id: bp.id + "-link1",
        data: {
          name: bp.name,
          frame: bp.properties.link2+'-translation',
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
          color: { ...hexToRgb(behaviorPropertyColorMirroring), a: 0.3 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          shape: "sphere",
          highlighted: bp.selected,
        },
      });
      feedbackItems.push({
        group: "items",
        id: bp.id,
        data: {
          name: bp.name,
          frame: bp.properties.link2+'-translation',
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
          color: { ...hexToRgb(behaviorPropertyColorMirroring), a: 0.5 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          transformMode: bp.selected ? "translate" : undefined,
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      break;
    case "OrientationMirroring":
      wxyz = quaternionFromEuler(
        bp.properties.rotation.map((v) => v * DEG_2_RAD)
      );
      feedbackItems.push({
        group: "items",
        id: bp.id+'-link1',
        data: {
          name: bp.name,
          frame: bp.properties.link1,
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
          color: { ...hexToRgb(behaviorPropertyColorMirroring), a: 0.3 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          highlighted: bp.selected,
          shape: "arrow",
        },
      });
      feedbackItems.push({
        group: "items",
        id: bp.id,
        data: {
          name: bp.name,
          frame: bp.properties.link + "-translation",
          position: {
            x: 0,
            y: 0,
            z: 0,
          },
          rotation: {
            w: wxyz[0],
            x: wxyz[1],
            y: wxyz[2],
            z: wxyz[3],
          },
          color: { ...hexToRgb(behaviorPropertyColorMirroring), a: 0.5 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          transformMode: bp.selected ? "rotate" : undefined,
          shape: "arrow",
        },
      });
      break;
    case "JointMirroring":        
      joints.some((j) => {
        if (j.name === bp.properties.joint1) {
          jointInfos[0] = j;
          return jointInfos[0] && jointInfos[1];
        } else if (j.name === bp.properties.joint2) {
          jointInfos[1] = j;
          return jointInfos[0] && jointInfos[1];
        } else {
          return false;
        }
      });
      feedbackItems.push({
        group: "items",
        id: bp.id + "-link1",
        data: {
          name: bp.name,
          frame: jointInfos[0].childLink,
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
          color: { ...hexToRgb(behaviorPropertyColorMirroring), a: 0.3 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      feedbackItems.push({
        group: "items",
        id: bp.id + 'link2',
        data: {
          name: bp.name,
          frame: jointInfos[1].childLink,
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
          color: { ...hexToRgb(behaviorPropertyColorMirroring), a: 0.5 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      scalarInputItems(
        bp.id,
        jointInfos[1].childLink,
        bp.selected,
        [0, jointInfo.upperBound-jointInfo.lowerBound],
        bp.properties.scalar,
        0.05,
        hexToRgb(behaviorPropertyColorMirroring)
      ).forEach((item) => feedbackItems.push(item));
      break;
    case "PositionBounding":
      wxyz = quaternionFromEuler(
        bp.properties.rotation.map((v) => v * DEG_2_RAD)
      );
      feedbackItems.push({
        group: "items",
        id: bp.id,
        data: {
          name: bp.name,
          frame: "world",
          position: {
            x: bp.properties.translation[0],
            y: bp.properties.translation[1],
            z: bp.properties.translation[2],
          },
          rotation: {
            w: wxyz[0],
            x: wxyz[1],
            y: wxyz[2],
            z: wxyz[3],
          },
          color: { ...hexToRgb(behaviorPropertyColorBounding), a: 0.5 },
          scale: { x: bp.properties.size[0], y: bp.properties.size[1], z: bp.properties.size[2] },
          transformMode: bp.selected ? bp.properties.editMode : undefined,
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      break;
    case "OrientationBounding":
      console.log("Orientationbounding" , conicalHullVertices(0.5, bp.properties.scalar));
      feedbackItems.push({
        group: "hulls",
        id: bp.id,
        data: {
          name: bp.name,
          frame: bp.properties.link,
          vertices: conicalHullVertices(0.5, bp.properties.scalar),
          color: { ...hexToRgb(behaviorPropertyColorBounding), a: 0.5 },
          highlighted: bp.selected,
         
         
        },
      });
      break;
    case "JointBounding":
      jointInfo = {};
      joints.some((j) => {
        if (j.name === bp.properties.joint) {
          jointInfo = j;
          return true;
        } else {
          return false;
        }
      });
      rangeInputItems(
        bp.id,
        jointInfo.childLink,
        bp.selected,
        [jointInfo.lowerBound, jointInfo.upperBound],
        [bp.properties.scalar-bp.properties.delta,bp.properties.scalar+bp.properties.delta],
        0.05,
        hexToRgb(behaviorPropertyColorBounding)
      ).forEach((item) => feedbackItems.push(item));
      break;
    case "RelativeMotionLiveliness":
      feedbackItems.push({
        group: "items",
        id: bp.id + "-link1",
        data: {
          name: bp.name,
          frame: bp.properties.link1,
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
          color: { ...hexToRgb(behaviorPropertyColorLiveliness), a: 0.5 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      feedbackItems.push({
        group: "items",
        id: bp.id + "-link1",
        data: {
          name: bp.name,
          frame: bp.properties.link1,
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
          color: { ...hexToRgb(behaviorPropertyColorLiveliness), a: 0.5 },
          scale: { x: bp.properties.scalar, y: bp.properties.scalar, z: bp.properties.scalar },
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      break;
    case "DistanceMatch":
      feedbackItems.push({
        group: "items",
        id: bp.id + "-link1",
        data: {
          name: bp.name,
          frame: bp.properties.link1,
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
          color: { ...hexToRgb(behaviorPropertyColorMatching), a: 0.7 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      feedbackItems.push({
        group: "items",
        id: bp.id + "-link1",
        data: {
          name: bp.name,
          frame: bp.properties.link1,
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
          color: { ...hexToRgb(behaviorPropertyColorMatching), a: 0.3 },
          scale: { x: bp.properties.scalar, y: bp.properties.scalar, z: bp.properties.scalar },
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      feedbackItems.push({
        group: "items",
        id: bp.id + '-link2',
        data: {
          name: bp.name,
          frame: bp.properties.link2,
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
          color: { ...hexToRgb(behaviorPropertyColorMatching), a: 0.7 },
          scale: { x: 0.1, y: 0.1, z: 0.1 },
          highlighted: bp.selected,
          shape: "sphere",
        },
      });
      break;
    default:
      break;
  }
  return feedbackItems;
};

export function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export const rs2bp = ({ current, worldTransform, localTransform, source, joints, links }) => {
  
  let jointInfo = null;
  if (current.properties.joint) {
    joints.some((j) => {
      if (j.name === bp.properties.joint) {
        jointInfo = j;
        return true;
      } else {
        return false;
      }
    });
  } else if (current.properties.joint1) {
    jointInfo = [null,null];
    joints.some((j) => {
      if (j.name === bp.properties.joint1) {
        jointInfo[0] = j;
        return jointInfo[0] && jointInfo[1];
      } else if (j.name === bp.properties.joint2) {
        jointInfos[1] = j;
        return jointInfo[0] && jointInfo[1];
      } else {
        return false;
      }
    });
  }
  
  switch (behaviorPropertyLookup[current.type]) {
    case "PositionMatch":
      current.properties.translation = [
        worldTransform.position.x,
        worldTransform.position.y,
        worldTransform.position.z,
      ];
      break;
    case "OrientationMatch":
      current.properties.rotation = eulerFromQuaternion([
        worldTransform.quaternion.w,
        worldTransform.quaternion.x,
        worldTransform.quaternion.y,
        worldTransform.quaternion.z,
      ]).map((v) => v * RAD_2_DEG);
      break;
    case "JointMatch":
      // TODO: FIX
      console.log()
      current.properties.scalar = clamp((4 * localTransform.position.z + 0.5) * (range[1]-range[0]) + range[0],range[0],range[1]);
      break;
    case "PositionBounding":
      if (current.properties.editMode === 'translate') {
        current.properties.translation = [
          worldTransform.position.x,
          worldTransform.position.y,
          worldTransform.position.z,
        ];
      } else if (current.properties.editMode === 'rotate') {
        current.properties.rotation = eulerFromQuaternion([
          worldTransform.quaternion.w,
          worldTransform.quaternion.x,
          worldTransform.quaternion.y,
          worldTransform.quaternion.z,
        ]).map((v) => v * RAD_2_DEG);
      } else if (current.properties.editMode === 'scale') {
        current.properties.size = [
          worldTransform.scale.x,
          worldTransform.scale.y,
          worldTransform.scale.z
        ]
      }
      break;
    case "OrientationBounding":
      
      current.properties.rotation = eulerFromQuaternion([
        worldTransform.quaternion.w,
        worldTransform.quaternion.x,
        worldTransform.quaternion.y,
        worldTransform.quaternion.z,
      ]).map((v) => v * RAD_2_DEG);
      break;
    case "JointBounding":
      // rangeInputItems
      break;
    case "PositionLiveliness":
      // Looks like PositionBounding but only scale
      break;
    // case "OrientationLiveliness":
    //   // Not Doing
    //   break;
    case "JointLiveliness":
      // Pill (scalarInputValue)
      break;
    case "PositionMirroring":
      // Translate controls, should look like positionMatch
      break;
    case "OrientationMirroring":
      // Rotate controls, should look like orientationMatch
      break;
    case "JointMirroring":
      // Pill control thing, should convert z value to the scalar
      break;
    default:
      break;
  }
  return current;
};

const conicalHullVertices = (length, angle) => {
  const origin = new Quaternion();
  const eulerA = new Euler(0, Math.PI / 2, 0);
  
  const qA = origin
    .clone()
    .rotateTowards(new Quaternion().setFromEuler(eulerA), angle || 0.001);
  const qB = origin
    .clone()
    .rotateTowards(new Quaternion().setFromEuler(eulerA), angle ? angle / 2 : 0.0005);
  const centralVec = new Vector3(0, 0, length);
  const vecA = centralVec.clone().applyQuaternion(qA);
  const vecB = centralVec.clone().applyQuaternion(qB);

  


  return [
    { x: 0, y: 0, z: 0 },
    { x: centralVec.x, y: centralVec.y, z: centralVec.z },
    { x: vecA.x, y: vecA.y, z: vecA.z },
    ...range(0, 2 * Math.PI, Math.PI / 6).map((a) => {
      return { x: vecA.x * Math.sin(a), y: vecA.x * Math.cos(a), z: vecA.z };
    }),
    ...range(0, 2 * Math.PI, Math.PI / 6).map((a) => {
      return { x: vecB.x * Math.sin(a), y: vecB.x * Math.cos(a), z: vecB.z };
    }),
  ];
};

const conicalHullVerticesVariable = (length, size) => {
  // const origin = new Quaternion();
  const eulers = [
    new Euler(size.x || 0.001, 0, 0),
    new Euler(-size.x || -0.001, 0, 0),
    new Euler(0, size.y || 0.001, 0),
    new Euler(0, -size.y || 0.001, 0),
  ];
  const qs = eulers.map((e) => new Quaternion().setFromEuler(e));
  const centralVec = new Vector3(0, 0, length);
  const vecs = qs.map((q) => centralVec.clone().applyQuaternion(q));

  const vertices = [
    { x: 0, y: 0, z: 0 },
    { x: centralVec.x, y: centralVec.y, z: centralVec.z },
    ...vecs.map((v) => ({ x: v.x, y: v.y, z: v.z })),
  ];
  console.log('vertices',vertices);
  return vertices
};

const scalarInputItems = (id, frame, selected, range, value, offset, color) => {
  const z = ((value - range[0]) / (range[1] - range[0])) * 0.25 - 0.25 / 2;
  return [
    {
      group: "items",
      id: id + "-range-housing",
      data: {
        shape: "capsule",
        name: "Input Housing",
        frame,
        position: { x: 0, y: offset || 0.05, z: 0 },
        rotation: { w: 1, x: 0, y: 0, z: 0 },
        color: { r: 100, g: 100, b: 100, a: 0.3 },
        scale: { x: 1, y: 1, z: 1 },
        shapeParams: { height: 0.25, radius: 0.05 },
        highlighted: selected,
      },
    },
    {
      group: "items",
      id,
      data: {
        shape: "sphere",
        name: "Input Indicator",
        frame,
        position: { x: 0, y: offset || 0.05, z },
        rotation: { w: 1, x: 0, y: 0, z: 0 },
        color: { ...color, a: 1 },
        scale: { x: 0.09, y: 0.09, z: 0.09 },
        transformMode: selected ? "translate-z" : undefined,
        highlighted: false,
      },
    },
  ];
};

const rangeInputItems = (
  id,
  frame,
  range,
  selected,
  valueRange,
  offset,
  color
) => {
  const zSphereTop =
    ((valueRange[1] - range[0]) / (range[1] - range[0])) * 0.25 - 0.25 / 2;
  const zSphereBottom =
    ((valueRange[0] - range[0]) / (range[1] - range[0])) * 0.25 - 0.25 / 2;
  const rangeHeight =
    ((valueRange[1] - valueRange[0]) / (range[1] - range[0])) * 0.24;

  return [
    {
      group: "items",
      id: id + "-range-housing",
      data: {
        shape: "capsule",
        name: "Input Housing",
        frame,
        position: { x: 0, y: offset || 0.05, z: 0 },
        rotation: { w: 1, x: 0, y: 0, z: 0 },
        color: { r: 100, g: 100, b: 100, a: 0.3 },
        scale: { x: 1, y: 1, z: 1 },
        shapeParams: { height: 0.25, radius: 0.05 },
        highlighted: selected,
      },
    },
    {
      group: "items",
      id: id + "-range-inner",
      data: {
        shape: "capsule",
        name: "Input Housing",
        frame,
        position: {
          x: 0,
          y: offset || 0.05,
          z: (zSphereTop + zSphereBottom) / 2,
        },
        rotation: { w: 1, x: 0, y: 0, z: 0 },
        color: { ...color, a: 1 },
        scale: { x: 1, y: 1, z: 1 },
        shapeParams: { height: rangeHeight, radius: 0.045 },
        highlighted: false,
      },
    },
    {
      group: "items",
      id: id + "-bottom",
      data: {
        shape: "sphere",
        name: "Input Indicator Bottom",
        frame,
        position: { x: 0, y: offset || 0.05, z: zSphereBottom },
        rotation: { w: 1, x: 0, y: 0, z: 0 },
        color: { ...color, a: 1 },
        scale: { x: 0.09, y: 0.09, z: 0.09 },
        transformMode: selected ? "translate-z" : undefined,
        highlighted: false,
      },
    },
    {
      group: "items",
      id: id + "-top",
      data: {
        shape: "sphere",
        name: "Input Indicator Top",
        frame,
        position: { x: 0, y: offset || 0.05, z: zSphereTop },
        rotation: { w: 1, x: 0, y: 0, z: 0 },
        color: { ...color, a: 1 },
        scale: { x: 0.09, y: 0.09, z: 0.09 },
        transformMode: selected ? "translate-z" : undefined,
        highlighted: false,
      },
    },
  ];
};
