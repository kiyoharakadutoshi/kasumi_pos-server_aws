import InputControl from "app/components/control-form/input-control";
import Header from "app/components/header/header";
import SidebarStore from "app/components/sidebar-store-default/sidebar-store/sidebar-store";
import { AppDispatch, useAppSelector } from "app/config/store";
import { isNullOrEmpty, localizeString } from "app/helpers/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { dropdownList, userRole } from "./data-input";

import { IDropDownItem } from "@/components/dropdown/dropdown";
import ModalCommon, { IModalType } from "@/components/modal/modal-common";
import { OperationType } from "@/components/table/table-common";
import { focusFirstInput } from "@/helpers/utils-element-html";
import { setError } from "@/reducers/error";
import { UserDetail } from "@/reducers/user-login-reducer";
import { confirmUserList, getUserList } from "@/services/user-login-site";
import ActionsButtonBottom from "app/components/bottom-button/actions-button-bottom";
import ButtonPrimary from "app/components/button/button-primary/button-primary";
import SelectControl from "app/components/control-form/select-control";
import TableData, { TableColumnDef } from "app/components/table/table-data/table-data";
import { KEYDOWN } from "app/constants/constants";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { DEFAULT_VALUE, ListUserRequest, storeRes, UserSaveCondition, UserTable } from "./interface-user";
import { ModalUser } from "./modal-user/modal-user";
import './user-setting.scss';

