import React, { Fragment, useCallback, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';

type RadioToggleProps = {
  name?: string;
  checked?: boolean;
  label?: string;
  onChange?: () => void;
};

const StyledLabel = styled.span`
  color: #464646;
  font-weight: 500;
  font-size: 24px;
  line-height: 36px;
  font-family: 'Noto Sans JP', sans-serif;
`;

const RadioToggleControl: React.FC<RadioToggleProps> = ({
  name,
  checked,
  label,
  onChange: onChangeRadio = () => {},
}) => {
  const { control, setValue, watch } = useFormContext();

  useEffect(() => {
    if (checked) {
      setValue(name, checked);
    }
  }, [checked]);

  const renderRadio = useCallback(
    ({ field: { onChange: onChangeFunc } }) => {
      return (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => {
            onChangeFunc(!watch(name));
            onChangeRadio?.();
          }}
        >
          <input
            type="radio"
            name={name}
            checked={watch(name)}
            onChange={(e) => {
              onChangeFunc(e.target.checked);
              onChangeRadio?.();
            }}
            className="radio-button__input"
          />
          {label && (
            <span className="ml-2">
              <StyledLabel>{label}</StyledLabel>
            </span>
          )}
        </div>
      );
    },
    [label, name, !watch(name)]
  );

  return (
    <Fragment>
      <Controller name={name} control={control} render={renderRadio} />
    </Fragment>
  );
};

export default RadioToggleControl;
