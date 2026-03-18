import React, { useEffect, useRef, useState } from 'react';
import { toNumber } from 'lodash';
import { useDispatch } from 'react-redux';
import { translate, Translate } from 'react-jhipster';

// Redux
import { AppDispatch, useAppSelector } from '@/config/store';
import { ErrorState, setError } from '@/reducers/error';
import {
  clearDataPaymentMachine,
  IPaymentMachineState,
  PaymentMachineSlice,
  setErrCode,
} from '@/reducers/payment-machine-reducer';
import { settingMasterSlice } from '@/reducers/setting-master-reducer';

// Components
import { ActionType } from '../enum-setting';
import { IPaymentMachine } from '@/modules/setting-master/add-cash-register-type/add-cash-register-type-interface';
import AddTablePaymentMachine from '@/modules/setting-master/add-cash-register-type/add-data-table-cash-register';

import Header from '@/components/header/header';
import InputTextCustom from '@/components/input-text-custom/input-text-custom';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import { OperationType } from '@/components/table/table-common';
import ButtonBottomCommon from '@/components/bottom-button/button-bottom-common';

// API
import { getPaymentMachineType, postPaymentMachine } from '@/services/payment-machine-service';

// Helpers
import { isEqual, isNullOrEmpty, localizeFormat, localizeString } from '@/helpers/utils';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './add-cash-register-type.scss';
import '../../../components/button/button.scss';

/**
 * SC7102 - Payment Machines component
 * This component is used to manage payment machines in the setting master section.
 * It allows users to create, update, delete, and search for payment machines.
 * @returns PaymentMachines component
 */
