import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import React, { Fragment, useCallback } from 'react';

import '@/components/input-text-custom/input-text-custom.scss';
import MultiSelect, { MultiSelectProps } from '../multi-selected/multi-selected';

const MultiSelectControl = (props: MultiSelectProps) => {
  const {
    name,
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

  const { control, getValues } = useFormContext();

  const renderInput = useCallback(
    ({ field: { onChange: onChangeFunc } }: { field: FieldValues }) => {
      return (
        <MultiSelect
          label={label}
          name={name}
          value={getValues(name)}
          className={className}
          items={items}
          onChangeFunc={onChangeFunc}
          onChange={onChange}
          hasLocalized={hasLocalized}
          {...props}
        />
      );
    },
    [name, label, value, items, disabled, hasBorder, hasBlankItem, isRequired, className, isHiddenCode, autoFocus, dataType, hasLocalized],
  );

  return (
    <Fragment>
      <Controller name={name} control={control} render={renderInput} />
    </Fragment>
  );
};

export default MultiSelectControl;
