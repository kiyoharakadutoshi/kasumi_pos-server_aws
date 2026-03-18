import React from 'react';
import { CheckBoxStyled, TextCheckBox } from '../styled';
import { FONT_SIZE } from 'app/constants/constants';

interface NormalCheckBoxButtonProps {
  id?: string;
  checkBoxValue?: string;
  textValue?: string;
  fontSize?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: () => void;
}

const NormalCheckboxButton: React.FC<NormalCheckBoxButtonProps> = ({
  id,
  checkBoxValue,
  textValue,
  disabled,
  checked,
  fontSize,
  onChange,
}) => {
  return (
    <div key={id} style={{ display: 'flex', alignItems: 'center' }}>
      <CheckBoxStyled
        type="checkbox"
        id={id + 'checkbox'}
        value={checkBoxValue}
        disabled={disabled}
        checked={checked}
        onChange={onChange || (() => { })}
      />
      {textValue && <TextCheckBox
        style={{ fontSize: fontSize ?? FONT_SIZE, display: 'flex', alignItems: 'center' }}
        disabledText={disabled}
        htmlFor={id + 'checkbox'}
      >
        {textValue}
      </TextCheckBox>}
    </div>
  );
};

export default NormalCheckboxButton;
