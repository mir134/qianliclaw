import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { Html } from '@react-three/drei';
import type { BodyPartName } from '@/constants/workspaceBodyMap';

export interface BodyPartProps {
  name: BodyPartName;
  fileName: string;
  label: string;
  onClick: (fileName: string) => void;
  isSelected: boolean;
  exists: boolean;
  position: [number, number, number];
  scale?: number;
  geometry: 'sphere' | 'capsule' | 'box';
  /** 胶囊高度（仅 geometry=capsule） */
  capsuleHeight?: number;
  /** 仅用于射线检测，不显示几何体（如 GLB 模式下的覆盖层） */
  invisible?: boolean;
}

export function BodyPart({
  name,
  fileName,
  label,
  onClick,
  isSelected,
  exists,
  position,
  scale = 1,
  geometry,
  capsuleHeight = 0.5,
  invisible = false,
}: BodyPartProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = isSelected ? '#5eead4' : hovered ? '#94a3b8' : '#64748b';
  const emissive = isSelected ? '#0f766e' : hovered ? '#334155' : '#1e293b';
  const roughness = 0.35;
  const metalness = isSelected ? 0.25 : 0.1;

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick(fileName);
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        name={name}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
        scale={scale}
      >
        {geometry === 'sphere' && <sphereGeometry args={[0.5, 16, 16]} />}
        {geometry === 'capsule' && (
          <capsuleGeometry args={[0.35, capsuleHeight, 8, 16]} />
        )}
        {geometry === 'box' && <boxGeometry args={[0.6, 0.25, 0.3]} />}
        {invisible ? (
          <meshBasicMaterial
            color="#000"
            transparent
            opacity={0}
            depthWrite={false}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={isSelected ? 0.25 : 0.08}
            roughness={roughness}
            metalness={metalness}
          />
        )}
      </mesh>
      {isSelected && (
        <Html
          position={[0.6, 0, 0]}
          center
          style={{
            pointerEvents: 'auto',
            whiteSpace: 'nowrap',
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            userSelect: 'none',
          }}
        >
          <div>
            <div className="font-medium">{fileName}</div>
            <div className="opacity-80">{label}</div>
            {exists && <span className="text-green-400 text-xs">已存在</span>}
            <div className="mt-1 text-xs opacity-80">点击即编辑</div>
          </div>
        </Html>
      )}
    </group>
  );
}
