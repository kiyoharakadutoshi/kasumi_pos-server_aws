import React, { useEffect, useState } from 'react';
import './modal-setting-master.scss';
import { Storage, translate, Translate } from 'react-jhipster';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { CashRegister, DataSearchCashMachine, DataTableMaster, MessageCash } from 'app/modules/setting-master/interface-setting';
import { setError } from 'app/reducers/error';
import { InputTitle, TextAreaInputStyled } from 'app/components/input/styled';
import { createCashRegisterInit, settingMasterSlice, SettingMasterState } from 'app/reducers/setting-master-reducer';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import {
  getCashRegisterDetail,
  getCashRegisterType,
  getPresetsCashMachine,
  validateCashRegister,
} from 'app/services/setting-master-service';
import { IStoreInfo, IStoreSate } from 'app/reducers/store-reducer';
import { getMasters } from 'app/services/master-service';
import ModalCommon, { IModalInfo, IModalType } from 'app/components/modal/modal-common';
import { USER_LOGIN_KEY } from 'app/constants/constants';
import { Position } from 'app/components/date-picker/date-picker';
import TimePicker from 'app/components/time-picker/time-picker';
import { TenantCashMachine } from 'app/modules/setting-master/enum-setting';
import { getHierarchyLevel } from 'app/services/hierarchy-level-service';
import { createDropdownListCustom, isNullOrEmpty } from 'app/helpers/utils';
import { postMessageMaster } from 'app/services/message-service';
import { PresetLayout } from 'app/modules/touch-menu/menu-preset/interface-preset';
import { IMasterCode, ItemMasterCode } from 'app/reducers/master-reducer';
import { toDateString } from 'app/helpers/date-utils';
import { SERVER_DATE_FORMAT } from 'app/constants/date-constants';
import Dropdown from 'app/components/dropdown/dropdown';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import CheckboxButton from 'app/components/checkbox-button/checkbox-button';
import { areObjectsCashRegisterEqual, createDataTable, handleValidateDataCash } from 'app/modules/setting-master/utils-setting-master';
import { CompanyInfo } from 'app/reducers/user-login-reducer';

interface ModalEditProps {
  mode: ModalMode;
  onClose: (cashRegister: CashRegister, dataTableCashRegister: DataTableMaster) => void;
}

