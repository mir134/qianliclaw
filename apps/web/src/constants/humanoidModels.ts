/**
 * 人形模型预设：简约几何 / 远程 GLB
 * 更多免费模型可搜：Poly Pizza、Sketchfab、Khronos glTF-Sample-Models
 */
export interface HumanoidModelPreset {
  id: string;
  label: string;
  type: 'primitive' | 'glb';
  /** GLB 地址，type=glb 时必填 */
  url?: string;
  /** GLB 缩放，默认 1 */
  scale?: number;
  /** GLB 垂直偏移，便于居中 */
  positionY?: number;
}

export const HUMANOID_MODEL_PRESETS: HumanoidModelPreset[] = [
  {
    id: 'primitive',
    label: '简约几何',
    type: 'primitive',
  },
  {
    id: 'robot-expressive',
    label: 'Robot Expressive',
    type: 'glb',
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    scale: 1.0,
    positionY: -0.8,
  },
  {
    id: 'custom',
    label: '自定义 URL',
    type: 'glb',
    url: '',
    scale: 1,
    positionY: 0,
  },
];

/** 默认选中预设 id */
export const DEFAULT_HUMANOID_PRESET_ID = 'robot-expressive';
