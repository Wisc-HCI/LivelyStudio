/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import Ur5Shoulder from './shoulder.glb';
import { useGLTF } from '@react-three/drei';

export default function Model(props) {

  const { nodes, materials } = useGLTF(Ur5Shoulder);
  return [

{type:'raw', geometry:nodes['ActorShape0_0-Mesh023'].geometry,material:materials['verbindung.005']},
{type:'raw', geometry:nodes['ActorShape0_0-Mesh023_1'].geometry, material:materials['Scheibe.003']},
{type:'raw', geometry:nodes.Actor1.geometry, material:materials['blau.004']}

  ]
}

useGLTF.preload(Ur5Shoulder)
