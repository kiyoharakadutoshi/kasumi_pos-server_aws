import { KEYDOWN } from 'app/constants/constants';
import { countCommas, isEqual, isNullOrEmpty, localizeString } from 'app/helpers/utils';
import _ from 'lodash';
import React, { ComponentProps, Fragment, Ref, useEffect, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { Placement } from 'react-bootstrap/types';
import { NumericFormat } from 'react-number-format';
import './tooltip-number-input-text.scss';

export type NumberInputTextProps = Omit<ComponentProps<'input'>, 'onChange'> & {
  name?: string;
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
  thousandSeparator?: string;
  selectAllOnFocus?: boolean;
  label?: string;
  required?: boolean;
  isNegative?: boolean;
  errorPlacement?: Placement;
  onMaxLength?: (value: string) => void;
  onMaxLengthInputTable?: (value: string) => void;
  focusOutWhenTabEnter?: boolean;
  focusOutWhenDataNotChanged?: boolean;
  defaultValue?: string | number;
  allowLeadingZeros?: boolean;
  decimalScale?: number;
};

const TooltipNumberInputText: React.FC<NumberInputTextProps> = ({
  inputRef,
  minValue,
  maxValue,
  addZero,
  numberZero,
  onChange,
  focusOut,
  thousandSeparator,
  selectAllOnFocus = true,
  focusOutWhenTabEnter = true,
  focusOutWhenDataNotChanged = true,
  errorPlacement = 'right',
  allowLeadingZeros = true,
  label,
  isNegative,
  required,
  onMaxLength,
  decimalScale = 0,
  onMaxLengthInputTable,
  ...inputProps
}) => {
  const { value, className, placeholder, width, error, textAlign, height, onFocus, maxLength = null, ...rest } = inputProps;
  const commaCount = isNullOrEmpty(thousandSeparator) ? 0 : countCommas(maxLength);
  const hasMaxlength = maxLength > 0;
  const decimalCount = decimalScale > 0 ? decimalScale + 1 : 0;
  const integerCount = hasMaxlength ? maxLength + commaCount : null;
  const maxLengthInput = hasMaxlength ? integerCount + decimalCount : null;
  const { textAlign: textAlignStyle, width: widthStyle, height: heightStyle, ...style } = rest.style || {};
  const [valueInput, setValueInput] = useState(_.toString(value) ?? '');
  const [errorInput, setError] = useState<string>(error);
  const [showError, setShowError] = useState(false);
  const [target, setTarget] = useState(null);
  const isError = (!isNullOrEmpty(error) || !isNullOrEmpty(errorInput)) && errorInput !== 'noErr';
  let isTabPressed = false;
  const [valueOutFocus, setValueFocus] = useState(value);

  useEffect(() => {
    setError(error);
  }, [error]);

  useEffect(() => {
    setValueInput(_.toString(value) ?? '');
    if (!isEqual(value, valueInput)) {
      setValueFocus(value);
    }
  }, [value]);

  const handleOnChange = (e: any) => {
    const inputValue: string = e.target.value.replace(/,/g, '');
    if (inputValue.length === 0) {
      setValueInput(inputValue);
      onChange && onChange(null);
      return;
    }

    setError('noErr');
    setShowError(false);

    setValueInput(inputValue);
    onChange && onChange(inputValue);

    if (hasMaxlength && inputValue?.length === maxLength) {
      onMaxLength?.(inputValue);
      if (onMaxLengthInputTable) {
        onMaxLengthInputTable?.(inputValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYDOWN.Tab || e.key === KEYDOWN.Enter) {
      isTabPressed = true;
    }
  };

  const handleFocusOut = () => {
    if (isNullOrEmpty(valueInput)) {
      checkFocusOut(valueInput);
      return;
    }

    setError(null);

    const num = numberZero ?? maxLength;
    let valueChange = valueInput;

    if (addZero && num && valueInput.length > 0) {
      valueChange = valueInput.padStart(num, '0');
      setValueInput(valueChange);
      onChange && onChange(valueChange);
    }

    checkFocusOut(valueChange);
  };

  const checkFocusOut = (valueChange: string) => {
    if (isEqual(valueChange, valueOutFocus)) {
      if ((!focusOutWhenTabEnter && isTabPressed) || (!focusOutWhenDataNotChanged && !isError)) {
        isTabPressed = false;
        return;
      }
    }

    setValueFocus(valueChange);
    focusOut?.(valueChange);
    isTabPressed = false;
  };

  const onPaste = (event: any) => {
    event.preventDefault();
    let valuePaste = event.clipboardData.getData('text')?.replace(/[^0-9]/g, '');
    if (hasMaxlength) valuePaste = valuePaste.substring(0, maxLength);
    document.execCommand('insertText', false, valuePaste);
  };

  const inputText = (
    <Fragment>
      <NumericFormat
        allowLeadingZeros={allowLeadingZeros}
        {...rest}
        type={'text'}
        value={valueInput}
        getInputRef={inputRef}
        maxLength={maxLengthInput}
        onChange={handleOnChange}
        decimalScale={decimalScale}
        allowNegative={isNegative || false}
        className={`tooltip-number-input-text ${isError ? 'tooltip-number-input-text-error' : ''
          } ${label ? '' : className ?? ''}`.trim()}
        placeholder={localizeString(placeholder)}
        onBlur={handleFocusOut}
        onKeyDown={handleKeyDown}
        style={{
          width: width || widthStyle,
          textAlign: textAlign || textAlignStyle,
          height: height || heightStyle,
          ...style,
        }}
        thousandSeparator={thousandSeparator}
        isAllowed={(values) => {
          const { floatValue, formattedValue } = values;
          if (isNullOrEmpty(values.value)) return true;

          // Validate integer part if has decimal
          if (decimalScale > 0) {
            if (hasMaxlength) {
              const [integerPart] = formattedValue.replace("-", "").split('.');
              if (integerPart.length > integerCount) return false;
            }
          } else if (hasMaxlength && values.value.replace("-", "")?.length > maxLength) return false;

          if (allowLeadingZeros === false && !/^(0(\.\d*)?|[1-9].*)$/g.test(values.value)) return false;
          if (minValue && maxValue) return floatValue >= minValue && floatValue <= maxValue;
          if (maxValue) return floatValue <= maxValue;
          if (minValue) return floatValue >= minValue;
          return true;
        }}
        onMouseEnter={(event: any) => {
          if (label) return;
          if (!target) setTarget(event?.target);
          if (isError) setShowError(true);
        }}
        onMouseLeave={() => setShowError(false)}
        onPaste={onPaste}
        onFocus={(event) => {
          if (selectAllOnFocus) {
            setTimeout(() => event.target.select(), 0);
          }
          onFocus?.(event);
        }}
      />
      {isError && (
        <Overlay show={showError} target={target} placement={errorPlacement}>
          <Popover id="popover-basic">
            <Popover.Body>{errorInput ?? error}</Popover.Body>
          </Popover>
        </Overlay>
      )}
    </Fragment>
  );

  if (label)
    return (
      <div
        onMouseEnter={(event) => {
          setTarget(event?.target);
          if (isError) setShowError(true);
        }}
        onMouseLeave={() => setShowError(false)}
        className={`input-number-container ${inputProps.disabled ? 'input-number-container-disable' : ''} ${isError ? 'input-number-container-error' : ''
          } ${className ?? ''}`.trim()}
        style={{
          ...rest.style,
        }}
      >
        <span className={'input-number-container__label'}>
          {localizeString(label)}
          {required && <span className={'input-number-container__required'}>*</span>}
        </span>
        {inputText}
      </div>
    );

  return inputText;
};

export default TooltipNumberInputText;
