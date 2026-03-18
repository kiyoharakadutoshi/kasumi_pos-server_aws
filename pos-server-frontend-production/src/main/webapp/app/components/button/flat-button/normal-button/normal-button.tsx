import React from 'react';
import { BtnNormal } from '../styled';
import { localizeString } from 'app/helpers/utils';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';
import '../../button.scss';

interface NormalButtonProps {
  text: string;
  height?: string;
  width?: string;
  fontSize?: string;
  onClick?: any;
  disabled?: boolean;
  onDoubleClick?: (event: any) => void;
}

const NormalButton: React.FC<NormalButtonProps> = ({ text, height, width, fontSize, onClick, disabled, onDoubleClick }) => {
  return (
    <BtnNormal
      style={{
        height: height ?? HEIGHT_INPUT,
        width: width ?? 'fit-content',
        fontSize: fontSize ?? FONT_SIZE,
      }}
      onClick={onClick}
      disabled={disabled}
      onDoubleClick={onDoubleClick}
      className={`button-normal__blue`}
    >
      {localizeString(text)}
    </BtnNormal>
  );
};

export default NormalButton;
