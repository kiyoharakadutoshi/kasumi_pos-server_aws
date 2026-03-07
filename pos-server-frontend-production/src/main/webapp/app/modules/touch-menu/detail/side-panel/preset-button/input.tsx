import React, { useEffect, useState } from 'react';
import 'app/modules/touch-menu/detail/preset.scss';
import NumberInputText from 'app/components/input/input-text/number-input';
import _, { isNaN, parseInt } from 'lodash';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';

export const SizeInput = ({
  title,
  value,
  defaultValue,
  minValue,
  maxValue,
  maxLength,
  onChange,
  disabled,
  classNameSizeInput,
}: {
  title: string;
  value?: number;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  maxLength?: number;
  onChange: (value?: number) => void;
  disabled?: boolean;
  classNameSizeInput?: string;
}) => {
  const [valueInput, setValueInput] = useState(value ?? defaultValue);

  useEffect(() => {
    setValueInput(value);
  }, [value]);

  const onChangeValue = (valueStr?: string) => {
    let valueNum = parseInt(valueStr, 10);
    if (isNaN(valueNum)) {
      valueNum = null;
    }
    setValueInput(valueNum);
    onChange(valueNum);
  };

  const focusOut = (valueStr?: string) => {
    if (isNullOrEmpty(valueStr)) {
      setValueInput(1);
      onChange(1);
    }
  };

  return (
    <>
      <NumberInputText
        classNameForm={classNameSizeInput}
        borderRadius={0}
        label={title}
        value={_.toString(valueInput)}
        width="60px"
        borderColor="#666666"
        backgroundColor="white"
        className="size-input"
        padding="0"
        maxLength={maxLength}
        onChange={(numberStr) => onChangeValue(numberStr)}
        minValue={minValue}
        maxValue={maxValue}
        type="number"
        focusOut={focusOut}
        disabled={disabled}
      />
    </>
  );
};

export const ImageItem = ({ title, src }: { title: string; src?: string }) => {
  return (
    <div className="side-panel-item-name">
      {localizeString(title)}
      <div className="container-image-item">
        {src ? (
          <img src={src} className="image-item" alt=""></img>
        ) : (
          <span className="side-panel-image-text">{localizeString('detailMenu.buttonTab.noImage')}</span>
        )}
      </div>
    </div>
  );
};
