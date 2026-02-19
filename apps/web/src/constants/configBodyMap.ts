const OCTOPUS_PART_NAMES = [
  'Head',
  'Tentacle1',
  'Tentacle2',
  'Tentacle3',
  'Tentacle4',
  'Tentacle5',
  'Tentacle6',
  'Tentacle7',
  'Tentacle8',
] as const;

export type OctopusPartName = (typeof OCTOPUS_PART_NAMES)[number];

export const PART_TO_CONFIG_KEY: Record<OctopusPartName, string> = {
  Head: 'gateway',
  Tentacle1: 'models',
  Tentacle2: 'agents',
  Tentacle3: 'channels',
  Tentacle4: 'tools',
  Tentacle5: 'skills',
  Tentacle6: 'plugins',
  Tentacle7: 'auth',
  Tentacle8: 'commands',
};

export const CONFIG_LABELS: Record<string, string> = {
  gateway: '网关配置',
  models: '模型配置',
  agents: '智能体配置',
  channels: '渠道配置',
  tools: '工具配置',
  skills: '技能配置',
  plugins: '插件配置',
  auth: '认证配置',
  commands: '命令配置',
};

export function getPartNameByConfigKey(key: string): OctopusPartName | null {
  const entry = (
    Object.entries(PART_TO_CONFIG_KEY) as [OctopusPartName, string][]
  ).find(([, configKey]) => configKey === key);
  return entry ? entry[0] : null;
}
