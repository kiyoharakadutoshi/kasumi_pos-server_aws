import React, { useMemo } from 'react';
import { TableColumnDef } from '@/components/table/table-data/table-data';
import { localizeString } from '@/helpers/utils';
import CashStatus from '@/modules/sc7301-cash-register-status-reference/CashStatus';
import {
  cashRegisterStatusReference,
  equipmentFailure,
} from 'app/modules/sc7301-cash-register-status-reference/sc7301-cash-register-status-interface';
import { itemCashRegisterStatusType } from '@/modules/sc7301-cash-register-status-reference/CashRegisterDataType';
import { COLON_FULL_SIZE } from 'app/constants/constants';

const UseTableColumn = () => {
  // Function to render store name and code

  // Function to render header for data primary status and apply primary time
  const renderHeaderDataMasterStatusAndApplyMasterTime = () => {
    return (
      <>
        {localizeString('cashRegisterStatus.masterDateTime')}
        <br />
        {localizeString('cashRegisterStatus.dataMasterStatus')}
      </>
    );
  };

  // Function to render row data for data primary status and apply primary time
  const renderRowDataMasterStatusAndApplyMasterTime = (row: {
    original: { dataMasterStatus: number; applyMasterTime: string };
  }) => {
    // if (row.original.cashRegisterStatus === 3) return '';
    const dataMasterStatus = row.original.dataMasterStatus;
    const applyMasterTime = row.original.applyMasterTime;
    const statusContent = localizeString(cashRegisterStatusReference[dataMasterStatus]);

    if (dataMasterStatus === 0) {
      return statusContent;
    }

    return (
      <div className={`update-date`}>
        <span>{applyMasterTime}</span>
        {statusContent}
      </div>
    );
  };

  // Define table columns using useMemo for performance optimization
  const columns = useMemo<TableColumnDef<itemCashRegisterStatusType>[]>(
    () => [
      {
        id: 'storeCodeAndName',
        accessorKey: 'storeCodeAndName', // column1
        header: 'cashRegisterStatus.store',
        type: 'text',
        size: 18,
        textAlign: 'left',
        option(props) {
          const record: itemCashRegisterStatusType = props?.row?.original;
          return { value: `${record?.storeCode}${COLON_FULL_SIZE}${record?.storeName}` };
        },
      },
      {
        accessorKey: 'cashRegisterCode', // cash_register_code  | column2
        header: 'cashRegisterStatus.registerNumber',
        textAlign: 'right',
        type: 'text',
        size: 6,
      },
      {
        accessorKey: 'cashRegisterTypeName', //  cash_register_type_name | column3
        header: 'cashRegisterStatus.cashRegisterType',
        textAlign: 'left',
        type: 'text',
        size: 14,
      },
      {
        accessorKey: 'ipAddress', // ip_address | column4
        header: 'IP',
        textAlign: 'left',
        type: 'text',
        size: 11.5,
      },
      {
        accessorKey: 'parentIpAddress', // parent_ip_address | column5
        textAlign: 'left',
        header: 'cashRegisterStatus.parentIP',
        type: 'text',
        size: 11.5,
      },
      {
        accessorKey: 'transactionDate', // transaction_date | column6
        textAlign: 'left',
        header: 'cashRegisterStatus.businessDate',
        type: 'text',
        size: 7,
      },
      {
        id: 'dataMasterStatusAndApplyMasterTime',
        accessorKey: 'dataMasterStatusAndApplyMasterTime', // data_master_status + apply_master_time | column12
        header() {
          return renderHeaderDataMasterStatusAndApplyMasterTime();
        },
        textAlign: 'left',
        cell({ row }) {
          return renderRowDataMasterStatusAndApplyMasterTime(row);
        },
        size: 10.5,
      },
      {
        id: 'cashRegisterStatus',
        accessorKey: 'cashRegisterStatus', // cash_register_status | column8
        textAlign: 'center',
        header: 'cashRegisterStatus.cashRegisterStatus',
        cell({ row }) {
          const status = row.original.cashRegisterStatus;
          return <CashStatus status={status} />;
        },
        size: 8,
      },
      {
        id: 'parentStatus',
        accessorKey: 'parentStatus', // parent_status | column13
        textAlign: 'center',
        header: 'cashRegisterStatus.parentStatus',
        cell({ row }) {
          const status = row.original.parentStatus;
          return <CashStatus status={status} />;
        },
        size: 8,
      },
      {
        id: 'failureStatus',
        accessorKey: 'failureStatus', // failure_status | column14
        header: 'cashRegisterStatus.failureStatus',
        textAlign: 'center',
        cell({ row }) {
          return <div>{localizeString(equipmentFailure[row.original.failureStatus])}</div>;
        },
        size: 5.5,
      },
    ],
    []
  );

  return { columns };
};

export default UseTableColumn;
