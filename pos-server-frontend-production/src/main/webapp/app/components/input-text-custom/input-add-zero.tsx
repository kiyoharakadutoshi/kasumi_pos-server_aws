import React, { ComponentProps, useState } from 'react'
import './input-text-custom.scss';
import { getStringLength, localizeString } from 'app/helpers/utils';
import _ from 'lodash';

export type InputAddZeroProp = ComponentProps<'input'> & {
  labelText?: string;
  widthInput?: string;
  heightInput?: string;
  isError?: boolean;
  isRequire?: boolean;
  icon?: any;
  errorText?: string;
  numberZero?: number;
  addZero?: boolean;

};

const InputAddZero = (props: InputAddZeroProp) => {
  const {
    labelText,
    widthInput,
    heightInput,
    disabled,
    isError,
    isRequire,
    onChange,
    icon,
    placeholder,
    errorText,
    defaultValue,
    addZero,
    numberZero,
    ...rest
  } = props;

  const [valueInput, setValueInput] = useState(_.toString(props?.value) ?? '');


  const handleFocusOut = (e: any) => {
    const value = _.toString(e.target.value) ?? ''
    const num = numberZero ?? props.maxLength;
    if (addZero && num && value.length > 0) {
      const valueChange = value.padStart(num, '0');
      setValueInput(valueChange);
      return;
    }
  };

  const handleOnChange = (e: any) => {
    setValueInput(e.target.value)
    onChange && onChange(e.target.value)
  }

  return (
    <div className="input-container" style={{ '--input-width': widthInput } as React.CSSProperties}>
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
              className="input-text"
              disabled={disabled}
              placeholder={localizeString(placeholder) || ''}
              {...rest}
              value={valueInput}
            />
          </div>
        ) : (
          <input
            className="input-text"
            disabled={disabled}
            placeholder={localizeString(placeholder) || ''}
            // value={valueInput}
            onBlur={handleFocusOut}
            // onChange={handleOnChange}
            // onChange={e => setValueInput(e.target.value)}
            {...rest}
            maxLength={5}
          />
        )}
      </div>

    </div>
  )
}

export default InputAddZero