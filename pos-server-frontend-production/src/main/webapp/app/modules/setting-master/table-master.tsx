import React from 'react';
import './master-home.scss';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { settingMasterSlice } from 'app/reducers/setting-master-reducer';
import TableCommon, { SelectedRow } from 'app/components/table/table-common';
import { CashRegister, DataTableMaster } from './interface-setting';

interface TableMasterLayoutProps {
  actionDoubleClick: (row: any) => void;
}

export const TableMasterLayout: React.FC<TableMasterLayoutProps> = ({ actionDoubleClick }) => {
  const dispatch = useAppDispatch();
  const listDataTable = useAppSelector(state => state.settingMasterReducer.data_table_cash_registers);
  const selectedCashMachine: SelectedRow = useAppSelector(state => state.settingMasterReducer.selected_cash_machine);
  const totalCount = useAppSelector(state => state.settingMasterReducer.total_count);
  const noData = useAppSelector(state => state.settingMasterReducer.noData);

  return (
    <TableCommon<DataTableMaster>
      columns={[
        {
          width: 24,
          keyItem: 'store',
          title: 'settingMaster.table.store',
        },
        {
          width: 6,
          keyItem: 'machineCode',
          title: 'settingMaster.table.machineCode',
          alignItem: 'right'
        },
        {
          width: 12,
          keyItem: 'machineType',
          title: 'settingMaster.table.machineType',
        },
        {
          width: 11,
          keyItem: 'noteType',
          title: 'settingMaster.table.noteType',
        },
        {
          width: 23.4,
          keyItem: 'presetLayout',
          title: 'settingMaster.table.presetLayout',
        },
        {
          width: 11.2,
          keyItem: 'ipAddress',
          title: 'settingMaster.table.ipAddress',
        },
        {
          width: 12.2,
          keyItem: 'macAddress',
          title: 'settingMaster.table.macAddress',
        },
      ]}
      selectedRow={{
        index: selectedCashMachine?.index,
        row:  listDataTable ? listDataTable[selectedCashMachine?.index] : null,
      }}
      bodyItems={listDataTable}
      totalCount={totalCount}
      bodyItemChange={(items: DataTableMaster[]) => dispatch(settingMasterSlice.actions.handleSaveDataTable(items))}
      onSelectRow={(selectedRow: SelectedRow<CashRegister>) => dispatch(settingMasterSlice.actions.handleSelectedCashRegister(selectedRow))}
      actionDoubleClick={(dataTable: any) => actionDoubleClick(dataTable)}
      canShowNoData={noData}
    />
  );
};

export default React.memo(TableMasterLayout);
