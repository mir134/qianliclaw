import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OctopusPart } from './OctopusPart';
import {
  PART_TO_CONFIG_KEY,
  CONFIG_LABELS,
  type OctopusPartName,
} from '@/constants/configBodyMap';

export interface ConfigOctopus3DProps {
  onPartClick: (configKey: string) => void;
  selectedConfigKey: string;
}

const partConfig: Array<{
  name: OctopusPartName;
  position: [number, number, number];
  scale?: number;
  geometry: 'sphere' | 'capsule' | 'cylinder';
  cylinderHeight?: number;
  rotation?: [number, number, number];
}> = [
  { name: 'Head', position: [0, 1.2, 0], scale: 1.2, geometry: 'sphere' },
  {
    name: 'Tentacle1',
    position: [-0.6, 0.3, 0.5],
    scale: 1,
    geometry: 'cylinder',
    cylinderHeight: 1.2,
    rotation: [0.3, -0.5, 0],
  },
  {
    name: 'Tentacle2',
    position: [-0.3, 0.1, 0.7],
    scale: 1,
    geometry: 'cylinder',
    cylinderHeight: 1.4,
    rotation: [0.2, -0.3, 0.2],
  },
  {
    name: 'Tentacle3',
    position: [0, 0, 0.75],
    scale: 1,
    geometry: 'cylinder',
    cylinderHeight: 1.5,
    rotation: [0.1, 0, 0.3],
  },
  {
    name: 'Tentacle4',
    position: [0.3, 0.1, 0.7],
    scale: 1,
    geometry: 'cylinder',
    cylinderHeight: 1.4,
    rotation: [0.2, 0.3, -0.2],
  },
  {
    name: 'Tentacle5',
    position: [0.6, 0.3, 0.5],
    scale: 1,
    geometry: 'cylinder',
    cylinderHeight: 1.2,
    rotation: [0.3, 0.5, 0],
  },
  {
    name: 'Tentacle6',
    position: [-0.5, -0.3, 0.4],
    scale: 1,
    geometry: 'cylinder',
    cylinderHeight: 1.3,
    rotation: [-0.2, -0.4, 0.1],
  },
  {
    name: 'Tentacle7',
    position: [0.5, -0.3, 0.4],
    scale: 1,
    geometry: 'cylinder',
    cylinderHeight: 1.3,
    rotation: [-0.2, 0.4, -0.1],
  },
  {
    name: 'Tentacle8',
    position: [0, -0.5, 0.6],
    scale: 1,
    geometry: 'cylinder',
    cylinderHeight: 1.1,
    rotation: [-0.3, 0, 0],
  },
];

function OctopusScene({
  onPartClick,
  selectedConfigKey,
}: ConfigOctopus3DProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 3, 2]} intensity={0.35} />
      <pointLight position={[0, 1.5, 1.5]} intensity={0.4} distance={4} />
      <OrbitControls
        enablePan={false}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI * 0.7}
        target={[0, -0.2, 0]}
      />
      <group position={[0, 0, 0]} scale={1}>
        {partConfig.map(
          ({
            name,
            position,
            scale = 1,
            geometry,
            cylinderHeight,
            rotation,
          }) => {
            const configKey = PART_TO_CONFIG_KEY[name];
            return (
              <OctopusPart
                key={name}
                name={name}
                configKey={configKey}
                label={CONFIG_LABELS[configKey] ?? configKey}
                onClick={onPartClick}
                isSelected={selectedConfigKey === configKey}
                position={position}
                scale={scale}
                geometry={geometry}
                cylinderHeight={cylinderHeight}
                rotation={rotation}
              />
            );
          }
        )}
      </group>
    </>
  );
}

export function ConfigOctopus3D(props: ConfigOctopus3DProps) {
  return (
    <div className="flex h-full min-h-[420px] w-full flex-col rounded-lg border border-neutral-200 bg-neutral-100">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-3 py-2">
        <label className="text-sm text-neutral-600">3D 配置视图</label>
        <span className="text-xs text-neutral-500">章鱼虚拟动物</span>
      </div>
      <div className="flex-1 min-h-0">
        <Canvas
          className="h-full w-full"
          style={{ width: '100%', height: '100%' }}
          camera={{ position: [0, 0.8, 2.8], fov: 45 }}
          gl={{ antialias: true }}
        >
          <OctopusScene {...props} />
        </Canvas>
      </div>
    </div>
  );
}
