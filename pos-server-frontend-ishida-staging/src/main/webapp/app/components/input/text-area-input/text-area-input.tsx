import React from 'react';
import { TextAreaInputStyled } from '../styled';
import { FONT_SIZE } from 'app/constants/constants';

interface TextAreaInputProps {
  height?: string;
  width?: string;
  fontSize?: string;
  placeHolder?: string;
  disabled?: boolean;
  error?: boolean;
  value?: string;
  onChange?: any;
  maxLength?: number;
  className?: string;
  datatype?: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  datatype,
  height,
  width,
  fontSize,
  placeHolder,
  disabled,
  error,
  value,
  onChange,
  maxLength,
  className,
}) => {
  return (
    <TextAreaInputStyled
      style={{
        height: height ?? 80,
        width: width ?? 528,
        fontSize: fontSize ?? FONT_SIZE,
      }}
      placeholder={placeHolder}
      disabled={disabled}
      errInput={error}
      onChange={onChange}
      value={value}
      maxLength={maxLength}
      className={className ?? ''}
      datatype={datatype}
    />
  );
};

export default TextAreaInput;
