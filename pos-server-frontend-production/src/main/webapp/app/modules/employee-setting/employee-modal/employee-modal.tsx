import React, { useEffect, useMemo, useState } from 'react';
import { translate } from 'react-jhipster';
import { useDispatch } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import { isNull } from 'lodash';

// Redux
import { AppDispatch, useAppSelector } from '@/config/store';
import { IStoreInfo } from '@/reducers/store-reducer';

// Component
import ModalCommon, { IModalInfo } from '@/components/modal/modal-common';
import { setError } from '@/reducers/error';
import DefaultModal from '@/components/modal/default-modal/default-modal';
import { ModalMode } from '@/components/modal/default-modal/default-enum';
import InputControl from '@/components/control-form/input-control';
import SelectControl from '@/components/control-form/select-control';
import { EmployeeRecord } from '../employee-setting';
import { IDropDownItem } from '@/components/dropdown/dropdown';

// API
import { checkDuplicatesEmployee } from '@/services/employee-setting-service';
import { isEqual, isNullOrEmpty, localizeFormat } from 'app/helpers/utils';

interface DefaultModalProps {
  isEdit?: boolean;
  closeModal?: () => void;
  showModal?: boolean;
  selectedRow?: EmployeeRecord;
}

/**
 *
 * @param param0
 * @returns
 */
