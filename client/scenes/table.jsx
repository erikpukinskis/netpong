import { useScene } from "./useScene";
import { useEffect } from "react";
import * as THREE from "three";

export function Table() {
  const { scene, render } = useScene();

  useEffect(
    function addSphere() {
      if (!scene) return;
      // const geometry = new THREE.SphereGeometry(5, 32, 32);
      // scene.add(sphere);
      const geometry = new THREE.BoxGeometry(.2, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);

      scene.add(cube);

      const animate = function () {
        requestAnimationFrame(animate);
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        render();
      };
      animate();
    },
    [scene]
  );

  return null;
}
