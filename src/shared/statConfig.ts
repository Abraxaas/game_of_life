import type { StatKey } from '../types/domain';

export interface StatDefinition {
  key: StatKey;
  name: string;
  icon: string;
}

export const STAT_DEFINITIONS: StatDefinition[] = [
  { key: 'health', name: 'Здоровье', icon: '◌' },
  { key: 'discipline', name: 'Дисциплина', icon: '△' },
  { key: 'order', name: 'Порядок', icon: '□' },
  { key: 'finance', name: 'Финансы', icon: '◇' },
  { key: 'socialization', name: 'Социализация', icon: '✦' },
];
