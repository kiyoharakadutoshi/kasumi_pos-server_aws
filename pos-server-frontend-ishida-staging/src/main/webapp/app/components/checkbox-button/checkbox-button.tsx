import PopoverText from '../popover/popover';
import './checkbox-button.scss';
import React, { useRef } from 'react';

export interface NormalCheckBoxButtonProps {
  id?: string;
  checkBoxValue?: string | number;
  textValue?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: () => void;
  onChangeFunc?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tabIndex?: number;
  className?: string;
  name?: string;
  hasPopperText?: boolean;
  linePopoverTextNumber?: number;
  dataType?: 'boolean' | 'number';
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
  hasPopperText = false,
  linePopoverTextNumber,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className="checkbox-button"
      onClick={() => {
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
        checked={checked ?? false}
        tabIndex={tabIndex}
        onChange={(event) => {
          onChangeFunc?.(event);
          onChange?.();
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {textValue && (
        <label htmlFor={id + 'checkbox'} className="checkbox-button__label">
          {hasPopperText ? <PopoverText text={textValue} lineLimit={linePopoverTextNumber} /> : textValue}
        </label>
      )}
    </div>
  );
};

export default CheckboxButton;
