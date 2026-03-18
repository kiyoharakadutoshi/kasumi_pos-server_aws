import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CashRegister,
  CashRegisterType,
  DataSearchCashMachine,
  DataTableMaster, ISettingMasterDefaultParam,
  MessageCash
} from 'app/modules/setting-master/interface-setting';
import { PresetLayout } from 'app/modules/touch-menu/menu-preset/interface-preset';
import {
  getCashRegister,
  getCashRegisterDetail,
  getCashRegisterType,
  getPresetsCashMachine,
  maintenance,
} from 'app/services/setting-master-service';
import { postMessageMaster } from 'app/services/message-service';
import { getMasters } from 'app/services/master-service';
import { IMasterCode } from 'app/reducers/master-reducer';
import { OperationType, SelectedRow } from 'app/components/table/table-common';
import { createDataTable } from 'app/modules/setting-master/utils-setting-master';
import { parseString } from 'app/helpers/utils';

export interface SettingMasterState {
  loading: boolean;
  cash_registers: CashRegister[];
  cash_register_detail: CashRegister;
  cash_register_detail_default: CashRegister;
  cash_register_type: CashRegisterType[];
  search_cash_machine: DataSearchCashMachine;
  selected_cash_machine: SelectedRow<CashRegister>;
  message: MessageCash[];
  data_table_cash_registers: DataTableMaster[];
  preset_layouts: PresetLayout[];
  masters: IMasterCode[];
  save_success: boolean;
  can_set_dropdown: boolean;
  is_save_data_cash_machine: boolean;
  noData: boolean;
  total_count?: number;
  reloadData?: boolean;
  needReloadCashRegisterType?: boolean;
}

export const createCashRegisterInit = (paramDefault?: ISettingMasterDefaultParam) => {
  const date = new Date();
  return {
    record_id: null,
    operation_type: null,
    store_code: null,
    code: null,
    type_code: null,
    type_name: null,
    type_node: paramDefault?.nodeType?.value ?? null,
    type_node_name: null,
    button_layout_code: null,
    button_layout_name: null,
    keyboard_layout_code: paramDefault?.keyboardLayout?.value ?? null,
    keyboard_layout_name: null,
    function_layout_code: paramDefault?.functionLayout?.value ?? null,
    function_layout_name: null,
    receipt_message_code: paramDefault?.receiptMessage?.value ?? null,
    receipt_message: null,
    ip_address: null,
    mac_address: null,
    payment_type_code: null,
    start_up_time: `${parseString(date.getHours(), 2)}:${parseString(date.getMinutes(), 2)}`,
    morning_discount_excluded: false,
    mega_discount_excluded: false,
    customer_count_excluded: false,
    rate_customer_excluded: false,
    attendant_monitor_excluded: false,
    receipt_coupon_excluded: false,
    used_standard_price: false,
    pos_model: null,
    cash_machine_model: null,
    scanner_model: null,
    tenant_hierarchy_code: null,
    updated_date: null,
    updated_employee: null,
    note1: null,
    note2: null,
    note3: null,
    store_name: null,
    name: null,
  };
};

export const dataSearchInit: DataSearchCashMachine = {
  selected_store: [],
  cash_machine_no: null,
  cash_machine_type: null,
  node_type: null,
  preset_layout_id: null,
  function_layout_id: null,
  keyboard_layout_id: null,
  language: 'ja',
};

export const initialStateSettingMaster: SettingMasterState = {
  loading: false,
  cash_registers: [],
  cash_register_detail: createCashRegisterInit(),
  cash_register_type: null,
  search_cash_machine: dataSearchInit,
  cash_register_detail_default: createCashRegisterInit(),
  message: null,
  data_table_cash_registers: [],
  selected_cash_machine: null,
  preset_layouts: null,
  masters: null,
  save_success: false,
  is_save_data_cash_machine: true,
  can_set_dropdown: true,
  noData: false,
  reloadData: false,
  needReloadCashRegisterType: false
};

