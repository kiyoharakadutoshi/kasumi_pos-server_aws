import { Controller, useFormContext } from 'react-hook-form';
import React, { Fragment, useEffect } from 'react';
import TooltipNumberInputText, {
  NumberInputTextProps,
} from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text';
import { localizeFormat } from 'app/helpers/utils';
import { ValidationRule } from 'react-hook-form/dist/types/validator';
import _ from 'lodash';

interface INumberInputTextControlProps extends NumberInputTextProps {
  localizeKey?: string;
  patternValidate?: ValidationRule<RegExp>;
  negativeNumber?: boolean;
  isNegative?: boolean;
}

const TooltipNumberInputTextControl = (props: INumberInputTextControlProps) => {
  const {
    control,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useFormContext();

  const { error, width, localizeKey, patternValidate, ...rest } = props;
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
          required: props.required ? localizeFormat('MSG_VAL_001', localizeKey ?? props.label) : null,
          pattern: patternValidate,
        }}
        name={props.name}
        control={control}
        render={({ field }) => {
          return (
            <>
              <TooltipNumberInputText
                value={getValues(props.name)}
                error={error ?? errorForm}
                width={width}
                {...rest}
                onChange={(value) => {
                  field.onChange(value);
                  if (props.onChange) props.onChange(value);
                }}
                focusOut={(value) => {
                  if (errorForm) setError(props.name, null);
                  field.onBlur();
                  props.focusOut?.(value);
                }}
                isNegative={props.isNegative}
              />
            </>
          );
        }}
      />
    </Fragment>
  );
};

export default TooltipNumberInputTextControl;
