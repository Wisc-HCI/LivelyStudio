/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const { nodes, materials } = useGLTF('/RFinger41.glb')
  return [{
    type : 'group', children : [{type : 'raw' ,geometry : nodes.imagetostl_mesh.geometry, material : materials.mat0 }]
  }]
}

useGLTF.preload('/RFinger41.glb')
