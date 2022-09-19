/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from '@react-three/drei'
import mesh from './RFinger32.glb'

export default function Model() {
  const { nodes, materials } = useGLTF(mesh)

  return [{
    type : 'group', children : [{type : 'raw' ,geometry : nodes.RFinger32_010.geometry, material : nodes.RFinger32_010.material }]
  }]

       
}

useGLTF.preload(mesh)
