/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/


import { useGLTF } from '@react-three/drei';
import InfoPhycon from './InfoPhycon.glb';

export default function Model(props) {

  const { nodes } = useGLTF(InfoPhycon)
  return [ {
    type:'group',
    scale: [0.005,0.005,0.005],
    position: [-1.25,1.25,0],
    children: [
      { type: 'raw', geometry: nodes.InfoPhycon.geometry, material: nodes.InfoPhycon.material }
    ]}
  ]
}

useGLTF.preload(InfoPhycon)
