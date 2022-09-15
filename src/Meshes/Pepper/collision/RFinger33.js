/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const { nodes, materials } = useGLTF('/RFinger33.glb')
  return [{
    type : 'group', children : [{type : 'raw' , geometry : nodes.RFinger33_010.geometry ,material : nodes.RFinger33_010.material }]
  }]

     
  
}

useGLTF.preload('/RFinger33.glb')
