/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/
import { useGLTF } from '@react-three/drei';
import RElbowRollMesh from './RElbowRoll.glb';

export default function Model(props) {
  const { nodes, materials } = useGLTF(RElbowRollMesh);
  return [{type:'raw',geometry:nodes.RElbowRoll.geometry, material:materials.RElbowRollUV, scale:[0.01, 0.01, 0.01]}]




}

useGLTF.preload(RElbowRollMesh)
