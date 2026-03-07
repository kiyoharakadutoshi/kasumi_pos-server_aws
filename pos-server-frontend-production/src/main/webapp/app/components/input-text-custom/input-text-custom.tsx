import React, { ComponentProps, LegacyRef } from 'react';
import './input-text-custom.scss';
import { getStringLength, isHalfSize, localizeString } from 'app/helpers/utils';

export type InputTextCustomProp = ComponentProps<'input'> & {
  name?: string;
  initValue?: string | number;
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
  addZero?: boolean;
  focusIn?: boolean;
  dataType?: string;
  textAlign?: 'center' | 'left' | 'right';
  checkHalfsize?: boolean;
  checkLengthFullsize?: boolean;
  minValue?: number;
  maxValue?: number;
  hasTrim?: boolean;
};
const InputTextCustom = (props: InputTextCustomProp) => {
  const {
    initValue,
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
    checkHalfsize = false,
    checkLengthFullsize = false,
    minValue,
    maxValue,
    hasTrim,
    ...rest
  } = props;

  const exceptThisSymbols = ['e', 'E', '+', '-', '.'];

  const handleChangeLength = (e: any) => {
    if (checkHalfsize === true && !isHalfSize(e.target.value)) return;

    if (props.maxLength) {
      const length = checkLengthFullsize === true ? props.maxLength : getStringLength(e.target.value);
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
    const value = e.target.value;
    let adjustedValue = '';
    let length = 0;

    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      const charLength = getStringLength(char);
      if (length + charLength > maxLength) break;

      length += charLength;
      adjustedValue += char;
    }
    e.target.value = adjustedValue;
  };

  const handleOnKeyDown = (e) => {
    if (props.type === 'number') {
      if (exceptThisSymbols.includes(e.key) || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    }
  };

  const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (hasTrim) {
      // Trim space
      const value = event.target.value;
      const valueTrim = value?.trim();

      if (valueTrim?.length < value?.length) {
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
              value={initValue || ''}
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
            value={initValue || ''}
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
