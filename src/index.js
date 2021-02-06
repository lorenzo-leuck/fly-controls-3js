import * as THREE from 'three'
import ReactDOM from 'react-dom'
import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas, useLoader, extend, useFrame, useThree } from 'react-three-fiber'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import uniform from './uniform'
import './styles.css'

extend({ FlyControls })
uniform.init(THREE)
const makeUrl = file => `https://raw.githubusercontent.com/flowers1225/threejs-earth/master/src/img/${file}.jpg`

function Earth() {
  const ref = useRef()
  const [texture, bump, moon] = useLoader(THREE.TextureLoader, [
    makeUrl('earth4'),
    makeUrl('earth_bump'),
    'http://jaanga.github.io/moon/heightmaps/WAC_GLD100_E000N1800_004P-1024x512.png'
  ])
  return (
    <group ref={ref}>
      <Stars />
      <rectAreaLight intensity={1} position={[10, 10, 10]} width={10} height={1000} onUpdate={self => self.lookAt(new THREE.Vector3(0, 0, 0))} />
      <rectAreaLight intensity={1} position={[-10, -10, -10]} width={1000} height={10} onUpdate={self => self.lookAt(new THREE.Vector3(0, 0, 0))} />
      <mesh>
        <sphereBufferGeometry attach="geometry" args={[2, 64, 64]} />
        <meshStandardMaterial attach="material" map={texture} bumpMap={bump} bumpScale={0.05} />
      </mesh>
      <mesh position={[5, 0, -10]}>
        <sphereBufferGeometry attach="geometry" args={[0.5, 64, 64]} />
        <meshStandardMaterial attach="material" color="gray" map={moon} />
      </mesh>
    </group>
  )
}

function Stars({ count = 5000 }) {
  const positions = useMemo(() => {
    let positions = []
    for (let i = 0; i < count; i++) {
      positions.push(Math.random() * 10 * (Math.round(Math.random()) ? -40 : 40))
      positions.push(Math.random() * 10 * (Math.round(Math.random()) ? -40 : 40))
      positions.push(Math.random() * 10 * (Math.round(Math.random()) ? -40 : 40))
    }
    return new Float32Array(positions)
  }, [count])
  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute attachObject={['attributes', 'position']} count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial attach="material" size={1} sizeAttenuation color="white" transparent opacity={0.8} />
    </points>
  )
}

function Controls() {
  const { camera } = useThree()
  const ref = useRef()
  useFrame((state, delta) => ref.current.update(delta))
  return <flyControls ref={ref} args={[camera]} />
}

ReactDOM.render(
  <Canvas
    camera={{ position: [0, 0, 10], fov: 40 }}
    onCreated={({ gl }) => {
      gl.gammaInput = true
      gl.toneMapping = THREE.ACESFilmicToneMapping
    }}>
    <pointLight intensity={0.1} position={[10, 10, 10]} />
    <rectAreaLight intensity={3} position={[0, 10, -10]} width={30} height={30} onUpdate={self => self.lookAt(new THREE.Vector3(0, 0, 0))} />
    <Suspense fallback={null}>
      <Earth />
    </Suspense>
    <Controls />
  </Canvas>,
  document.getElementById('root')
)
