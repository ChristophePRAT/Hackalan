export const PROFILES = [
  { id: 'a463e0bf26d790d6afdfda0cfd161cf5', name: 'Alex',       label: 'IT Manager',            source: 'Withings' },
  { id: '2bfaa7e6f9455ceafa0a59fd5b80496c', name: 'Christophe', label: 'Active Gym Guy',         source: 'Whoop' },
  { id: '7f82fc3b0abba3a86b5e15c911fc5f6e', name: 'Tassilo',    label: 'Moderate Student',       source: 'Samsung · Oura · Withings' },
  { id: '65b1357f1ceb98f51de05d1cbeb81532', name: 'Samuel',     label: 'Our CPO',                source: 'Withings' },
  { id: '1e2e53da12e0a9aebb3750af3c5857e1', name: 'Marcus',     label: 'Sedentary Techie',       source: 'Apple' },
  { id: '26158117728afa6083c58c958eed5d89', name: 'Jordan',     label: 'Moderate Techie',        source: 'Samsung' },
  { id: 'eb634efc4ac80c9ed6a355c8a99adb83', name: 'Elena',      label: 'Active Tennis Player',   source: 'Garmin' },
  { id: '79187771a36482f013203b32712e873d', name: 'Robert',     label: 'Senior · Heart Patient', source: 'Withings' },
] as const;

export const userIds = PROFILES.map(p => p.id);

export const CATEGORIES = [
  { label: 'Mental well-being',            color: '#8B5CF6', bg: '#F5F3FF' },
  { label: 'Sleep',                         color: '#6366F1', bg: '#EEF2FF' },
  { label: 'Sport & physical activity',     color: '#F97316', bg: '#FFF7ED' },
  { label: 'Nutrition',                     color: '#22C55E', bg: '#F0FDF4' },
  { label: 'Breathing & relaxation',        color: '#06B6D4', bg: '#ECFEFF' },
  { label: 'Digital detox',                 color: '#EC4899', bg: '#FDF2F8' },
  { label: 'Habits & addictions',           color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Productivity & organization',   color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'Relationships & social life',   color: '#F43F5E', bg: '#FFF1F2' },
  { label: 'Personal development',          color: '#A855F7', bg: '#FAF5FF' },
] as const;

export type CategoryLabel = typeof CATEGORIES[number]['label'];

export const XP_PER_LEVEL = 300;
