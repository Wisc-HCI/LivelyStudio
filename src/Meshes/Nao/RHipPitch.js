/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from '@react-three/drei';
import RHipPitchMesh from './RHipPitch.glb';

export default function Model(props) {
  const { nodes, materials } = useGLTF(RHipPitchMesh);
  return [{type:'raw', geometry:nodes.RHipPitch.geometry, material:materials.RHipPitchUV, scale:[0.01, 0.01, 0.01]}]
}

useGLTF.preload(RHipPitchMesh)