import React from 'react';
import { BtnNegative } from '../styled';
import { localizeString } from 'app/helpers/utils';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

interface NegativeButtonProps {
  text: string;
  height?: string;
  width?: string;
  fontSize?: string;
  onClick?: any;
  disabled?: boolean;
}

const NegativeButton: React.FC<NegativeButtonProps> = ({ text, height, width, fontSize, onClick, disabled }) => {
  return (
    <BtnNegative
      style={{
        height: height ?? HEIGHT_INPUT,
        width: width ?? 'fit-content',
        fontSize: fontSize ?? FONT_SIZE,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {localizeString(text)}
    </BtnNegative>
  );
};

export default NegativeButton;
