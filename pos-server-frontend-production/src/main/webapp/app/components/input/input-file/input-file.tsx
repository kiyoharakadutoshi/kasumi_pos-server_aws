import React from 'react';
import { InputFileStyled, CustomUpload } from '../styled';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

interface InputFileProps {
  text?: string;
  height?: string;
  width?: string;
  fontSize?: string;
  placeHolder?: string;
  disabled?: boolean;
  error?: boolean;
}

const InputFile: React.FC<InputFileProps> = ({ text, height, width, fontSize, disabled, error }) => {
  return (
    <div>
      <CustomUpload
        style={{
          height: height ?? HEIGHT_INPUT,
          width: width ?? 528,
          fontSize: fontSize ?? FONT_SIZE,
        }}
        htmlFor="file-upload"
        errInput={error}
        disabled={disabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
        </svg>
        {text}
      </CustomUpload>
      <InputFileStyled type="file" id="file-upload" disabled={disabled} />
    </div>
  );
};

export default InputFile;