const UserSetting = (): JSX.Element => {
  const dispatch: AppDispatch = useDispatch();
  const userDetail: UserDetail = useAppSelector(state => state.loginReducer.userLogin?.user_detail);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isShowNoData, setIsShowNoData] = useState(false);
  const [showDirtyCheck, setShowDirtyCheck] = useState(false);
  const [userIdBefore, setUserIdBefore] = useState("");
  const selectedStores =
    useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const hasStore = !isNullOrEmpty(selectedStores);

  const formConfig = useForm({
    defaultValues: DEFAULT_VALUE,
  });

  const { getValues, watch, reset, setValue } = formConfig;

  // Add function key F12
  useEffect(() => {
    const handleFuncKey = (event: KeyboardEvent) => {
      if (hasStore && event.key === KEYDOWN.F12) {
        handleSearchUser()
      }
    };

    focusInput(false)
    window.addEventListener('keydown', handleFuncKey);
    return () => {
      window.removeEventListener('keydown', handleFuncKey);
    };
  }, [selectedStores]);

  const formRef = useRef<HTMLDivElement>(null);

  // Focus first input
  const focusInput = (isExpand: boolean) => {
    if (!isExpand) {
      focusFirstInput(formRef);
    }
  };

  const handleDeleteUser = () => {
    const userInfo = getValues('userInfo');
    const selectedRow = getValues('selectedRows')?.[0];

    if (selectedRow?.original?.['user_id'] === userDetail.user_id) {
      dispatch(setError(localizeString('MSG_VAL_071')));
      return;
    }

    if (selectedRow?.original?.['role_id'] === "00" && selectedRow?.original?.['user_created'] === null) {
      dispatch(setError(localizeString('MSG_VAL_072')));
      return;
    }

    const record: UserTable = userInfo?.[selectedRow?.index];
    const operationType = record?.operation_type === OperationType.Remove ? record?.operation_type_before : OperationType.Remove;
    const deleteRecord: UserTable = {
      ...record,
      operation_type: operationType
    }
    selectedRow.original['operation_type_before'] = operationType;
    userInfo[selectedRow?.index] = deleteRecord
    setValue('userInfo', userInfo);
  }

  const handleEditUser = () => {
    const selectedRowData = getValues('selectedRows')?.[0]
    const operationTypeBefore = selectedRowData?.original?.['operation_type_before'] ?? OperationType.Edit
    if (operationTypeBefore === OperationType.Remove || selectedRowData?.original?.['operation_type'] === OperationType.Remove) {
      dispatch(setError(localizeString('MSG_VAL_010')));
      return;
    }
    if (selectedRowData.original['user_id'] !== userIdBefore) {
      setValue('edit', null);
    }
    setUserIdBefore(selectedRowData.original['user_id'])

    const editData = {
      userId: getValues('edit.userId')?.trim() || selectedRowData?.original?.['user_id'],
      userName: getValues('edit.userName')?.trim() || selectedRowData?.original?.['user_name'],
      role: getValues('edit.role') || parseInt(selectedRowData?.original?.['role_id'], 10),
      stores: getValues('edit.stores') || (selectedRowData?.original?.['stores'] as storeRes[] || [])?.map((item) => ({
        code: item.store_code,
        name: item.store_name,
        value: item.store_code
      }) as IDropDownItem),
      operation_type: operationTypeBefore,
      operation_type_before: operationTypeBefore,
      userCreated: selectedRowData?.original?.['user_created'],
    }
    setValue('edit', editData);
    setValue('editDefault', editData);
    setShowModal(true);
    setIsEditMode(true)
  }

  const handleCreateUser = () => {
    setShowModal(true);
    setIsEditMode(false);
    setValue('edit', null);
  }

  const handleConfirm = () => {
    const listUser = getValues('userInfo');
    const users: UserSaveCondition[] = [];
    for (const data of listUser) {
      if (data.operation_type === OperationType.Remove) {
        if (data.user_id === userDetail.user_id) {
          dispatch(setError(localizeString('MSG_VAL_071')));
          return;
        }

        if (data.role_id === "00" && data.user_created === null) {
          dispatch(setError(localizeString('MSG_VAL_072')));
          return;
        }
      }

      if (data.operation_type) {
        users.push({
          operation_type: data.operation_type,
          user_id: data.user_id,
          user_name: data.user_name,
          role_id: data.role_id,
          store_code: data.stores?.map((store) => store.store_code),
          password: data.password
        })
      }
    }
    dispatch(confirmUserList({ users }))
      .unwrap()
      .then(() => {
        handleSearchUser();
      })
      .catch(() => { });
  }

  const closeModal = () => {
    setShowModal(false);
    setValue('add', DEFAULT_VALUE.add);
    setValue('edit', getValues('editDefault'));
    focusFirstInput(formRef);
  };

  const confirmStatus = useMemo(() => {
    return !getValues('userInfo')?.some((item) => item?.operation_type);
  }, [watch('userInfo')]);

  const columns = React.useMemo<TableColumnDef<UserTable>[]>(
    () => [
      {
        accessorKey: 'user_id',
        header: 'userSetting.table.userId',
        size: 16,
        textAlign: 'left',
        type: 'text',
      },
      {
        accessorKey: 'user_name',
        header: 'userSetting.table.userName',
        size: 20,
        textAlign: 'left',
        type: 'text',
      },
      {
        accessorKey: 'role_id',
        header: 'userSetting.table.userRole',
        size: 16,
        textAlign: 'left',
        option(props, defaultValue) {
          const roleId = props.row.original.role_id;
          const roleName = props.row.original.role_name;

          return { value: `${roleId}：${roleName}`, defaultValue: `${defaultValue?.role_id}：${defaultValue?.role_name}` }
        },
        type: 'text',
      },
      {
        header: 'userSetting.table.store',
        size: 20,
        textAlign: 'left',
        option(props, defaultValue) {
          const storeList = props.row.original.stores;
          const value = Array.isArray(defaultValue?.stores)
            ? defaultValue?.stores
              .map(item => `${item?.store_code} : ${item?.store_name}`)
              .join(', ')
            : '';
          return {
            value: storeList
              ?.map(store => `${store?.store_code} : ${store?.store_name}`)
              .join(', '), defaultValue: value
          };
        },
        type: 'text',
      },
      {
        accessorKey: 'update_date',
        header: 'userSetting.table.updateDate',
        size: 12,
        textAlign: 'left',
        type: 'text',
      },
      {
        accessorKey: 'update_user',
        header: 'userSetting.table.updateBy',
        size: 16,
        textAlign: 'left',
        type: 'text',
      },
    ],
    []
  );

  /**
 *
 */
  const handleCheckDirtySearch = () => {
    if (confirmStatus === false) {
      setShowDirtyCheck(true);
      setValue('typeDirty', 'search');
    } else {
      setShowDirtyCheck(false);
      handleSearchUser();
    }
  };

  const handleSearchUser = () => {
    const { userId, userIdType, userName, userNameType, roleId } = getValues();

    const searchParams: Readonly<ListUserRequest> = {
      selected_stores: selectedStores,
      user_id: userId,
      user_id_filter_type: userIdType,
      user_name: userName,
      user_name_filter_type: userNameType,
      role: userDetail.role_code === '01' ? 2 : roleId
    };
    dispatch(getUserList(searchParams))
      .unwrap()
      .then((response) => {
        const data = response?.data?.data?.items;
        setValue('userInfo', data);
        setValue('defaultUserInfo', data);
        setValue('isExceedRecords', response?.data?.data?.is_exceed_records)
        setIsShowNoData(data.length === 0)
      })
      .catch(() => { });
    setValue('selectedRows', []);
    setValue('edit', null);
    setValue('add', null);
    setValue('defaultUserInfo', []);
    setValue('userInfo', []);
    setValue('typeDirty', 'search');
  }

  /**
 * Clear data when change store
 */
  const handleClearData = () => {
    reset();
  };

  return (
    <div className="menu-user-wrapper">
      <Header
        title='userSetting.label.title'
        csv={{ disabled: true, listTitleTable: [], csvData: null, fileName: null }}
        printer={{ disabled: true }}
        hasESC={true}
        confirmBack={!confirmStatus}
      />
      <SidebarStore
        selectMultiple
        onClickSearch={() => { }}
        firstSelectStore={() => { }}
        expanded={true}
        hasData={watch('userInfo')?.length > 0}
        actionConfirm={handleClearData}
        onChangeCollapseExpand={focusInput}
      />
      <FormProvider {...formConfig}>
        {showModal && (
          <ModalUser
            showModal={showModal}
            closeModal={closeModal}
            isEdit={isEditMode}
          />
        )}
        <main className="user-setting">
          <section className="user-setting__search">
            <div className="user-setting__search-group" ref={formRef}>
              <InputControl
                name="userId"
                labelText={'userSetting.label.userId'}
                widthInput={'100%'}
                heightInput={'50px'}
                maxLength={32}
                type="text"
                disabled={!hasStore}
                autoFocus={true}
                hasComma={true}
              />
              <SelectControl
                name="userIdType"
                items={dropdownList}
                onChange={(e) => e.value}
                disabled={!hasStore}
                isHiddenCode={true}
              />
            </div>
            <div className="user-setting__search-group">
              <InputControl
                name="userName"
                labelText={'userSetting.label.userName'}
                widthInput={'100%'}
                heightInput={'50px'}
                maxLength={16}
                type="text"
                disabled={!hasStore}
              />
              <SelectControl
                name="userNameType"
                items={dropdownList}
                isHiddenCode={true}
                onChange={(e) => e.value}
                disabled={!hasStore}
              />
            </div>
            <div className="user-setting__search-group">
              <SelectControl
                label={'userSetting.label.userRole'}
                name="roleId"
                items={userRole}
                onChange={(e) => e.value}
                disabled={!hasStore}
                hasBlankItem={true}
              />
              <ButtonPrimary
                onClick={() => handleCheckDirtySearch()}
                className="search-button"
                text="action.f12Search"
                disabled={!hasStore}
              />
            </div>
          </section>
          <TableData<UserTable>
            columns={columns}
            data={watch('userInfo')}
            onDoubleClick={() => handleEditUser()}
            showNoData={isShowNoData}
            isExceedRecords={watch('isExceedRecords')}
            defaultData={watch('defaultUserInfo')}
          />
        </main>
        <ActionsButtonBottom
          deleteAction={handleDeleteUser}
          disableDelete={isNullOrEmpty(watch('selectedRows')?.[0])}
          disableEdit={isNullOrEmpty(watch('selectedRows')?.[0])}
          editAction={handleEditUser}
          addAction={handleCreateUser}
          disableAdd={!hasStore}
          confirmAction={handleConfirm}
          disableConfirm={confirmStatus}
        />
        <ModalCommon
          modalInfo={{
            type: IModalType.confirm,
            isShow: showDirtyCheck,
            message: localizeString('MSG_CONFIRM_002'),
          }}
          handleOK={() => {
            switch (getValues('typeDirty')) {
              case 'changeStore':
                handleClearData();
                break;
              case 'search':
                handleSearchUser();
                break;
              default:
                break;
            }

            setShowDirtyCheck(false);
          }}
          handleClose={() => {
            setShowDirtyCheck(false);
          }}
        />
      </FormProvider>
    </div>
  )
}

export default UserSetting;
