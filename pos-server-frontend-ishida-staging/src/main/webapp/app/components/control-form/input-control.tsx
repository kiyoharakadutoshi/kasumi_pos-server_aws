import React, { Fragment, useCallback, useEffect } from 'react';
import { Controller, FieldValues, useFormContext, ValidationRule } from 'react-hook-form';

import InputTextCustom, { InputTextCustomProp } from '../input-text-custom/input-text-custom';

// Styles
import '@/components/input-text-custom/input-text-custom.scss';
import _ from 'lodash';
import { isNullOrEmpty, localizeFormat } from 'app/helpers/utils';

type CommonProps = {
  hasAutoFill?: boolean;
  hasComma?: boolean;
  localizeKey?: string;
  patternValidate?: ValidationRule<RegExp>;
};

const InputControl = (props: InputTextCustomProp & CommonProps) => {
  const {
    name = '',
    value,
    labelText,
    widthInput,
    disabled,
    isError,
    isRequire,
    onChange,
    onKeyDown,
    onInput,
    className,
    icon,
    placeholder,
    errorText,
    maxLength,
    onBlur,
    hasAutoFill,
    hasComma,
    autoFocus,
    textAlign,
    patternValidate,
    localizeKey,
    ...rest
  } = props;

  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();
  const errorForm = _.get(errors, props.name)?.message as string;

  useEffect(() => {
    if (value) {
      setValue(name, value);
    }
  }, [value]);

  const autoFillData = () => {
    const valueText = getValues(name);
    if (isNullOrEmpty(valueText)) {
      return;
    }

    if (typeof valueText === 'string') {
      setValue(name, valueText.padStart(maxLength, '0'));
      return;
    }
    setValue(name, valueText);
  };

  const onKeyDownRemoveCommon = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const renderInput = useCallback(
    ({
      field: { onChange: onChangeFunc, onKeyDown: onKeyDownFunc, onInput: onInputFunc, onBlur: onBlurFunc },
    }: {
      field: FieldValues;
    }) => {
      return (
        <InputTextCustom
          name={name}
          className={className}
          onChange={(e) => {
            onChangeFunc?.(e);
            onChange?.(e);
          }}
          onKeyDown={(e) => {
            onKeyDownFunc?.(e);
            onKeyDown?.(e);
            hasComma && onKeyDownRemoveCommon?.(e);
          }}
          onInput={(e) => {
            onInputFunc?.(e);
            onInput?.(e);
          }}
          onBlur={(e) => {
            onBlur?.(e);
            onBlurFunc?.(e);
            hasAutoFill && autoFillData();
          }}
          value={getValues(name)}
          labelText={labelText}
          disabled={disabled}
          isRequire={isRequire}
          maxLength={maxLength}
          tabIndex={0}
          autoFocus={autoFocus}
          widthInput={widthInput}
          textAlign={textAlign}
          isError={isError || !isNullOrEmpty(errorForm)}
          errorText={errorText ?? errorForm}
          {...rest}
        />
      );
    },
    [
      errorText,
      disabled,
      labelText,
      placeholder,
      widthInput,
      className,
      isRequire,
      icon,
      maxLength,
      hasAutoFill,
      autoFocus,
    ]
  );

  return (
    <Fragment>
      <Controller
        rules={{
          required: props.required ? localizeFormat('MSG_VAL_001', localizeKey) : null,
          pattern: patternValidate,
        }}
        name={name}
        control={control}
        render={renderInput}
      />
      {errors[name]?.message as string}
    </Fragment>
  );
};

export default InputControl;
