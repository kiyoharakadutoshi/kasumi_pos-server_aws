import { TBodyBase } from 'app/components/table/table-common';
import { OperationType } from 'app/modules/setting-master/enum-setting';
import { PresetLayout } from 'app/modules/touch-menu/menu-preset/interface-preset';
import { IDropDownItem } from 'app/components/dropdown/dropdown';

export interface StoreLayout {
  code: string;
  name: string;
  checked?: boolean;
}

export interface CashRegisterType {
  record_id: string;
  code: string;
  name: string;
}

export interface MessageCash {
  store_code: string;
  store_name: string;
  type: number;
  code: string;
  sub_type_code: string;
  sub_type_name: string;
  message: string;
  apply_date: string;
}

export interface CashRegister extends TBodyBase {
  record_id?: string;
  store_code: string;
  code: string;
  type_code: string;
  type_name: string;
  type_node: string;
  type_node_name: string;
  button_layout_code: string;
  button_layout_name: string;
  keyboard_layout_code: string;
  keyboard_layout_name: string;
  function_layout_code: string;
  function_layout_name: string;
  receipt_message_code: string;
  receipt_message: string;
  ip_address?: string;
  mac_address?: string;
  payment_type_code: string;
  start_up_time?: string;
  morning_discount_excluded?: boolean;
  mega_discount_excluded?: boolean;
  customer_count_excluded?: boolean;
  rate_customer_excluded: boolean;
  attendant_monitor_excluded: boolean;
  receipt_coupon_excluded: boolean;
  used_standard_price: boolean;
  pos_model?: string;
  cash_machine_model?: string;
  scanner_model?: string;
  updated_date?: string;
  updated_employee?: string;
  tenant_hierarchy_code?: string;
  note1?: string;
  note2?: string;
  note3?: string;
  store_name: string;
  name: string;
}

export interface DataTableMaster extends TBodyBase {
  record_id: string;
  store: string;
  machineCode: string;
  storeCode: string;
  machineType: string;
  noteType: string;
  presetLayout: string;
  functionLayout: string;
  keyboardLayout: string;
  message: string;
  ipAddress: string;
  macAddress: string;
}

export interface DataSearchCashMachine {
  selected_store: string[];
  cash_machine_no?: string;
  cash_machine_type?: string;
  node_type?: string;
  preset_layout_id?: string;
  function_layout_id?: string;
  keyboard_layout_id?: string;
  language?: string;
}

export interface PaymentMachineLayout {
  recordId: number;
  codeId: string;
  Name: string;
  operationType: OperationType;
  operationTypeBefore?: OperationType;
}

export interface IPresetCash {
  preset_layouts: PresetLayout[];
}

export interface IDataDropdownCompany {
  dropdownValues: IDropDownItem[];
  value: string;
  disabled: boolean;
}

export interface ISettingMasterDefaultParam {
  functionLayout: IDataDropdownCompany;
  keyboardLayout: IDataDropdownCompany;
  receiptMessage: IDataDropdownCompany;
  nodeType: IDataDropdownCompany;
}

export interface ICashRegisterCodeDto {
  record_id: number;
  code: string;
}

export interface ICashRegisterCodeDtos {
  items: ICashRegisterCodeDto[];
}

/*
  Init data
 */

export const dataDefaultDropdown: IDataDropdownCompany = {
  dropdownValues: [{ value: '999', name: '999' }],
  value: '999',
  disabled: true,
};


export const dataMessageDefault: IDataDropdownCompany = {
  dropdownValues: [{ value: '99', name: '99' }],
  value: '99',
  disabled: true,
};
