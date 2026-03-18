import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/header/header';
import BottomDepositWithdraw from '@/modules/sc8501-deposit-withdraw/BottomDepositWithdraw';
import SearchTable from '@/modules/sc8501-deposit-withdraw/SearchTable';
import ModalCommon from '@/components/modal/modal-common';
import useGetTypeList from '@/modules/sc8501-deposit-withdraw/hook/useGetTypeList';
import TableDepositWithdraw from '@/modules/sc8501-deposit-withdraw/TableDepositWithdraw';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import { useForm } from 'react-hook-form';
import { getDepositWithdraw, depositWithdrawMaintenance } from '@/services/deposit-withdraw-service';
import { useAppDispatch } from '@/config/store';
import { localizeFormat } from '@/helpers/utils';
import {
  DEFAULT_STATUS_BUTTON,
  DEFAULT_SELECT_ITEM,
  DEFAULT_FORM_TABLE,
} from '@/modules/sc8501-deposit-withdraw/constants/tableDepositWithdraw';
import { DEFAULT_FORM_SEARCH } from '@/modules/sc8501-deposit-withdraw/constants/searchTable';
import { convertData } from '@/modules/sc8501-deposit-withdraw/utils/convertData';
import { OPERATION_TYPE_CONVERT } from '@/modules/sc8501-deposit-withdraw/constants/operationType';

