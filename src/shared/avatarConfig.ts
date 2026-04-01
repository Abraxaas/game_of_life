import type {
  AvatarBeardStyle,
  AvatarEyeColor,
  AvatarFormValues,
  AvatarGender,
  AvatarHairColor,
  AvatarHairStyle,
  AvatarSkinTone,
  StatKey,
} from '../types/domain';

export const AVATAR_GENDER_OPTIONS: Array<{ value: AvatarGender; label: string }> = [
  { value: 'female', label: 'Женский' },
  { value: 'male', label: 'Мужской' },
];

export const AVATAR_SKIN_TONE_OPTIONS: Array<{
  value: AvatarSkinTone;
  label: string;
  color: string;
}> = [
  { value: 'light', label: 'Светлая', color: '#f1d0b5' },
  { value: 'medium', label: 'Средняя', color: '#d5a37d' },
  { value: 'deep', label: 'Темная', color: '#8d5d42' },
];

export const AVATAR_EYE_COLOR_OPTIONS: Array<{
  value: AvatarEyeColor;
  label: string;
  color: string;
}> = [
  { value: 'brown', label: 'Карие', color: '#5c3826' },
  { value: 'hazel', label: 'Ореховые', color: '#86653d' },
  { value: 'green', label: 'Зеленые', color: '#4f7a53' },
  { value: 'blue', label: 'Голубые', color: '#5f83b8' },
];

export const AVATAR_HAIR_COLOR_OPTIONS: Array<{
  value: AvatarHairColor;
  label: string;
  color: string;
}> = [
  { value: 'black', label: 'Черные', color: '#2d2623' },
  { value: 'brown', label: 'Каштановые', color: '#5c4031' },
  { value: 'blonde', label: 'Светлые', color: '#cfa86a' },
  { value: 'auburn', label: 'Рыжеватые', color: '#995a3e' },
];

export const AVATAR_HAIR_STYLE_OPTIONS: Array<{
  value: AvatarHairStyle;
  label: string;
}> = [
  { value: 'short', label: 'Короткая' },
  { value: 'wave', label: 'Волна' },
  { value: 'long', label: 'Длинная' },
];

export const AVATAR_BEARD_STYLE_OPTIONS: Array<{
  value: AvatarBeardStyle;
  label: string;
}> = [
  { value: 'none', label: 'Нет' },
  { value: 'stubble', label: 'Щетина' },
  { value: 'trim', label: 'Короткая' },
  { value: 'full', label: 'Полная' },
];

export const DEFAULT_AVATAR_VALUES: AvatarFormValues = {
  gender: 'male',
  skinTone: 'medium',
  eyeColor: 'brown',
  hairColor: 'brown',
  hairStyle: 'short',
  beardStyle: 'none',
};

export const DASHBOARD_STAT_COLORS: Record<StatKey, { accent: string; glow: string }> = {
  health: { accent: '#3e8f72', glow: 'rgba(62, 143, 114, 0.34)' },
  discipline: { accent: '#4f7b9d', glow: 'rgba(79, 123, 157, 0.32)' },
  order: { accent: '#8e6f4f', glow: 'rgba(142, 111, 79, 0.28)' },
  finance: { accent: '#b58535', glow: 'rgba(181, 133, 53, 0.32)' },
  socialization: { accent: '#b06072', glow: 'rgba(176, 96, 114, 0.30)' },
};
