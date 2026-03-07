import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { Storage } from 'react-jhipster';

// Components
import Header from '@/components/header/header';
import { URL_MAPPING } from '@/router/url-mapping';
import { OperationType } from '@/components/table/table-common';
import TableMaster from '@/modules/setting-master/table-master';
import useFocusInput from '@/modules/setting-master/hook/useFocusInput';
import { ModalMode } from '@/components/modal/default-modal/default-enum';
import ButtonBottomCommon from '@/components/bottom-button/button-bottom-common';
import SettingMasterSearch from '@/modules/setting-master/setting-master-search';
import { exportCSV, importCSV, maintenance } from '@/services/setting-master-service';
import { settingMasterSlice, SettingMasterState } from '@/reducers/setting-master-reducer';
import { CashRegister, DataTableMaster, InstoreMasterState } from '@/modules/setting-master/interface-setting';
import ModalEditPreset from '@/modules/setting-master/modal-setting-master/modal-setting-master';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';

// Redux
import { setError } from '@/reducers/error';
import { IStoreSate } from '@/reducers/store-reducer';
import { useAppDispatch, useAppSelector } from '@/config/store';

// Utils
import { toDateString } from '@/helpers/date-utils';
import { USER_LOGIN_KEY } from '@/constants/constants';
import { DATE_FORMAT_YYYYmmDDHHmm } from '@/constants/date-constants';
import { isNullOrEmpty, localizeFormat, localizeString } from '@/helpers/utils';


// Styles
import './master-home.scss';
import '../../components/button/button.scss';
import 'bootstrap/dist/css/bootstrap.min.css';


/**
 * SC7101: SettingMaster component
 * @returns SettingMaster component
 */
