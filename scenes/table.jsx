import { useScene } from "./useScene";
import { useEffect } from "react";
import * as THREE from "three";

export function Table() {
  const scene = useScene();

  useEffect(
    function addSphere() {
      if (!scene) return;
      // const geometry = new THREE.SphereGeometry(5, 32, 32);
      // scene.add(sphere);
    },
    [scene]
  );

  return null;
}