export const ModalEditPreset: React.FC<ModalEditProps> = ({ mode, onClose }) => {
  const dispatch = useAppDispatch();
  const storeReducer: IStoreSate = useAppSelector(state => state.storeReducer);
  const settingMasterState: SettingMasterState = useAppSelector(state => state.settingMasterReducer);
  const cashRegister = settingMasterState.selected_cash_machine?.row;
  let storeCodes: IStoreInfo[];
  const storesAdd: IStoreInfo[] = storeReducer?.stores?.filter(selectCode => selectCode?.selected);
  switch (mode) {
    case ModalMode.Copy:
      storeCodes = storeReducer?.stores;
      break;

    case ModalMode.Edit:
      if (!storesAdd?.some(item => item?.store_code === cashRegister?.store_code)) {
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
  const [masters, setMasters] = useState<IMasterCode[]>([]);
  const getMasterItems = (masterCode: string): ItemMasterCode[] => masters?.find(master => master.master_code === masterCode)?.items || [];
  const [listCashRegisterType, setListCashRegisterType] = useState([]);
  const [dataPresetLayout, setDataPresetLayout] = useState<PresetLayout[]>([]);
  const [dataMessage, setDataMessage] = useState<MessageCash[]>([]);
  const [storeCallApi, setStoreCallApi] = useState<IStoreInfo[]>(storesAdd);
  const [modalInfo, setModalInfo] = useState<IModalInfo>({ isShow: false });
  const userName = Storage.local?.get(USER_LOGIN_KEY)?.user_detail?.name;
  const [tenantCode, setTenantCode] = useState<string>();
  const [dropDownPresetValue, setDropDownPresetValue] = useState(dataPresetLayout);
  const [dropDownReceiptValue, setDropDownReceiptValue] = useState(dataMessage);
  const [loadApiSuccess, setLoadApiSuccess] = useState(false);
  const formattedDate = toDateString(new Date(), SERVER_DATE_FORMAT);
  const [disableConfirm, setDisableConfirm] = useState<boolean>(mode === ModalMode.Edit);
  const company: CompanyInfo = useAppSelector(state => state.loginReducer.selectedCompany);

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
      dispatch(settingMasterSlice.actions.clearCashRegisterDetail(createCashRegisterInit(company?.settingMaster)));
    }
    const listStoreCode = storeCallApi?.map(itemStore => itemStore?.store_code);
    dispatch(actions.setCanSetDropdown(false));
    const runInitialTasks = async (fetchMastersAndCashTypes: boolean) => {
      let mastersResponse: any, cashMachineTypesResponse: any, msgResponse: any;
      const hasDataDefault = company?.settingMaster;
      if (fetchMastersAndCashTypes) {
        if (!hasDataDefault) {
          mastersResponse = dispatch(getMasters({ master_code: ['MC7101', 'MC7102', 'MC7103'] })).unwrap();
        }
        cashMachineTypesResponse = dispatch(getCashRegisterType(null)).unwrap();
      }

      const presetsResponse = dispatch(getPresetsCashMachine({ selected_stores: listStoreCode })).unwrap();
      if (!hasDataDefault) {
        msgResponse = dispatch(postMessageMaster({ selected_stores: listStoreCode, type: 1 })).unwrap();
      }

      const results = await Promise.all([
        mastersResponse || Promise.resolve({ data: { data: settingMasterState?.masters } }),
        cashMachineTypesResponse || Promise.resolve({ data: { data: settingMasterState?.cash_register_type } }),
        msgResponse,
        presetsResponse,
      ]);
      const [dataMasters, dataCashMachines, dataMsg, dataPresets] = results;
      return { dataMasters, dataCashMachines, dataMsg, dataPresets };
    };

    const shouldFetchMastersAndCashTypes =
      !settingMasterState?.masters ||
      settingMasterState?.masters.length === 0 ||
      !settingMasterState?.cash_register_type ||
      settingMasterState?.cash_register_type.length === 0;
    runInitialTasks(shouldFetchMastersAndCashTypes)
      .then(({ dataMasters, dataCashMachines, dataMsg, dataPresets }) => {
        setMasters(dataMasters.data.data);
        setListCashRegisterType(dataCashMachines.data.data);
        setDataPresetLayout(dataPresets.data.data?.preset_layouts);
        setDataMessage(dataMsg?.data?.data);
        setLoadApiSuccess(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {}, [cashRegisterDetail]);

  useEffect(() => {
    if (!loadApiSuccess || mode === ModalMode.Add) return;
    const setDataFirstTime = (itemCashInit: CashRegister) => {
      dispatch(actions.setCashDetail(itemCashInit));
      const { store_code, store_name, tenant_hierarchy_code, type_code, type_node, function_layout_code, keyboard_layout_code } =
        itemCashInit || {};

      if (mode === ModalMode.Copy) {
        const cashDetailCopy = {
          ...itemCashInit,
          code: '',
          ip_address: '',
          mac_address: '',
          pos_model: '',
          cash_machine_model: '',
          scanner_model: '',
          note1: '',
          note2: '',
          note3: '',
          tenant_hierarchy_code: '',
          customer_count_excluded: false,
          morning_discount_excluded: false,
          mega_discount_excluded: false,
          rate_customer_excluded: false,
          attendant_monitor_excluded: false,
          receipt_coupon_excluded: false,
          used_standard_price: false
        };
        dispatch(actions.setCashDetail(cashDetailCopy));
        setTenantCode('');
      } else {
        setTenantCode(tenant_hierarchy_code);
      }

      handleChangeStoreCode(store_code, store_name, itemCashInit);
      if (company?.settingMaster) {
        dispatch(
          actions.handleUpdateCashRegisterDetail({
            key: 'type_code',
            value: listCashRegisterType?.find(cashType => cashType?.code === type_code) ? type_code : '',
          }),
        );
      } else {
        const masterItems = {
          type_code: listCashRegisterType?.find(cashType => cashType?.code === type_code) ? type_code : '',
          type_node: getMasterItems('MC7101')?.find(data => data?.setting_data_type === type_node) ? type_node : '',
          function_layout_code: getMasterItems('MC7102')?.find(data => data?.setting_data_type === function_layout_code)
            ? function_layout_code
            : '',
          keyboard_layout_code: getMasterItems('MC7103')?.find(data => data?.setting_data_type === keyboard_layout_code)
            ? keyboard_layout_code
            : '',
        };
        Object.entries(masterItems).forEach(([key, value]) => {
          dispatch(actions.handleUpdateCashRegisterDetail({ key: key as keyof CashRegister, value }));
        });
      }
    };

    if (cashRegister?.operation_type) {
      return setDataFirstTime(cashRegister);
    }
    const param = {
      store_code: cashRegister?.store_code ?? '',
      code: cashRegister?.code ?? '',
    };
    dispatch(getCashRegisterDetail(param))
      .unwrap()
      .then(res => {
        const cashRegisterRes = res.data.data;
        const cashRegisterType = listCashRegisterType?.find(type => type.code === cashRegisterRes.type_code);
        const itemMatchMC7101 = getMasterItems('MC7101').find(master => master.setting_data_type === cashRegisterRes.type_node);
        const itemMatchMC7102 = getMasterItems('MC7102')?.find(master => master.setting_data_type === cashRegisterRes.function_layout_code);
        const itemMatchMC7103 = getMasterItems('MC7103')?.find(master => master.setting_data_type === cashRegisterRes.keyboard_layout_code);
        const message = dataMessage?.find(msg => msg.sub_type_code === cashRegisterRes.receipt_message_code);
        const presetMenu = dataPresetLayout?.find(presetLayout => presetLayout.preset_layout_code === cashRegisterRes.button_layout_code);
        setDataFirstTime({
          ...cashRegisterRes,
          type_name: cashRegisterType?.name,
          type_node_name: itemMatchMC7101?.event_group_name,
          function_layout_name: itemMatchMC7102?.event_group_name,
          keyboard_layout_name: itemMatchMC7103?.event_group_name,
          receipt_message: message?.sub_type_name,
          button_layout_name: presetMenu?.preset_layout_name,
        });
      })
      .catch(() => {});
  }, [loadApiSuccess]);

  useEffect(() => {
    if (!cashRegisterDetail || !cashRegisterDetailDefault || mode !== ModalMode.Edit || !loadApiSuccess) return;
    setDisableConfirm(
      areObjectsCashRegisterEqual(cashRegisterDetailDefault, {
        ...cashRegisterDetail,
        tenant_hierarchy_code: tenantCode,
      }),
    );
  }, [cashRegisterDetail, loadApiSuccess, tenantCode]);

  const handleChangeStoreCode = (storeCode: string, storeName: string, cashDetail?: CashRegister) => {
    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'store_code', value: storeCode }));
    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'store_name', value: storeName }));
    if (isNullOrEmpty(storeCode)) {
      setDropDownPresetValue([]);
      dispatch(actions.handleUpdateCashRegisterDetail({ key: 'button_layout_code', value: '' }));
      if (!company?.settingMaster) {
        setDropDownReceiptValue([]);
        dispatch(actions.handleUpdateCashRegisterDetail({ key: 'receipt_message_code', value: '' }));
      }
      return;
    }
    if (storeCallApi?.some(item => item?.store_code === storeCode)) {
      return setDataDropDown(dataPresetLayout, dataMessage, storeCode, cashDetail);
    }
    const storeCodeNoExist = storeCallApi?.concat([storeReducer?.stores?.find(item => item?.store_code === storeCode)]);
    setStoreCallApi(storeCodeNoExist);
    const runTasksChangeStore = async () => {
      const presetsResponse = dispatch(getPresetsCashMachine({ selected_stores: [storeCode] })).unwrap();

      // If company have receipt message default => don't call api receipt message
      if (company?.settingMaster?.receiptMessage) {
        const results = await Promise.all([presetsResponse]);
        const [dataPresets] = results;
        return { dataPresets, dataMsg: null };
      }

      // If company don't have receipt message default => call api receipt message
      const msgResponse = dispatch(postMessageMaster({ selected_stores: [storeCode], type: 1 })).unwrap();
      const results = await Promise.all([presetsResponse, msgResponse]);
      const [dataPresets, dataMsg] = results;
      return { dataPresets, dataMsg };
    };

    runTasksChangeStore()
      .then(({ dataPresets, dataMsg }) => {
        const dataPresetAfterCallApi = dataPresetLayout?.concat(dataPresets.data.data?.preset_layouts);
        setDataPresetLayout(dataPresetAfterCallApi);

        let dataMsgAfterCallApi = dataMessage;
        if (dataMsg?.data?.data) {
          dataMsgAfterCallApi = dataMessage?.concat(dataMsg?.data?.data);
          setDataMessage(dataMsgAfterCallApi);
        }
        setDataDropDown(dataPresetAfterCallApi, dataMsgAfterCallApi, storeCode, cashDetail);
      })
      .catch(() => {});
  };

  const setDataDropDown = (presetArr: PresetLayout[], msgArr: MessageCash[], storeCode: string, cashDetail: CashRegister) => {
    const listPresetWithStoreCode = presetArr?.filter(preset => {
      return preset.store_code === storeCode;
    });
    setDropDownPresetValue(listPresetWithStoreCode);
    const listMessageWithStoreCode = msgArr?.filter(message => {
      return message.store_code === storeCode;
    });
    if (!company?.settingMaster) {
      setDropDownReceiptValue(listMessageWithStoreCode);
      const receiptMessageCodeDetails =
        listMessageWithStoreCode?.find(msg => cashDetail?.receipt_message_code === msg?.sub_type_code)?.sub_type_code || '';
      dispatch(
        actions.handleUpdateCashRegisterDetail({
          key: 'receipt_message_code',
          value: receiptMessageCodeDetails,
        }),
      );
    }
    const buttonLayoutCodeDetails =
      listPresetWithStoreCode?.find(preset => cashDetail?.button_layout_code === preset?.preset_layout_code)?.preset_layout_code || '';
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
    const msgErr = handleValidateDataCash({ ...cashRegisterDetail, tenant_hierarchy_code: tenantCode });
    if (msgErr) return showError(msgErr);

    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'tenant_hierarchy_code', value: tenantCode }));
    if (cashRegisterDetail?.type_node !== TenantCashMachine) {
      return handleCheckExist();
    }
    dispatch(
      getHierarchyLevel({
        store_code: cashRegisterDetail?.store_code,
        level: 1,
        filter_code: tenantCode,
      }),
    )
      .unwrap()
      .then(res => {
        const totalCount = res.data.data?.total_count;
        if (totalCount && totalCount > 0) {
          handleCheckExist();
        } else {
          dispatch(setError(translate('MSG_VAL_039')));
        }
      })
      .catch(() => {});
  };

  const handleCheckExist = () => {
    const dataSearch: DataSearchCashMachine = {
      selected_store: [cashRegisterDetail?.store_code],
      cash_machine_no: settingMasterState.cash_register_detail.code,
    };

    const cashMachineEdit: CashRegister = {
      ...cashRegisterDetail,
      tenant_hierarchy_code: tenantCode,
      copy: mode === ModalMode.Copy ? true : null,
    };

    const cashRegisterTable = createDataTable(cashMachineEdit);
    dispatch(actions.setCanSetDropdown(true));
    if (mode === ModalMode.Edit) {
      return onClose(cashMachineEdit, cashRegisterTable);
    }
    dispatch(actions.setSaveDataCashRegister(false));
    dispatch(validateCashRegister(dataSearch))
      .unwrap()
      .then(response => {
        if (response.data?.data?.total_count > 0) {
          return dispatch(setError(translate('MSG_VAL_032')));
        }
        const existCashRegisterLocal = settingMasterState?.cash_registers?.some(
          item => item?.store_code === cashMachineEdit?.store_code && item?.code === cashMachineEdit?.code,
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
      }),
    );
  };

  const handleSelectTypeNode = (valueTypeNode: any) => {
    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'type_node', value: valueTypeNode?.code }));
    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'type_node_name', value: valueTypeNode?.name }));
    valueTypeNode !== TenantCashMachine
      ? setTenantCode(null)
      : setTenantCode(cashRegisterDetail?.tenant_hierarchy_code);
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
      <div className={'body-modal-machine'}>
        <div className="left-modal-body">
          <div className="left-modal-body-item row-store-name">
            <div className="right-item" style={{ display: 'flex' }}>
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.store_name"
                items={createDropdownListCustom(
                  storeCodes,
                  (item) => item?.store_code || '',
                  (item) => item?.store_name || ''
                )}
                onChange={(item) => {
                  if (loadApiSuccess) {
                    handleChangeStoreCode(item?.code?.toString(), item?.name, cashRegisterDetail);
                  }
                }}
                value={cashRegisterDetail?.store_code || ''}
                disabled={mode === ModalMode.Edit}
                isRequired={true}
              />
            </div>
          </div>
          <div className="left-modal-body-item row-code">
            <div className="right-item">
              <InputTextCustom
                labelText="modalEditPaymentMachine.code"
                disabled={mode === ModalMode.Edit}
                isRequire={true}
                type="number"
                maxLength={4}
                onChange={(e: any) =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'code',
                      value: e.target?.value,
                    })
                  )
                }
                value={cashRegisterDetail?.code ?? ''}
                datatype="code_data"
              />
            </div>
          </div>
          <div className="left-modal-body-item row-type-code">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.type_code"
                items={createDropdownListCustom(
                  listCashRegisterType,
                  (item) => item?.code || '',
                  (item) => item?.name || ''
                )}
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'type_code', value: item?.code }));
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'type_name', value: item?.name }));
                }}
                value={cashRegisterDetail?.type_code || ''}
                isRequired={true}
              />
            </div>
          </div>
          <div className="left-modal-body-item row-type-node">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                disabled={company?.settingMaster?.nodeType?.disabled}
                label="modalEditPaymentMachine.type_node"
                items={
                  company?.settingMaster?.nodeType?.dropdownValues ??
                  createDropdownListCustom(
                    getMasterItems('MC7101'),
                    (item) => item?.setting_data_type || '',
                    (item) => item?.event_group_name || ''
                  )
                }
                onChange={(item) => handleSelectTypeNode(item)}
                value={cashRegisterDetail?.type_node || ''}
                isRequired={true}
              />
            </div>
          </div>
          <div className="left-modal-body-item row-button-layout">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.button_layout_code"
                items={createDropdownListCustom(
                  dropDownPresetValue,
                  (item) => item?.preset_layout_code || '',
                  (item) => item?.preset_layout_name || ''
                )}
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'button_layout_code', value: item?.code }));
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'button_layout_name', value: item?.name }));
                }}
                value={cashRegisterDetail?.button_layout_code || ''}
                isRequired={true}
              />
            </div>
          </div>
          <div className="left-modal-body-item row-function-layout">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                disabled={company?.settingMaster?.functionLayout?.disabled}
                label="modalEditPaymentMachine.function_layout_code"
                items={
                  company?.settingMaster?.functionLayout?.dropdownValues ??
                  createDropdownListCustom(
                    getMasterItems('MC7102'),
                    (item) => item?.setting_data_type || '',
                    (item) => item?.event_group_name || ''
                  )
                }
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'function_layout_code', value: item?.code }));
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'function_layout_name', value: item?.name }));
                }}
                value={cashRegisterDetail?.function_layout_code || ''}
                isRequired={true}
              />
            </div>
          </div>
          <div className="left-modal-body-item row-keyboard-layout">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.keyboard_layout_code"
                disabled={company?.settingMaster?.keyboardLayout?.disabled}
                items={
                  company?.settingMaster?.keyboardLayout?.dropdownValues ??
                  createDropdownListCustom(
                    getMasterItems('MC7103'),
                    (item) => item?.setting_data_type || '',
                    (item) => item?.event_group_name || ''
                  )
                }
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'keyboard_layout_code', value: item?.code }));
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'keyboard_layout_name', value: item?.name }));
                }}
                value={cashRegisterDetail?.keyboard_layout_code || ''}
                isRequired={true}
              />
            </div>
          </div>
          <div className="left-modal-body-item row-receipt-message">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.receipt_message_code"
                disabled={company?.settingMaster?.receiptMessage?.disabled}
                isRequired={true}
                items={
                  company?.settingMaster?.receiptMessage?.dropdownValues ??
                  createDropdownListCustom(
                    dropDownReceiptValue,
                    (item) => item?.sub_type_code || '',
                    (item) => item?.sub_type_name || ''
                  )
                }
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'receipt_message_code', value: item?.code }));
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'receipt_message', value: item?.name }));
                }}
                value={cashRegisterDetail?.receipt_message_code || ''}
              />
            </div>
          </div>
          <div className="left-modal-body-item row-ipaddress">
            <div className="right-item">
              <InputTextCustom
                labelText="modalEditPaymentMachine.ip_address"
                type="text"
                onChange={(e: any) =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'ip_address',
                      value: e.target.value,
                    })
                  )
                }
                value={cashRegisterDetail?.ip_address || ''}
                datatype="ipAddress_data"
              />
            </div>
          </div>
          <div className="left-modal-body-item row-mac-address">
            <div className="right-item">
              <InputTextCustom
                labelText="modalEditPaymentMachine.mac_address"
                type="text"
                onChange={(e: any) =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'mac_address',
                      value: e.target.value,
                    })
                  )
                }
                value={cashRegisterDetail?.mac_address || ''}
                datatype="macAddress_data"
              />
            </div>
          </div>
          <div className="left-modal-body-item row-startup-time">
            <div className="right-item time-picker">
              <InputTitle className={'time-picker__text-title'}>
                <Translate contentKey="modalEditPaymentMachine.automatic_start_time" />
              </InputTitle>
              <TimePicker
                position={Position.Top}
                initValue={initTime}
                timePicked={(hour, min) => updateDateTime(hour, min)}
                height="50px"
              />
            </div>
          </div>
          <div className="left-modal-body-item row-customer-count left-modal-body-item-checkbox">
            <div className="left-item-customer-count left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.customer_count_excluded" />
              </div>
            </div>
            <div className="right-item-customer-count left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.customer_count_excluded}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'customer_count_excluded',
                      value: !cashRegisterDetail?.customer_count_excluded,
                    })
                  )
                }
              />
            </div>
          </div>
          <div className="left-modal-body-item row-morning-discount left-modal-body-item-checkbox">
            <div className="left-item-morning-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.morning_discount_excluded" />
              </div>
            </div>
            <div className="right-item-morning-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.morning_discount_excluded}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'morning_discount_excluded',
                      value: !cashRegisterDetail?.morning_discount_excluded,
                    })
                  )
                }
              />
            </div>
          </div>
          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.mega_discount_excluded" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.mega_discount_excluded}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'mega_discount_excluded',
                      value: !cashRegisterDetail?.mega_discount_excluded,
                    })
                  )
                }
              />
            </div>
          </div>
          {/* 構成比除外 */}
          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.rate_customer_excluded" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.rate_customer_excluded}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'rate_customer_excluded',
                      value: !cashRegisterDetail?.rate_customer_excluded,
                    })
                  )
                }
              />
            </div>
          </div>

          {/* 380アテンダントモニタ */}
          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.attendant_monitor_excluded" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.attendant_monitor_excluded}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'attendant_monitor_excluded',
                      value: !cashRegisterDetail?.attendant_monitor_excluded,
                    })
                  )
                }
              />
            </div>
          </div>

          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.receipt_coupon_excluded" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.receipt_coupon_excluded}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'receipt_coupon_excluded',
                      value: !cashRegisterDetail?.receipt_coupon_excluded,
                    })
                  )
                }
              />
            </div>
          </div>

          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.used_standard_price" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.used_standard_price}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'used_standard_price',
                      value: !cashRegisterDetail?.used_standard_price,
                    })
                  )
                }
              />
            </div>
          </div>

          <div className="left-modal-body-item row-pos-modal">
            <div className="right-item-pos-modal">
              <InputTextCustom
                labelText="modalEditPaymentMachine.pos_model"
                type="text"
                maxLength={50}
                onChange={(e: any) =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'pos_model',
                      value: e.target.value,
                    })
                  )
                }
                value={cashRegisterDetail?.pos_model || ''}
                datatype="posModel_data"
              />
            </div>
          </div>
          <div className="left-modal-body-item row-cash-machine-modal">
            <div className="right-item">
              <InputTextCustom
                labelText="modalEditPaymentMachine.cash_machine_model"
                type="text"
                maxLength={50}
                onChange={(e: any) =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'cash_machine_model',
                      value: e.target.value,
                    })
                  )
                }
                value={cashRegisterDetail?.cash_machine_model || ''}
                datatype="cashMachineModel_data"
              />
            </div>
          </div>
          <div className="left-modal-body-item row-scanner-model">
            <div className="right-item">
              <InputTextCustom
                labelText="modalEditPaymentMachine.scanner_model"
                type="text"
                maxLength={50}
                onChange={(e: any) =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'scanner_model',
                      value: e.target.value,
                    })
                  )
                }
                value={cashRegisterDetail?.scanner_model || ''}
                datatype="scannerModel_data"
              />
            </div>
          </div>
          <div className="left-modal-body-item row-scanner-model">
            <div className="right-item">
              <InputTextCustom
                labelText="modalEditPaymentMachine.tenant_cashier_department"
                type="number"
                maxLength={2}
                onChange={(e: any) => setTenantCode(e.target?.value)}
                value={tenantCode || ''}
                datatype="tenantCashierDepartment_data"
                disabled={cashRegisterDetail?.type_node !== TenantCashMachine}
                isRequire={cashRegisterDetail?.type_node === TenantCashMachine}
              />
            </div>
          </div>
          <div className="left-modal-body-item row-update-date">
            <div className="left-item">
              <Translate contentKey="modalEditPaymentMachine.updated_date" />
            </div>
            <div className="right-item-update-date right-item-update-date-ground">
              <InputTitle
                className="label-text"
                style={{
                  height: 50,
                  width: 'fit-content',
                  fontSize: 24,
                }}
              >
                {mode === ModalMode.Edit && !cashRegister?.operation_type
                  ? cashRegisterDetail?.updated_date
                  : formattedDate}
              </InputTitle>
            </div>
          </div>
          <div className="left-modal-body-item row-update-employee">
            <div className="left-item-update-employee ">
              <Translate contentKey="modalEditPaymentMachine.updated_employee" />
            </div>
            <div className="right-item-update-employee right-item-update-date-ground">
              <InputTitle
                className="label-text"
                style={{
                  height: 50,
                  width: 'fit-content',
                  fontSize: 24,
                }}
              >
                {mode === ModalMode.Edit && !cashRegister?.operation_type
                  ? cashRegisterDetail?.updated_employee
                  : userName}
              </InputTitle>
            </div>
          </div>
        </div>

        <div className="right-modal-body">
          <div className="row-right-note-top">
            <div className="right-node">
              <Translate contentKey="modalEditPaymentMachine.note_1" />
            </div>
            <div className="note-top">
              <div className="wrap-area-container">
                <TextAreaInputStyled
                  style={{
                    height: 170,
                    width: 580,
                    fontSize: 24,
                  }}
                  maxLength={200}
                  value={cashRegisterDetail?.note1 || ''}
                  onChange={(e: any) =>
                    dispatch(
                      actions.handleUpdateCashRegisterDetail({
                        key: 'note1',
                        value: e.target.value,
                      })
                    )
                  }
                />
              </div>
            </div>
          </div>
          <div className="row-right-note-center">
            <div className="right-node">
              <Translate contentKey="modalEditPaymentMachine.note_2" />
            </div>
            <div>
              <div className="wrap-area-container">
                <TextAreaInputStyled
                  style={{
                    height: 170,
                    width: 580,
                    fontSize: 24,
                  }}
                  maxLength={200}
                  value={cashRegisterDetail?.note2 || ''}
                  onChange={(e: any) =>
                    dispatch(
                      actions.handleUpdateCashRegisterDetail({
                        key: 'note2',
                        value: e.target.value,
                      })
                    )
                  }
                />
              </div>
            </div>
          </div>
          <div className="row-right-note-bottom">
            <div className="right-node">
              <Translate contentKey="modalEditPaymentMachine.note_3" />
            </div>
            <div className="note-bottom">
              <div className="wrap-area-container">
                <TextAreaInputStyled
                  style={{
                    height: 170,
                    width: 580,
                    fontSize: 24,
                  }}
                  maxLength={200}
                  value={cashRegisterDetail?.note3 || ''}
                  onChange={(e: any) =>
                    dispatch(
                      actions.handleUpdateCashRegisterDetail({
                        key: 'note3',
                        value: e.target.value,
                      })
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultModal>
  );
};

export default ModalEditPreset;
