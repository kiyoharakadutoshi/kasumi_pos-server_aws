import React from 'react';
import CheckboxButton, { NormalCheckBoxButtonProps } from 'app/components/checkbox-button/checkbox-button';
import { Controller, useFormContext } from 'react-hook-form';
import { parseBool, parseNumber } from 'app/helpers/utils';

interface CheckboxControlProps extends NormalCheckBoxButtonProps {
  name: string;
}

const CheckboxControl: React.FC<CheckboxControlProps> = (props) => {
  const { control, getValues } = useFormContext();

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { onChange } }) => {
        const value = getValues(props.name);
        return (
          <CheckboxButton
            {...props}
            name={props.name}
            onChangeFunc={(event) => {
              onChange?.(props.dataType === 'number' ? parseNumber(event?.target?.checked) : event?.target?.checked);
              props.onChangeFunc?.(event);
              props.onChange?.();
              event.stopPropagation();
            }}
            checked={props.dataType === 'number' ? parseBool(value) : value}
          />
        );
      }}
    />
  );
};

export default CheckboxControl;
