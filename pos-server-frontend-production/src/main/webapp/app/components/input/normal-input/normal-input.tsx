import React from 'react';
import { MessageError, NormalInputStyled } from '../styled';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

interface NormalInputProps {
  height?: string;
  width?: string;
  fontSize?: string;
  placeHolder?: string;
  disabled?: boolean;
  error?: boolean;
  messageError?: string;
}

const NormalInput: React.FC<NormalInputProps> = ({ height, width, fontSize, placeHolder, disabled, error, messageError }) => {
  return (
    <div>
      <NormalInputStyled
        style={{
          height: height ?? HEIGHT_INPUT,
          width: width ?? 528,
          fontSize: fontSize ?? FONT_SIZE,
        }}
        placeholder={placeHolder}
        errInput={error}
        disabled={disabled}
      />
      {error && <MessageError>{messageError ?? 'エラー文言が入ります。'}</MessageError>}
    </div>
  );
};

export default NormalInput;
