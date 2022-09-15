/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  
  const { nodes, materials } = useGLTF('/RFinger42.glb')
  return [{
    type : 'group', children : [{type : 'raw' ,geometry : nodes.imagetostl_mesh.geometry, material : materials.mat0 }]
  }]
}

useGLTF.preload('/RFinger42.glb')