const DepositWithdraw = () => {
  const inputCodeEditRef = useRef<HTMLInputElement>(null);
  const inputNameEditRef = useRef<HTMLInputElement>(null);
  const inputCodeNewRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const [statusListButton, setStatusListButton] = useState(DEFAULT_STATUS_BUTTON);
  const [lastRow, setLastRow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [listItems, setListItems] = useState({
    entities: {},
    originEntities: {},
    listRecordId: [null],
    change: false,
    listCode: [],
  });

  const [itemSelected, setItemSelected] = useState(DEFAULT_SELECT_ITEM);
  const formConfig = useForm({
    defaultValues: DEFAULT_FORM_SEARCH,
  });

  const { typeList } = useGetTypeList();

  const { getValues, reset } = formConfig;

  const tableFormConfig = useForm({
    defaultValues: DEFAULT_FORM_TABLE,
  });

  const [isModalError, setIsModalError] = useState(false);
  const [messageError, setMessageError] = useState('');
  const { reset: resetTable, setValue: setTableValue } = tableFormConfig;

  elementChangeKeyListener({ isEdit, lastRow }, 110);

  const handleAddAction = () => {
    setLastRow(true);
    setIsEdit(false);
    setStatusListButton({
      ...statusListButton,
      disableAdd: true,
      disableEdit: true,
      disableConfirm: true,
    });

    resetTable();
    const delayFocus = setTimeout(() => {
      inputCodeNewRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      inputCodeNewRef.current.focus();
    }, 100);

    return () => {
      clearTimeout(delayFocus);
    };
  };

  const handleEditAction = () => {
    setIsEdit(true);
    setLastRow(false);
    setStatusListButton({ ...statusListButton, disableEdit: true, disableAdd: true, disableConfirm: true });

    if (itemSelected.prevStatus === 'old') {
      const delayFocus = setTimeout(() => {
        inputNameEditRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        inputNameEditRef.current.focus();
      }, 100);

      return () => {
        clearTimeout(delayFocus);
      };
    } else {
      const delayFocus = setTimeout(() => {
        inputCodeEditRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        inputCodeEditRef.current.focus();
      }, 100);

      return () => {
        clearTimeout(delayFocus);
      };
    }
  };

  const handleDeleteAction = () => {
    if (itemSelected.record_id) {
      const findItem = listItems.entities[itemSelected.record_id];

      if (itemSelected.currentStatus === 'old' || itemSelected.currentStatus === 'new') {
        const updateItem = {
          ...findItem,
          currentStatus: 'delete',
        };

        setListItems({
          ...listItems,
          entities: {
            ...listItems.entities,
            [itemSelected.record_id]: updateItem,
          },
          change: true,
        });

        setItemSelected(updateItem);
        setStatusListButton((pevState) => ({
          ...pevState,
          disableEdit: true,
          disableConfirm: false,
        }));
      } else if (itemSelected.currentStatus === 'edit') {
        const updateItem = {
          ...findItem,
          currentStatus: 'delete',
          prevStatus: 'edit',
        };

        setListItems({
          ...listItems,
          entities: {
            ...listItems.entities,
            [itemSelected.record_id]: updateItem,
          },
          change: true,
        });

        setItemSelected(updateItem);
        setStatusListButton((pevState) => ({
          ...pevState,
          disableEdit: true,
          disableConfirm: false,
        }));
      } else if (itemSelected.currentStatus === 'delete') {
        const updateItem = {
          ...findItem,
          currentStatus: findItem.prevStatus,
        };

        const checkChangeDelete = listItems.listRecordId.find(
          (record_id) => listItems.entities[record_id].currentStatus === 'delete'
        );

        console.log('checkChangeDelete', checkChangeDelete)

        setListItems({
          ...listItems,
          entities: {
            ...listItems.entities,
            [itemSelected.record_id]: updateItem,
          },
          change: checkChangeDelete !== updateItem.record_id,
        });
        setItemSelected(updateItem);


        setStatusListButton((pevState) => ({
          ...pevState,
          disableEdit: false,
          disableConfirm: checkChangeDelete === updateItem.record_id,
        }));
      }
    }
  };

  // fetch data to show table
  // run the first time user accesses the screen
  const handleFetchData = () => {
    const payload = {
      type: getValues('type') ? Number(getValues('type')) : undefined,
      name: getValues('name'),
      name_type: Number(getValues('name_type')),
    };

    // call api get data
    dispatch(getDepositWithdraw(payload))
      .unwrap()
      .then((response) => {
        const data = response.data.data.items;
        const formatData = convertData(data);
        setListItems(formatData);
      });
  };

  // F8 clear screen data
  const handleClearAction = () => {
    setStatusListButton({
      disableClear: false,
      disableDelete: false,
      disableAdd: false,
      disableEdit: true,
      disableConfirm: true,
    });
    setItemSelected(DEFAULT_SELECT_ITEM);
    setListItems({ entities: {}, originEntities: {}, listRecordId: [], change: false, listCode: [] });

    // clear data form table
    resetTable();
    // reset search
    reset();
    // fetch data again
    handleFetchData();
  };

  // find item change and convert data to prepare to submit F12
  const findItemChange = () => {
    const codeCount: Record<string, number> = {};
    const duplicateMap: Map<string, any> = new Map(); // Lưu object đầy đủ

    return listItems.listRecordId.reduce(
      (
        acc: {
          deposit_withdrawals: any[];
          errorItems: any[];
          errorDuplicate: any[];
        },
        recordId
      ) => {
        const {
          currentStatus,
          prevStatus,
          deposit_withdrawal_code,
          deposit_withdrawal_name,
          deposit_withdrawal_type,
          record_id,
        } = listItems.entities[recordId];

        const isEmptyCode =
          (deposit_withdrawal_code === '' || deposit_withdrawal_name === '') &&
          currentStatus !== 'delete' &&
          prevStatus !== 'new';
        const hasValue = deposit_withdrawal_code !== '' || deposit_withdrawal_name !== '';
        const isValidStatus =
          currentStatus === 'new' || currentStatus === 'edit' || (currentStatus === 'delete' && prevStatus !== 'new');

        const itemResult = {
          deposit_withdrawal_code: deposit_withdrawal_code.toString(),
          deposit_withdrawal_name,
          deposit_withdrawal_type,
          operation_type: OPERATION_TYPE_CONVERT[currentStatus],
        };

        // Count code and mark duplicates
        if (hasValue) {
          codeCount[deposit_withdrawal_code] = (codeCount[deposit_withdrawal_code] || 0) + 1;

          if (codeCount[deposit_withdrawal_code] === 2) {
            duplicateMap.set(deposit_withdrawal_code, {
              deposit_withdrawal_code: deposit_withdrawal_code.toString(),
              deposit_withdrawal_name,
              deposit_withdrawal_type,
              currentStatus,
              prevStatus,
              record_id,
            });
          }
        }

        // Report error if code is missing
        if (isEmptyCode) {
          acc.errorItems.push({
            deposit_withdrawal_code: deposit_withdrawal_code.toString(),
            deposit_withdrawal_name,
            deposit_withdrawal_type,
            currentStatus,
            prevStatus,
            record_id,
          });
        }

        // add a result
        if (hasValue && isValidStatus && !duplicateMap.has(deposit_withdrawal_code)) {
          acc.deposit_withdrawals.push(itemResult);
        }

        // update duplicate
        acc.errorDuplicate = Array.from(duplicateMap.values());

        return acc;
      },
      {
        deposit_withdrawals: [],
        errorItems: [],
        errorDuplicate: [],
      }
    );
  };

  const handleCloseModal = () => {
    setIsModalError(false);
  };

  const handleOk = () => {
    setIsModalError(false);
    setIsEdit(true);
    setLastRow(false);
    setStatusListButton({ ...statusListButton, disableEdit: true, disableAdd: true });

    if (itemSelected.deposit_withdrawal_code === '') {
      const delayFocus = setTimeout(() => {
        inputCodeEditRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        inputCodeEditRef.current.focus();
      }, 500);

      return () => {
        clearTimeout(delayFocus);
      };
    } else if (itemSelected.deposit_withdrawal_name === '') {
      const delayFocus = setTimeout(() => {
        inputNameEditRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        inputNameEditRef.current.focus();
      }, 500);

      return () => {
        clearTimeout(delayFocus);
      };
    }
  };

  // F12 submit data change
  const handleConfirmAction = () => {
    const validateData = findItemChange();

    if (validateData.errorItems.length > 0) {
      setMessageError(
        localizeFormat('MSG_VAL_001', validateData.errorItems[0].deposit_withdrawal_code === '' ? 'コード' : '名称')
      );
      const selectITem = validateData.errorItems[0];
      setItemSelected(selectITem);

      setTableValue('code__edit', selectITem.deposit_withdrawal_code);
      setTableValue('name__edit', selectITem.deposit_withdrawal_name);
      setTableValue('type__edit', selectITem.deposit_withdrawal_type);

      setStatusListButton({ ...statusListButton, disableEdit: true, disableAdd: true });
      setIsModalError(true);
      return;
    }

    if (validateData.errorDuplicate.length > 0) {
      setMessageError(localizeFormat('MSG_VAL_048', 'コード', validateData.errorDuplicate[0].deposit_withdrawal_code));
      const selectITem = validateData.errorDuplicate[0];
      setItemSelected(selectITem);

      setTableValue('code__edit', selectITem.deposit_withdrawal_code);
      setTableValue('name__edit', selectITem.deposit_withdrawal_name);
      setTableValue('type__edit', selectITem.deposit_withdrawal_type);

      setStatusListButton({ ...statusListButton, disableEdit: true, disableAdd: true });
      setIsModalError(true);
      return;
    }

    const payload = {
      deposit_withdrawals: validateData.deposit_withdrawals,
    };

    // check empty payload to return
    if (payload.deposit_withdrawals.length === 0) return;

    dispatch(depositWithdrawMaintenance(payload))
      .unwrap()
      .then((response) => {
        setStatusListButton(DEFAULT_STATUS_BUTTON);
        if (response.data.status === 'Success') {
          handleFetchData();
        }
      })
      .catch(() => {});

    // reset data form table
    resetTable();
    // reset search
    reset();
  };

  // run the first time user accesses the screen
  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <>
      <ModalCommon
        handleClose={handleCloseModal}
        handleOK={handleOk}
        modalInfo={{
          isShow: isModalError,
          type: 0,
          message: messageError,
        }}
      />

      <Header
        isDisable={false}
        printer={{ disabled: true }}
        csv={{
          listTitleTable: [],
          disabled: true,
          csvData: [],
          fileName: '',
        }}
        title="depositWithdraw.title"
        hasESC={true}
        confirmBack={listItems.change}
      />
      <div>
        <SearchTable
          formConfig={formConfig}
          handleConfirmAction={handleFetchData}
          typeList={typeList}
          dataChange={listItems.change}
        />
        <TableDepositWithdraw
          refProps={{
            inputCodeEditRef,
            inputNameEditRef,
            inputCodeNewRef,
          }}
          stateProps={{
            listItems,
            lastRow,
            isEdit,
            itemSelected,
          }}
          setStateProps={{
            setListItems,
            setStatusListButton,
            setLastRow,
            setIsEdit,
            setItemSelected,
          }}
          tableFormConfig={tableFormConfig}
        />
        <BottomDepositWithdraw
          dataChange={listItems.change}
          disableProps={{
            disableAdd: statusListButton.disableAdd,
            disableClear: statusListButton.disableClear,
            disableDelete: statusListButton.disableDelete,
            disableConfirm: statusListButton.disableConfirm,
            disableEdit: statusListButton.disableEdit,
          }}
          actionProps={{
            clearAction: handleClearAction,
            addAction: handleAddAction,
            editAction: handleEditAction,
            deleteAction: handleDeleteAction,
            confirmAction: handleConfirmAction,
          }}
        />
      </div>
    </>
  );
};

export default DepositWithdraw;
