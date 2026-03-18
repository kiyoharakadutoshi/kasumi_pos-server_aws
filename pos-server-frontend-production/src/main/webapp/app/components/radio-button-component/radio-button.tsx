import React, { useEffect, useRef, useState } from 'react';
import './radio-button.scss';
import { localizeString } from 'app/helpers/utils';

export interface IRadioButtonValue {
  id: string | number;
  textValue: string | number;
  disabled?: boolean;
}

export interface IRadioButtonProps {
  name: string;
  isVertical?: boolean;
  listValues: IRadioButtonValue[];
  value?: string | number;
  onChange?: (selectValue: IRadioButtonValue, index: number) => void;
  disabled?: boolean;
}

const indexValue = (listValues: IRadioButtonValue[], value: string | number) => {
  const index = listValues.findIndex((item) => item.id === value);
  return Math.max(index, 0);
};

const ListRadioButton: React.FC<IRadioButtonProps> = ({
  name,
  listValues,
  isVertical,
  value,
  onChange,
  disabled = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(indexValue(listValues, value));

  useEffect(() => {
    setSelectedIndex(indexValue(listValues, value));
  }, [value]);

  const handleRadioChange = (selectValue: IRadioButtonValue, index: number) => {
    setSelectedIndex(index);
    if (onChange) onChange(selectValue, index);
  };

  return (
    <div className={`${isVertical ? 'radio-button-container-vertical' : 'radio-button-container-horizontal'}`}>
      {listValues.map((data, index) => (
        <RadioButton
          key={index}
          id={name + index}
          textValue={localizeString(String(data.textValue))}
          disabled={disabled || data.disabled}
          onChange={() => handleRadioChange(data, index)}
          checked={index === selectedIndex}
        />
      ))}
    </div>
  );
};

export default ListRadioButton;

export const RadioButton = ({
  id,
  textValue,
  checked,
  disabled,
  onChange,
  className,
}: {
  id: string | number;
  textValue: string | number;
  disabled?: boolean;
  checked?: boolean;
  onChange?: () => void;
  className?: string;
}) => {
  const [checkedValue, setCheckedValue] = useState<boolean>(checked ?? false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCheckedValue(checked);
  }, [checked]);

  return (
    <div
      className="radio-button"
      onClick={() => {
        if (!checkedValue && !disabled) {
          setCheckedValue(true);
          if (onChange) onChange();
        }
      }}
    >
      <input
        ref={ref}
        checked={checkedValue}
        type="radio"
        name={`${id}`}
        value={textValue}
        disabled={disabled}
        className={`radio-button__input ${className ?? ''}`.trim()}
        onChange={() => {}}
      />
      <label
        className={`radio-button__text-value ${disabled ? 'radio-button__text-value-disabled' : ''}`}
        htmlFor={`${id}`}
        onClick={() => ref.current?.focus()}
      >
        {textValue}
      </label>
    </div>
  );
};
