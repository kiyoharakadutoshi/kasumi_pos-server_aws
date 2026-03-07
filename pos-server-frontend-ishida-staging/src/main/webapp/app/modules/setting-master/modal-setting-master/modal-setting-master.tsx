import React, { useEffect, useState } from 'react';
import './modal-setting-master.scss';
import { Storage, translate } from 'react-jhipster';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import {
  CashRegister,
  DataSearchCashMachine,
  DataTableMaster,
  InstoreMasterCode,
  InstoreMasterState,
} from 'app/modules/setting-master/interface-setting';
import { setError } from 'app/reducers/error';
import { createCashRegisterInit, settingMasterSlice, SettingMasterState } from 'app/reducers/setting-master-reducer';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import {
  getCashRegisterDetail,
  getPresetsCashMachine,
  validateCashRegister,
} from 'app/services/setting-master-service';
import { IStoreInfo, IStoreSate } from 'app/reducers/store-reducer';
import { getMasters } from 'app/services/master-service';
import ModalCommon, { IModalInfo, IModalType } from 'app/components/modal/modal-common';
import { USER_LOGIN_KEY } from 'app/constants/constants';
import { getHierarchyLevel } from 'app/services/hierarchy-level-service';
import { isNullOrEmpty } from 'app/helpers/utils';
import { PresetLayout } from 'app/modules/touch-menu/menu-preset/interface-preset';
import { toDateString } from 'app/helpers/date-utils';
import { SERVER_DATE_FORMAT } from 'app/constants/date-constants';
import {
  areObjectsCashRegisterEqual,
  createDataTable,
  handleValidateDataCash,
} from 'app/modules/setting-master/utils-setting-master';
import { CompanyInfo } from 'app/reducers/user-login-reducer';
import FormSettingMaster from '@/modules/setting-master/modal-setting-master/form-setting-master';
import { OperationType } from 'app/components/table/table-common';
import { useFormContext } from 'react-hook-form';
import { LIST_MASTER_CODE } from 'app/modules/setting-master/setting-master-search';

interface ModalEditProps {
  mode: ModalMode;
  onClose: (cashRegister: CashRegister, dataTableCashRegister: DataTableMaster) => void;
}

