import React from 'react';
import TableData from '@/components/table/table-data/table-data';
import useColumn from '@/modules/setting-master/table-master/useColumn';
import { useAppSelector } from '@/config/store';
import { settingMasterSlice } from 'app/reducers/setting-master-reducer';
import { useAppDispatch } from 'app/config/store';

const TableMaster = ({ actionDoubleClick }) => {
  const { columns } = useColumn();
  const dispatch = useAppDispatch();
  const listDataTable = useAppSelector((state) => state.settingMasterReducer.data_table_cash_registers);
  const dataTableDefault = useAppSelector((state) => state.settingMasterReducer.data_table_cash_registers_default);
  const indexSelectedRows = useAppSelector((state) => state.settingMasterReducer.selected_cash_machine?.index);
  const noData = useAppSelector((state) => state.settingMasterReducer.noData);

  return (<TableData
    columns={columns}
    data={listDataTable}
    onDoubleClick={actionDoubleClick}
    showNoData={!!noData}
    defaultData={dataTableDefault}
    onClickRow={(row, index) => {
      dispatch(settingMasterSlice.actions.handleSelectedCashRegister({ ...row, index }));
    }}
    selectedIndexRows={[indexSelectedRows]}
  />
  );
};

export default TableMaster;
