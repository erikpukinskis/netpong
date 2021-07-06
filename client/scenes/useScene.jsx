import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import * as THREE from "three";

const SceneContext = React.createContext();

export function SceneProvider({ children }) {
  const [scene, setScene] = useState();
  const [renderer, setRenderer] = useState();
  const [camera, setCamera] = useState()
  const canvasRef = useRef();
  const dirtyCount = useRef(0);

  const render = useCallback(function requestRender() {
    if (!renderer) return
    renderer.render(scene, camera);
  }, [renderer])

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
    setCamera(camera)
    var renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current
    });
    setRenderer(renderer);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.position.z = 5;

    renderer.render(scene, camera);
  }, [canvasRef]);

  return (
    <SceneContext.Provider value={{ scene, render }}>
      <canvas ref={canvasRef} />
      {canvasRef.current && children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  return useContext(SceneContext);
}
