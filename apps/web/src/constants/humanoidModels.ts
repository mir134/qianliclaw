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
    id: 'cesium-man',
    label: 'Cesium Man',
    type: 'glb',
    url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@2.0.0/2.0/CesiumMan/glTF-Binary/CesiumMan.glb',
    scale: 1.2,
    positionY: -0.5,
  },
  {
    id: 'rigged-figure',
    label: 'Rigged Simple',
    type: 'glb',
    url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@2.0.0/2.0/RiggedSimple/glTF-Binary/RiggedSimple.glb',
    scale: 0.8,
    positionY: -0.3,
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
export const DEFAULT_HUMANOID_PRESET_ID = 'primitive';
