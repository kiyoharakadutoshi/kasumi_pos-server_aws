import React, { useCallback, useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './master-home.scss';
import '../../components/button/button.scss';
import { CashRegister, DataTableMaster } from 'app/modules/setting-master/interface-setting';
import TableMasterLayout from 'app/modules/setting-master/table-master';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { settingMasterSlice, SettingMasterState } from 'app/reducers/setting-master-reducer';
import { useNavigate } from 'react-router-dom';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { exportCSV, importCSV, maintenance } from 'app/services/setting-master-service';
import Header from 'app/components/header/header';
import ModalEditPreset from 'app/modules/setting-master/modal-setting-master/modal-setting-master';
import { saveAs } from 'file-saver';
import { IStoreSate } from 'app/reducers/store-reducer';
import { setError } from 'app/reducers/error';
import { isNullOrEmpty, localizeFormat } from 'app/helpers/utils';
import { OperationType } from 'app/components/table/table-common';
import BottomButton from 'app/modules/setting-master/bottom-button-setting-master/bottom-button';
import { Storage, translate } from 'react-jhipster';
import { USER_LOGIN_KEY } from 'app/constants/constants';
import { toDateString } from 'app/helpers/date-utils';
import { DATE_FORMAT_YYYYmmDDHHmm } from 'app/constants/date-constants';
import SettingMasterSearch from './setting-master-search/setting-master-search';
import { URL_MAPPING } from 'app/router/url-mapping';

export const SettingMaster = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const settingMasterState: SettingMasterState = useAppSelector(state => state.settingMasterReducer);
  const cashRegisterChange = settingMasterState.cash_registers?.filter(cashRegister => {
    return [OperationType.New, OperationType.Edit, OperationType.Remove].includes(cashRegister.operation_type);
  });
  const storeReducer: IStoreSate = useAppSelector(state => state.storeReducer);
  const storeCodes = storeReducer?.stores?.filter(selectCode => {
    if (selectCode?.selected) {
      return selectCode;
    }
  });
  const selectedStoresBeforConfirm = storeReducer.selectedStores;
  const [openModal, setOpenModal] = useState(false);
  const [modeEdit, setModeEdit] = useState<ModalMode>(null);
  const fileInputRef = useRef(null);
  const [canDisableButton, setCanDisableButton] = useState<boolean>(isNullOrEmpty(selectedStoresBeforConfirm));
  const isEnableButton = settingMasterState?.selected_cash_machine?.row && settingMasterState.cash_registers?.length !== 0;
  const actionDelete = () => {
    const hasItemCopy = cashRegisterChange?.some(item => item.copy);
    if (hasItemCopy) {
      dispatch(setError(translate('MSG_VAL_012')));
      return;
    }
    dispatch(settingMasterSlice.actions.handleClickDelete());
  };

  const actionDoubleClick = useCallback(() => {
    handleOpenModalEdit(ModalMode.Edit, true);
  }, []);

  useEffect(() => {
    setCanDisableButton(isNullOrEmpty(selectedStoresBeforConfirm))
  }, [selectedStoresBeforConfirm])

  const actionCloseModal = (cashRegister?: CashRegister, cashRegisterTable?: DataTableMaster) => {
    setOpenModal(false);
    if (cashRegister && cashRegisterTable) {
      let newOperationType: OperationType;
      let newOperationTypeBefore: OperationType;
      switch (modeEdit) {
        case ModalMode.Add:
        case ModalMode.Copy:
          newOperationType = OperationType.New;
          newOperationTypeBefore = OperationType.New;
          break;
        case ModalMode.Edit:
          newOperationType = cashRegister.operation_type_before === OperationType.New ? OperationType.New : OperationType.Edit;
          newOperationTypeBefore = newOperationType;
          break;
        default:
          newOperationType = null;
      }

      const newCashRegister = {
        ...cashRegister,
        record_id: newOperationType === OperationType.New ? null : cashRegister?.record_id,
        pos_model: cashRegister?.pos_model?.trim(),
        scanner_model: cashRegister?.scanner_model?.trim(),
        cash_machine_model: cashRegister?.cash_machine_model?.trim(),
        note1: cashRegister?.note1?.trim(),
        note2: cashRegister?.note2?.trim(),
        note3: cashRegister?.note3?.trim(),
        operation_type: newOperationType,
        operation_type_before: newOperationTypeBefore,
      };

      const newCashRegisterTable = {
        ...cashRegisterTable,
        record_id: newOperationType === OperationType.New ? null : cashRegister?.record_id,
        operation_type: newOperationType,
        operation_type_before: newOperationTypeBefore,
      };

      if (modeEdit === ModalMode.Add || modeEdit === ModalMode.Copy) {
        dispatch(settingMasterSlice.actions.copyCashRegisterTable(newCashRegisterTable));
        dispatch(settingMasterSlice.actions.copyCashRegister(newCashRegister));
      } else if (modeEdit === ModalMode.Edit) {
        dispatch(settingMasterSlice.actions.updateCashRegisterTable(newCashRegisterTable));
        dispatch(settingMasterSlice.actions.updateCashRegister(newCashRegister));
      }
    }
  };

  const actionConfirm = () => {
    const itemCashRegisterChange = cashRegisterChange?.filter(cashRegister => {
      return !(cashRegister.operation_type === OperationType.Remove && cashRegister.operation_type_before === OperationType.New);
    });

    if (itemCashRegisterChange?.length > 0) {
      dispatch(maintenance({ cash_registers: itemCashRegisterChange }));
    } else {
      dispatch(settingMasterSlice.actions.setSaveSuccess(true));
    }
  };

  const dirtyCheckConfirmed = () => {
    dispatch(settingMasterSlice.actions.clearScreenData());
    dispatch(settingMasterSlice.actions.setReloadData(true));
    actionAddMachine();
  }

  const actionAddMachine = () => {
    navigate(URL_MAPPING.SC7102);
  };

  const actionExportFileCSV = () => {
    if (storeCodes?.length === 0) {
      return;
    }

    const reqExportCsv = {
      ...settingMasterState.search_cash_machine,
      selected_store: storeCodes?.map(item => item?.store_code),
    };
    dispatch(exportCSV(reqExportCsv))
      .unwrap()
      .then(response => {
        const timeExport = toDateString(new Date(), DATE_FORMAT_YYYYmmDDHHmm);
        const companyCode = Storage.local?.get(USER_LOGIN_KEY)?.user_detail?.company_code;
        const fileName = `CashRegister_${companyCode}_${timeExport}.csv`;
        saveAs(response.blob, fileName);
      })
      .catch(_ => { });
  };

  const handleOpenModalEdit = (mode: ModalMode, isOpen: boolean) => {
    const selectedCash = settingMasterState?.selected_cash_machine?.row;
    const cashRegistersCopy = cashRegisterChange?.filter(cashRegister => cashRegister?.copy);
    const hasCashCopy = cashRegistersCopy?.length > 0;
    const isDeleteItemSelect = selectedCash?.operation_type === OperationType.Remove;
    let msgVal = '';

    switch (mode) {
      case ModalMode.Copy:
        if (cashRegisterChange?.some(cashRegister => cashRegister.copy !== true) || isDeleteItemSelect) {
          msgVal = translate('MSG_VAL_013');
        }
        break;

      case ModalMode.Edit:
        if (hasCashCopy && !cashRegistersCopy?.some(item => selectedCash?.code === item?.code)) {
          msgVal = translate('MSG_VAL_012');
        }
        if (isDeleteItemSelect) msgVal = translate('MSG_VAL_010');
        break;

      default:
        if (hasCashCopy) {
          msgVal = translate('MSG_VAL_012');
        }
        if (storeCodes?.length === 0) {
          msgVal = localizeFormat('MSG_VAL_001', 'settingMaster.table.store');
        }
    }

    if (msgVal) {
      dispatch(setError(msgVal));
      return;
    }
    setModeEdit(mode);
    setOpenModal(isOpen);
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
          .then(res => {
            const data = res.data;
            if (data.status === 'Error') {
              dispatch(setError(localizeFormat('MSG_INFO_003', data?.data?.join(', '))));
            }
          })
          .catch(_ => { });
        event.target.value = null;
        return;
      }
    }
    dispatch(setError(localizeFormat('MSG_VAL_033', 'CSV')));
    event.target.value = null;
  };

  return (
    <div className={'setting-mater-container'}>
      {openModal && (
        <ModalEditPreset
          mode={modeEdit}
          onClose={(cashRegister: CashRegister, cashTable: DataTableMaster) => actionCloseModal(cashRegister, cashTable)}
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
              confirmChange={cashRegisterChange?.length > 0}
              disabledSearch={canDisableButton}
              onCloseSideBar={setCanDisableButton}
            />
            <TableMasterLayout actionDoubleClick={actionDoubleClick} />
          </div>
          <div className="right-bottom">
            <div className="group-import-csv">
              <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
            <BottomButton
              dirtyCheckAddCashRegister={dirtyCheckConfirmed}
              dirtyCheck={cashRegisterChange?.length > 0}
              addCashRegister={actionAddMachine}
              importCSV={handleButtonClick}
              deleteAction={actionDelete}
              disableDelete={!isEnableButton}
              editAction={() => handleOpenModalEdit(ModalMode.Edit, true)}
              disableEdit={!isEnableButton}
              addAction={() => handleOpenModalEdit(ModalMode.Add, true)}
              copyAction={() => handleOpenModalEdit(ModalMode.Copy, true)}
              disableCopy={!isEnableButton}
              disableAdd={canDisableButton}
              confirmAction={actionConfirm}
              disableConfirm={cashRegisterChange?.length === 0 || !cashRegisterChange}
              dataChange={settingMasterState?.selected_cash_machine?.row}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingMaster;
