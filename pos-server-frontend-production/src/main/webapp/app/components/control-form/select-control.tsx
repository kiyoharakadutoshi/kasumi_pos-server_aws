import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import React, { Fragment, useCallback } from 'react';

import '@/components/input-text-custom/input-text-custom.scss';
import Dropdown, { DropDownProps } from '../dropdown/dropdown';
import _ from 'lodash';
import { localizeFormat } from '@/helpers/utils';

const SelectControl = (props: DropDownProps) => {
  const {
    name,
    itemsName,
    label,
    value,
    items,
    onChange,
    disabled,
    hasBorder = true,
    hasBlankItem,
    isRequired,
    className,
    isHiddenCode,
    autoFocus,
    dataType,
    hasLocalized,
  } = props;

  const { control, getValues, setError, formState: { errors } } = useFormContext();
  const { error, localizeKey, patternValidate } = props;
  const errorForm = _.get(errors, props.name)?.message as string;

  const renderInput = useCallback(
    ({ field: { onChange: onChangeFunc } }: { field: FieldValues }) => {
      return (
        <Dropdown
          error={error ?? errorForm}
          label={label}
          name={name}
          value={getValues(name)}
          className={className}
          items={items ?? getValues(itemsName)}
          onChangeFunc={(valueChange) => {
            setError(props.name, null);
            onChangeFunc(valueChange)
          }}
          onChange={(item) => {
            onChange?.(item);
            setError(props.name, null);
          }}
          hasLocalized={hasLocalized}
          {...props}
        />
      );
    },
    [
      name,
      label,
      value,
      items,
      disabled,
      hasBorder,
      hasBlankItem,
      isRequired,
      className,
      isHiddenCode,
      autoFocus,
      dataType,
      hasLocalized,
      props.dirtyCheck,
      errorForm
    ]
  );

  return (
    <Fragment>
      <Controller name={name} control={control} render={renderInput} rules={{
        required: isRequired ? localizeFormat('MSG_VAL_001', localizeKey ?? label) : null,
        pattern: patternValidate,
      }} />
    </Fragment>
  );
};

export default SelectControl;
