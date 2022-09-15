/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/


import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {

  const { nodes, materials } = useGLTF('/LFinger41.glb')

  return [{
    type : 'group', children : [{type : 'raw' , geometry : nodes.LFinger41_010.geometry, material : nodes.LFinger41_010.material }]
  }]


 
  
    
}

useGLTF.preload('/LFinger41.glb')
