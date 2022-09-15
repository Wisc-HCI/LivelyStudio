/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/


import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const { nodes, materials } = useGLTF('/LFinger23.glb')

  return [{
    type : 'group', children : [{type : 'raw' ,   geometry : nodes.LFinger23_010.geometry, material : nodes.LFinger23_010.material}]
  }]


  
    
    
}

useGLTF.preload('/LFinger23.glb')
