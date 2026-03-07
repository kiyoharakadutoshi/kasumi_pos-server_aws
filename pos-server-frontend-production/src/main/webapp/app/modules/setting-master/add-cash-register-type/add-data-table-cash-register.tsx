import {translate} from 'react-jhipster';
import React from 'react';
import {useAppDispatch, useAppSelector} from 'app/config/store';
import {IPaymentMachine} from 'app/modules/setting-master/add-cash-register-type/add-cash-register-type-interface';
import './add-cash-register-type.scss';
import TablePaymentMachine from 'app/modules/setting-master/add-cash-register-type/add-cash-register-type-table';
import {TitleName} from 'app/components/table/default-table/default-table';
import {handleClickUpdate, IPaymentMachineState} from 'app/reducers/payment-machine-reducer';
import {OperationType} from 'app/modules/setting-master/enum-setting';

const AddTablePaymentMachine = ({
  handleSelectRow,
  isEditing,
  onEdit,
  selectedRow,
}: {
  handleSelectRow: (paymentMachine: IPaymentMachine) => void;
  isEditing: boolean;
  selectedRow: IPaymentMachine;
  onEdit: (row: any) => void;
}) => {
  const listTitleTable: TitleName[] = [
    {
      keyName: 'no',
      title: translate('addPaymentMachine.table.no'),
      width: 15,
    },
    {
      keyName: 'code',
      title: translate('addPaymentMachine.table.code'),
      width: 15,
    },
    {
      keyName: 'name',
      width: 70,
      title: translate('addPaymentMachine.table.typeCashRegister'),
    },
  ];

  const dispatch = useAppDispatch();
  const paymentMachineState: IPaymentMachineState = useAppSelector(state => state.paymentMachineReducer);

  const handleSelectRowTable = (itemTable: any) => {
    const cashRegister = paymentMachineState?.payment_Machine?.find(paymentMachine => {
      return paymentMachine.no === itemTable.no;
    });
    handleSelectRow(cashRegister);
  };
  const handleEdit = (row: any) => {
    if (onEdit) {
      dispatch(
        handleClickUpdate({
          ...row,
          operation_type: row.operation_type ?? OperationType.Edit,
          operation_type_before: row.operation_type ?? OperationType.Edit,
        }),
      );
      onEdit(row);
    }
  };

  return (
    <TablePaymentMachine
      selectedRow={selectedRow}
      titleTable={listTitleTable}
      onRowSelect={(itemTable: any) => handleSelectRowTable(itemTable)}
      isEditing={isEditing}
      onEdit={handleEdit}
    />
  );
};

export default AddTablePaymentMachine;
