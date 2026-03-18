import { Controller, useFormContext } from 'react-hook-form';
import React, { Fragment, useEffect } from 'react';
import { localizeFormat } from 'app/helpers/utils';
import InputText, {
  InputTextProps,
} from 'app/components/input-text/input-text';
import { ValidationRule } from 'react-hook-form/dist/types/validator';
import _ from 'lodash';

interface IInputTextControlProps extends InputTextProps {
  localizeKey?: string;
  patternValidate?: ValidationRule<RegExp>;
}

const TooltipInputTextControl = (props: IInputTextControlProps) => {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
    setError,
  } = useFormContext();

  const { errorValue, localizeKey, ...rest } = props;
  const errorForm = _.get(errors, props.name)?.message as string;

  useEffect(() => {
    if (props.value) {
      setValue(props.name, props.value);
    }
  }, [props.value]);

  return (
    <Fragment>
      <Controller
        rules={{
          required: props.required
            ? localizeFormat('MSG_VAL_001', localizeKey ?? props.title)
            : null,
          pattern: props.patternValidate
        }}
        name={props.name}
        control={control}
        render={({ field: {ref, ...field} }) => {
          return (
            <>
              <InputText
                value={getValues(props.name)}
                errorValue={errorValue ?? errorForm}
                {...field}
                {...rest}
                onChange={(value: React.ChangeEvent) => {
                  field.onChange(value);
                  props.onChange?.(value);
                }}
                onBlur={(event) => {
                  setError(props.name, null);
                  props.onBlur?.(event);
                }}
              />
            </>
          );
        }}
      />
    </Fragment>
  );
};

export default TooltipInputTextControl;
