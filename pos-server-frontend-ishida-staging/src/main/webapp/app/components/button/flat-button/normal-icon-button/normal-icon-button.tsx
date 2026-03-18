import React from 'react';
import { BtnDarkNormalIcon, BtnNormalIcon } from '../styled';
import { FONT_SIZE } from 'app/constants/constants';
import { localizeString } from 'app/helpers/utils';

interface NormalIconButtonProps {
  height?: string;
  width?: string;
  keyboardKey?: string;
  icon?: React.ReactNode;
  text?: string;
  fontSize?: string;
  onClick?: any;
  disabled?: boolean;
  backgroundColor?: string;
  type?: 'light' | 'dark';
  className?: string;
}

const NormalIconButton: React.FC<NormalIconButtonProps> = ({
  type = 'dark',
  icon,
  text,
  fontSize,
  height,
  width,
  onClick,
  disabled,
  keyboardKey,
  className,
}) => {
  switch (type) {
    case 'light':
      return (
        <BtnNormalIcon
          style={{
            height: height ?? 48,
            width: width ?? 'fit-content',
            fontSize: fontSize ?? FONT_SIZE,
            gap: 16,
          }}
          onClick={onClick}
          disabled={disabled}
          className={className}
        >
          {icon}
          {keyboardKey && <span className="button-icon-key">{localizeString(keyboardKey)}</span>}
          {text && (
            <span className="button-icon-text">
              {keyboardKey && ' : '}
              {localizeString(text)}
            </span>
          )}
        </BtnNormalIcon>
      );
    default:
      return (
        <BtnDarkNormalIcon
          style={{
            height: height ?? 48,
            width: width ?? 'fit-content',
            fontSize: fontSize ?? FONT_SIZE,
            gap: 16,
          }}
          onClick={onClick}
          disabled={disabled}
          className={className}
        >
          {icon}
          {(text || keyboardKey) && (
            <label>
              {keyboardKey && <span className="button-icon-key">{localizeString(keyboardKey)}</span>}
              {text && (
                <span className="button-icon-text" style={{cursor: 'pointer'}}>
                  {keyboardKey && ' : '}
                  {localizeString(text)}
                </span>
              )}
            </label>
          )}
        </BtnDarkNormalIcon>
      );
  }
};

export default NormalIconButton;
