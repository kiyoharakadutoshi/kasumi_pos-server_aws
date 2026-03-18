import React, { Fragment, useCallback, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

// Styles
import '@/components/input-text-custom/input-text-custom.scss';
import ListRadioButton, { IRadioButtonProps } from '../radio-button-component/radio-button';
import styled from 'styled-components';
import { Translate } from 'react-jhipster';

export const RadioBoxControl = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: #001440;
  font-weight: 500;
`;

interface RadioControlProps {
  name: string;
  initValue?: string;
  label?: string;
  isRequired?: boolean;
  className?: string;
}

const RadioControl = (props: IRadioButtonProps & RadioControlProps) => {
  const { name, value, initValue, listValues, isVertical, isRequired, label, disabled } = props;
  const { onChange, ...rest } = props;

  const { control, setValue, getValues } = useFormContext();

  useEffect(() => {
    if (initValue) {
      setValue(name, initValue);
    }
  }, [initValue]);

  const renderInput = useCallback(
    ({ field: { ...field } }) => {
      return (
        <RadioBoxControl className={props.className}>
          {label && (
            <label className="label-radio">
              <Translate contentKey={label} />
              {isRequired && <span className={'text-require'}>*</span>}
            </label>
          )}

          <ListRadioButton
            name={name}
            isVertical={isVertical}
            value={value || getValues(name)}
            listValues={listValues}
            onChange={(item, index) => {
              field.onChange?.(item.id, index);
              onChange?.(item, index);
            }}
            {...rest}
          />
        </RadioBoxControl>
      );
    },
    [value, listValues, isVertical, disabled]
  );

  return (
    <Fragment>
      <Controller name={name} control={control} render={renderInput} />
    </Fragment>
  );
};

export default RadioControl;
