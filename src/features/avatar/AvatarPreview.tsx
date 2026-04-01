import type { CSSProperties } from 'react';
import type { AvatarProfile, Stat } from '../../types/domain';
import {
  getAvatarColorValue,
  getAvatarStages,
} from '../../utils/avatar';

interface AvatarPreviewProps {
  avatar: AvatarProfile;
  stats: Stat[];
}

export function AvatarPreview({ avatar, stats }: AvatarPreviewProps) {
  const stages = getAvatarStages(stats);
  const previewStyle = {
    '--avatar-skin': getAvatarColorValue(avatar.skinTone),
    '--avatar-eyes': getAvatarColorValue(avatar.eyeColor),
    '--avatar-hair': getAvatarColorValue(avatar.hairColor),
  } as CSSProperties;

  return (
    <div
      className={`avatar-preview avatar-preview--${avatar.gender}`}
      style={previewStyle}
      aria-label="Превью аватара"
    >
      <div className={`avatar-preview__aura avatar-preview__aura--${stages.health}`} />
      <div className={`avatar-preview__order avatar-preview__order--${stages.order}`} />
      <div className={`avatar-preview__discipline avatar-preview__discipline--${stages.discipline}`} />
      <div className={`avatar-preview__finance avatar-preview__finance--${stages.finance}`} />
      <div className={`avatar-preview__social avatar-preview__social--${stages.socialization}`} />

      <div className="avatar-preview__body">
        <div className="avatar-preview__torso" />
        <div className="avatar-preview__neck" />
        <div className={`avatar-preview__head avatar-preview__head--${avatar.gender}`}>
          <div className={`avatar-preview__hair avatar-preview__hair--${avatar.hairStyle}`} />
          <div className="avatar-preview__eyes">
            <span />
            <span />
          </div>
          <div className={`avatar-preview__mouth avatar-preview__mouth--${stages.socialization}`} />
          {avatar.beardStyle !== 'none' ? (
            <div className={`avatar-preview__beard avatar-preview__beard--${avatar.beardStyle}`} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