export const SettingMaster = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const settingMasterState: SettingMasterState = useAppSelector((state) => state.settingMasterReducer);
  const cashRegisterChange = settingMasterState.cash_registers?.filter((cashRegister) => {
    return [OperationType.New, OperationType.Edit, OperationType.Remove].includes(cashRegister.operation_type);
  });
  const storeReducer: IStoreSate = useAppSelector((state) => state.storeReducer);
  const storeCodes = storeReducer?.stores?.filter((selectCode) => {
    if (selectCode?.selected) {
      return selectCode;
    }
  });
  const selectedStoresBeforeConfirm = storeReducer.selectedStores;
  const [openModal, setOpenModal] = useState(false);
  const [modeEdit, setModeEdit] = useState<ModalMode>(null);
  const fileInputRef = useRef(null);
  const [canDisableButton, setCanDisableButton] = useState<boolean>(isNullOrEmpty(selectedStoresBeforeConfirm));
  const { handleFocusInput } = useFocusInput();
  const isEnableButton = settingMasterState?.selected_cash_machine;

  const formConfig = useForm<InstoreMasterState>({
    defaultValues: { codeMaster: {} },
  });

  const { setValue } = formConfig;

  const actionDelete = () => {
    const selectedRows = formConfig.getValues('selectedRows' as any);
    const index: number = selectedRows?.[0]?.index;
    dispatch(settingMasterSlice.actions.handleClickDelete(index));
  };

  const actionDoubleClick = () => {
    handleOpenModalEdit(ModalMode.Edit, true);
  };

  useEffect(() => {
    setCanDisableButton(isNullOrEmpty(selectedStoresBeforeConfirm));
  }, [selectedStoresBeforeConfirm]);

  const actionCloseModal = (cashRegister?: CashRegister, cashRegisterTable?: DataTableMaster) => {
    setOpenModal(false);
    if (cashRegister && cashRegisterTable) {
      // format data
      const newCashRegister = {
        ...cashRegister,
        pos_model: cashRegister?.pos_model?.trim(),
        scanner_model: cashRegister?.scanner_model?.trim(),
        cash_machine_model: cashRegister?.cash_machine_model?.trim(),
        note_1: cashRegister?.note_1?.trim(),
        note_2: cashRegister?.note_2?.trim(),
        note_3: cashRegister?.note_3?.trim(),
      };

      // format data
      const newCashRegisterTable = {
        ...cashRegisterTable,
        type_node: cashRegister?.type_node,
        type_node_name: cashRegister?.type_node_name,
      };

      // update record to table
      if (modeEdit === ModalMode.Add || modeEdit === ModalMode.Copy) {
        dispatch(settingMasterSlice.actions.copyCashRegisterTable(newCashRegisterTable));
        dispatch(settingMasterSlice.actions.copyCashRegister(newCashRegister));
      } else if (modeEdit === ModalMode.Edit) {
        const selectedRows = formConfig.getValues('selectedRows' as any);
        const index: number = selectedRows?.[0]?.index;
        dispatch(settingMasterSlice.actions.updateCashRegisterTable({ index, item: newCashRegisterTable }));
        dispatch(settingMasterSlice.actions.updateCashRegister({ index, item: newCashRegister }));
      }
    }
  };

  // call api submit data
  const actionConfirm = () => {
    // ignore unused properties
    const formatPayload = cashRegisterChange?.map((cashRegister) => ({
      operation_type: cashRegister.operation_type,
      store_code: cashRegister.store_code,
      code: cashRegister.code,
      type_code: cashRegister.type_code,
      type_node: cashRegister.type_node,
      button_layout_code: cashRegister.button_layout_code,
      keyboard_layout_code: cashRegister.keyboard_layout_code,
      function_layout_code: cashRegister.function_layout_code,
      receipt_message_code: cashRegister.receipt_message_code,
      device_class_code: cashRegister.device_class_code,
      ip_address: cashRegister.ip_address ?? '',
      mac_address: cashRegister.mac_address ?? '',
      start_up_time: cashRegister.start_up_time,
      morning_discount_excluded: cashRegister.morning_discount_excluded,
      mega_discount_excluded: cashRegister.mega_discount_excluded,
      customer_count_excluded: cashRegister.customer_count_excluded,
      rate_customer_excluded: cashRegister.rate_customer_excluded,
      attendant_monitor_excluded: cashRegister.attendant_monitor_excluded,
      receipt_coupon_excluded: cashRegister.receipt_coupon_excluded,
      used_standard_price: cashRegister.used_standard_price,
      pos_model: cashRegister.pos_model,
      cash_machine_model: cashRegister.cash_machine_model,
      scanner_model: cashRegister.scanner_model,
      tenant_hierarchy_code: cashRegister.tenant_hierarchy_code,
      note_1: cashRegister.note_1 ?? '',
      note_2: cashRegister.note_2 ?? '',
      note_3: cashRegister.note_3 ?? '',
    }));

    if (cashRegisterChange?.length > 0) {
      // call API submit, this API used for three cases, CREATE, UPDATE, DELETE
      // be careful if you want to change something
      dispatch(maintenance({ cash_registers: formatPayload }))
        .unwrap()
        .then(() => {
          // submit success
          // clear data on screen
          // if selected_cash_machine === null => button F10, F1, F3, F11 in the bottom is disabled
          dispatch(settingMasterSlice.actions.clearScreenData());
          dispatch(settingMasterSlice.actions.setReloadData(true));

          // select the first input
          handleFocusInput();
        })
        .catch(() => { });
    } else {
      dispatch(settingMasterSlice.actions.setSaveSuccess(true));
    }
  };

  const dirtyCheckConfirmed = () => {
    dispatch(settingMasterSlice.actions.clearScreenData());
    dispatch(settingMasterSlice.actions.setReloadData(true));
    actionAddMachine();
  };

  const actionAddMachine = () => {
    navigate(URL_MAPPING.SC7102);
  };

  const actionExportFileCSV = () => {
    if (storeCodes?.length === 0) {
      return;
    }

    const reqExportCsv = {
      ...settingMasterState.search_cash_machine,
      selected_store: storeCodes?.map((item) => item?.store_code),
    };
    dispatch(exportCSV(reqExportCsv))
      .unwrap()
      .then((response) => {
        const timeExport = toDateString(new Date(), DATE_FORMAT_YYYYmmDDHHmm);
        const companyCode = Storage.local?.get(USER_LOGIN_KEY)?.user_detail?.company_code;
        const fileName = `CashRegister_${companyCode}_${timeExport}.csv`;
        saveAs(response.blob, fileName);
      })
      .catch((error) => {
        console.error('export csv error: ', error);
      });
  };

  const handleOpenModalEdit = (mode: ModalMode, isOpen: boolean) => {
    if (mode === ModalMode.Add) {
      setModeEdit(mode);
      setOpenModal(isOpen);
      return;
    }

    const selectedRows = formConfig.getValues('selectedRows' as any);
    const index: number = selectedRows?.[0]?.index;
    const selectedItem = settingMasterState?.data_table_cash_registers?.[index];
    if (!selectedItem) return;

    if (selectedItem.operation_type !== OperationType.Remove) {
      setModeEdit(mode);
      setOpenModal(isOpen);
      return;
    }

    dispatch(setError(localizeString(mode === ModalMode.Edit ? 'MSG_VAL_010' : 'MSG_VAL_081')));
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (fileType === 'text/csv' || fileExtension === 'csv') {
        const formData = new FormData();
        formData.append('file', file);
        dispatch(importCSV(formData))
          .unwrap()
          .then((res) => {
            const data = res.data;
            if (data.status === 'Error') {
              dispatch(setError(localizeFormat('MSG_INFO_003', data?.data?.join(', '))));
            }
          })
          .catch((error) => {
            console.error('import csv error: ', error);
          });
        event.target.value = null;
        return;
      }
    }
    dispatch(setError(localizeFormat('MSG_VAL_033', 'CSV')));
    event.target.value = null;
  };

  const handleResetSelected = () => {
    setValue('selectedRows' as any, []);
  };

  return (
    <div className={'setting-mater-container'}>
      <FormProvider {...formConfig}>
        {openModal && (
          <ModalEditPreset
            mode={modeEdit}
            onClose={(cashRegister: CashRegister, cashTable: DataTableMaster) =>
              actionCloseModal(cashRegister, cashTable)
            }
          />
        )}
        <Header
          exportCSVByApi={true}
          csv={{ disabled: canDisableButton }}
          handleExportSCVByApi={actionExportFileCSV}
          printer={{ disabled: true }}
          title="settingMaster.title"
          confirmBack={cashRegisterChange?.length > 0}
          hasESC={true}
        />

        <div className="setting-mater">
          <div className="right-panel">
            <div className="right-top">
              <SettingMasterSearch
                handleResetSelected={handleResetSelected}
                confirmChange={cashRegisterChange?.length > 0}
                disabledSearch={canDisableButton}
                onCloseSideBar={setCanDisableButton}
              />

              <TableMaster actionDoubleClick={actionDoubleClick} />
            </div>
            <div className="right-bottom">
              <div className="group-import-csv">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              <ButtonBottomCommon
                dataChange={settingMasterState?.selected_cash_machine?.row}
                deleteAction={actionDelete}
                editAction={() => handleOpenModalEdit(ModalMode.Edit, true)}
                addAction={() => handleOpenModalEdit(ModalMode.Add, true)}
                copyAction={() => handleOpenModalEdit(ModalMode.Copy, true)}
                confirmAction={actionConfirm}
                disableEdit={!isEnableButton}
                disableDelete={!isEnableButton}
                disableCopy={!isEnableButton}
                disableAdd={canDisableButton}
                disableConfirm={cashRegisterChange?.length === 0 || !cashRegisterChange}
                importCSV={handleButtonClick}
              >
                <FuncKeyDirtyCheckButton
                  funcKey={null}
                  onClickAction={actionAddMachine}
                  text="action.addCashRegister"
                  dirtyCheck={cashRegisterChange?.length > 0}
                  okDirtyCheckAction={dirtyCheckConfirmed}
                />
              </ButtonBottomCommon>
            </div>
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default SettingMaster;
