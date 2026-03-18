import React from 'react';
import { SelectDataInputStyled, SelectOption } from './styled';

const SelectDataInput = ({
  name,
  id,
  selectData,
  disabled,
}: {
  name: string;
  id: string;
  selectData: {
    code: number;
    name: string;
  }[];
  disabled?: boolean;
}) => {
  return (
    <SelectDataInputStyled name={name} id={id} disabled={disabled} data-container="body">
      {selectData?.map((data, index) => {
        return (
          <SelectOption key={index} value={data?.code}>
            {data?.name}
          </SelectOption>
        );
      })}
    </SelectDataInputStyled>
  );
};

export default SelectDataInput;
