import React from 'react';
import { BtnSub } from '../styled';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

interface SubButtonProps {
  text: string | React.ReactNode;
  height?: string;
  width?: string;
  fontSize?: string;
  onClick?: any;
  disabled?: boolean;
}

const SubButton: React.FC<SubButtonProps> = ({ text, height, width, fontSize, onClick, disabled }) => {
  return (
    <BtnSub
      style={{
        height: height ?? HEIGHT_INPUT,
        width: width ?? 'fit-content',
        fontSize: fontSize ?? FONT_SIZE,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </BtnSub>
  );
};

export default SubButton;
