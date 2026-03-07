import React, { ChangeEvent, Suspense } from 'react';
import Dropdown from '@/components/dropdown/dropdown';
import { createDropdownListCustom } from '@/helpers/utils';
import { ModalMode } from '@/components/modal/default-modal/default-enum';
import InputTextCustom from '@/components/input-text-custom/input-text-custom';
import { InputTitle, TextAreaInputStyled } from '@/components/input/styled';
import { Translate } from 'react-jhipster';
import TimePicker from '@/components/time-picker/time-picker';
import { Position } from '@/components/date-picker/date-picker';
import CheckboxButton from '@/components/checkbox-button/checkbox-button';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { CompanyInfo } from 'app/reducers/user-login-reducer';
import { TenantCashMachine } from 'app/modules/setting-master/enum-setting';
import { useFormContext } from 'react-hook-form';
import { InstoreMasterCode, InstoreMasterState } from 'app/modules/setting-master/interface-setting'
import { settingMasterSlice } from 'app/reducers/setting-master-reducer';
import _ from 'lodash';

const FormSettingMaster = ({
  storeCodes,
  loadApiSuccess,
  handleChangeStoreCode,
  cashRegisterDetail,
  mode,
  initTime,
  updateDateTime,
  cashRegister,
  formattedDate,
  userName,
  tenantCode,
  setTenantCode,
  dropDownPresetValue,
}) => {
  const dispatch = useAppDispatch();
  const { watch } = useFormContext<InstoreMasterState>();
  const instoreMasterCode: InstoreMasterCode = watch('codeMaster');
  const company: CompanyInfo = useAppSelector((state) => state.loginReducer.selectedCompany);
  const actions = settingMasterSlice.actions;
  const handleSelectTypeNode = (valueTypeNode: any) => {
    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'type_node', value: valueTypeNode?.code }));
    dispatch(actions.handleUpdateCashRegisterDetail({ key: 'type_node_name', value: valueTypeNode?.name }));
    valueTypeNode !== TenantCashMachine
      ? setTenantCode(null)
      : setTenantCode(cashRegisterDetail?.tenant_hierarchy_code);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={'body-modal-machine'}>
        <div className="left-modal-body">
          {/* 店舗 store code */}
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

          {/* レジ番号 code */}
          <div className="left-modal-body-item row-code">
            <div className="right-item">
              <InputTextCustom
                inputClassName={'fill-container'}
                labelText="modalEditPaymentMachine.code"
                disabled={mode === ModalMode.Edit}
                isRequire={true}
                type="number"
                maxLength={4}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'code',
                      value: e.target?.value,
                    })
                  );
                }}
                value={cashRegisterDetail?.code ?? ''}
                datatype="code_data"
              />
            </div>
          </div>

          {/* レジ種別 type code */}
          <div className="left-modal-body-item row-type-code">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.type_code"
                items={instoreMasterCode?.instoreTypes}
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'type_code', value: item?.code }));
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'type_name', value: item?.name }));
                }}
                value={cashRegisterDetail?.type_code ?? ''}
                isRequired={true}
              />
            </div>
          </div>

          {/* type node */}
          <div className="left-modal-body-item row-type-node">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.type_node"
                items={instoreMasterCode?.noteTypes}
                onChange={(item) => handleSelectTypeNode(item)}
                value={cashRegisterDetail?.type_node}
                isRequired={true}
              />
            </div>
          </div>

          {/* プリセットレイアウト button layout code */}
          <div className="left-modal-body-item row-button-layout">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.button_layout_code"
                items={createDropdownListCustom(
                  dropDownPresetValue,
                  (item) => item?.preset_layout_code ?? '',
                  (item) => item?.preset_layout_name ?? ''
                )}
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'button_layout_code', value: item?.code }));
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'button_layout_name', value: item?.name }));
                }}
                value={cashRegisterDetail?.button_layout_code ?? ''}
                isRequired={true}
              />
            </div>
          </div>

          {/* function layout code */}
          <div className="left-modal-body-item row-function-layout">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                disabled={company?.settingMaster?.functionLayout?.disabled}
                label="modalEditPaymentMachine.function_layout_code"
                items={instoreMasterCode?.functionLayouts}
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'function_layout_code', value: item?.code }));
                }}
                value={cashRegisterDetail?.function_layout_code ?? company?.settingMaster?.functionLayout.value}
                isRequired={true}
              />
            </div>
          </div>

          {/* keyboard layout */}
          <div className="left-modal-body-item row-keyboard-layout">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.keyboard_layout_code"
                disabled={company?.settingMaster?.keyboardLayout?.disabled}
                items={instoreMasterCode?.keyboardLayouts}
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'keyboard_layout_code', value: item?.code }));
                }}
                value={cashRegisterDetail?.keyboard_layout_code ?? company?.settingMaster?.keyboardLayout.value}
                isRequired={true}
              />
            </div>
          </div>

          {/* receipt message */}
          <div className="left-modal-body-item row-receipt-message">
            <div className="right-item">
              <Dropdown
                hasBlankItem={true}
                label="modalEditPaymentMachine.receipt_message_code"
                disabled={company?.settingMaster?.receiptMessage?.disabled}
                isRequired={true}
                items={instoreMasterCode?.receiptMessages}
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'receipt_message_code', value: item?.code }));
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'receipt_message', value: item?.name }));
                }}
                value={cashRegisterDetail?.receipt_message_code ?? company?.settingMaster?.receiptMessage.value}
              />
            </div>
          </div>

          {/* 環境 device class */}
          <div className="left-modal-body-item row-button-layout">
            <div className="right-item">
              <Dropdown
                label="modalEditPaymentMachine.device_class"
                items={instoreMasterCode?.deviceClasses}
                onChange={(item) => {
                  dispatch(actions.handleUpdateCashRegisterDetail({ key: 'device_class_code', value: item?.code }));
                }}
                value={_.toString(cashRegisterDetail?.device_class_code) ?? instoreMasterCode?.deviceClasses?.[0]?.value}
                isRequired={true}
              />
            </div>
          </div>

          {/* IPアドレス ip address */}
          <div className="left-modal-body-item row-ipaddress">
            <div className="right-item">
              <InputTextCustom
                inputClassName={'fill-container'}
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

          {/* MACアドレス mac address */}
          <div className="left-modal-body-item row-mac-address">
            <div className="right-item">
              <InputTextCustom
                inputClassName={'fill-container'}
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

          {/* 自動起動時間 start up time */}
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

          {/* 客数集計除外 check box 1*/}
          <div className="left-modal-body-item row-customer-count left-modal-body-item-checkbox">
            <div className="left-item-customer-count left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.customer_count_excluded" />
              </div>
            </div>
            <div className="right-item-customer-count left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.customer_count_excluded === 1}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'customer_count_excluded',
                      value: cashRegisterDetail?.customer_count_excluded === 1 ? 0 : 1,
                    })
                  )
                }
              />
            </div>
          </div>

          {/* 朝割除外 check box 2 */}
          <div className="left-modal-body-item row-morning-discount left-modal-body-item-checkbox">
            <div className="left-item-morning-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.morning_discount_excluded" />
              </div>
            </div>
            <div className="right-item-morning-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.morning_discount_excluded === 1}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'morning_discount_excluded',
                      value: cashRegisterDetail?.morning_discount_excluded === 1 ? 0 : 1,
                    })
                  )
                }
              />
            </div>
          </div>

          {/* メガ割除外 check box 3 */}
          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.mega_discount_excluded" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.mega_discount_excluded === 1}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'mega_discount_excluded',
                      value: cashRegisterDetail?.mega_discount_excluded === 1 ? 0 : 1,
                    })
                  )
                }
              />
            </div>
          </div>

          {/* 構成比除外 check box 4 */}
          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.rate_customer_excluded" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.rate_customer_excluded === 1}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'rate_customer_excluded',
                      value: cashRegisterDetail?.rate_customer_excluded === 1 ? 0 : 1,
                    })
                  )
                }
              />
            </div>
          </div>

          {/* 380アテンダントモニタ check box 5 */}
          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.attendant_monitor_excluded" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.attendant_monitor_excluded === 1}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'attendant_monitor_excluded',
                      value: cashRegisterDetail?.attendant_monitor_excluded === 1 ? 0 : 1,
                    })
                  )
                }
              />
            </div>
          </div>

          {/* レシートクーポン発行除外 check box 6 */}
          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.receipt_coupon_excluded" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.receipt_coupon_excluded === 1}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'receipt_coupon_excluded',
                      value: cashRegisterDetail?.receipt_coupon_excluded === 1 ? 0 : 1,
                    })
                  )
                }
              />
            </div>
          </div>

          {/* 定番売価使用 check box 7 */}
          <div className="left-modal-body-item row-mega-discount left-modal-body-item-checkbox">
            <div className="left-item-mega-discount left-modal-body-item-checkbox-title">
              <div className="left-modal-body-item-checkbox-wapper">
                <Translate contentKey="modalEditPaymentMachine.used_standard_price" />
              </div>
            </div>
            <div className="right-item-mega-discount left-modal-body-item-checkbox">
              <CheckboxButton
                checked={cashRegisterDetail?.used_standard_price === 1}
                onChange={() =>
                  dispatch(
                    actions.handleUpdateCashRegisterDetail({
                      key: 'used_standard_price',
                      value: cashRegisterDetail?.used_standard_price === 1 ? 0 : 1,
                    })
                  )
                }
              />
            </div>
          </div>

          {/* POS機種 */}
          <div className="left-modal-body-item row-pos-modal">
            <div className="right-item-pos-modal">
              <InputTextCustom
                inputClassName={'fill-container'}
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

          {/* 釣銭機機種 */}
          <div className="left-modal-body-item row-cash-machine-modal">
            <div className="right-item">
              <InputTextCustom
                inputClassName={'fill-container'}
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

          {/* スキャナ機種 */}
          <div className="left-modal-body-item row-scanner-model">
            <div className="right-item">
              <InputTextCustom
                inputClassName={'fill-container'}
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
                inputClassName={'fill-container'}
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

          {/* 更新日 */}
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
                  value={cashRegisterDetail?.note_1 || ''}
                  onChange={(e: any) =>
                    dispatch(
                      actions.handleUpdateCashRegisterDetail({
                        key: 'note_1',
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
                  value={cashRegisterDetail?.note_2 || ''}
                  onChange={(e: any) =>
                    dispatch(
                      actions.handleUpdateCashRegisterDetail({
                        key: 'note_2',
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
                  value={cashRegisterDetail?.note_3 || ''}
                  onChange={(e: any) =>
                    dispatch(
                      actions.handleUpdateCashRegisterDetail({
                        key: 'note_3',
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
    </Suspense>
  );
};

export default FormSettingMaster;
