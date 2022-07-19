/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/


import { useGLTF } from '@react-three/drei';
import RobotiqVisual85InnerKnuckle from './robotiq_arg2f_85_inner_knuckle.glb'

export default function Model(props) {
  const { nodes, materials } = useGLTF(RobotiqVisual85InnerKnuckle)
  return [{type:'raw', geometry:nodes.node0.geometry, material:materials['mymaterial.002']}]
}

useGLTF.preload(RobotiqVisual85InnerKnuckle)