const ModalEditPreset: React.FC<ModalEditProps> = ({ mode, onClose }) => {
  const dispatch = useAppDispatch();
  const { watch, setValue, getValues } = useFormContext<InstoreMasterState>();
  const storeReducer: IStoreSate = useAppSelector((state) => state.storeReducer);
  const settingMasterState: SettingMasterState = useAppSelector((state) => state.settingMasterReducer);
  const instoreMasterCode: InstoreMasterCode = watch('codeMaster');
  const cashRegister = settingMasterState.selected_cash_machine?.row;
  const listCashRegister = settingMasterState.cash_registers;
  const company: CompanyInfo = useAppSelector((state) => state.loginReducer.selectedCompany);

  let storeCodes: IStoreInfo[];
  const storesAdd: IStoreInfo[] = storeReducer?.stores?.filter((selectCode) => selectCode?.selected);
  switch (mode) {
    case ModalMode.Copy:
      storeCodes = storeReducer?.stores;
      break;

    case ModalMode.Edit:
      if (!storesAdd?.some((item) => item?.store_code === cashRegister?.store_code)) {
        storesAdd.unshift({
          store_code: cashRegister?.store_code,
          store_name: cashRegister?.store_name,
        });
      }
      storeCodes = storesAdd;
      break;

    default:
      storeCodes = storesAdd;
      break;
  }

  const cashRegisterDetail = settingMasterState.cash_register_detail;
  const cashRegisterDetailDefault = settingMasterState.cash_register_detail_default;
  const actions = settingMasterSlice.actions;
  const [dataPresetLayout, setDataPresetLayout] = useState<PresetLayout[]>([]);
  const [dropDownPresetValue, setDropDownPresetValue] = useState(dataPresetLayout);

  const [storeCallApi, setStoreCallApi] = useState<IStoreInfo[]>(storesAdd);
  const [modalInfo, setModalInfo] = useState<IModalInfo>({ isShow: false });
  const userName = Storage.local?.get(USER_LOGIN_KEY)?.user_detail?.user_name;
  const [tenantCode, setTenantCode] = useState<string>();
  const [loadApiSuccess, setLoadApiSuccess] = useState(false);
  const formattedDate = toDateString(new Date(), SERVER_DATE_FORMAT);
  const [disableConfirm, setDisableConfirm] = useState<boolean>(mode === ModalMode.Edit);

  const getStartUpTime = () => {
    if (cashRegister?.start_up_time && mode === ModalMode.Edit) {
      const [hours, minutes] = cashRegister.start_up_time.split(':').map(Number);
      const time = new Date();
      time.setHours(hours, minutes, 0);
      return time;
    }
    return new Date();
  };
  const [initTime] = useState(getStartUpTime());

  useEffect(() => {
    if (mode === ModalMode.Add) {
      dispatch(settingMasterSlice.actions.clearCashRegisterDetail(createCashRegisterInit()));
    }

    const listStoreCode = storeCallApi?.map((itemStore) => itemStore?.store_code);
    dispatch(actions.setCanSetDropdown(false));
    const runInitialTasks = async (fetchMastersAndCashTypes: boolean) => {
      let mastersResponse: any;
      if (fetchMastersAndCashTypes) {
        mastersResponse = dispatch(getMasters({ master_code: LIST_MASTER_CODE })).unwrap();
      }

      const presetsResponse = dispatch(getPresetsCashMachine({ selected_stores: listStoreCode })).unwrap();

      const results = await Promise.all([
        mastersResponse || Promise.resolve({ data: { data: settingMasterState?.masters } }),
        presetsResponse,
      ]);
      const [dataMasters, dataPresets] = results;
      return { dataMasters, dataPresets };
    };

    runInitialTasks(!instoreMasterCode)
      .then(({ dataPresets }) => {
        setDataPresetLayout(dataPresets.data.data?.preset_layouts);
        const storeCode = mode === ModalMode.Edit ? cashRegister?.store_code : null;
        setDropDownPresetValue(filterPresets(storeCode, dataPresets.data.data?.preset_layouts));
        setLoadApiSuccess(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (cashRegister && mode !== ModalMode.Copy) {
      setTenantCode(cashRegister.tenant_hierarchy_code);
    }
  }, []);

  const instoreDetailKey = (instore: CashRegister) => {
    if (!instore) return '';
    return `${instore.store_code}-${instore.code}`;
  };

  const handleGetDetailCashRegister = () => {
    const param = {
      store_code: cashRegister?.store_code ?? '',
      code: cashRegister?.code ?? '',
    };

    dispatch(getCashRegisterDetail(param))
      .unwrap()
      .then((res) => {
        const cashRegisterRes = res.data.data;
        const cashRegisterType = instoreMasterCode?.instoreTypes?.find(
          (type) => type.value === cashRegisterRes.type_code
        );
        const findTypeNode = instoreMasterCode?.noteTypes.find((item) => item.value === cashRegisterRes.type_node);

        const initData = {
          ...cashRegisterRes,
          type_node_name: findTypeNode.name,
          device_class_code: cashRegisterRes?.device_class_code ?? instoreMasterCode?.deviceClasses?.[0]?.value,
          type_name: cashRegisterType?.name,
        };
        setTenantCode(cashRegisterRes.tenant_hierarchy_code);
        dispatch(actions.setCashDetail(initData));
        const instoreDetails = getValues('instoreDetails') ?? new Map();

        instoreDetails.set(instoreDetailKey(initData), initData);
        setValue('instoreDetails', instoreDetails);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (loadApiSuccess !== false) return;
    const findRecord = () => listCashRegister?.[settingMasterState.selected_cash_machine?.index];
    const operationType = cashRegister?.operation_type;

    switch (mode) {
      case ModalMode.Add:
        dispatch(actions.initData(instoreMasterCode));
        break;
      case ModalMode.Edit: {
        const record = findRecord();
        if (operationType) {
          dispatch(actions.setCashDetail(record));
        } else {
          handleGetDetailCashRegister();
        }
        break;
      }
      case ModalMode.Copy: {
        dispatch(actions.copyInstore(findRecord()));
        break;
      }
      default:
        break;
    }
  }, [loadApiSuccess]);

  const filterPresets = (storeCode?: string, presetLayouts?: PresetLayout[]) => {
    if (isNullOrEmpty(storeCode)) return [];
    return presetLayouts?.filter((item) => item.store_code === storeCode);
  };

  useEffect(() => {
    if (!cashRegisterDetail || !cashRegisterDetailDefault || mode !== ModalMode.Edit || !loadApiSuccess) return;
    setDisableConfirm(
      areObjectsCashRegisterEqual(cashRegisterDetailDefault, {
        ...cashRegisterDetail,
      })
    );
  }, [cashRegisterDetail, loadApiSuccess]);

  const handleChangeStoreCode = (storeCode: string, storeName: string, cashDetail?: CashRegister) => {
    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'store_code', value: storeCode }));
    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'store_name', value: storeName }));

    if (mode === ModalMode.Copy) {
      dispatch(actions.handleUpdateCashRegisterDetail({ key: 'code', value: '' }));
    }

    if (isNullOrEmpty(storeCode)) {
      setDropDownPresetValue([]);
      dispatch(actions.handleUpdateCashRegisterDetail({ key: 'button_layout_code', value: '' }));

      return;
    }

    if (storeCallApi?.some((item) => item?.store_code === storeCode)) {
      return setDataDropDown(dataPresetLayout, storeCode, cashDetail);
    }

    const storeCodeNoExist = storeCallApi?.concat([
      storeReducer?.stores?.find((item) => item?.store_code === storeCode),
    ]);

    setStoreCallApi(storeCodeNoExist);

    dispatch(getPresetsCashMachine({ selected_stores: [storeCode] }))
      .unwrap()
      .then((response) => {
        const dataPresetAfterCallApi = dataPresetLayout?.concat(response.data.data?.preset_layouts);
        setDataPresetLayout(dataPresetAfterCallApi);
        setDataDropDown(dataPresetAfterCallApi, storeCode, cashDetail);
      })
      .catch(() => {});
  };

  const setDataDropDown = (presetArr: PresetLayout[], storeCode: string, cashDetail: CashRegister) => {
    const listPresetWithStoreCode = filterPresets(storeCode, presetArr);

    setDropDownPresetValue(listPresetWithStoreCode);

    const buttonLayoutCodeDetails =
      listPresetWithStoreCode?.find((preset) => cashDetail?.button_layout_code === preset?.preset_layout_code)
        ?.preset_layout_code || '';
    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'button_layout_code', value: buttonLayoutCodeDetails }));
  };

  const showError = (msg: string) => {
    setModalInfo({ isShow: true, type: IModalType.error, message: msg });
  };

  const handleCancel = () => {
    onClose(null, null);
    dispatch(actions.setCanSetDropdown(true));
    dispatch(settingMasterSlice.actions.clearCashRegisterDetail(createCashRegisterInit()));
  };

  const handleConfirm = () => {
    const selectedStore = storeCodes?.find((item) => item.store_code === cashRegisterDetail?.store_code);

    const checkData = {
      ...cashRegisterDetail,
      store_name: selectedStore?.store_name,
      type_node: cashRegisterDetail.type_node,
      function_layout_code: cashRegisterDetail.function_layout_code ?? company?.settingMaster?.functionLayout.value,
      keyboard_layout_code: cashRegisterDetail.keyboard_layout_code ?? company?.settingMaster?.keyboardLayout.value,
      receipt_message_code: cashRegisterDetail.receipt_message_code ?? company?.settingMaster?.receiptMessage.value,
      tenant_hierarchy_code: tenantCode,
    };

    const msgErr = handleValidateDataCash(checkData);
    if (msgErr) return showError(msgErr);

    dispatch(
      getHierarchyLevel({
        level: 1,
        filter_type: 2,
        filter_code: tenantCode,
      })
    )
      .unwrap()
      .then((res) => {
        const totalCount = res.data.data?.total_count;

        if (totalCount && totalCount > 0) {
          handleCheckExist(selectedStore);
        } else {
          dispatch(setError(translate('MSG_VAL_039')));
        }
      })
      .catch(() => {});
  };

  const handleCheckExist = (store: IStoreInfo) => {
    const dataSearch: DataSearchCashMachine = {
      selected_store: [settingMasterState.cash_register_detail.store_code],
      cash_machine_no: settingMasterState.cash_register_detail.code,
    };

    let operationType =
      mode === ModalMode.Edit && cashRegisterDetail?.record_id > 0 ? OperationType.Edit : OperationType.New;

    if (mode === ModalMode.Edit) {
      const instoreDefault = getValues('instoreDetails').get(instoreDetailKey(cashRegisterDetail));
      const isReturn = areObjectsCashRegisterEqual(instoreDefault, cashRegisterDetail);
      if (isReturn) operationType = null;
    }

    // Map data to create payload, get ready-to-call API 8109
    const cashMachineEdit: CashRegister = {
      ...cashRegisterDetail,
      operation_type: operationType,
      operation_type_before: operationType,
      store_name: store?.store_name,
      type_node: cashRegisterDetail.type_node,
      function_layout_code: cashRegisterDetail.function_layout_code ?? company?.settingMaster?.functionLayout.value,
      keyboard_layout_code: cashRegisterDetail.keyboard_layout_code ?? company?.settingMaster?.keyboardLayout.value,
      receipt_message_code: cashRegisterDetail.receipt_message_code ?? company?.settingMaster?.receiptMessage.value,
      tenant_hierarchy_code: tenantCode,
    };

    const cashRegisterTable = createDataTable(cashMachineEdit);
    dispatch(actions.setCanSetDropdown(true));
    if (mode === ModalMode.Edit) {
      return onClose(cashMachineEdit, cashRegisterTable);
    }
    dispatch(actions.setSaveDataCashRegister(false));
    dispatch(validateCashRegister(dataSearch))
      .unwrap()
      .then((response) => {
        if (response.data?.data?.total_count > 0) {
          return dispatch(setError(translate('MSG_VAL_032')));
        }
        const existCashRegisterLocal = settingMasterState?.cash_registers?.some(
          (item) => item?.store_code === cashMachineEdit?.store_code && item?.code === cashMachineEdit?.code
        );
        if (existCashRegisterLocal) {
          return dispatch(setError(translate('MSG_VAL_032')));
        }
        onClose(cashMachineEdit, cashRegisterTable);
      })
      .catch(() => {});
  };

  const updateDateTime = (hour?: number, min?: number) => {
    if (!loadApiSuccess) return;
    const hourNew = hour?.toString().padStart(2, '0');
    const minNew = min?.toString().padStart(2, '0');
    dispatch(
      actions.handleUpdateCashRegisterDetail({
        key: 'start_up_time',
        value: `${hourNew}:${minNew}`,
      })
    );
  };

  return (
    <DefaultModal
      headerType={mode}
      titleModal={`modalEditPaymentMachine.store_choice.${mode}`}
      cancelAction={handleCancel}
      confirmAction={handleConfirm}
      disableConfirm={disableConfirm}
    >
      <ModalCommon modalInfo={modalInfo} />
      <FormSettingMaster
        setTenantCode={setTenantCode}
        tenantCode={tenantCode}
        storeCodes={storeCodes}
        loadApiSuccess={loadApiSuccess}
        handleChangeStoreCode={handleChangeStoreCode}
        cashRegisterDetail={cashRegisterDetail}
        mode={mode}
        initTime={initTime}
        updateDateTime={updateDateTime}
        cashRegister={cashRegister}
        formattedDate={formattedDate}
        userName={userName}
        dropDownPresetValue={dropDownPresetValue}
      />
    </DefaultModal>
  );
};
export default ModalEditPreset;
