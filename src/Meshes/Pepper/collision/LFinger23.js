/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/LFinger23.glb')
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh geometry={nodes.LFinger23_010.geometry} material={nodes.LFinger23_010.material} />
    </group>
  )
}

useGLTF.preload('/LFinger23.glb')
