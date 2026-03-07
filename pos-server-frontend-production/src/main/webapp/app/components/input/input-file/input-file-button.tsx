import React from 'react';
import { CustomUploadButton, InputFileStyled } from 'app/components/input/styled';

interface InputFileButtonProps {
  text: string | React.ReactNode;
  height?: string;
  width?: string;
  fontSize?: string;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
}

const InputFileButton: React.FC<InputFileButtonProps> = ({ text, height, width, fontSize, disabled, onChange, multiple }) => {
  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event);
    event.target.value = null;
  };

  return (
    <div>
      <CustomUploadButton
        style={{
          height: height ?? 40,
          width: width ?? 'fit-content',
          fontSize: fontSize ?? 24,
        }}
        htmlFor="file-upload"
      >
        {text}
      </CustomUploadButton>
      <InputFileStyled type="file" id="file-upload" disabled={disabled} onChange={onChangeFile} multiple={multiple} />
    </div>
  );
};

export default InputFileButton;
