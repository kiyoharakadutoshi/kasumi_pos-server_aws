import { Controller, useFormContext } from 'react-hook-form';
import React, { useEffect } from 'react';
import TooltipTimePicker, { TimePickerProps } from 'app/components/time-picker/tooltip-time-picker/tooltip-time-picker';
import { localizeFormat } from 'app/helpers/utils';
import { ValidationRule } from 'react-hook-form/dist/types/validator';
import _ from 'lodash';

interface IDatePickerControlProps extends TimePickerProps {
  name: string;
  patternValidate?: ValidationRule<RegExp>;
}

const TooltipTimePickerControl = (props: IDatePickerControlProps) => {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
    setError
  } = useFormContext();
  const errorForm = _.get(errors, props.name)?.message as string;

  useEffect(() => {
    if (props.initValue) {
      setValue(props.name, props.initValue);
    }
  }, [props.initValue]);

  return (
    <Controller
      name={props.name}
      control={control}
      rules={{
        required: props.required ? localizeFormat('MSG_VAL_001', props.keyError) : null,
        pattern: props.patternValidate,
      }}
      render={({ field }) => (
        <TooltipTimePicker
          initValue={getValues(props.name)}
          {...field}
          {...props}
          error={props.error ?? errorForm}
          onChange={(time, value) => {
            field.onChange(value);
            if (props.onChange) props.onChange(time, value);
            if(time){
              setError(props.name, null);
            }
          }}
        />
      )}
    />
  );
};

export default TooltipTimePickerControl;
