import React, { useEffect } from 'react';
import CheckboxButton, { NormalCheckBoxButtonProps } from 'app/components/checkbox-button/checkbox-button';
import { Controller, useFormContext } from 'react-hook-form';

interface CheckboxControlProps extends NormalCheckBoxButtonProps {
  name: string;
}

const CheckboxControl: React.FC<CheckboxControlProps> = (props) => {
  const { control, getValues } = useFormContext();

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { onChange } }) => (
        <CheckboxButton
          {...props}
          name={props.name}
          onChangeFunc={(event) => {
            onChange?.(event);
            props.onChangeFunc?.(event);
            props.onChange?.();
            event.stopPropagation();
          }}
          checked={getValues(props.name)}
        />
      )}
    />
  );
};

export default CheckboxControl;
