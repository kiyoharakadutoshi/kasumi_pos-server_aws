import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CashRegister,
  CashRegisterPayload,
  CashRegisterType,
  DataSearchCashMachine,
  DataTableMaster,
  InstoreMasterCode,
  MessageCash,
  SelectedCashMachine,
} from 'app/modules/setting-master/interface-setting';
import { PresetLayout } from 'app/modules/touch-menu/menu-preset/interface-preset';
import {
  getCashRegister,
  getCashRegisterDetail,
  getCashRegisterType,
  getPresetsCashMachine,
  maintenance,
} from 'app/services/setting-master-service';
import { getMasters } from 'app/services/master-service';
import { IMasterCode } from 'app/reducers/master-reducer';
import { createDataTable } from 'app/modules/setting-master/utils-setting-master';
import { isEqual, parseString } from 'app/helpers/utils';
import { OperationType } from 'app/components/table/table-common';
import { DEVICE_CLASS_DEFAULT } from 'app/modules/setting-master/enum-setting';

export interface SettingMasterState {
  loading: boolean;
  cash_registers: CashRegister[];
  cash_register_detail: CashRegister;
  cash_register_detail_default: CashRegisterPayload;
  cash_register_type: CashRegisterType[];
  search_cash_machine: DataSearchCashMachine;
  selected_cash_machine: SelectedCashMachine;
  message: MessageCash[];
  data_table_cash_registers: DataTableMaster[];
  data_table_cash_registers_default: DataTableMaster[];
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

export const createCashRegisterInit = (codeMaster?: InstoreMasterCode) => {
  const date = new Date();
  return {
    record_id: null,
    operation_type: null,
    store_code: null,
    code: null,
    type_code: null,
    type_node: null,
    button_layout_code: null,
    keyboard_layout_code: null,
    function_layout_code: null,
    receipt_message_code: null,
    device_class_code: codeMaster?.deviceClasses?.every((item) => isEqual(item.value, DEVICE_CLASS_DEFAULT))
      ? codeMaster?.deviceClasses?.[0]?.value
      : DEVICE_CLASS_DEFAULT,
    ip_address: '',
    mac_address: '',
    start_up_time: `${parseString(date.getHours(), 2)}:${parseString(date.getMinutes(), 2)}`,
    morning_discount_excluded: 0,
    mega_discount_excluded: 0,
    customer_count_excluded: 0,
    rate_customer_excluded: 0,
    attendant_monitor_excluded: 0,
    receipt_coupon_excluded: 0,
    used_standard_price: 0,
    pos_model: '',
    cash_machine_model: '',
    scanner_model: '',
    note_1: '',
    note_2: '',
    note_3: '',
    updated_date: '',
    updated_employee: '',
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
  data_table_cash_registers_default: [],
  selected_cash_machine: null,
  preset_layouts: null,
  masters: null,
  save_success: false,
  is_save_data_cash_machine: true,
  can_set_dropdown: true,
  noData: false,
  reloadData: false,
  needReloadCashRegisterType: false,
};

export const settingMasterSlice = createSlice({
  name: 'setting-master',
  initialState: initialStateSettingMaster,
  reducers: {
    initData(state, action: PayloadAction<InstoreMasterCode>) {
      state.cash_register_detail = createCashRegisterInit(action.payload);
    },

    handleSelectedCashRegister(state, action) {
      if (!action.payload) {
        state.selected_cash_machine = null;
        return;
      }

      const cash_machine_select = state.cash_registers?.[action.payload?.index];

      if (!cash_machine_select) {
        state.selected_cash_machine = null;
        return;
      }

      state.selected_cash_machine = {
        ...action.payload,
        row: cash_machine_select,
      };
    },

    handleClearSelectedRow(state) {
      state.selected_cash_machine = null;
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
      state.selected_cash_machine = null;
    },

    handleClickDelete(state, action: PayloadAction<number>) {
      const index = action.payload;

      // Or if you want to log each item individually:
      if (index !== null && index !== undefined) {
        const cash_register = state.cash_registers[index];
        const operationTypeBefore = cash_register.operation_type_before;
        const operationType =
          cash_register.operation_type === OperationType.Remove ? operationTypeBefore : OperationType.Remove;
        state.cash_registers[index].operation_type = operationType;

        state.selected_cash_machine = {
          ...state.selected_cash_machine,
          row: cash_register,
        };

        state.data_table_cash_registers[index].operation_type = operationType;
      }
    },

    updateCashRegister(state, action: PayloadAction<{ item: CashRegister; index: number }>) {
      const { item, index } = action.payload;

      if (index !== null && index !== undefined) {
        state.cash_registers[index] = item;

        state.selected_cash_machine = {
          record_id: item.record_id,
          store: `${item.store_code}:${item.store_name}`,
          machineCode: item.code,
          storeCode: item.store_code,
          machineType: `${item.type_code}:${item.type_name}`,

          presetLayout: `${item.button_layout_code}:${item.button_layout_name}`,
          ipAddress: item.ip_address,
          macAddress: item.mac_address,
          operation_type: item.operation_type,
          operation_type_before: item.operation_type_before,
          typeNode: `${item.type_node}:${item.type_node_name}`,

          row: item,
          index,
        };

        state.cash_register_detail = item;
        state.cash_register_detail_default = item;
      }
    },

    updateCashRegisterTable(state, action: PayloadAction<{ item: DataTableMaster; index: number }>) {
      const { item, index } = action.payload;
      if (index !== null && index !== undefined) {
        state.data_table_cash_registers[index] = item;
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
      state: { key?: keyof CashRegister; value?: any; cash_register_detail?: any },
      action: PayloadAction<{
        key: T;
        value: CashRegister[T];
      }>
    ) {
      const { key, value } = action.payload;
      state.cash_register_detail[key] = value;
    },

    setCashDetail(state, action) {
      state.cash_register_detail = action.payload;
    },

    copyInstore(state, action: PayloadAction<CashRegister>) {
      const copyInstore = action.payload;
      state.cash_register_detail = {
        ...createCashRegisterInit(),
        keyboard_layout_code: copyInstore?.keyboard_layout_code,
        keyboard_layout_name: copyInstore?.keyboard_layout_name,
        function_layout_code: copyInstore?.function_layout_code,
        function_layout_name: copyInstore?.function_layout_name,
        device_class_code: copyInstore?.device_class_code,
        type_code: copyInstore?.type_code,
        type_name: copyInstore?.type_name,
        type_node: copyInstore?.type_node,
        type_node_name: copyInstore?.type_node_name,
        receipt_message: copyInstore?.receipt_message,
        receipt_message_code: copyInstore?.receipt_message_code,
      };
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
      .addCase(maintenance.fulfilled, (state) => {
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
          const tableData = listCashRegister?.map((itemCashMachine) => {
            return createDataTable(itemCashMachine);
          });
          state.data_table_cash_registers = tableData;
          state.data_table_cash_registers_default = tableData;
        } else state.is_save_data_cash_machine = true;
      })
      .addCase(getPresetsCashMachine.fulfilled, (state, action) => {
        if (!state?.can_set_dropdown) return;
        state.preset_layouts = action.payload.data.data?.preset_layouts;
      })
      .addCase(getMasters.fulfilled, (state, action) => {
        if (!state?.can_set_dropdown) return;
        state.masters = action.payload.data.data;
      })
      .addCase(getCashRegister.rejected, (state) => {
        state.noData = true;
        state.total_count = null;
      });
  },
});

export default settingMasterSlice.reducer;
