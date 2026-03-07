import React, { useEffect } from 'react';
import Dropdown from '@/components/dropdown/dropdown';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import InputTextCustom from '@/components/input-text-custom/input-text-custom';
import { FormProvider } from 'react-hook-form';
import { NAME_TYPE_LIST } from '@/modules/sc8501-deposit-withdraw/constants/searchTable';
import { focusElementByName } from '@/helpers/utils';
import './search-table.scss';

const SearchTable = ({ formConfig, handleConfirmAction, typeList, dataChange }) => {
  const { setValue, watch } = formConfig;

  useEffect(() => {
    focusElementByName('type');
  }, []);

  return (
    <FormProvider {...formConfig}>
      <div id="search-table-deposit" className="search-table-deposit">
        <Dropdown
          className="search-table-deposit__dropdown-label"
          label="種別"
          items={typeList}
          disabled={false}
          onChange={(e: any) => setValue('type', e.value)}
          value={watch('type')}
          name="type"
          id="type"
          hasBlankItem={true}
          isHiddenCode={false}
        />

        <InputTextCustom
          widthInput={'800px'}
          inputClassName={'search-table-deposit__input-text-custom'}
          id="name"
          name="name"
          labelText="入出金名称"
          value={watch('name')}
          type="text"
          onChange={(e: any) => setValue('name', e.target.value)}
        />
        <Dropdown
          className="search-table-deposit__dropdown"
          items={NAME_TYPE_LIST}
          disabled={false}
          onChange={(e: any) => setValue('name_type', e.value)}
          value={watch('name_type')}
          id="name_type"
          name="name_type"
          hasBlankItem={false}
          isHiddenCode={true}
        />

        <FuncKeyDirtyCheckButton
          dirtyCheck={dataChange}
          text="action.f12Search"
          onClickAction={handleConfirmAction}
          okDirtyCheckAction={handleConfirmAction}
        />
      </div>
    </FormProvider>
  );
};

export default SearchTable;
