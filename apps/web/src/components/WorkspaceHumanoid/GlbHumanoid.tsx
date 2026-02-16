import { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { BodyPart } from './BodyPart';
import {
  BODY_PART_TO_FILE,
  FILE_LABELS,
  type BodyPartName,
} from '@/constants/workspaceBodyMap';

const partConfig: Array<{
  name: BodyPartName;
  position: [number, number, number];
  scale?: number;
  geometry: 'sphere' | 'capsule' | 'box';
  capsuleHeight?: number;
}> = [
  { name: 'Head', position: [0, 1.55, 0], scale: 0.9, geometry: 'sphere' },
  {
    name: 'Chest',
    position: [0, 1.05, 0],
    scale: 0.85,
    geometry: 'capsule',
    capsuleHeight: 0.4,
  },
  {
    name: 'Torso',
    position: [0, 0.5, 0],
    scale: 0.9,
    geometry: 'capsule',
    capsuleHeight: 0.6,
  },
  {
    name: 'LeftHand',
    position: [-0.65, 0.95, 0.15],
    scale: 0.5,
    geometry: 'sphere',
  },
  {
    name: 'RightHand',
    position: [0.65, 0.95, 0.15],
    scale: 0.5,
    geometry: 'sphere',
  },
  {
    name: 'Feet',
    position: [0, -0.15, 0.05],
    scale: 1,
    geometry: 'box',
  },
];

export interface GlbHumanoidProps {
  url: string;
  scale?: number;
  positionY?: number;
  onPartClick: (fileName: string) => void;
  selectedFile: string;
  files: { name: string; exists: boolean }[];
}

function Model({ url, scale = 1, positionY = 0 }: { url: string; scale?: number; positionY?: number }) {
  const { scene } = useGLTF(url);
  return (
    <primitive
      object={scene.clone()}
      scale={scale}
      position={[0, positionY, 0]}
    />
  );
}

export function GlbHumanoid({
  url,
  scale = 1,
  positionY = 0,
  onPartClick,
  selectedFile,
  files,
}: GlbHumanoidProps) {
  const fileExists = (fileName: string) =>
    files.some((f) => f.name === fileName && f.exists);

  return (
    <>
      <Suspense
        fallback={
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial color="#64748b" wireframe />
          </mesh>
        }
      >
        <Model url={url} scale={scale} positionY={positionY} />
      </Suspense>
      {/* 透明可点击覆盖层，与几何人形相同的部位位置 */}
      <group position={[0, 0, 0]}>
        {partConfig.map(({ name, position, scale: s = 1, geometry, capsuleHeight }) => {
          const fileName = BODY_PART_TO_FILE[name];
          return (
            <BodyPart
              key={name}
              name={name}
              fileName={fileName}
              label={FILE_LABELS[fileName] ?? fileName}
              onClick={onPartClick}
              isSelected={selectedFile === fileName}
              exists={fileExists(fileName)}
              position={position}
              scale={s}
              geometry={geometry}
              capsuleHeight={capsuleHeight}
              invisible
            />
          );
        })}
      </group>
    </>
  );
}
