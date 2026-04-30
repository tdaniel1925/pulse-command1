export const HEYGEN_AVATAR_GROUPS = [
  {
    id: 'e0e84faea390465896db75a83be45085',
    name: 'Professional Male',
    label: 'Pro Male',
    description: 'Professional male presenter',
    icon: '👨‍💼',
  },
  {
    id: 'bd3a37b07456488e87757da1f9f0673d',
    name: 'Professional Female',
    label: 'Pro Female',
    description: 'Professional female presenter',
    icon: '👩‍💼',
  },
  {
    id: 'e3f27f75328f49139a15cb8b6c5894b9',
    name: 'Casual Male',
    label: 'Casual Male',
    description: 'Casual, friendly male presenter',
    icon: '👨‍🎓',
  },
  {
    id: '1872a1dae86243818818bfb33ff6baec',
    name: 'Casual Female',
    label: 'Casual Female',
    description: 'Casual, friendly female presenter',
    icon: '👩‍🎓',
  },
  {
    id: 'e526201820384cb7a5412b29311c07cb',
    name: 'Executive',
    label: 'Executive',
    description: 'Senior executive presenter',
    icon: '🎩',
  },
  {
    id: '2c43461ac14846ef973be96e81c49ca3',
    name: 'Creative',
    label: 'Creative',
    description: 'Creative, energetic presenter',
    icon: '🎨',
  },
  {
    id: '00a0cd2d04b44543ae1bd4a7faec9460',
    name: 'Global',
    label: 'Global',
    description: 'International presenter',
    icon: '🌍',
  },
] as const

export type AvatarGroupId = typeof HEYGEN_AVATAR_GROUPS[number]['id']

export function getAvatarGroup(id: string) {
  return HEYGEN_AVATAR_GROUPS.find(g => g.id === id)
}
