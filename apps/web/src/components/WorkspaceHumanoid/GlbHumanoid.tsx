import { Suspense, useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import {
  BODY_PART_TO_FILE,
  FILE_LABELS,
  type BodyPartName,
} from '@/constants/workspaceBodyMap';

const robotBoneMapping: Record<string, BodyPartName> = {
  Head: 'Head',
  Head_4: 'Torso',
  Head_2: 'Torso',
  Neck: 'Chest',
  Torso: 'Chest',
  Torso_1: 'Chest',
  Spine: 'Torso',
  Hips: 'Chest',
  Abdomen: 'Chest',
  Body: 'Chest',
  HandL_1: 'LeftHand',
  ShoulderL: 'LeftHand',
  UpperArmL: 'LeftHand',
  LowerArmL: 'LeftHand',
  Palm1L: 'LeftHand',
  Palm2L: 'LeftHand',
  Palm3L: 'LeftHand',
  ThumbL: 'LeftHand',
  Thumb2L: 'LeftHand',
  IndexL: 'LeftHand',
  Index2L: 'LeftHand',
  Middle1L: 'LeftHand',
  Middle2L: 'LeftHand',
  Ring1L: 'LeftHand',
  Ring2L: 'LeftHand',
  HandR_1: 'RightHand',
  ShoulderR: 'RightHand',
  UpperArmR: 'RightHand',
  LowerArmR: 'RightHand',
  Palm1R: 'RightHand',
  Palm2R: 'RightHand',
  Palm3R: 'RightHand',
  ThumbR: 'RightHand',
  Thumb2R: 'RightHand',
  IndexR: 'RightHand',
  Index2R: 'RightHand',
  Middle1R: 'RightHand',
  Middle2R: 'RightHand',
  Ring1R: 'RightHand',
  Ring2R: 'RightHand',
  FootL: 'Feet',
  FootR: 'Feet',
  UpperLegL: 'Feet',
  LowerLegL: 'Feet',
  UpperLegR: 'Feet',
  LowerLegR: 'Feet',
};

export interface GlbHumanoidProps {
  url: string;
  scale?: number;
  positionY?: number;
  onPartClick: (fileName: string) => void;
  selectedFile: string;
  files: { name: string; exists: boolean }[];
}

function Model({
  url,
  scale = 1,
  positionY = 0,
  onPartClick,
  files,
}: GlbHumanoidProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, groupRef);
  const [hoveredBone, setHoveredBone] = useState<string | null>(null);

  const fileExists = (fileName: string) =>
    files.some((f) => f.name === fileName && f.exists);

  const getBodyPartFromBone = (boneName: string): BodyPartName | null => {
    return robotBoneMapping[boneName] || null;
  };

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const actionNames = Object.keys(actions);
      const action = actions[actionNames[2]];
      if (action) {
        action.reset();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = true;
        action.play();
      }
    }
  }, [actions]);

  const getBoneNameFromMesh = (object: THREE.Object3D): string | null => {
    const mesh = object as THREE.Mesh;

    let boneName = (mesh.userData as any)?.boneName;
    if (boneName) return boneName;

    boneName = mesh.name;
    if (boneName && robotBoneMapping[boneName]) {
      return boneName;
    }

    let parent = mesh.parent;
    while (parent && (parent as any).name) {
      if ((parent as any).name && robotBoneMapping[(parent as any).name]) {
        return (parent as any).name;
      }
      parent = parent.parent;
    }

    return null;
  };

  const handleBoneClick = (e: unknown) => {
    const event = e as { stopPropagation: () => void; object: THREE.Object3D };
    event.stopPropagation?.();
    const boneName = getBoneNameFromMesh(event.object);
    if (boneName) {
      const bodyPart = getBodyPartFromBone(boneName);
      if (bodyPart) {
        const fileName = BODY_PART_TO_FILE[bodyPart];
        if (fileName) {
          onPartClick(fileName);
        }
      }
    }
  };

  const handleBoneHover = (e: any) => {
    const event = e;
    event.stopPropagation?.();
    const boneName = getBoneNameFromMesh(event.object);
    setHoveredBone(boneName ? boneName : null);
  };

  const handleBoneOut = (e: any) => {
    const event = e;
    event.stopPropagation?.();
    setHoveredBone(null);
  };

  return (
    <group ref={groupRef} scale={scale} position={[0, positionY, 0]}>
      <primitive
        object={scene.clone()}
        onClick={handleBoneClick}
        onPointerOver={handleBoneHover}
        onPointerOut={handleBoneOut}
      />
      {hoveredBone && (
        <group>
          {(() => {
            const bodyPart = getBodyPartFromBone(hoveredBone);
            if (!bodyPart) return null;
            const fileName = BODY_PART_TO_FILE[bodyPart];
            const label = FILE_LABELS[fileName] ?? fileName;
            const exists = fileExists(fileName);

            const bone = groupRef.current?.getObjectByName(hoveredBone);
            const position =
              bone?.getWorldPosition(new THREE.Vector3()) ||
              new THREE.Vector3(0, 1.5, 0);

            return (
              <Html
                style={{ pointerEvents: 'none' }}
                position={[position.x + 0.4, position.y, position.z]}
                center
              >
                <div
                  style={{
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    background: 'rgba(0,0,0,0.85)',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    userSelect: 'none',
                  }}
                >
                  <div className="font-medium">{fileName}</div>
                  <div className="opacity-80">{label}</div>
                  {exists && (
                    <span className="text-green-400 text-xs">已存在</span>
                  )}
                  {!exists && (
                    <span className="text-red-400 text-xs">未配置</span>
                  )}
                  <div className="mt-1 text-xs opacity-80">点击即编辑</div>
                </div>
              </Html>
            );
          })()}
        </group>
      )}
    </group>
  );
}

export function GlbHumanoid({
  url,
  scale = 1,
  positionY = 0,
  onPartClick,
  selectedFile: _selectedFile,
  files,
}: GlbHumanoidProps) {
  return (
    <Suspense
      fallback={
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#64748b" wireframe />
        </mesh>
      }
    >
      <Model
        url={url}
        scale={scale}
        positionY={positionY}
        onPartClick={onPartClick}
        selectedFile={_selectedFile}
        files={files}
      />
    </Suspense>
  );
}
