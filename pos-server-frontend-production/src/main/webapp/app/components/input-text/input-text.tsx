import React, {
  ComponentProps,
  LegacyRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getStringLength, isNullOrEmpty, localizeString } from 'app/helpers/utils';
import './input-text.scss';
import { Overlay, Popover } from 'react-bootstrap';
import { Placement } from 'react-bootstrap/types';

export type InputTextProps = ComponentProps<'input'> & {
  required?: boolean;
  onChange?: (e: any) => void;
  errorValue?: string;
  inputRef?: LegacyRef<HTMLInputElement>;
  hasBorder?: boolean;
  errorPlacement?: Placement;
  regex?: RegExp;
  checkLengthFullSize?: boolean;
  hasTrimSpace?: boolean;
};

const InputText: React.FC<InputTextProps> = ({ required, onChange, errorValue, width, height, ...inputProps }) => {
  const {
    disabled,
    maxLength,
    title,
    className,
    placeholder,
    inputRef,
    regex,
    value,
    errorPlacement = 'right',
    checkLengthFullSize,
    hasTrimSpace,
    onBlur,
    ...rest
  } = inputProps;

  const [errorInput, setError] = useState<string>(errorValue);
  const [showError, setShowError] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const ref = useRef(null);

  useEffect(() => {
    setError(errorValue);
  }, [errorValue]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChangeLength = (e: any) => {
    if (isNullOrEmpty(e.target.value)) {
      setInputValue('');
      if (onChange) onChange(e);
      return;
    }

    if (maxLength) {
      const length = checkLengthFullSize === true ? maxLength : getStringLength(e.target.value);
      if (length > maxLength) {
        e.target.value = inputProps.value;
        return;
      }
    }

    setInputValue(e.currentTarget.value);
    setError(null);
    setShowError(false);
    if (onChange) onChange(e);
  };

  const onInput = (e: any) => {
    if (!isNullOrEmpty(e.target.value) && regex && !regex.test(e.target.value)) {
      e.target.value = inputProps.value;
    }
  }

  if (isNullOrEmpty(title)) {
    return (
      <>
        <input
          ref={ref}
          style={{ width }}
          {...rest}
          disabled={disabled}
          value={inputValue ?? ''}
          onChange={handleChangeLength}
          maxLength={maxLength}
          className={`${className ?? ''} ${errorInput?.length > 0 ? 'input-text-error' : 'input-text-normal'} input-text-data`.trim()}
          placeholder={localizeString(placeholder)}
          onMouseEnter={() => {
            if (errorInput?.length > 0) setShowError(true);
          }}
          onMouseLeave={() => setShowError(false)}
          onInput={onInput}
        />
        <Overlay
          show={showError}
          target={(inputRef as React.MutableRefObject<any>)?.current ?? ref.current}
          placement={errorPlacement}
        >
          <Popover id="popover-basic">
            <Popover.Body>{errorInput}</Popover.Body>
          </Popover>
        </Overlay>
      </>
    );
  }

  return (
    <div
      ref={ref}
      onMouseLeave={() => setShowError(false)}
      className={`wrap-input-text ${errorInput?.length > 0 ? 'wrap-input-text-error' : ''} ${inputProps?.disabled ? 'disabled' : ''}`}
      onMouseEnter={() => {
        if (errorInput?.length > 0) setShowError(true);
      }}
    >
      <div className="wrap-label">
        <label className="label">
          {localizeString(title)}
          {required && <span className="label-require">*</span>}
        </label>
      </div>
      <input
        style={{ width, height }}
        {...rest}
        ref={inputRef}
        disabled={disabled}
        onChange={handleChangeLength}
        value={inputValue ?? ''}
        maxLength={maxLength}
        className={`${className ?? ''} ${errorInput?.length > 0 ? 'input-text-error' : 'input-text-normal'} input-text-data`.trim()}
        placeholder={localizeString(placeholder)}
        onInput={onInput}
        onBlur={(event) => {
          if (hasTrimSpace) {
            event.target.value = event.target.value.trim();
            onChange?.(event);
          }
          onBlur?.(event);
        }}
      />
      <Overlay show={showError} target={ref.current} placement={errorPlacement}>
        <Popover id="popover-basic">
          <Popover.Body>{errorInput}</Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default InputText;
