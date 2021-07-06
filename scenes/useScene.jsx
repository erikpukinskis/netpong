import React, { useEffect, useState, useContext, useRef } from "react";
import * as THREE from "three";

const SceneContext = React.createContext();

export function SceneProvider({ children }) {
  const [scene, setScene] = useState();
  const [renderer, setRenderer] = useState();
  const canvasRef = useRef();

  useEffect(function createThreeJsScene() {
    if (!canvasRef.current) return

    const scene = new THREE.Scene();
    setScene(scene);
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    var renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current
    });
    setRenderer(renderer);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    camera.position.z = 5;

    const animate = function () {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();
  }, [canvasRef]);

  return (
    <SceneContext.Provider value={scene}>
      <canvas ref={canvasRef} />
      {children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  return useContext(SceneContext);
}
