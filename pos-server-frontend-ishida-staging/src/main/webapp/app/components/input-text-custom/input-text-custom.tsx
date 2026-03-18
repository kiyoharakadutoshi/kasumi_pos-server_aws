import React, { ComponentProps, LegacyRef } from 'react';
import './input-text-custom.scss';
import { getStringLength, isHalfSize, localizeString } from 'app/helpers/utils';

export type InputTextCustomProp = ComponentProps<'input'> & {
  name?: string;
  labelText?: string;
  widthInput?: string;
  heightInput?: string;
  inputClassName?: string;
  isError?: boolean;
  isRequire?: boolean;
  icon?: any;
  errorText?: string;
  inputRef?: LegacyRef<HTMLInputElement>;
  focusOut?: (value: string) => void;
  focusIn?: boolean;
  dataType?: string;
  textAlign?: 'center' | 'left' | 'right';
  checkHalfSize?: boolean;
  checkLengthFullSize?: boolean;
  hasTrim?: boolean;
};
const InputTextCustom = (props: InputTextCustomProp) => {
  const {
    labelText,
    widthInput,
    heightInput,
    disabled,
    isError = false,
    isRequire,
    onChange,
    className,
    icon,
    placeholder,
    errorText,
    inputRef,
    focusIn,
    dataType,
    inputClassName,
    textAlign,
    checkHalfSize = false,
    checkLengthFullSize = false,
    value,
    hasTrim,
    onKeyDown,
    ...rest
  } = props;

  const exceptThisSymbols = ['e', 'E', '+', '-', '.'];

  const handleChangeLength = (e: any) => {
    if (checkHalfSize === true && !isHalfSize(e.target.value)) return;

    if (props.maxLength) {
      const length = checkLengthFullSize === true ? e.target.value?.length : getStringLength(e.target.value);
      if (length > props.maxLength) {
        return;
      }
    }

    // action onChange
    if (onChange) {
      onChange(e);
    }
  };

  const handleOnInput = (e) => {
    const maxLength = props.maxLength;
    const valueString = e.target.value;

    if (checkLengthFullSize === true) {
      return;
    }

    let adjustedValue = '';
    let length = 0;

    for (let i = 0; i < valueString.length; i++) {
      const char = valueString[i];
      const charLength = getStringLength(char);
      if (length + charLength > maxLength) break;

      length += charLength;
      adjustedValue += char;
    }
    e.target.value = adjustedValue;
  };

  const handleOnKeyDown = (e: any) => {
    if (props.type === 'number') {
      if (exceptThisSymbols.includes(e.key) || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    }
    onKeyDown?.(e);
  };

  const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (hasTrim) {
      // Trim space
      const valueString = event.target.value;
      const valueTrim = valueString?.trim();

      if (valueTrim?.length < valueString?.length) {
        event.target.value = valueTrim;
        onChange?.(event);
      }
    }

    rest.onBlur?.(event);
  };

  return (
    <div
      className={`input-container ${className ?? ''}`}
      style={
        {
          '--input-width': widthInput,
          cursor: disabled && 'not-allowed',
        } as React.CSSProperties
      }
    >
      <div
        className={`wrap-input-text ${disabled ? 'wrap-input-text-disabled' : 'wrap-input-text-enabled'} ${labelText ? 'wrap-input-text-label' : ''
          } ${isError && !disabled ? 'input-text-custom-error' : ''}`}
        style={{ '--input-height': heightInput, textAlign } as React.CSSProperties}
        data-type={dataType}
        autoFocus={true}
      >
        {labelText && (
          <div className="wrap-label-text">
            <label className="label-text">{localizeString(labelText)}</label>
            {isRequire && <span className="input-text-require">*</span>}
          </div>
        )}
        {icon ? (
          <div className="contain-icon-with-input">
            <div className="input-text-custom__icon">{icon}</div>
            <input
              className={`input-text ${inputClassName ?? ''}`.trim()}
              disabled={disabled}
              placeholder={localizeString(placeholder) || ''}
              onChange={handleChangeLength}
              onInput={handleOnInput}
              onKeyDown={handleOnKeyDown}
              ref={inputRef}
              value={value || ''}
              autoFocus={focusIn}
              onBlur={handleOnBlur}
              style={{
                textAlign,
                ...rest.style,
              }}
              {...rest}
            />
          </div>
        ) : (
          <input
            className={`input-text ${inputClassName ?? ''}`.trim()}
            disabled={disabled}
            placeholder={localizeString(placeholder) || ''}
            onChange={handleChangeLength}
            onInput={handleOnInput}
            onKeyDown={handleOnKeyDown}
            ref={inputRef}
            value={value || ''}
            autoFocus={focusIn}
            onBlur={handleOnBlur}
            style={{
              textAlign,
              ...rest.style,
            }}
            {...rest}
          />
        )}
      </div>
      {errorText && (
        <div className="wrap-error-text">
          <span className="error-text">{localizeString(errorText)}</span>
        </div>
      )}
    </div>
  );
};

export default InputTextCustom;
