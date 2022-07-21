/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/


import { useGLTF } from '@react-three/drei';
import RobotiqVisual85Pad from './robotiq_arg2f_85_pad.glb';

export default function Model(props) {

  const { nodes, materials } = useGLTF(RobotiqVisual85Pad)
  return [{type:'raw', geometry:nodes.node0.geometry,material:materials.mymaterial}]
}

useGLTF.preload(RobotiqVisual85Pad)