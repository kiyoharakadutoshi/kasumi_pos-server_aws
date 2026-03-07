import React, { useEffect, useRef, useState } from 'react';
import './master-stores.scss';
import Dropdown from 'app/components/dropdown/dropdown';
import Header from 'app/components/header/header';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import TableCommon, { SelectedRow } from 'app/components/table/table-common';
import BottomButton from 'app/components/bottom-button/bottom-button';
import { ActionTypeButtonMasterStores } from './enum-master-stores';
import { businessTypeValue, dropdownMasterStores } from './option-dropdown';
import { handleActionBottomButton } from './master-stores-funtion/handleActionButton';
import { handleConfirm } from './master-stores-funtion/handleConfirm';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import MasterStoresAdd from './modal/master-stores-add';
import MasterStoresEdit from './modal/master-stores-edit';
import {
  addListMasterStores,
  handleChangeCode,
  handleChangeCodeType,
  handleChangeName,
  handleChangeNameType,
  handleChangeStoreType,
  handleClearMasterStoresList,
  handleClearSaveCondition,
  handleClearSearchCondition,
  handleClearSelected,
  selectMasterStores,
} from 'app/reducers/master-stores-reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import MasterStoresCopy from './modal/master-stores-copy';
import { IMasterStores, MasterStoreSearchCondition, MasterStoreState } from './master-stores-interface';
import { getListMasterStores } from 'app/services/master-stores-service';
import { formatBusinessType } from './master-stores-funtion/formatGetList';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';
import { focusFirstInput } from 'app/helpers/utils-element-html';

