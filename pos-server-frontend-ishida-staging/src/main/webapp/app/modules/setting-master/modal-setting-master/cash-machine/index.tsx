import React, { useEffect } from 'react';
import TableData from '@/components/table/table-data/table-data';
import { FormProvider } from 'react-hook-form';
import useTableColumn from '@/modules/setting-master/modal-setting-master/cash-machine/useTableColumn';
import { focusElementByNameWithTimeOut } from 'app/helpers/utils';

const TabSetting = ({ mode, formConfig, setDisableConfirm }) => {
  const { watch } = formConfig;
  const { columns } = useTableColumn({ setDisableConfirm, mode });

  useEffect(() => {
    focusElementByNameWithTimeOut('settingCashMachine[0].count_10000', 100);
  }, []);

  return (
    <FormProvider {...formConfig}>
      <TableData
        columns={columns}
        data={watch('settingCashMachine')}
        showNoData={false}
        enableSelectRow={false}
        tableKey="settingCashMachine"
      />
    </FormProvider>
  );
};

export default TabSetting;
