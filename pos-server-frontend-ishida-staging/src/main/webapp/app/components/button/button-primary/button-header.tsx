import React from 'react';
import { localizeString } from 'app/helpers/utils';
import '../../button/button.scss';

interface ButtonHeaderProps {
  heightBtn?: string;
  widthBtn?: string;
  keyboardKey?: string;
  icon?: React.ReactNode;
  text?: string;
  fontSize?: string;
  onClick?: any;
  disabled?: boolean;
  backgroundColor?: string;
  iconMagrin?: boolean;
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({
  icon,
  text,
  fontSize,
  heightBtn,
  widthBtn,
  onClick,
  disabled,
  backgroundColor,
  keyboardKey,
  iconMagrin,
}) => {
  return (
    <button
      className={'btn-header'}
      style={{ height: heightBtn, width: widthBtn, fontSize, backgroundColor }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <div className={`btn-header__icon ${iconMagrin ? 'iconMagrin' : ''}`}>{icon}</div>}
      {keyboardKey && <span className="btn-header__key">{localizeString(keyboardKey)}</span>}
      {text && (
        <span className="btn-header__text">
          {keyboardKey && ' : '}
          {localizeString(text)}
        </span>
      )}
    </button>
  );
};

export default ButtonHeader;