const MasterStores = () => {
  const dispatch = useAppDispatch();
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);
  const selectedRow: SelectedRow = masterStoresReducer.masterStoreSelected;

  const masterStoreSearchCondition: MasterStoreSearchCondition = masterStoresReducer.masterStoreSearchCondition;

  const masterStoresList: IMasterStores[] = masterStoresReducer.masterStoresList;

  const [openModalCopy, setOpenModalCopy] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);
  // action when close modal
  const handleCancelActionModal = (action: ActionTypeButtonMasterStores) => {
    switch (action) {
      case ActionTypeButtonMasterStores.Delete:
        break;
      case ActionTypeButtonMasterStores.Update:
        setOpenModalEdit(false);
        break;
      case ActionTypeButtonMasterStores.Create:
        dispatch(handleClearSaveCondition());
        setOpenModalAdd(false);

        break;
      case ActionTypeButtonMasterStores.Copy: {
        setOpenModalCopy(false);
        break;
      }
      default:
        break;
    }
  };
  // handle Search
  const handleSearchMasterStores = () => {
    dispatch(getListMasterStores(masterStoreSearchCondition))
      .unwrap()
      .then((response) => {
        // Need concat add in here
        const dataStoreList = response.data?.data?.store_list?.map((item) => ({
          ...item,
          address: `${item?.address1 || ''}${item?.address2 || ''}${item?.address3 || ''}`,
        }));
        response.data?.data && dispatch(addListMasterStores(dataStoreList || []));
      })
      .catch(() => {});
  };

  // Focus first input
  useEffect(() => {
    setTimeout(() => {
      focusFirstInput(formRef);
    }, 100);
  }, []);

  // clear data in form add and edit
  useEffect(() => {
    dispatch(handleClearSearchCondition());
    dispatch(handleClearSaveCondition());
    dispatch(handleClearMasterStoresList());
    dispatch(handleClearSelected());
  }, []);

  useEffect(() => {
    setDisableConfirm(!(masterStoresList?.filter((item) => item.operation_type)?.length > 0));
  }, [masterStoresList]);

  return (
    <div className="master-stores-container">
      <Header
        title="masterStores.headerTitle"
        csv={{
          disabled: true,
        }}
        printer={{ disabled: true }}
        hasESC={true}
        confirmBack={!disableConfirm}
      />
      {/* Modal UI */}
      {openModalAdd && (
        <MasterStoresAdd
          setOpenModalAdd={setOpenModalAdd}
          handleCancelAction={() => {
            handleCancelActionModal(ActionTypeButtonMasterStores.Create);
          }}
        />
      )}

      {openModalEdit && (
        <MasterStoresEdit
          setOpenModalEdit={setOpenModalEdit}
          handleCancelAction={() => {
            handleCancelActionModal(ActionTypeButtonMasterStores.Update);
          }}
        />
      )}

      {openModalCopy && (
        <MasterStoresCopy
          setOpenModalCopy={setOpenModalCopy}
          handleCancelAction={() => {
            handleCancelActionModal(ActionTypeButtonMasterStores.Copy);
          }}
        />
      )}

      <div className="master-stores__condition-container">
        <div className="master-stores__condition-container--left" ref={formRef}>
          <div className="master-stores__condition-item">
            <InputTextCustom
              widthInput="280px"
              labelText="masterStores.conditionLabel.storeCode"
              type="number"
              value={masterStoreSearchCondition?.code}
              onChange={(e: any) => {
                dispatch(handleChangeCode(e.target.value));
              }}
              maxLength={5}
            />
            <Dropdown
              isHiddenCode={true}
              items={dropdownMasterStores}
              onChange={(item) => dispatch(handleChangeCodeType(item?.value as any))}
            />
          </div>
          <div className="master-stores__condition-item">
            <InputTextCustom
              widthInput="788px"
              labelText="masterStores.conditionLabel.storeName"
              maxLength={50}
              value={masterStoreSearchCondition?.name}
              onChange={(e: any) => {
                dispatch(handleChangeName(e.target.value));
              }}
              onBlur={(e) => {
                dispatch(handleChangeName(e.target.value.trim()));
              }}
            />
            <Dropdown
              isHiddenCode={true}
              items={dropdownMasterStores}
              onChange={(item) => dispatch(handleChangeNameType(item?.value as any))}
            />
          </div>
          <div className="master-stores__condition-item">
            <Dropdown
              className="dropdown-business-type"
              label="masterStores.modal.businessType"
              items={businessTypeValue}
              hasBlankItem={true}
              onChange={(item) => dispatch(handleChangeStoreType(item?.value as any))}
            />
          </div>
        </div>
        <div className="master-stores__condition-container--right">
          <FuncKeyDirtyCheckButton
            funcKey="F12"
            dirtyCheck={!disableConfirm}
            okDirtyCheckAction={handleSearchMasterStores}
            text="action.f12Search"
            onClickAction={handleSearchMasterStores}
            funcKeyListener={masterStoresReducer.masterStoreSearchCondition}
          />
        </div>
      </div>
      <div className="master-stores__message-err">
        {masterStoresList?.length > 1000 && (
          <p className="message-err-text">{localizeString('masterStores.errMessageDataLength')}</p>
        )}
      </div>
      <div className="master-stores__table-container">
        <TableCommon<any>
          totalCount={11}
          maxHeightBodyTable="620px"
          columns={[
            {
              title: 'masterStores.tableText.businessType',
              keyItem: 'business_type_code',
              alignItem: 'left',
              width: 5,
              isHiddenExtraValue: true,
              formatFunction: formatBusinessType,
            },
            {
              title: 'masterStores.tableText.storeCode',
              keyItem: 'code',
              alignItem: 'right',
              width: 10,
            },
            {
              title: 'masterStores.tableText.storeName',
              keyItem: 'name',
              alignItem: 'left',
              width: 20,
            },
            {
              title: 'masterStores.tableText.postCode',
              keyItem: 'post_code',
              alignItem: 'left',
              width: 10,
            },
            {
              title: 'masterStores.tableText.address',
              keyItem: 'address',
              alignItem: 'left',
              width: 24,
            },
            {
              title: 'masterStores.tableText.phone',
              keyItem: 'phone_number',
              alignItem: 'left',
              width: 16,
            },
            {
              title: 'masterStores.tableText.totalNumberOfPOS',
              keyItem: 'total_pos',
              alignItem: 'right',
              width: 12,
            },

            {
              title: 'masterStores.tableText.basicPoint',
              keyItem: 'default_point',
              alignItem: 'right',
              width: 12,
            },
          ]}
          formatFields={['business_type_code']}
          bodyItems={masterStoresList}
          selectedRow={selectedRow}
          onSelectRow={(row: SelectedRow) => {
            dispatch(selectMasterStores(row));
          }}
          actionDoubleClick={() => {
            handleActionBottomButton(
              ActionTypeButtonMasterStores.Update,
              setOpenModalEdit,
              masterStoresList,
              selectedRow,
              dispatch
            );
          }}
          canShowNoData={masterStoresReducer.noData}
        />
      </div>
      <div className="master-stores__bottom-container">
        <BottomButton
          deleteAction={() =>
            handleActionBottomButton(
              ActionTypeButtonMasterStores.Delete,
              null,
              masterStoresList,
              selectedRow,
              dispatch,
              masterStoreSearchCondition
            )
          }
          disableDelete={isNullOrEmpty(selectedRow)}
          copyAction={() =>
            handleActionBottomButton(
              ActionTypeButtonMasterStores.Copy,
              setOpenModalCopy,
              masterStoresList,
              selectedRow,
              dispatch
            )
          }
          disableCopy={isNullOrEmpty(selectedRow)}
          editAction={() =>
            handleActionBottomButton(
              ActionTypeButtonMasterStores.Update,
              setOpenModalEdit,
              masterStoresList,
              selectedRow,
              dispatch
            )
          }
          disableEdit={isNullOrEmpty(selectedRow)}
          addAction={() =>
            handleActionBottomButton(
              ActionTypeButtonMasterStores.Create,
              setOpenModalAdd,
              masterStoresList,
              selectedRow,
              dispatch
            )
          }
          confirmAction={() => {
            handleConfirm(masterStoresList, dispatch, masterStoreSearchCondition);
          }}
          disableConfirm={disableConfirm}
          canKeyDown={!openModalCopy && !openModalEdit}
          disableAdd={false}
          stateChange={selectedRow}
        />
      </div>
    </div>
  );
};

export default MasterStores;
