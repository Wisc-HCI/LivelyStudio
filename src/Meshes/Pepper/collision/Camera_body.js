/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const { nodes} = useGLTF('/camera_body.glb')
  return[{type: 'group' , children : [{type : 'raw', geometry : nodes.camera_body.geometry, material:nodes.camera_body.material}]}]  
}


useGLTF.preload('/camera_body.glb')
