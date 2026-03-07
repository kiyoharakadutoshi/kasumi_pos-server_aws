import './checkbox-button.scss';
import React, { ChangeEvent, useRef } from 'react';

export interface NormalCheckBoxButtonProps {
  id?: string;
  checkBoxValue?: string | number
  textValue?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: () => void;
  onChangeFunc?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tabIndex?: number;
  className?: string;
  name?: string;
}

const CheckboxButton: React.FC<NormalCheckBoxButtonProps> = ({
  id,
  checkBoxValue,
  textValue,
  disabled,
  checked,
  onChange,
  onChangeFunc,
  tabIndex,
  className,
  name,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className="checkbox-button"
      onClick={() => {
        if (!disabled && onChange) onChange();
        ref.current?.focus();
      }}
    >
      <input
        name={name}
        ref={ref}
        className={`checkbox-button__input ${className ?? ''}`.trim()}
        type="checkbox"
        id={id + 'checkbox'}
        value={checkBoxValue}
        disabled={disabled}
        checked={checked}
        tabIndex={tabIndex}
        onChange={(event) => {
          onChangeFunc?.(event);
          onChange?.();
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {textValue && <label className="checkbox-button__label">{textValue}</label>}
    </div>
  );
};

export default CheckboxButton;
