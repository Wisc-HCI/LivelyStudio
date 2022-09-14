/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/RShoulderRoll.glb')
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh geometry={nodes.RShoulderRoll_010.geometry} material={nodes.RShoulderRoll_010.material} />
    </group>
  )
}

useGLTF.preload('/RShoulderRoll.glb')
