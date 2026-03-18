import React, { useEffect, useState } from 'react';
import { isNumber } from 'app/helpers/utils';
import InputText, { InputTextProps } from './input-text';
import _ from 'lodash';

type NumberInputTextProps = Omit<InputTextProps, 'onChange'> & {
  unitText?: string;
  minValue?: number;
  maxValue?: number;
  addZero?: boolean;
  numberZero?: number;
  fontSize?: number;
  focusOut?: (value: string) => void;
  onChange?: (value: string) => void;
};

const NumberInputText: React.FC<NumberInputTextProps> = ({
  unitText,
  minValue,
  maxValue,
  addZero,
  numberZero,
  fontSize,
  onChange,
  focusOut,
  ...inputProps
}) => {
  const { value, ...rest } = inputProps;
  const [valueInput, setValueInput] = useState(_.toString(value) ?? '');
  useEffect(() => {
    setValueInput(_.toString(value) ?? '');
  }, [value]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.length === 0) {
      setValueInput(inputValue);
      onChange && onChange(null);
      return;
    }

    if (!isNumber(inputValue)) {
      return;
    }

    const valueNum = parseInt(inputValue, 10);
    if (minValue && valueNum < minValue) {
      return;
    }

    if (maxValue && valueNum > maxValue) {
      return;
    }

    setValueInput(inputValue);
    !addZero && onChange && onChange(inputValue);
  };

  const handleFocusOut = (event: React.FocusEvent<HTMLInputElement>) => {
    const num = numberZero ?? inputProps.maxLength;
    if (addZero && num && valueInput.length > 0) {
      const valueChange = valueInput.padStart(num, '0');
      setValueInput(valueChange);
      onChange && onChange(valueChange);
      focusOut && focusOut(valueChange);
      event.target.value = valueChange;
      rest?.onBlur?.(event);
      return;
    }
    focusOut && focusOut(valueInput);
    rest?.onBlur?.(event);
  };

  return (
    <InputText
      className={inputProps.classNameForm}
      unitText={unitText}
      fontSize={fontSize}
      {...inputProps}
      value={valueInput}
      onChange={handleOnChange}
      onBlur={handleFocusOut}
    />
  );
};
export default NumberInputText;
