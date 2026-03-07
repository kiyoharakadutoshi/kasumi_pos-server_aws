import React, { useEffect, useState } from 'react';
import { CheckboxStyled, RadioButton, RadioStyled, TextCheckBox } from '../styled';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';
import './normal-radio-button.scss';

interface NormalRadioButtonProps {
  text?: string | React.ReactNode;
  height?: string;
  widthText?: string;
  isVertical?: boolean;
  spacing?: number;
  required?: boolean;
  widthInput?: string;
  fontSize?: string;
  nameGroupRadio: string;
  listCheckBox: { id: string; checkBoxValue: number; textValue: string | React.ReactNode; disabled?: boolean }[];
  value: number;
  onChange: (value: number) => void;
}

const NormalRadioButton: React.FC<NormalRadioButtonProps> = ({
  text,
  nameGroupRadio,
  height,
  widthText,
  widthInput,
  fontSize,
  listCheckBox,
  spacing,
  isVertical,
  required,
  value,
  onChange,
}) => {
  const [selectedValue, setSelectedValue] = useState<number>(value);

  useEffect(() => {
    setSelectedValue(value ?? listCheckBox[0].checkBoxValue);
  }, [value]);

  const handleRadioChange = (checkBoxValue: number) => {
    setSelectedValue(checkBoxValue);
    onChange(checkBoxValue);
  };

  return (
    <div
      className="radio-button-container"
      style={{
        display: isVertical ? 'initial' : 'flex',
        height: height ?? isVertical ? 'fit-content' : HEIGHT_INPUT,
      }}
    >
      {text && (
        <div
          style={{
            display: 'flex',
            width: widthText ?? 300,
            fontSize: fontSize ?? FONT_SIZE,
            alignItems: isVertical ? 'top' : 'center',
            padding: isVertical ? '0px' : '4px',
          }}
        >
          {text}
          {required && <span className="required">*</span>}
        </div>
      )}
      <RadioButton
        className="group-button"
        style={{
          height: height ?? isVertical ? 'fit-content' : HEIGHT_INPUT,
          width: widthInput ?? 'fit-content',
          display: isVertical ? 'initial' : 'flex',
        }}
      >
        {listCheckBox.map(data => (
          <CheckboxStyled key={data.id} className="radio-list" style={{ height: HEIGHT_INPUT, marginBottom: spacing ?? 0 }}>
            <RadioStyled
              checked={selectedValue === data.checkBoxValue}
              type="radio"
              id={data.id + 'radio' + nameGroupRadio}
              name={nameGroupRadio}
              value={data.checkBoxValue}
              disabled={data.disabled}
              onChange={() => handleRadioChange(data.checkBoxValue)}
            />
            <TextCheckBox
              style={{ fontSize: fontSize ?? FONT_SIZE, lineHeight: fontSize ?? FONT_SIZE }}
              disabledText={data.disabled}
              htmlFor={data.id + 'radio' + nameGroupRadio}
            >
              {data.textValue}
            </TextCheckBox>
          </CheckboxStyled>
        ))}
      </RadioButton>
    </div>
  );
};

export default NormalRadioButton;
