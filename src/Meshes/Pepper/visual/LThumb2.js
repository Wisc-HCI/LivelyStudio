/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/LThumb2.glb')
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh geometry={nodes.imagetostl_mesh.geometry} material={materials.mat0} />
    </group>
  )
}

useGLTF.preload('/LThumb2.glb')
