/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from '@react-three/drei';
import Finger from './finger.glb';

export default function Model(props) {
  const { nodes, materials } = useGLTF(Finger);
  return [{geometry:nodes.node0.geometry, material:materials.Part__Feature_007},
    {geometry:nodes.node1.geometry, material:materials.Part__Feature001_006},
  ]





}

useGLTF.preload(Finger)
