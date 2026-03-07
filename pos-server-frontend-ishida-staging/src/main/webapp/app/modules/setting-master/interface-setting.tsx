import { OperationType, TBodyBase } from 'app/components/table/table-common';
import { PresetLayout } from 'app/modules/touch-menu/menu-preset/interface-preset';
import { IDropDownItem } from 'app/components/dropdown/dropdown';
import { FormTableDataBase } from 'app/components/table/table-data/interface-table';

export interface InstoreMasterState extends FormTableDataBase<DataTableMaster> {
  codeMaster: InstoreMasterCode;
  instoreDetails?: Map<string, CashRegister>;
}

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

export interface CashChangerSetting {
  status: number;
  count_10000: number;
  count_5000: number;
  count_2000: number;
  count_1000: number;
  count_500: number;
  count_100: number;
  count_50: number;
  count_10: number;
  count_5: number;
  count_1: number;
  cassette: number;
}

export interface CashRegisterPayload {
  operation_type: OperationType;
  store_code: string;
  code: string;
  type_code: number | string;
  type_node: string;
  button_layout_code: string;
  keyboard_layout_code: string;
  function_layout_code: string;
  receipt_message_code: string;
  device_class_code: number | string;
  ip_address?: string;
  mac_address?: string;
  start_up_time?: string;
  morning_discount_excluded?: number;
  mega_discount_excluded?: number;
  customer_count_excluded?: number;
  rate_customer_excluded?: number;
  attendant_monitor_excluded?: number;
  receipt_coupon_excluded?: number;
  used_standard_price?: number;
  tenant_hierarchy_code?: string;
  pos_model?: string;
  cash_machine_model?: string;
  scanner_model?: string;
  note_1?: string;
  note_2?: string;
  note_3?: string;
}

export interface CashRegister extends CashRegisterPayload {
  record_id?: number;
  type_name?: string;
  type_node_name?: string;
  button_layout_name?: string;
  keyboard_layout_name?: string;
  function_layout_name?: string;
  receipt_message?: string;
  payment_type_code?: string;
  updated_date?: string;
  updated_employee?: string;
  store_name?: string;
  name?: string;
  copy?: boolean | null;
  operation_type_before?: OperationType;

  TenantCashMachine?: string;
}

export interface SelectedCashMachine {
  row?: CashRegister;
  index?: number;
  record_id?: number;
  store?: string;
  machineCode?: string;
  storeCode?: string;
  machineType?: string;
  presetLayout?: string;
  ipAddress?: string;
  macAddress?: string;
  operation_type?: number;
  operation_type_before?: number;
  typeNode?: string;
}

export interface DataTableMaster extends TBodyBase {
  record_id: number;
  store: string;
  machineCode: string | number;
  storeCode: string;
  machineType: string;
  presetLayout: string;
  ipAddress: string;
  macAddress: string;
  typeNode: string;
}

export interface DataSearchCashMachine {
  selected_store: string[];
  cash_machine_no?: string | number;
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
}

export interface InstoreMasterCode {
  instoreTypes?: IDropDownItem[];
  noteTypes?: IDropDownItem[];
  deviceClasses?: IDropDownItem[];
  keyboardLayouts?: IDropDownItem[];
  functionLayouts?: IDropDownItem[];
  receiptMessages?: IDropDownItem[];
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
