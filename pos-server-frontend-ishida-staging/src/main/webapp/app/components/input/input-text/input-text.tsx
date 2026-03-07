import React, { ComponentProps } from 'react';
import { InputForm, InputStyled, InputTitle } from '../styled';
import { getStringLength, localizeString } from 'app/helpers/utils';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

export type InputTextProps = ComponentProps<'input'> & {
  label?: string;
  unitText?: string;
  widthLabel?: string;
  borderColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
  classNameForm?: string;
  marginBottom?: number;
  padding?: string;
  error?: boolean;
  required?: boolean;
  fontSize?: number;
  onChange?: (e: any) => void;
  classNameInput?: string;
};

const InputText: React.FC<InputTextProps> = ({
  label,
  unitText,
  widthLabel,
  borderRadius,
  borderColor,
  backgroundColor,
  classNameForm,
  padding,
  fontSize,
  error,
  required,
  marginBottom,
  onChange,
  classNameInput,
  ...inputProps
}) => {
  const { ref, width, height, disabled, maxLength, ...rest } = inputProps;

  const handleChangeLength = (e: any) => {
    if (maxLength) {
      const length = getStringLength(e.target.value);
      if (length > maxLength) {
        return;
      }
    }
    onChange(e);
  };

  return (
    <InputForm className={classNameForm} paddingBottom={marginBottom}>
      {label && (
        <InputTitle
          className={'title-name'}
          style={{
            width: widthLabel ?? 'fit-content',
            height: height ?? HEIGHT_INPUT,
            fontSize: fontSize ?? FONT_SIZE,
          }}
        >
          {localizeString(label)}
          {required && <span style={{ color: '#FA1E1E' }}>*</span>}
        </InputTitle>
      )}
      <InputStyled
        disabled={disabled}
        errInput={error}
        borderRadius={borderRadius}
        borderColor={borderColor}
        backgroundColor={backgroundColor}
        padding={padding}
        maxLength={maxLength}
        onChange={handleChangeLength}
        className={classNameInput}
        {...rest}
        style={{
          width: width ?? 80,
          fontSize: fontSize ?? FONT_SIZE,
          height: height ?? HEIGHT_INPUT,
          lineHeight: `${height ?? HEIGHT_INPUT}px`,
        }}
      />
      <p className="unit-text">{unitText && unitText}</p>
    </InputForm>
  );
};
export default InputText;
