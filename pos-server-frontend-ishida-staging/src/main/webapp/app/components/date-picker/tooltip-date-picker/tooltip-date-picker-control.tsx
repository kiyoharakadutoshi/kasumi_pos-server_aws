import { Controller, useFormContext } from 'react-hook-form';
import React, { useEffect } from 'react';
import TooltipDatePicker, {
  IDatePickerProps,
} from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import { convertDateServer } from 'app/helpers/date-utils';
import { localizeFormat } from 'app/helpers/utils';
import { ValidationRule } from 'react-hook-form/dist/types/validator';
import _ from 'lodash';
import { isValid } from 'date-fns';
interface IDatePickerControlProps extends IDatePickerProps {
  name: string;
  localizeKey?: string;
  patternValidate?: ValidationRule<RegExp>;
}

const TooltipDatePickerControl = (props: IDatePickerControlProps) => {
  const {
    control,
    setValue,
    formState: { errors },
    getValues,
    setError,
    trigger,
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
      rules={{
        required: props.required ? localizeFormat('MSG_VAL_001', props.keyError) : null,
        pattern: props.patternValidate,
      }}
      control={control}
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      render={({ field: { ref, ...field } }) => {
        const dateStr = getValues(props.name);
        return (
          <TooltipDatePicker
            isShortDate={true}
            initValue={dateStr ? new Date(Date.parse(dateStr)) : null}
            {...field}
            {...props}
            error={props.error ?? errorForm}
            onChange={(value) => {
              field.onChange(convertDateServer(value));
              if (props.onChange) props.onChange(value);
              if (isValid(value)) setError(props.name, null);
              trigger(props.name);
            }}
            onBlur={(value) => {
              field.onBlur();
              if (props.onBlur) props.onBlur(value);
            }}
          />
        );
      }}
    />
  );
};

export default TooltipDatePickerControl;
