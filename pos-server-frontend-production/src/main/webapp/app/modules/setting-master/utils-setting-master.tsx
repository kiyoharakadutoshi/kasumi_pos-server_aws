import { CashRegister, DataTableMaster } from 'app/modules/setting-master/interface-setting';
import { TenantCashMachine } from 'app/modules/setting-master/enum-setting';
import { validateIpv4, validateMacAddress, validateRequired } from 'app/shared/validate/validate';
import { isNullOrEmpty } from 'app/helpers/utils';

export const createDataTable = (cashRegister: CashRegister): DataTableMaster => {
  return {
    record_id: cashRegister?.record_id,
    store: `${cashRegister?.store_code ?? ''}${cashRegister?.store_name ? `:${cashRegister?.store_name}` : ''}`,
    machineCode: cashRegister?.code ?? '',
    storeCode: cashRegister?.store_code ?? '',
    machineType: `${cashRegister?.type_code ?? ''}${cashRegister?.type_name ? `:${cashRegister?.type_name}` : ''}`,
    noteType: `${cashRegister?.type_node ?? ''}${cashRegister?.type_node_name ? `:${cashRegister?.type_node_name}` : ''}`,
    presetLayout: `${cashRegister?.button_layout_code ?? ''}${cashRegister?.button_layout_name ? `:${cashRegister?.button_layout_name}` : ''}`,
    functionLayout: `${cashRegister?.function_layout_code ?? ''}${cashRegister?.function_layout_name ? `:${cashRegister?.function_layout_name}` : ''}`,
    keyboardLayout: `${cashRegister?.keyboard_layout_code ?? ''}${cashRegister?.keyboard_layout_name ? `:${cashRegister?.keyboard_layout_name}` : ''}`,
    message: `${cashRegister?.receipt_message_code ?? ''}${cashRegister?.receipt_message ? `:${cashRegister?.receipt_message}` : ''}`,
    ipAddress: cashRegister?.ip_address ?? '',
    macAddress: cashRegister?.mac_address ?? ''
  };
};

export const handleValidateDataCash = (cashRegisterDetail: CashRegister): string => {
  const fieldsToValidateRequired = [
    { value: cashRegisterDetail?.store_code, messageKey: 'modalEditPaymentMachine.store_name' },
    { value: cashRegisterDetail?.store_name, messageKey: 'modalEditPaymentMachine.store_name' },
    { value: cashRegisterDetail?.code, messageKey: 'modalEditPaymentMachine.code' },
    { value: cashRegisterDetail?.type_code, messageKey: 'modalEditPaymentMachine.type_code' },
    { value: cashRegisterDetail?.type_node, messageKey: 'modalEditPaymentMachine.type_node' },
    { value: cashRegisterDetail?.button_layout_code, messageKey: 'modalEditPaymentMachine.button_layout_code' },
    { value: cashRegisterDetail?.function_layout_code, messageKey: 'modalEditPaymentMachine.function_layout_code' },
    { value: cashRegisterDetail?.keyboard_layout_code, messageKey: 'modalEditPaymentMachine.keyboard_layout_code' },
    { value: cashRegisterDetail?.receipt_message_code, messageKey: 'modalEditPaymentMachine.receipt_message_code' },
    {
      value: cashRegisterDetail?.tenant_hierarchy_code,
      messageKey: 'modalEditPaymentMachine.tenant_cashier_department',
      condition: cashRegisterDetail?.type_node === TenantCashMachine
    }
  ];
  for (const field of fieldsToValidateRequired) {
    const { value, messageKey, condition = true } = field;
    if (condition) {
      const validateMsg = validateRequired(value, messageKey);
      if (validateMsg) {
        return validateMsg;
      }
    }
  }
  const ipError = !isNullOrEmpty(cashRegisterDetail?.ip_address) && validateIpv4(cashRegisterDetail?.ip_address, 'modalEditPaymentMachine.ip_address');
  if (ipError) return ipError;

  const macError = !isNullOrEmpty(cashRegisterDetail?.mac_address) && validateMacAddress(cashRegisterDetail?.mac_address, 'modalEditPaymentMachine.mac_address');
  if (macError) return macError;
  return null;
};

export const areObjectsCashRegisterEqual = (cashRegister: CashRegister, cashRegisterCompare: CashRegister): boolean => {
  const areEqual = (val1: any, val2: any) => {
    if ([null, undefined, ''].includes(val1) && [null, undefined, ''].includes(val2)) {
      return true;
    }
    return val1 === val2;
  };

  return areEqual(cashRegister?.type_node, cashRegisterCompare?.type_node) &&
    areEqual(cashRegister?.type_code, cashRegisterCompare?.type_code) &&
    areEqual(cashRegister?.button_layout_code, cashRegisterCompare?.button_layout_code) &&
    areEqual(cashRegister?.keyboard_layout_code, cashRegisterCompare?.keyboard_layout_code) &&
    areEqual(cashRegister?.function_layout_code, cashRegisterCompare?.function_layout_code) &&
    areEqual(cashRegister?.receipt_message_code, cashRegisterCompare?.receipt_message_code) &&
    areEqual(cashRegister?.ip_address, cashRegisterCompare?.ip_address) &&
    areEqual(cashRegister?.mac_address, cashRegisterCompare?.mac_address) &&
    areEqual(cashRegister?.start_up_time, cashRegisterCompare?.start_up_time) &&
    areEqual(cashRegister?.mega_discount_excluded, cashRegisterCompare?.mega_discount_excluded) &&
    areEqual(cashRegister?.morning_discount_excluded, cashRegisterCompare?.morning_discount_excluded) &&
    areEqual(cashRegister?.customer_count_excluded, cashRegisterCompare?.customer_count_excluded) &&
    areEqual(cashRegister?.rate_customer_excluded, cashRegisterCompare?.rate_customer_excluded) &&
    areEqual(cashRegister?.attendant_monitor_excluded, cashRegisterCompare?.attendant_monitor_excluded) &&
    areEqual(cashRegister?.receipt_coupon_excluded, cashRegisterCompare?.receipt_coupon_excluded) &&
    areEqual(cashRegister?.used_standard_price, cashRegisterCompare?.used_standard_price) &&
    areEqual(cashRegister?.pos_model, cashRegisterCompare?.pos_model) &&
    areEqual(cashRegister?.cash_machine_model, cashRegisterCompare?.cash_machine_model) &&
    areEqual(cashRegister?.scanner_model, cashRegisterCompare?.scanner_model) &&
    areEqual(cashRegister?.tenant_hierarchy_code, cashRegisterCompare?.tenant_hierarchy_code) &&
    areEqual(cashRegister?.note1, cashRegisterCompare?.note1) &&
    areEqual(cashRegister?.note2, cashRegisterCompare?.note2) &&
    areEqual(cashRegister?.note3, cashRegisterCompare?.note3);
};
