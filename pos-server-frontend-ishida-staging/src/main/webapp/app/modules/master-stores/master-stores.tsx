import React, { useEffect, useMemo, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { FormProvider, useForm } from 'react-hook-form';

// Components
import ModalTabsAdd from './modal-tabs/modal-tabs-add';
import ModalTabsEdit from './modal-tabs/modal-tabs-edit';
import { getMasters } from '@/services/master-service';
import Dropdown from '@/components/dropdown/dropdown';
import Header from '@/components/header/header';
import InputTextCustom from '@/components/input-text-custom/input-text-custom';
import { SelectedRow } from '@/components/table/table-common';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';

// Redux
import {
  addListMasterStores,
  addListMasterStoresDefault,
  getBusinessTypeName,
  handleChangeSearchConditionField,
  handleClearMasterStoresList,
  handleClearSaveCondition,
  handleClearSearchCondition,
  selectMasterStores,
} from '@/reducers/master-stores-reducer';

// FUNCTION
import { handleActionBottomButton } from './master-stores-funtion/handleActionButton';
import { handleConfirm } from './master-stores-funtion/handleConfirm';

// CONSTANT
import {
  IMasterStoreRecord,
  IPaymentMethod,
  MasterStoreExportCsvCondition,
  IMasterStoreSearchCondition,
  MasterStoreState,
  BusinessTypeName,
} from './master-stores-interface';
import { ActionTypeButtonMasterStores } from './enum-master-stores';
import { dropdownMasterStores } from './option-dropdown';

// API
import {
  getCodeMasterPayment,
  getListMasterStores,
  postExportingMasterStoreCsv,
} from '@/services/master-stores-service';

// Utils
import { LanguageOption } from '@/constants/constants';
import { focusFirstInput } from '@/helpers/utils-element-html';
import { isNullOrEmpty, localizeString } from '@/helpers/utils';

// Styles
import './master-stores.scss';

import TableData, { SELECTED_ROW_FORM_CONTROL, TableColumnDef } from '@/components/table/table-data/table-data';
import { Row } from '@tanstack/react-table';
import ButtonBottomCommon from '@/components/bottom-button/button-bottom-common';
import styled from 'styled-components';

interface FormData {
  listData: IMasterStoreRecord[];
  selectedRows: SelectedRow | null;
  totalCount: number;
}

const DEFAULT_VALUES: FormData = {
  listData: [],
  totalCount: 0,
  selectedRows: null,
};

const TableContainer = styled.div<{ isError: boolean }>`
  .table-data .table-scroll {
    height: ${({ isError }) => (isError ? 'calc(100vh - 336px)' : 'calc(100vh - 298px)')};
  }
`;

/**
 * SC8201 - Master Store
 *
 * @returns {JSX.Element} The page for master store screen
 */
const MasterStores = () => {
  const dispatch = useAppDispatch();
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);
  const selectedRow: SelectedRow = masterStoresReducer.masterStoreSelected;
  const businessTypeName: BusinessTypeName[] = masterStoresReducer.businessTypeName;
  const masterStoreSearchCondition: IMasterStoreSearchCondition = masterStoresReducer.masterStoreSearchCondition;
  const masterStoresList: IMasterStoreRecord[] = masterStoresReducer.masterStoresList;
  const masterStoreListDefault: IMasterStoreRecord[] = masterStoresReducer.masterStoreListDefault;
  const user = useAppSelector((state) => state.loginReducer.userLogin?.user_detail);
  // Define state
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(true);
  const [dirtyCheckSearch, setDirtyCheckSearch] = useState(false);
  const [paymentMethodList, setPaymentMethodList] = useState<IPaymentMethod[]>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const formConfig = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  const { setValue, watch } = formConfig;

  const formatPaymentMethod = (value: string[]) => {
    if (!isNullOrEmpty(value)) {
      return paymentMethodList
        ?.filter((item) => value?.includes(item.code_no))
        .map((item) => `${item.code_value}`)
        .join('、');
    }
    return '';
  };

  const formatBusinessType = (value) => {
    if (!isNullOrEmpty(value)) {
      const data = businessTypeName?.find((item) => Number(item?.code) === Number(value));
      return data?.name ?? '';
    }
    return '';
  };

  /**
   * Define column table
   */
  const columns = useMemo<TableColumnDef<IMasterStoreRecord>[]>(() => {
    return [
      {
        header: 'masterStores.tableText.businessType',
        accessorKey: 'business_type_code',
        size: 10,
        type: 'text',
        textAlign: 'left',
        align: 'left',
        option(props, defaultValue) {
          const businessType = props.row.original.business_type_code;
          return {
            value: formatBusinessType(businessType),
            defaultValue: formatBusinessType(defaultValue?.business_type_code),
          };
        },
      },
      {
        header: 'masterStores.tableText.storeCode',
        accessorKey: 'store_code',
        type: 'text',
        size: 10,
        textAlign: 'right',
      },
      {
        header: 'masterStores.tableText.storeName',
        accessorKey: 'name',
        type: 'text',
        size: 25,
        textAlign: 'left',
      },
      {
        header: 'masterStores.tableText.postCode',
        accessorKey: 'post_code',
        size: 10,
        type: 'text',
        textAlign: 'left',
      },
      {
        header: 'masterStores.tableText.address',
        accessorKey: 'address',
        type: 'text',
        size: 16,
        textAlign: 'left',
      },
      {
        header: 'masterStores.tableText.phone',
        accessorKey: 'phone_number',
        type: 'text',
        size: 12,
        textAlign: 'left',
      },
      {
        header: 'masterStores.tableText.totalNumberOfPOS',
        accessorKey: 'total_pos',
        type: 'text',
        size: 12,
        textAlign: 'left',
      },
      {
        header: 'masterStores.tableText.paymentMethod',
        accessorKey: 'payment_methods',
        type: 'text',
        size: 14,
        textAlign: 'left',
        option(props, defaultValue) {
          const payment_methods = props.row.original.payment_methods;
          return {
            value: formatPaymentMethod(payment_methods),
            defaultValue: formatPaymentMethod(defaultValue?.payment_methods),
          };
        },
      },
    ];
  }, [businessTypeName, paymentMethodList?.length]);

  /**
   * Function used to clear selected row when click on button
   */
  const handleClearSelectedRow = () => {
    setValue(SELECTED_ROW_FORM_CONTROL, null);
  };

  // Action close when close modal
  const handleCancelActionModal = (action: ActionTypeButtonMasterStores) => {
    switch (action) {
      case ActionTypeButtonMasterStores.Delete:
        break;
      case ActionTypeButtonMasterStores.Update:
        setOpenModalEdit(false);
        dispatch(handleClearSaveCondition());
        break;
      case ActionTypeButtonMasterStores.Create:
        dispatch(handleClearSaveCondition());
        setOpenModalAdd(false);
        break;
      default:
        break;
    }
  };

  /**
   * Function used to search master store with input condition in the screen
   */
  const handleSearchMasterStores = () => {
    dispatch(getListMasterStores({ ...masterStoreSearchCondition }))
      .unwrap()
      .then((response) => {
        // Need concat add in here
        const dataStoreList = response.data?.data?.store_list?.map((item) => ({
          ...item,
          address: `${item?.address1 || ''}${item?.address2 || ''}${item?.address3 || ''}`,
        }));

        if (response.data?.data.store_list.length > 0) {
          setDirtyCheckSearch(true);
          setValue('totalCount', response.data?.data.total_count || 0);
          handleClearSelectedRow();
        } else {
          setDirtyCheckSearch(false);
        }

        dispatch(addListMasterStores(dataStoreList || []));
        dispatch(addListMasterStoresDefault(dataStoreList || []));
      })
      .catch(() => { });
  };

  /**
   * Function used to export master stores csv
   */
  const exportMasterStoreCsv = () => {
    dispatch(
      postExportingMasterStoreCsv({
        ...masterStoreSearchCondition,
        language: LanguageOption.LANG_JA,
      } as MasterStoreExportCsvCondition)
    )
      .unwrap()
      .then((response) => {
        // Need concat add in here
        const { blob, headers } = response;
        let fileName = '';
        const match = headers.get('Content-Disposition')?.match(/filename\*=(?:UTF-8'')?(.+)/);
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1]);
        } else {
          fileName = `店舗マスタ_${user?.company_code}_${format(new Date(), 'yyyyMMddHHmmss')}.csv`;
        }

        // Save file
        saveAs(blob, fileName);

        setTimeout(() => {
          focusFirstInput(formRef);
        }, 100);
      })
      .catch(() => { });
  };

  // Focus first input
  useEffect(() => {
    setTimeout(() => {
      focusFirstInput(formRef);
    }, 100);
  }, []);

  // Clear data in form add and edit
  useEffect(() => {
    dispatch(handleClearSearchCondition());
    dispatch(handleClearSaveCondition());
    dispatch(handleClearMasterStoresList());
    dispatch(addListMasterStoresDefault([]));
    dispatch(selectMasterStores(null));
  }, []);

  useEffect(() => {
    setDisableConfirm(!(masterStoresList?.filter((item) => item.operation_type || item.operation_type_before)?.length > 0));
  }, [masterStoresList]);

  // get list payment method
  useEffect(() => {
    dispatch(getCodeMasterPayment({ master_code: 'MC0008' }))
      .unwrap()
      .then((response) => {
        const paymentMethodResponse = response?.data?.data?.items;
        return paymentMethodResponse;
      })
      .then((data) => {
        if (data) {
          setPaymentMethodList(data);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    dispatch(getMasters({ master_code: ['MC0004'] }))
      .unwrap()
      .then((res) => {
        const data = res?.data?.data;
        if (data) {
          const listGroupName = data.flatMap((entry) =>
            entry?.items?.map((item) => ({
              name: item.event_group_name,
              code: item.setting_data_type,
              value: item.setting_data_type,
            }))
          );
          dispatch(getBusinessTypeName(listGroupName));
        }
      })
      .catch(() => { });
  }, []);

  return (
    <FormProvider {...formConfig}>
      <div className="master-stores-container">
        <Header
          title="masterStores.headerTitle"
          csv={{
            disabled: false,
          }}
          exportCSVByApi
          handleExportSCVByApi={exportMasterStoreCsv}
          printer={{ disabled: true }}
          hasESC={true}
          confirmBack={dirtyCheckSearch}
        />
        {/* Modal UI */}
        {openModalAdd && (
          <ModalTabsAdd
            openModalAdd={openModalAdd}
            setOpenModalAdd={setOpenModalAdd}
            handleCancelAction={() => {
              handleCancelActionModal(ActionTypeButtonMasterStores.Create);
            }}
          />
        )}

        {openModalEdit && (
          <ModalTabsEdit
            openModalEdit={openModalEdit}
            setOpenModalEdit={setOpenModalEdit}
            handleCancelAction={() => {
              handleCancelActionModal(ActionTypeButtonMasterStores.Update);
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
                  dispatch(handleChangeSearchConditionField({ key: 'code', value: e.target.value }));
                }}
                maxLength={5}
              />
              <Dropdown
                isHiddenCode={true}
                items={dropdownMasterStores}
                onChange={(item) =>
                  dispatch(handleChangeSearchConditionField({ key: 'code_filter_type', value: item?.value }))
                }
              />
            </div>
            <div className="master-stores__condition-item">
              <InputTextCustom
                widthInput="788px"
                labelText="masterStores.conditionLabel.storeName"
                maxLength={50}
                value={masterStoreSearchCondition?.name}
                onChange={(e: any) => {
                  dispatch(handleChangeSearchConditionField({ key: 'name', value: e.target.value }));
                }}
                onBlur={(e) => {
                  dispatch(handleChangeSearchConditionField({ key: 'name', value: e.target.value.trim() }));
                }}
              />
              <Dropdown
                isHiddenCode={true}
                items={dropdownMasterStores}
                onChange={(item) =>
                  dispatch(handleChangeSearchConditionField({ key: 'name_filter_type', value: item?.value }))
                }
              />
            </div>
            <div className="master-stores__condition-item">
              <Dropdown
                className="dropdown-business-type"
                label="masterStores.modal.businessType"
                items={businessTypeName}
                hasBlankItem={true}
                onChange={(item) => dispatch(handleChangeSearchConditionField({ key: 'store_type', value: item?.value }))}
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
        {watch('totalCount') > 1000 && (
          <div className="master-stores__message-err">
            <p className="message-err-text">{localizeString('masterStores.errMessageDataLength')}</p>
          </div>
        )}
        <TableContainer isError={watch('totalCount') > 1000} className="master-stores__table-container">
          <TableData<IMasterStoreRecord>
            data={masterStoresList}
            columns={columns}
            enableSelectRow={true}
            onClickRow={(row: IMasterStoreRecord) => {
              dispatch(selectMasterStores({
                index: masterStoresList.findIndex((item) => item.store_code === row.store_code),
                row,
              }));
            }}
            onDoubleClick={(row) => {
              dispatch(selectMasterStores({
                index: masterStoresList.findIndex((item) => item.store_code === row.store_code),
                row,
              }));
              handleActionBottomButton(
                ActionTypeButtonMasterStores.Update,
                setOpenModalEdit,
                masterStoresList,
                selectedRow,
                dispatch
              );
            }}
            defaultData={masterStoreListDefault}
            showNoData={masterStoresReducer.noData}
            rowConfig={(row: Row<IMasterStoreRecord>) => {
              return {
                className: row?.original.operation_type === 2 ? 'is_update' : ''
              };
            }}

          />
        </TableContainer>
        <div className="master-stores__bottom-container">
          <ButtonBottomCommon
            deleteAction={() =>
              handleActionBottomButton(ActionTypeButtonMasterStores.Delete, null, masterStoresList, selectedRow, dispatch)
            }
            disableDelete={isNullOrEmpty(selectedRow)}
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
              handleClearSelectedRow();
            }}
            disableConfirm={disableConfirm}
            canKeyDown={!openModalEdit}
            disableAdd={false}
            stateChange={selectedRow}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default MasterStores;
