import React from 'react';
import { BtnDefault } from '../styled';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

interface DefaultButtonProps {
  text?: string | React.ReactNode;
  icon?: any;
  height?: string;
  width?: string;
  fontSize?: string;
  onClick?: any;
  disabled?: boolean;
}

const DefaultButton: React.FC<DefaultButtonProps> = ({ text, icon, height, width, fontSize, onClick, disabled }) => {
  return (
    <BtnDefault
      style={{
        height: height ?? HEIGHT_INPUT,
        width: width ?? 'fit-content',
        fontSize: fontSize ?? FONT_SIZE,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {text}
    </BtnDefault>
  );
};

export default DefaultButton;
