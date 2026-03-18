import React from 'react';
import { localizeString } from 'app/helpers/utils';
import '../../button/button.scss';

interface ButtonPrimaryProps {
  heightBtn?: string;
  widthBtn?: string;
  keyboardKey?: string;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
  text?: string;
  fontSize?: string;
  onClick?: any;
  disabled?: boolean;
  backgroundColor?: string;
  className?: string;
  onDoubleClick?: (event: any) => void;
  dataFocus?: any;
  tabIndex?: number;
  styles?: React.CSSProperties;
  name?: string,
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  icon,
  iconEnd,
  text,
  fontSize,
  heightBtn,
  widthBtn,
  onClick,
  disabled,
  backgroundColor,
  keyboardKey,
  className,
  onDoubleClick,
  dataFocus,
  tabIndex,
  styles = {},
  name,
  onMouseDown
}) => {
  return (
    <button
      onMouseDown={onMouseDown}
      name={name}
      className={`${className ?? ''} btn-primary`.trim()}
      style={{
        ...styles,
        height: heightBtn,
        width: widthBtn,
        fontSize,
        backgroundColor,
      }}
      onClick={onClick}
      disabled={disabled}
      onDoubleClick={onDoubleClick}
      data-focus={dataFocus}
      tabIndex={tabIndex}
    >
      {icon && <div className={`btn-primary__icon ${!text ? 'btn-primary-no-text' : ''}`}>{icon}</div>}
      {keyboardKey && <span className="btn-primary__key">{localizeString(keyboardKey)}</span>}
      {text && (
        <span className="btn-primary__text">
          {keyboardKey && ' : '}
          {localizeString(text)}
        </span>
      )}
      {iconEnd && <div className={`btn-primary__icon icon-end`}>{iconEnd}</div>}
    </button>
  );
};

export default ButtonPrimary;
