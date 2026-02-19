import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { Html } from '@react-three/drei';
import type { OctopusPartName } from '@/constants/configBodyMap';

export interface OctopusPartProps {
  name: OctopusPartName;
  configKey: string;
  label: string;
  onClick: (configKey: string) => void;
  isSelected: boolean;
  position: [number, number, number];
  scale?: number;
  geometry: 'sphere' | 'capsule' | 'cylinder';
  cylinderHeight?: number;
  rotation?: [number, number, number];
}

export function OctopusPart({
  name,
  configKey,
  label,
  onClick,
  isSelected,
  position,
  scale = 1,
  geometry,
  cylinderHeight = 1,
  rotation = [0, 0, 0],
}: OctopusPartProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = isSelected ? '#f97316' : hovered ? '#fb923c' : '#ea580c';
  const emissive = isSelected ? '#c2410c' : hovered ? '#ea580c' : '#9a3412';
  const roughness = 0.35;
  const metalness = isSelected ? 0.25 : 0.1;

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick(configKey);
  };

  return (
    <group position={position} rotation={rotation}>
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
          <capsuleGeometry args={[0.35, 0.4, 8, 16]} />
        )}
        {geometry === 'cylinder' && (
          <cylinderGeometry args={[0.12, 0.08, cylinderHeight, 8, 16]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isSelected ? 0.25 : 0.08}
          roughness={roughness}
          metalness={metalness}
        />
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
            <div className="font-medium">{configKey}</div>
            <div className="opacity-80">{label}</div>
            <div className="mt-1 text-xs opacity-80">点击即编辑</div>
          </div>
        </Html>
      )}
    </group>
  );
}
