import React, { ComponentProps, Fragment, LegacyRef, useCallback } from 'react';
// import './input-text-custom.scss';
import 'app/components/input-text-custom/input-text-custom.scss';
import { getStringLength, localizeString } from 'app/helpers/utils';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';

export type InputTextCustomProp = ComponentProps<'input'> & {
  name?: string;
  labelText?: string;
  widthInput?: string;
  heightInput?: string;
  isError?: boolean;
  isRequire?: boolean;
  icon?: any;
  errorText?: string;
  inputRef?: LegacyRef<HTMLInputElement>;
  focusOut?: (value: string) => void;
  addZero?: boolean;
};
const InputControl = (props: InputTextCustomProp) => {
  const {
    name = '',
    labelText,
    widthInput,
    heightInput,
    disabled,
    isError,
    isRequire,
    onChange,
    className,
    icon,
    placeholder,
    errorText,
    defaultValue,
    inputRef,
    ...rest
  } = props;

  const { control, getValues } = useFormContext();

  const exceptThisSymbols = ['e', 'E', '+', '-', '.'];

  const handleChangeLength = (e: any) => {
    if (props.maxLength) {
      const length = getStringLength(e.target.value);
      if (length > props.maxLength) {
        return;
      }
    }

    // action onChange
    if (onChange) {
      onChange(e);
    }
  };

  const handleOnKeyDown = e => {
    if (props.type === 'number') {
      if (exceptThisSymbols.includes(e.key) || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    }
  };

  const renderInput = useCallback(
    ({ field: { onChange: onChangeFunc, onBlur, value } }: { field: FieldValues }) => {
      return (
        <div
          className={`input-container ${className ?? ''}`}
          style={{ '--input-width': widthInput, cursor: disabled && 'not-allowed' } as React.CSSProperties}
        >
          <div
            className={`wrap-input-text ${isError ? 'input-text-error' : ''} ${disabled ? 'input-text-disable' : ''}`}
            style={{ '--input-height': heightInput } as React.CSSProperties}
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
                  name={name}
                  className="input-text"
                  disabled={disabled}
                  placeholder={localizeString(placeholder) || ''}
                  onChange={e => (handleChangeLength(e), onChangeFunc(e))}
                  onBlur={onBlur}
                  value={value}
                  onKeyDown={handleOnKeyDown}
                  ref={inputRef}
                  {...rest}
                />
              </div>
            ) : (
              <input
                name={name}
                className="input-text"
                disabled={disabled}
                placeholder={localizeString(placeholder) || ''}
                onChange={e => (handleChangeLength(e), onChangeFunc(e))}
                onKeyDown={handleOnKeyDown}
                onBlur={onBlur}
                value={value}
                ref={inputRef}
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
    },
    [errorText, disabled, labelText, placeholder, widthInput, className, isRequire, icon],
  );

  return (
    <Fragment>
      <Controller name={name} control={control} render={renderInput} />
    </Fragment>
  );
};

export default InputControl;
