/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/


import { useGLTF } from '@react-three/drei';
import Ur3Shoulder from './shoulder.glb';

export default function Model(props) {
  const { nodes } = useGLTF(Ur3Shoulder)
  return [

    { type: 'raw', geometry: nodes.eSeries_UR3e_029.geometry, material: nodes.eSeries_UR3e_029.material, scale:[0.001, 0.001, 0.001], rotation:[Math.PI/2, 0, 0] },
    { type: 'raw', geometry: nodes.eSeries_UR3e_012.geometry, material: nodes.eSeries_UR3e_012.material, scale:[0.001, 0.001, 0.001], rotation:[Math.PI/2, 0, 0] },
    { type: 'raw', geometry: nodes.eSeries_UR3e_013.geometry, material: nodes.eSeries_UR3e_013.material, scale:[0.001, 0.001, 0.001], rotation:[Math.PI/2, 0, 0] }

  ]
}

useGLTF.preload(Ur3Shoulder)