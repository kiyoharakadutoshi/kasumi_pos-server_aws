import React from 'react';
import BottomButton, { IBottomButtonProps } from 'app/components/bottom-button/bottom-button';
import { Controller, useFormContext } from 'react-hook-form';

interface IBottomButtonControlProps extends IBottomButtonProps {
  name: string;
}

export const ButtonBottomControl = (props: IBottomButtonControlProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      render={({ field }) => (
        <BottomButton
          {...props}
          disableConfirm={field.value}
          disabledClear={field.value}
          dirtyCheckClear={props.dirtyCheckClear && !field.value}
        />
      )}
      control={control}
      name={props.name}
    />
  );
};
