import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BodyPart } from './BodyPart';
import { GlbHumanoid } from './GlbHumanoid';
import {
  BODY_PART_TO_FILE,
  FILE_LABELS,
  type BodyPartName,
} from '@/constants/workspaceBodyMap';
import {
  HUMANOID_MODEL_PRESETS,
  DEFAULT_HUMANOID_PRESET_ID,
  type HumanoidModelPreset,
} from '@/constants/humanoidModels';

export interface WorkspaceHumanoidProps {
  onPartClick: (fileName: string) => void;
  selectedFile: string;
  files: { name: string; exists: boolean }[];
}

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

function HumanoidScene({
  onPartClick,
  selectedFile,
  files,
}: WorkspaceHumanoidProps) {
  const fileExists = (fileName: string) =>
    files.some((f) => f.name === fileName && f.exists);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 3, 2]} intensity={0.35} />
      <pointLight position={[0, 1.5, 1.5]} intensity={0.4} distance={4} />
      <OrbitControls
        enablePan={false}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI * 0.6}
        target={[0, 0.4, 0]}
      />
      <group position={[0, 0, 0]} scale={1}>
        {partConfig.map(
          ({ name, position, scale = 1, geometry, capsuleHeight }) => {
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
                scale={scale}
                geometry={geometry}
                capsuleHeight={capsuleHeight}
              />
            );
          }
        )}
      </group>
    </>
  );
}

function SceneContent({
  preset,
  customUrl,
  ...props
}: WorkspaceHumanoidProps & {
  preset: HumanoidModelPreset | null;
  customUrl: string;
}) {
  const isPrimitive = !preset || preset.type === 'primitive';
  const glbUrl =
    preset?.type === 'glb'
      ? preset.id === 'custom'
        ? customUrl
        : (preset.url ?? '')
      : '';

  if (isPrimitive) {
    return <HumanoidScene {...props} />;
  }
  if (glbUrl.trim()) {
    return (
      <>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} />
        <directionalLight position={[-3, 3, 2]} intensity={0.35} />
        <pointLight position={[0, 1.5, 1.5]} intensity={0.4} distance={4} />
        <OrbitControls
          enablePan={false}
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI * 0.6}
          target={[0, -0.1, 0]}
        />
        <GlbHumanoid
          url={glbUrl}
          scale={preset?.scale ?? 1}
          positionY={preset?.positionY ?? 0}
          onPartClick={props.onPartClick}
          selectedFile={props.selectedFile}
          files={props.files}
        />
      </>
    );
  }
  return (
    <>
      <ambientLight intensity={0.6} />
      <OrbitControls enablePan={false} />
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#64748b" wireframe />
      </mesh>
    </>
  );
}

export function WorkspaceHumanoid(props: WorkspaceHumanoidProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(
    DEFAULT_HUMANOID_PRESET_ID
  );
  const [customUrl, setCustomUrl] = useState('');

  const preset =
    HUMANOID_MODEL_PRESETS.find((p) => p.id === selectedPresetId) ?? null;
  const isCustom = selectedPresetId === 'custom';

  return (
    <div className="flex h-full min-h-[420px] w-full flex-col rounded-lg border border-neutral-200 bg-neutral-100">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-3 py-2">
        <label className="text-sm text-neutral-600">形象：</label>
        <select
          className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm"
          value={selectedPresetId}
          onChange={(e) => setSelectedPresetId(e.target.value)}
        >
          {HUMANOID_MODEL_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {isCustom && (
          <input
            type="url"
            className="min-w-[200px] rounded border border-neutral-300 px-2 py-1 text-sm"
            placeholder="输入 GLB 链接..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        )}
        <span className="text-xs text-neutral-500">
          更多模型：Poly Pizza、Khronos glTF-Sample-Models、Sketchfab
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <Canvas
          className="h-full w-full"
          style={{ width: '100%', height: '100%' }}
          camera={{ position: [0, 0.6, 3.2], fov: 50 }}
          gl={{ antialias: true }}
        >
          <SceneContent {...props} preset={preset} customUrl={customUrl} />
        </Canvas>
      </div>
    </div>
  );
}
