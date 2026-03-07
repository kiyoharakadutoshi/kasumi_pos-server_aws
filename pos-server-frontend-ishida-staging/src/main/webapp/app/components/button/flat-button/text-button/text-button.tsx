import React from 'react';
import { BtnText } from '../styled';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

interface TextButtonProps {
  text: string;
  icon?: any;
  height?: string;
  width?: string;
  fontSize?: string;
  onClick?: any;
  disabled?: boolean;
}

const TextButton: React.FC<TextButtonProps> = ({ text, icon, height, width, fontSize, onClick, disabled }) => {
  return (
    <BtnText
      style={{
        height: height ?? HEIGHT_INPUT,
        width: width ?? 'fit-content',
        fontSize: fontSize ?? FONT_SIZE,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span style={{ paddingLeft: 8 }}>{text}</span>
    </BtnText>
  );
};

export default TextButton;
