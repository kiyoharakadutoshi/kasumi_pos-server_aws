import React, { useEffect, useRef, useState } from 'react';
import './add-cash-register-type.scss';
import { IPaymentMachine } from 'app/modules/setting-master/add-cash-register-type/add-cash-register-type-interface';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import { handleClickUpdate, IPaymentMachineState } from 'app/reducers/payment-machine-reducer';
import { TitleName } from 'app/components/table/default-table/default-table';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { OperationType } from 'app/modules/setting-master/enum-setting';
import { ErrorState } from 'app/reducers/error';
import { elementChangeKeyListener } from 'app/hooks/keyboard-hook';

interface DefaultTableProps {
  titleTable: TitleName[];
  onRowSelect?: (row: any) => void;
  isEditing?: boolean;
  selectedRow?: IPaymentMachine;
  onEdit?: (row: any) => void;
}

const TablePaymentMachine: React.FC<DefaultTableProps> = ({ titleTable, selectedRow, onRowSelect, isEditing, onEdit }) => {
  const [editName, setEditName] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const paymentMachineState: IPaymentMachineState = useAppSelector(state => state.paymentMachineReducer);
  const dispatch = useAppDispatch();
  const errorState: ErrorState = useAppSelector(state => state.error);

  useEffect(() => {
    if (isEditing) {
      setEditName(selectedRow?.name);
      setEditCode(selectedRow?.code?.toString());
    } else {
      setEditName('');
      setEditCode('');
    }
  }, [isEditing, selectedRow]);

  elementChangeKeyListener(isEditing);

  useEffect(() => {
    let datatypeInput: string;
    if (selectedRow?.operation_type === OperationType.Create) {
      datatypeInput = 'input-edit-payment-code';
    } else {
      datatypeInput = 'input-edit-payment';
    }

    if (paymentMachineState?.is_err_code !== null && errorState?.onCloseModal) {
      datatypeInput = paymentMachineState?.is_err_code ? 'input-edit-payment-code' : 'input-edit-payment';
    }
    const input = document.querySelector(`input[datatype=${datatypeInput}]`);
    setTimeout(() => {
      (input as HTMLInputElement)?.focus();
    }, 400);
  }, [selectedRow, errorState?.onCloseModal]);

  const handleRowClick = (row: any) => {
    if (onRowSelect && !isEditing) {
      onRowSelect(row);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>, isEditName: boolean) => {
    const valueInput = e.target.value;
    const handleUpdate = (field: string, value: string) => {
      const selectedRowCash = paymentMachineState.payment_Machine?.find(payment => payment?.no === selectedRow?.no);
      dispatch(
        handleClickUpdate({
          ...selectedRowCash,
          [field]: value,
          operation_type: selectedRow?.operation_type ?? OperationType.Edit,
          operation_type_before: selectedRow?.operation_type ?? OperationType.Edit,
        }),
      );
    };

    if (isEditName) {
      setEditName(valueInput);
      handleUpdate('name', valueInput);
    } else {
      if (isNullOrEmpty(valueInput) || (valueInput.length <= 2 && /^[0-9]+$/.test(valueInput))) {
        setEditCode(valueInput);
        handleUpdate('code', valueInput);
      }
    }
  };

  const handleSaveEdit = (e: any) => {
    if (
      e.relatedTarget?.attributes?.datatype?.value === 'input-edit-payment-code' ||
      e.relatedTarget?.attributes?.datatype?.value === 'input-edit-payment' ||
      errorState?.message
    ) {
      e.preventDefault();
      return;
    }
    if (onEdit && selectedRow) {
      onEdit({ ...selectedRow, name: editName.trim(), code: editCode?.trim() });
      setEditName('');
      setEditCode('');
    }
  };

  const classNameTicket = (data: any) => {
    const paymentRecordByCode = paymentMachineState?.payment_Machine?.find(item => item?.code === data?.code);
    const paymentRecordByCodeDefault = paymentMachineState?.default_payment_machine?.find(item => item?.code === data?.code);
    if (data?.operation_type === 3) {
      if (
        data?.operation_type_before === 1 ||
        (data?.operation_type_before === 2 && paymentRecordByCode?.name?.trim() !== paymentRecordByCodeDefault?.name?.trim())
      ) {
        return ' record-remove-latest';
      }
      return ' record-remove';
    }
    if (data?.operation_type === 1) {
      return ' record-new';
    }
    if (data?.operation_type === 2) {
      if (data?.operation_type_before === 1 || data?.operation_type_before === 3) {
        return ' record-new record-remove';
      }
      if (paymentRecordByCode?.name?.trim() !== paymentRecordByCodeDefault?.name?.trim()) {
        return ' record-update';
      }
    }
    return '';
  };

  return (
    <>
      <div className={`default-table-body-container`}>
        <table className={'table table-register'}>
          <thead className={'title-table-add-cash table-secondary'}>
            <tr className={'row-table'}>
              {titleTable?.map((data, index) => (
                <th key={index} scope="col" className={`title-header title-header-content`} style={{ width: `${data?.width}%` }}>
                  {data?.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="body-table-add-cash">
            {paymentMachineState?.payment_Machine?.length > 0
              ? paymentMachineState?.payment_Machine?.map((dataTable, index) => {
                  const isSelected = selectedRow?.[titleTable[0]?.keyName] === dataTable?.[titleTable[0]?.keyName];
                  return (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(dataTable)}
                      className={`row-table row-body-table${classNameTicket(dataTable)} ${isSelected ? 'row-selected' : ''}`}
                    >
                      {titleTable?.map(title => {
                        const isInputName = title?.keyName === 'name';
                        const canEditCode = isInputName ? true : dataTable?.operation_type === OperationType.Create;
                        return (
                          <td key={title.keyName} className={`row-data`} width={`${title?.width}%`}>
                            {isEditing && isSelected && title.keyName !== 'no' && canEditCode ? (
                              <input
                                type={'text'}
                                style={{
                                  width: title.keyName !== 'name' ? '185px' : '100%',
                                  height: '36px',
                                }}
                                value={isInputName ? editName : editCode}
                                onChange={(e: any) => handleEditChange(e, isInputName)}
                                onBlur={handleSaveEdit}
                                ref={inputRef}
                                maxLength={isInputName ? 50 : 2}
                                datatype={isInputName ? `input-edit-payment` : `input-edit-payment-code`}
                                className={`input-data-table-payment ${isInputName ? '' : 'input-data-table-payment-code'}`.trim()}
                                required
                              />
                            ) : (
                              <div className={`data-table ${!isInputName ? 'data-table-payment' : ''}`}>{dataTable?.[title?.keyName]}</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              : paymentMachineState.no_data_payment && <div className="no-data">{localizeString('MSG_ERR_001')}</div>}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TablePaymentMachine;