const EmployeeModal: React.FC<DefaultModalProps> = ({
  closeModal,
  isEdit,
  selectedRow,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [modalInfo, setModalInfo] = useState<IModalInfo>({ isShow: false });
  const selectedStores = useAppSelector(
    (state) => state.storeReducer.selectedStores
  );
  const stores: IStoreInfo[] = useAppSelector(
    (state) => state.storeReducer.stores
  )?.filter((item: IStoreInfo) => selectedStores.includes(item.store_code));
  const { getValues, setValue, watch } = useFormContext();
  const dataEditDefault = getValues('editDefault');

  const disableUpdate = useMemo(() => {
    const item = getValues('edit');
    return (
      isEdit &&
      isEqual(item?.employeeName, dataEditDefault?.employeeName) &&
      isEqual(item?.description, dataEditDefault?.description)
    );
  }, [watch('edit.employeeName'), watch('edit.description')]);

  /**
   *
   */
  const actionConfirm = () => {
    isEdit ? handleUpdateEmployee() : handleCreateEmployee();
  };

  const handleUpdateEmployee = () => {
    const { edit } = getValues();

    if (isNullOrEmpty(edit?.employeeName)) {
      dispatch(setError(localizeFormat('MSG_VAL_001', '従業員名')));
      return;
    }

    setValue('edit', {
      store: '',
      employeeCode: edit.employeeCode,
      employeeName: edit.employeeName,
      description: edit.description,
    });

    const dataTemp = getValues('recordSelected').map((item: EmployeeRecord) => {
      if (item.employeeCode === selectedRow.employeeCode && item.store.storeCode === selectedRow?.store?.storeCode) {
        if (item.isCreate) {
          return {
            ...item,
            isUpdate: false,
            employeeCode: edit.employeeCode,
            employeeName: edit.employeeName,
            description: edit.description,
            dataUpdate: null,
          };
        } else {
          const isUpdate =
            edit.employeeName !== item.employeeName ||
            edit.description !== item.description;

          return {
            ...item,
            isUpdate,
            dataUpdate: {
              employeeCode: isUpdate && edit.employeeCode,
              employeeName: isUpdate && edit.employeeName,
              description: isUpdate && edit.description,
            },
          };
        }
      }
      return item;
    });

    setValue('recordSelected', dataTemp);
    closeModal();
  };

  const checkExistEmployCode = (employeeCode: string, storeCode: string) => {
    const listRecord = getValues('recordSelected') as EmployeeRecord[];
    const checkRecord = listRecord?.find(
      (item) => item?.employeeCode === employeeCode && item.store?.storeCode === storeCode
    );

    return (
      checkRecord?.store.storeCode === storeCode &&
      checkRecord?.employeeCode === employeeCode
    );
  };

  const handleCreateEmployee = () => {
    const { add, recordSelected: listRecord } = getValues();

    const selectedStore = add.store;

    if (isNullOrEmpty(add?.employeeCode)) {
      dispatch(setError(localizeFormat('MSG_VAL_001', '従業員コード')));
      return;
    }

    if (isNullOrEmpty(add?.employeeName)) {
      dispatch(setError(localizeFormat('MSG_VAL_001', '従業員名')));
      return;
    }

    if (checkExistEmployCode(add?.employeeCode, selectedStore)) {
      dispatch(setError('重複するデータが存在するため登録できません。'));
      return;
    }

    const checkDuplicates = {
      selected_store: selectedStore,
      employee_code: add.employeeCode,
    };

    dispatch(checkDuplicatesEmployee(checkDuplicates))
      .unwrap()
      .then((response) => {
        if (response.data?.data?.count === 0) {
          const storeNameTemp = LIST_STORE.find(
            (item) => item.value === selectedStore
          )?.name;

          const newRecord = {
            recordId: null,
            store: {
              storeCode: selectedStore,
              storeName: storeNameTemp,
            },
            employeeCode: add.employeeCode,
            employeeName: add.employeeName,
            description: add.description,
            isPrintBarcode: false,
            isCreate: true,
            isDelete: false,
            isUpdate: false,
            dataUpdate: null,
          };
          setValue(
            'recordSelected',
            isNull(listRecord) ? [newRecord] : [newRecord, ...listRecord]
          );
          closeModal();
        } else {
          dispatch(setError('重複するデータが存在するため登録できません。'));
        }
      })
      .catch((_) => {});
  };

  const LIST_STORE: IDropDownItem[] = useMemo(() => {
    return stores.map((store, index) => ({
      name: store.store_name,
      value: store.store_code,
      code: store.store_code,
    }));
  }, [stores]);

  const modeStatus = useMemo(() => {
    return isEdit ? 'edit' : 'add';
  }, [isEdit]);

  useEffect(() => {
    setValue('add.store', LIST_STORE[0].value);
  }, []);

  return (
    <DefaultModal
      disableConfirm={disableUpdate}
      headerType={isEdit ? ModalMode.Edit : ModalMode.Add}
      titleModal={`employeeSettingDefaultModal.title.${isEdit ? 'editMode' : 'createMode'}`}
      cancelAction={closeModal}
      confirmAction={actionConfirm}
    >
      <ModalCommon modalInfo={modalInfo} />

      <SelectControl
        label="label.store"
        name={`${modeStatus}.store`}
        items={LIST_STORE || []}
        onChange={(e) => e.value}
        value={getValues(`${modeStatus}.store`)}
        disabled={isEdit}
        isRequired
      />

      <InputControl
        name={`${modeStatus}.employeeCode`}
        className="input-condition-keyword"
        labelText={translate('label.employeeCode')}
        widthInput={'100%'}
        heightInput={'50px'}
        maxLength={7}
        disabled={isEdit}
        initValue={isEdit ? getValues('edit.employeeCode') : ''}
        isRequire={true}
        hasAutoFill={true}
        type="number"
      />

      <InputControl
        name={`${modeStatus}.employeeName`}
        className="input-condition-keyword"
        labelText={translate('label.employeeName')}
        widthInput={'100%'}
        heightInput={'50px'}
        maxLength={50}
        initValue={isEdit ? getValues('edit.employeeName') : ''}
        isRequire={true}
        onBlur={event => setValue(`${modeStatus}.employeeName`, event.target.value.trim())}
      />

      <InputControl
        name={`${modeStatus}.description`}
        className="input-condition-keyword"
        labelText={translate('label.employeeDescription')}
        widthInput={'100%'}
        heightInput={'50px'}
        maxLength={50}
      />
    </DefaultModal>
  );
};

export default EmployeeModal;
