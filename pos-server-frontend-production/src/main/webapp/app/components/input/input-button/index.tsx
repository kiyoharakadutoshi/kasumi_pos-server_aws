import React, { CSSProperties } from 'react';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import InputControl from 'app/modules/mix-match-settings/form-control/InputControl';

import './styles.scss';
import TooltipNumberInputTextControl from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text-control';

interface InputButtonGroupProps {
  style?: CSSProperties;
  inputName?: string;
  inputOnBlur?: () => void;
  inputFocusOut?: () => void;
  handleClickButton?: () => void;
  height?: number;
  disabled?: boolean;
  maxLength?: number;
  addZero?: boolean;
  inputDisabled?: boolean;
}

const InputButtonGroup = ({
  maxLength,
  style,
  inputName,
  inputOnBlur,
  inputFocusOut,
  handleClickButton,
  height,
  disabled,
  addZero,
  inputDisabled
}: InputButtonGroupProps) => {
  return (
    <div className="input-button-group" style={style}>
      <div className="input-button-group__box">
        <TooltipNumberInputTextControl
          maxLength={maxLength}
          disabled={disabled}
          name={inputName}
          onBlur={inputOnBlur}
          focusOut={inputFocusOut}
          height={`${height}px`}
          className="input-button-group__input"
          addZero={addZero}
        />
        <ButtonPrimary
          disabled={disabled || inputDisabled}
          heightBtn={`${height}px`}
          className="input-button-group__button"
          text="検索"
          onClick={handleClickButton}
        />
      </div>
    </div>
  );
};

export default InputButtonGroup;
