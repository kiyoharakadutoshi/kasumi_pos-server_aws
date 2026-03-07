import React, { ComponentProps, Ref, useEffect, useState } from 'react';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { localizeString } from 'app/helpers/utils';

type NumberInputTextProps = Omit<ComponentProps<'input'>, 'onChange'> & {
  inputRef?: Ref<HTMLInputElement>;
  minValue?: number;
  maxValue?: number;
  addZero?: boolean;
  numberZero?: number;
  focusOut?: (value: string) => void;
  onChange?: (value: string) => void;
  maxLength?: number;
  error?: string;
  textAlign?: 'left' | 'center' | 'right';
  data: Record<string, string>;
};

const CodeNumberInputText: React.FC<NumberInputTextProps> = ({
  inputRef,
  minValue,
  maxValue,
  addZero,
  numberZero,
  onChange,
  focusOut,
  maxLength,
  data,
  ...inputProps
}) => {
  const { value, className, placeholder, width, error, textAlign, ...rest } = inputProps;
  const [valueInput, setValueInput] = useState(data[value as string] ?? data[0]);

  useEffect(() => {
    setValueInput(data[value as string] ?? data[0]);
  }, [value]);

  const handleChangeCode = (code: string) => {
    const valueStr = code?.replace(/\D/g, '');

    if (valueStr?.length !== code?.length) {
      setValueInput('');
      if (onChange) onChange('');
      return;
    }

    if (maxLength && valueStr?.length > maxLength) {
      return;
    }

    const valueInt = parseInt(valueStr, 10);
    if ((minValue && valueInt < minValue) || (maxValue && valueInt > maxValue)) {
      return;
    }
    setValueInput(valueStr);
    if (onChange) onChange(valueStr);
  };

  const handleBlurCode = () => {
    const code = valueInput.substring(0, 1);
    setValueInput(data[code] ?? data[0]);
    if (focusOut) focusOut(code);
  };

  return (
    <InputTextCustom
      onChange={event => handleChangeCode(event.target.value)}
      value={localizeString(valueInput)}
      className={`code-number-input ${className ?? ''}`.trim()}
      onBlur={handleBlurCode}
      {...rest}
    />
  );
};

export default CodeNumberInputText;
