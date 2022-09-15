/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from "@react-three/drei";
import mesh from "./HeadPitch.glb";
export default function Model() {
  const { nodes, materials } = useGLTF(mesh);
  return [{
    type: 'group', children: [
      { type: 'raw', geometry: nodes.imagetostl_mesh_1.geometry, material: nodes.imagetostl_mesh_1.material },

      { type: 'raw', geometry: nodes.imagetostl_mesh_2.geometry, material: materials.overall },

      {
        type: 'raw', geometry: nodes.imagetostl_mesh_3.geometry,
        material: materials["Material.001"]
      },

      {
        type: 'raw',
        geometry: nodes.imagetostl_mesh_4.geometry,
        material: materials.led
      }



    ]
  }]
}

useGLTF.preload(mesh);


