import TooltipInputTextControl from '@/components/input-text/input-text-control';
import { SERVER_DATE_FORMAT_COMPACT } from '@/constants/date-constants';
import { toDateString } from '@/helpers/date-utils';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import { UserDetail } from '@/reducers/user-login-reducer';
import { checkExistUserLoginSite } from '@/services/user-login-site';
import SelectControl from 'app/components/control-form/select-control';
import { IDropDownItem } from 'app/components/dropdown/dropdown';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { OperationType } from 'app/components/table/table-common';
import { AppDispatch, useAppSelector } from 'app/config/store';
import { MAX_LENGTH_PASSWORD, MIN_LENGTH_PASSWORD, USER_ID_REGEX } from 'app/constants/constants';
import { arraysEqual, isEqual, isNullOrEmpty, localizeFormat } from 'app/helpers/utils';
import { setErrorValidate } from 'app/reducers/error';
import { IStoreInfo } from 'app/reducers/store-reducer';
import _, { isNull } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { userRole } from '../data-input';
import { DEFAULT_VALUE, UserTable } from '../interface-user';

interface DefaultModalProps {
  isEdit?: boolean;
  closeModal?: () => void;
  showModal?: boolean;
}

export const ModalUser: React.FC<DefaultModalProps> = ({
  closeModal,
  isEdit,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [valueRole, setValueRole] = useState(0);
  const stores: IStoreInfo[] = useAppSelector(state => state.storeReducer.stores);
  const userDetail: UserDetail = useAppSelector(state => state.loginReducer.userLogin?.user_detail);
  const form = useFormContext();
  const { getValues, setValue, watch } = useFormContext();
  const dataEditDefault = getValues('editDefault');
  elementChangeKeyListener(valueRole)

  const LIST_STORE: IDropDownItem[] = useMemo(() => {
    return stores.map((store) => ({
      name: store.store_name,
      value: store.store_code,
      code: store.store_code,
    }));
  }, [stores]);

  const modeStatus = useMemo(() => {
    form.clearErrors();
    return isEdit ? 'edit' : 'add';
  }, [isEdit]);

  useEffect(() => {
    setValue('add', DEFAULT_VALUE.add);
    setValueRole(Number(getValues(`${modeStatus}.role`)));
  }, []);

  const actionConfirm = () => {
    form.clearErrors();
    isEdit ? handleUpdateUser() : handleCreateUser();
  };

  const disableUpdate = useMemo(() => {
    const item = getValues('edit');
    return (
      isEdit &&
      isEqual(item?.userId, dataEditDefault?.userId) &&
      isEqual(item?.userName, dataEditDefault?.userName) &&
      isEqual(item?.role, dataEditDefault?.role) &&
      isEqual(item?.password, dataEditDefault?.password) &&
      isEqual(item?.storeCode, dataEditDefault?.storeCode)
    );
  }, [watch('edit.userId'), watch('edit.userName'), watch('edit.role'), watch('edit.password'), watch('edit.storeCode')]);

  const handleUpdateUser = async () => {
    let isError = false;
    const { edit, userInfo: listUser } = getValues();
    const userId = edit?.userId.trim();
    const userName = edit?.userName.trim();
    const selectedRole = edit.role;
    if (isNullOrEmpty(userId)) {
      form.setError(`${modeStatus}.userId`, { message: localizeFormat('MSG_VAL_001', 'modalUser.label.userId') });
      isError = true;
    }

    if (isNullOrEmpty(userName)) {
      form.setError(`${modeStatus}.userName`, { message: localizeFormat('MSG_VAL_001', 'modalUser.label.userName') });
      isError = true;
    }

    if (selectedRole === 2 && isNullOrEmpty(edit?.storeCode)) {
      form.setError(`${modeStatus}.storeCode`, { message: localizeFormat('MSG_VAL_001', 'modalUser.label.store') });
      isError = true;
    }

    if (!isNullOrEmpty(edit?.password) && (edit?.password.length < MIN_LENGTH_PASSWORD || edit?.password.length > MAX_LENGTH_PASSWORD)) {
      form.setError(`${modeStatus}.password`, { message: localizeFormat('MSG_VAL_056', 'modalUser.label.password', String(MIN_LENGTH_PASSWORD), String(MAX_LENGTH_PASSWORD)) });
      isError = true;
    }

    if (!isNullOrEmpty(edit?.confirmPassword) && (edit?.confirmPassword.length < MIN_LENGTH_PASSWORD || edit?.confirmPassword.length > MAX_LENGTH_PASSWORD)) {
      form.setError(`${modeStatus}.confirmPassword`, { message: localizeFormat('MSG_VAL_056', 'modalUser.label.confirmPassword', String(MIN_LENGTH_PASSWORD), String(MAX_LENGTH_PASSWORD)) });
      isError = true;
    }

    if (!isNullOrEmpty(edit?.password) && isNullOrEmpty(edit?.confirmPassword)) {
      form.setError(`${modeStatus}.confirmPassword`, { message: localizeFormat('MSG_VAL_001', 'modalUser.label.confirmPassword') });
      isError = true;
    }

    if (!isNullOrEmpty(edit?.password) && !isNullOrEmpty(edit?.confirmPassword) && edit?.password !== edit?.confirmPassword) {
      form.setError(`${modeStatus}.confirmPassword`, { message: localizeFormat('MSG_VAL_057', 'modalUser.label.password', 'modalUser.label.confirmPassword') });
      isError = true;
    }

    if (isError) {
      return;
    }

    if (edit.operation_type === OperationType.New && (userId !== getValues('editDefault.userId'))) {
      if (checkExistUser(userId)) {
        form.setError(`${modeStatus}.userId`, { message: localizeFormat('MSG_ERR_003') });
        return
      }
      const checkExist = await dispatch(checkExistUserLoginSite({ user_id: userId }))
        .unwrap()
        .then((response) => {
          if (response?.data?.data?.is_existed === true) {
            dispatch(setErrorValidate({ param: 'userId', message: localizeFormat('MSG_ERR_003') }));
            return true;
          }
          return false;
        })
        .catch(() => { return false });

      if (checkExist) {
        return;
      }
    }

    const selectedStore = LIST_STORE?.find(item => item.value === getValues(`${modeStatus}.storeCode`));

    const selectedRoleDetails = userRole.find(
      (item) => item.value === selectedRole
    );

    const selectedRow = getValues('selectedRows')?.[0];
    const record: UserTable = listUser?.[selectedRow?.index];
    const userDefault: UserTable = getValues('defaultUserInfo')?.[selectedRow?.index]

    const isNoChange = isEdit &&
      isEqual(userDefault?.user_id, userId) &&
      isEqual(userDefault?.user_name, userName) &&
      isEqual(parseInt(userDefault?.role_id, 10), edit?.role) &&
      isNullOrEmpty(edit?.password) &&
      isEqual(userDefault?.store_code, selectedStore.value);
    listUser[selectedRow?.index] = {
      ...record,
      user_id: userId,
      user_name: userName,
      role_id: selectedRoleDetails.code || '',
      role_name: selectedRoleDetails.name || '',
      store_code: selectedStore?.code,
      store_name: selectedStore?.name,
      password: isNullOrEmpty(edit.password) ? getValues('selectedRows')?.[0]?.original['password'] : edit.password,
      confirm_password: isNullOrEmpty(edit.confirmPassword)
        ? getValues('selectedRows')?.[0]?.original['confirm_password']
        : edit.confirmPassword,
      ...(isNoChange
        ? {
          update_date: userDefault.update_date,
          update_user: userDefault.update_user,
        }
        : {
          update_date: toDateString(new Date(), SERVER_DATE_FORMAT_COMPACT),
          update_user: userDetail.user_name,
        }),
        ...((isNoChange && edit.operation_type !== OperationType.New)
        ? {
          operation_type: null,
          operation_type_before: null,
        }
        : {
          operation_type: edit?.operation_type ?? OperationType.Edit,
          operation_type_before: edit?.operation_type ?? OperationType.Edit,
        })
    };

    // Reset selected row when edit success
    setValue('selectedRows', []);

    // Delay to avoid deleting row select causing UI lag
    setTimeout(() => {
      setValue('userInfo', listUser);
      setValue('editDefault', getValues('edit'));
      closeModal();
    }, 50);
  }

  const handleCreateUser = async () => {
    let isError = false;
    const { add, userInfo: listUser } = getValues();
    const userId = add?.userId?.trim();
    const userName = add?.userName?.trim();
    const selectedRole = add.role;
    if (isNullOrEmpty(userId)) {
      form.setError(`${modeStatus}.userId`, { message: localizeFormat('MSG_VAL_001', 'modalUser.label.userId') });
      isError = true;
    }

    if (isNullOrEmpty(userName)) {
      form.setError(`${modeStatus}.userName`, { message: localizeFormat('MSG_VAL_001', 'modalUser.label.userName') });
      isError = true;
    }

    if (selectedRole === 2 && isNullOrEmpty(add?.storeCode)) {
      form.setError(`${modeStatus}.storeCode`, { message: localizeFormat('MSG_VAL_001', 'modalUser.label.store') });
      isError = true;
    }

    if (isNullOrEmpty(add?.password)) {
      form.setError(`${modeStatus}.password`, { message: localizeFormat('MSG_VAL_001', 'modalUser.label.password') });
      isError = true;
    } else if (add?.password.length < MIN_LENGTH_PASSWORD || add?.password.length > MAX_LENGTH_PASSWORD) {
      form.setError(`${modeStatus}.password`, { message: localizeFormat('MSG_VAL_056', 'modalUser.label.password', String(MIN_LENGTH_PASSWORD), String(MAX_LENGTH_PASSWORD)) });
      isError = true;
    }

    if (isNullOrEmpty(add?.confirmPassword)) {
      form.setError(`${modeStatus}.confirmPassword`, { message: localizeFormat('MSG_VAL_001', 'modalUser.label.confirmPassword') });
      isError = true;
    } else if (add?.confirmPassword.length < MIN_LENGTH_PASSWORD || add?.confirmPassword.length > MAX_LENGTH_PASSWORD) {
      form.setError(`${modeStatus}.confirmPassword`, { message: localizeFormat('MSG_VAL_056', 'modalUser.label.confirmPassword', String(MIN_LENGTH_PASSWORD), String(MAX_LENGTH_PASSWORD)) });
      isError = true;
    }

    if (add?.password !== add?.confirmPassword) {
      form.setError(`${modeStatus}.confirmPassword`, { message: localizeFormat('MSG_VAL_057', 'modalUser.label.password', 'modalUser.label.confirmPassword') });
      isError = true;
    }

    if (isError) {
      return;
    }

    if (checkExistUser(userId)) {
      form.setError(`${modeStatus}.userId`, { message: localizeFormat('MSG_ERR_003') });
      return;
    }

    const checkExist = await dispatch(checkExistUserLoginSite({ user_id: userId }))
      .unwrap()
      .then((response) => {
        if (response?.data?.data?.is_existed === true) {
          dispatch(setErrorValidate({ param: 'userId', message: localizeFormat('MSG_ERR_003') }));
          return true;
        }
        return false;
      })
      .catch(() => { return false });

    if (checkExist) {
      return;
    }

    const selectedStore = LIST_STORE?.find(item => item.value === getValues(`${modeStatus}.storeCode`));

    const selectedRoleDetails = userRole.find(
      (item) => item.value === selectedRole
    ) ?? userRole?.[0];

    const newRecord: UserTable = {
      user_id: userId,
      user_name: userName,
      role_id: selectedRoleDetails?.code || '',
      role_name: selectedRoleDetails?.name || '',
      store_code: _.toString(selectedStore?.code),
      store_name: selectedStore?.name,
      operation_type: OperationType.New,
      operation_type_before: OperationType.New,
      password: add.password,
      confirm_password: add.confirmPassword
    };

    setValue('userInfo', isNull(listUser) ? [newRecord] : [newRecord, ...listUser])
    closeModal();
  }

  const checkExistUser = (userId: string) => {
    const listUser = getValues('userInfo') as UserTable[];
    const checkRecord = listUser?.some((item) => item?.user_id === userId);
    return checkRecord || false;
  };

  return (
    <DefaultModal
      headerType={isEdit ? ModalMode.Edit : ModalMode.Add}
      titleModal={`modalUser.title.${isEdit ? 'editMode' : 'createMode'}`}
      cancelAction={closeModal}
      confirmAction={actionConfirm}
      disableConfirm={disableUpdate}
    >
      <TooltipInputTextControl
        datatype="userId"
        name={`${modeStatus}.userId`}
        className="input-condition-keyword"
        title={'modalUser.label.userId'}
        width={'100%'}
        height={'50px'}
        maxLength={32}
        disabled={(getValues(`${modeStatus}.operation_type_before`) !== OperationType.New) && isEdit}
        required={true}
        type="text"
        regex={USER_ID_REGEX}
      />
      <TooltipInputTextControl
        datatype="userName"
        name={`${modeStatus}.userName`}
        className="input-condition-keyword"
        title={'modalUser.label.userName'}
        width={'100%'}
        height={'50px'}
        maxLength={16}
        required={true}
        type="text"
        checkLengthFullSize={true}
      />
      <SelectControl
        name={`${modeStatus}.role`}
        label={'modalUser.label.userRole'}
        items={userRole}
        onChange={(e) => {
          setValueRole(Number(e.value));
          if (Number(e.value) !== getValues('editDefault.role')) {
            setValue(`${modeStatus}.storeCode`, null);
          }
          return e.value
        }}
        disabled={getValues('edit.userId') === userDetail.user_id || (getValues('edit.role') === 0 && getValues('edit.userCreated') === null)}
        value={Number(getValues(`${modeStatus}.role`))}
        isRequired
      />
      <SelectControl
        label="modalUser.label.store"
        name={`${modeStatus}.storeCode`}
        items={LIST_STORE || []}
        isRequired
        hasBlankItem={true}
        disabled={valueRole === 0 || valueRole === 1}
      />

      <TooltipInputTextControl
        datatype="password"
        name={`${modeStatus}.password`}
        className="input-condition-keyword"
        title={'modalUser.label.password'}
        width={'100%'}
        height={'50px'}
        required={!isEdit}
        type="password"
        value={getValues(`${modeStatus}.password`)}
        disabled={getValues(`${modeStatus}.role`) === 0 && getValues(`${modeStatus}.userCreated`) === null}
      />
      <TooltipInputTextControl
        datatype="confirmPassword"
        name={`${modeStatus}.confirmPassword`}
        className="input-condition-keyword"
        title={'modalUser.label.confirmPassword'}
        width={'100%'}
        height={'50px'}
        required={!isEdit}
        type="password"
        value={getValues(`${modeStatus}.confirmPassword`)}
        disabled={getValues(`${modeStatus}.role`) === 0 && getValues(`${modeStatus}.userCreated`) === null}
      />
    </DefaultModal>
  )
}