export const settingMasterSlice = createSlice({
  name: 'setting-master',
  initialState: initialStateSettingMaster,
  reducers: {
    handleSaveDataTable(state, action) {
      state.data_table_cash_registers = action.payload;
    },

    handleSelectedCashRegister(state, action) {
      const cash_machine_select = state.cash_registers[action.payload?.index];
      state.selected_cash_machine = {
        ...action.payload,
        row: cash_machine_select,
      };
    },

    clearDataSearch(state, action) {
      state.search_cash_machine = {
        ...state.search_cash_machine,
        selected_store: action.payload,
        cash_machine_type: null,
        cash_machine_no: null,
        keyboard_layout_id: null,
        node_type: null,
        function_layout_id: null,
        preset_layout_id: null,
      };
      state.reloadData = false;
      state.needReloadCashRegisterType = false;
    },

    setSaveDataCashRegister(state, action) {
      state.is_save_data_cash_machine = action.payload;
    },

    setCanSetDropdown(state, action) {
      state.can_set_dropdown = action.payload;
    },

    clearScreenData(state) {
      state.cash_registers = [];
      state.data_table_cash_registers = [];
      state.noData = false;
      state.total_count = null;
    },

    handleClickDelete(state) {
      const index = state.selected_cash_machine?.index;
      if (index !== null && index !== undefined) {
        const currentOperationType = state.cash_registers[index].operation_type;
        const currentBeforeType = state.cash_registers[index].operation_type_before;
        const operationType = currentOperationType === OperationType.Remove ? currentBeforeType || null : OperationType.Remove;
        state.cash_registers[index].operation_type = operationType;
        state.selected_cash_machine = {
          ...state.selected_cash_machine,
          row: state.cash_registers[index],
        };
        state.data_table_cash_registers[index].operation_type = operationType;
      }
    },

    updateCashRegister(state, action) {
      const index = state.selected_cash_machine?.index;
      if (index !== null && index !== undefined) {
        state.cash_registers[index] = action.payload;
        state.selected_cash_machine = action.payload;
        state.cash_register_detail = createCashRegisterInit();
      }
    },

    updateCashRegisterTable(state, action) {
      const index = state.selected_cash_machine?.index;
      if (index !== null && index !== undefined) {
        state.data_table_cash_registers[index] = action.payload;
      }
    },

    copyCashRegister(state, action) {
      state.cash_registers.unshift(action.payload);
      state.cash_register_detail = createCashRegisterInit();
    },

    copyCashRegisterTable(state, action) {
      state.data_table_cash_registers.unshift(action.payload);
    },

    clearCashRegisterDetail(state, action) {
      state.cash_register_detail = action.payload;
    },

    handleSelectCashMachineType(state, action: PayloadAction<string>) {
      state.search_cash_machine.cash_machine_type = action.payload;
    },

    handleSelectCashMachineNo(state, action: PayloadAction<string>) {
      state.search_cash_machine.cash_machine_no = action.payload;
    },

    handleSelectPresetLayout(state, action: PayloadAction<string>) {
      state.search_cash_machine.preset_layout_id = action.payload;
    },

    handleSelectNodeType(state, action: PayloadAction<string>) {
      state.search_cash_machine.node_type = action.payload;
    },

    handleSelectFunctionLayout(state, action: PayloadAction<string>) {
      state.search_cash_machine.function_layout_id = action.payload;
    },

    setSaveSuccess(state, action) {
      state.save_success = action.payload;
    },

    handleSelectKeyboardLayout(state, action: PayloadAction<string>) {
      state.search_cash_machine.keyboard_layout_id = action.payload;
    },

    handleUpdateCashRegisterDetail<T extends keyof CashRegister>(
      state,
      action: PayloadAction<{
        key: T;
        value: CashRegister[T];
      }>,
    ) {
      const { key, value } = action.payload;
      state.cash_register_detail[key] = value;
    },

    setCashDetail(state, action) {
      state.cash_register_detail = action.payload;
    },

    setReloadData(state, action: PayloadAction<boolean>) {
      state.reloadData = action.payload;
    },

    setReloadCashRegisterType(state, action: PayloadAction<boolean>) {
      state.needReloadCashRegisterType = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getCashRegisterDetail.fulfilled, (state, action) => {
        state.cash_register_detail = action.payload.data.data;
        state.cash_register_detail_default = action.payload.data.data;
      })
      .addCase(maintenance.fulfilled, state => {
        state.save_success = true;
      })
      .addCase(getCashRegisterType.fulfilled, (state, action) => {
        if (!state?.can_set_dropdown) return;
        state.cash_register_type = action.payload.data.data;
      })
      .addCase(getCashRegister.fulfilled, (state, action) => {
        if (state?.is_save_data_cash_machine) {
          const listCashRegister: CashRegister[] = action.payload.data.data?.items;
          state.noData = listCashRegister?.length === 0;
          state.selected_cash_machine = null;
          state.cash_registers = listCashRegister;
          state.noData = true;
          state.total_count = action.payload.data.data?.total_count;
          state.data_table_cash_registers = listCashRegister?.map(itemCashMachine => {
            return createDataTable(itemCashMachine);
          });
        } else state.is_save_data_cash_machine = true;
      })
      .addCase(getPresetsCashMachine.fulfilled, (state, action) => {
        if (!state?.can_set_dropdown) return;
        state.preset_layouts = action.payload.data.data?.preset_layouts;
      })
      .addCase(postMessageMaster.fulfilled, (state, action) => {
        if (!state?.can_set_dropdown) return;
        state.message = action.payload.data.data;
      })
      .addCase(getMasters.fulfilled, (state, action) => {
        if (!state?.can_set_dropdown) return;
        state.masters = action.payload.data.data;
      })
      .addCase(getCashRegister.rejected, state => {
        state.noData = true;
        state.total_count = null;
      });
  },
});

export default settingMasterSlice.reducer;
