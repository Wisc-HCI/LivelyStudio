/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/


import { useGLTF } from '@react-three/drei'
import mesh from './LFinger21.glb'

export default function Model() {
  
  const { nodes, materials } = useGLTF (mesh)
  return [{
    type : 'group', children : [{type : 'raw' ,  geometry : nodes.LFinger21_010.geometry,  material : nodes.LFinger21_010.material}]
  }]

     
    
}

useGLTF.preload(mesh)
