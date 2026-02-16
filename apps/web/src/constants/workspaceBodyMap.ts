/** 身体部位名（Three 对象 name，用于射线检测） */
export const BODY_PART_NAMES = [
  'Head',
  'Chest',
  'Torso',
  'LeftHand',
  'RightHand',
  'Feet',
] as const;

export type BodyPartName = (typeof BODY_PART_NAMES)[number];

/** 部位 -> 工作区文件名 */
export const BODY_PART_TO_FILE: Record<BodyPartName, string> = {
  Head: 'IDENTITY.md',
  Chest: 'SOUL.md',
  Torso: 'USER.md',
  LeftHand: 'TOOLS.md',
  RightHand: 'AGENTS.md',
  Feet: 'BOOTSTRAP.md',
};

/** 文件名 -> 简短说明（用于提示） */
export const FILE_LABELS: Record<string, string> = {
  'IDENTITY.md': '智能体名称、风格、表情',
  'SOUL.md': '人设、边界、语气',
  'USER.md': '用户档案与偏好',
  'TOOLS.md': '工具说明',
  'AGENTS.md': '操作指令与记忆',
  'BOOTSTRAP.md': '首次运行引导',
};

/** 根据文件名反查部位名 */
export function getPartNameByFile(fileName: string): BodyPartName | null {
  const entry = (Object.entries(BODY_PART_TO_FILE) as [BodyPartName, string][]).find(
    ([, file]) => file === fileName
  );
  return entry ? entry[0] : null;
}
