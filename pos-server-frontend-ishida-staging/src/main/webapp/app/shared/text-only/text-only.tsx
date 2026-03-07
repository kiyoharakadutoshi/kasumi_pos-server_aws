import React from 'react';
import { InputText } from './styled';

interface TextOnlyProps {
  text: string | React.ReactNode;
  required?: boolean;
  height?: string;
  width?: string;
  fontSize?: string;
  color?: string;
}

const TextOnly: React.FC<TextOnlyProps> = ({ text, required, height, width, fontSize, color }) => {
  return (
    <InputText
      style={{
        height: height ?? 40,
        width: width ?? 'fit-content',
        fontSize: fontSize ?? 24,
        color: color,
      }}
    >
      {text}
      {required && <span style={{ color: '#FA1E1E' }}>*</span>}
    </InputText>
  );
};

export default TextOnly;
