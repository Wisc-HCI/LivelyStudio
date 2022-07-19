/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import Ur5Base from './base.glb';
import { useGLTF } from '@react-three/drei';

export default function Model(props) {

  const { nodes, materials } = useGLTF( Ur5Base)
  return [

{type:'raw', geometry:nodes['ActorShape0_0-Mesh002'].geometry, material:materials['Rohr.005']},
{type:'raw',geometry:nodes['ActorShape0_0-Mesh002_1'].geometry, material:materials['Scheibe.002']}

  ]
}

useGLTF.preload( Ur5Base)
