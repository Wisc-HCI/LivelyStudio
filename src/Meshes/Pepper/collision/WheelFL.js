/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/


import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  
  const { nodes, materials } = useGLTF('/WheelFL.glb')

  return [{
    type : 'group', children : [{type : 'raw' , geometry : nodes.WheelFL_010.geometry, material : nodes.WheelFL_010.material }]
  }]


  

    
  
}

useGLTF.preload('/WheelFL.glb')