export const PaymentMachines = () => {
  const dispatch: AppDispatch = useDispatch();
  const searchNameRef = useRef<HTMLInputElement>(null);
  const paymentMachineState: IPaymentMachineState = useAppSelector((state) => state.paymentMachineReducer);
  const [searchName, setSearchName] = useState(null);
  const [selectPaymentMachine, setSelectPaymentMachine] = useState<IPaymentMachine>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [itemErrValid, setItemErrValid] = useState<IPaymentMachine>();
  const errorState: ErrorState = useAppSelector((state) => state.error);
  const cashRegisterTypeChange = paymentMachineState.payment_Machine?.filter((cashItem) => {
    if (!cashItem?.operation_type) return false;
    switch (cashItem?.operation_type) {
      case OperationType.New:
        return !isNullOrEmpty(cashItem?.code) || !isNullOrEmpty(cashItem.name?.trim());
      case OperationType.Edit: {
        const cashItemDefault = paymentMachineState?.default_payment_machine?.find(
          (item) => item?.code === cashItem?.code
        );
        return cashItemDefault?.name?.trim() !== cashItem?.name?.trim();
      }
      default:
        return true;
    }
  });

  const handleEndEdit = (row: any) => {
    setSelectPaymentMachine(row);
    setIsEditing(false);
  };

  useEffect(() => {
    const searchParams: Readonly<{
      type_name: string;
    }> = {
      type_name: searchName,
    };
    dispatch(getPaymentMachineType(searchParams));
    // Display screen to focus search name input text
    searchNameRef?.current?.focus();
    return () => {
      dispatch(clearDataPaymentMachine());
    };
  }, []);

  const handleAction = (action: ActionType) => {
    dispatch(setErrCode(null));
    switch (action) {
      case ActionType.Delete:
        handleDelete();
        break;
      case ActionType.Update:
        handleUpdate();
        break;
      case ActionType.Create:
        handleCreate();
        break;
      case ActionType.Decide:
        handleConfirm();
        break;
      default:
        break;
    }
  };

  let highestCode = 0;

  const handleCreate = () => {
    if (paymentMachineState?.payment_Machine.length > 0) {
      highestCode = Math.max(
        highestCode,
        ...paymentMachineState.payment_Machine.map((machine) => toNumber(machine?.no))
      );
    }
    const newCode = highestCode + 1;

    const newPaymentMachine: IPaymentMachine = {
      record_id: '',
      code: null,
      name: '',
      no: newCode,
      operation_type: OperationType.New,
      operation_type_before: OperationType.New,
    };

    if (!isEditing) {
      newPaymentMachine.name = '';
      dispatch(PaymentMachineSlice.actions.handleClickCreate(newPaymentMachine));
      setSelectPaymentMachine(newPaymentMachine);
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    const deletePaymentMachine: IPaymentMachine = {
      ...selectPaymentMachine,
      operation_type:
        selectPaymentMachine?.operation_type === OperationType.Remove
          ? selectPaymentMachine?.operation_type_before
          : OperationType.Remove,
    };
    setIsEditing(false);
    setSelectPaymentMachine(deletePaymentMachine);
    dispatch(PaymentMachineSlice.actions.handleClickDelete(selectPaymentMachine));
  };

  const handleUpdate = () => {
    if (selectPaymentMachine.operation_type !== OperationType.Remove) {
      setSelectPaymentMachine({
        ...selectPaymentMachine,
        operation_type: selectPaymentMachine?.operation_type ?? OperationType.Edit,
      });

      if (!isEditing) {
        setIsEditing(true);
      }
    }
  };

  useEffect(() => {
    if (errorState.onCloseModal && itemErrValid) {
      setSelectPaymentMachine(itemErrValid);
      setIsEditing(true);
      setItemErrValid(null);
    }
  }, [errorState.onCloseModal]);

  const handleConfirm = () => {
    let existPayment: IPaymentMachine = null;
    let isErrCodeVal = null;
    const cashRegisterChange = cashRegisterTypeChange?.filter((paymentMachine) => {
      const isDeleteWithId = paymentMachine.operation_type === OperationType.Remove && !paymentMachine?.record_id;
      return !isDeleteWithId;
    });
    const cashRegisterChangeAfter = [];
    const fieldsToCheck = ['code', 'name'];

    for (let i = 0; i < cashRegisterChange?.length; i++) {
      let item = cashRegisterChange[i];
      if (item?.operation_type !== OperationType.Remove) {
        const errorMessages = {
          code: localizeFormat('MSG_VAL_001', 'コード'),
          name: localizeFormat('MSG_VAL_001', 'レジ種別'),
        };
        for (const field of fieldsToCheck) {
          if (isNullOrEmpty(item?.[field])) {
            dispatch(setError(errorMessages[field]));
            isErrCodeVal = field === 'code';
            dispatch(setErrCode(isErrCodeVal));
            setItemErrValid(item);
            return;
          }
        }
      }

      if (existPayment) continue;
      for (let index = 0; index < paymentMachineState?.payment_Machine?.length; index++) {
        const itemPayment = paymentMachineState.payment_Machine[index];
        if (itemPayment?.operation_type === OperationType.Remove) continue;
        if (item?.operation_type === OperationType.Remove) break;
        if (itemPayment?.no !== item?.no) {
          const isSameCode = isEqual(itemPayment?.code, item?.code) && item?.operation_type === OperationType.New;
          const isSameName = itemPayment?.name === item?.name;

          if (isSameCode || isSameName) {
            isErrCodeVal = isSameCode;
            existPayment = item;
            break;
          }
        }
      }

      if (isNullOrEmpty(item?.name) && item?.operation_type === OperationType.Remove) {
        item = {
          ...item,
          name: paymentMachineState.default_payment_machine[i]?.name,
          code: paymentMachineState.default_payment_machine[i]?.code,
        };
      }
      cashRegisterChangeAfter.push(item);
    }

    if (existPayment) {
      const errorParam = isErrCodeVal ? 'コード' : translate('addPaymentMachine.cashRegisterType');
      const errorValue = isErrCodeVal ? existPayment?.code : existPayment?.name;
      dispatch(setError(localizeFormat('MSG_VAL_048', errorParam, errorValue)));
      dispatch(setErrCode(isErrCodeVal));

      setItemErrValid(existPayment);
      return;
    }

    dispatch(postPaymentMachine({ cash_register_types: cashRegisterChangeAfter }))
      .unwrap()
      .then(() => {
        setSelectPaymentMachine(null);
        handleClickSearch();
        dispatch(settingMasterSlice.actions.setReloadCashRegisterType(true));
      })
      .then(() => {
        // Reset mode edit (enable bottom button after submit)
        setIsEditing(false);
      })
      .catch((error) => {
        const listError = Object.values(error.response.data.errors);
        dispatch(setError(localizeString(listError[0] as string)));
      });
  };

  const handleClickSearch = () => {
    setSelectPaymentMachine(null);
    const searchParams: Readonly<{
      type_name: string;
    }> = {
      type_name: searchName,
    };
    dispatch(getPaymentMachineType(searchParams));
  };

  return (
    <div>
      <Header
        hasESC={true}
        isHiddenCSV={true}
        isHiddenPrinter={true}
        title="settingMaster.cashRegisterTitle"
        confirmBack={cashRegisterTypeChange?.length > 0}
      />
      <div className="payment-machine-screen">
        <div className="left-panel-machine">
          <div className="on-left-panel-machine">
            <div className="left-top-machine">
              <div>
                <div className="title-search-machine">
                  <Translate contentKey="addPaymentMachine.searchCriteria" />
                </div>
                <div className="horizontal-line-machine" />
                <div className="title-cash-register">
                  <Translate contentKey="addPaymentMachine.cashRegisterType" />
                </div>
                <div
                  className="item-machine"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
                >
                  <div className="input-text" style={{ marginBottom: '15px' }}>
                    <InputTextCustom
                      value={searchName}
                      onChange={(e: any) => setSearchName(e.target?.value)}
                      inputRef={searchNameRef}
                    />
                  </div>
                  <div className="button-normal">
                    <FuncKeyDirtyCheckButton
                      text="action.f04Clear"
                      onClickAction={() => setSearchName('')}
                      funcKey="F4"
                      dirtyCheck={false}
                    />
                    <FuncKeyDirtyCheckButton
                      text={'action.f12Search'}
                      onClickAction={handleClickSearch}
                      funcKey="F12"
                      dirtyCheck={cashRegisterTypeChange?.length > 0}
                      okDirtyCheckAction={handleClickSearch}
                      funcKeyListener={searchName}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="right-panel-machine">
          <div className="right-top-machine">
            <AddTablePaymentMachine
              selectedRow={selectPaymentMachine}
              handleSelectRow={setSelectPaymentMachine}
              isEditing={isEditing}
              onEdit={handleEndEdit}
            />
          </div>
        </div>
      </div>
      <div className="button-normal-content">
        <ButtonBottomCommon
          deleteAction={() => handleAction(ActionType.Delete)}
          editAction={() => handleAction(ActionType.Update)}
          confirmAction={() => handleAction(ActionType.Decide)}
          addAction={() => handleAction(ActionType.Create)}
          disableDelete={
            (!selectPaymentMachine && paymentMachineState?.payment_Machine?.length === 0) ||
            (!selectPaymentMachine && paymentMachineState?.payment_Machine?.length !== 0) ||
            isEditing
          }
          disableEdit={
            (!selectPaymentMachine && paymentMachineState?.payment_Machine?.length === 0) ||
            (!selectPaymentMachine && paymentMachineState?.payment_Machine?.length !== 0) ||
            selectPaymentMachine?.operation_type === OperationType.Remove ||
            isEditing
          }
          disableAdd={isEditing}
          disableConfirm={cashRegisterTypeChange?.length === 0}
          stateChange={{ selected_payment: selectPaymentMachine, data_table: paymentMachineState?.payment_Machine }}
        />
      </div>
    </div>
  );
};

export default PaymentMachines;
