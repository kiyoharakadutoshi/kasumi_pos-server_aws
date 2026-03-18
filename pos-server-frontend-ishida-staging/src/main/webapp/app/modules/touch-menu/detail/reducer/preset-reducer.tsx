import { createSlice, isRejected, PayloadAction } from '@reduxjs/toolkit';
import { ColorInfo, PresetMenu, PresetMenuButton, TabSide } from '../interface-preset';
import { DropResult } from 'react-beautiful-dnd';
import { getDetailPreset, getPresetImages } from 'app/services/preset-service';
import { OperationType } from 'app/components/table/table-common';
import { moveElement } from 'app/helpers/utils';

export interface PresetState {
  errorMessage: string;
  presets: PresetMenu[];
  indexPresetMenu?: number;
  presetMenu?: PresetMenu;
  presetButton?: PresetMenuButton;
  presetImages?: PresetImage[];
  checkHidden?: boolean;
  selectColor?: ColorInfo;
  posToken?: string;
}

export interface PresetImage {
  record_id: number;
  image_url: string;
  file_name: string;
}

const initialState: PresetState = {
  errorMessage: null,
  presetButton: null,
  presets: [],
  presetMenu: null,
  presetImages: null,
  checkHidden: false,
  indexPresetMenu: null,
  selectColor: null,
  posToken: null,
};

const presetSlice = createSlice({
  name: 'preset',
  initialState,
  reducers: {
    setCheckHidden(state, action: PayloadAction<boolean>) {
      state.checkHidden = action.payload;
    },

    setSelectedColor(state, action: PayloadAction<ColorInfo>) {
      state.selectColor = action.payload;
    },

    addPreset(state, action: PayloadAction<PresetMenu>) {
      state.presets.push(action.payload);
      state.indexPresetMenu = state.presets.length - 1;
      state.presetButton = null;
      state.presetMenu = state.presets[state.indexPresetMenu];
    },

    updatePreset(state, action: PayloadAction<PresetMenu>) {
      state.presetMenu = action.payload;
      state.presetMenu.operation_type = state.presetMenu.record_id ? OperationType.Edit : OperationType.New;
      state.presets[state.indexPresetMenu] = state.presetMenu;
    },

    setDefaultPreset(state, action) {
      state.presets = action.payload?.preset_menu;
      const index = state.presets?.findIndex(preset => preset.page_number);
      if (index >= 0) {
        state.indexPresetMenu = index;
        state.presetMenu = state.presets[index];
        state.checkHidden = state.presetMenu.is_hidden;
      } else {
        state.indexPresetMenu = null;
        state.presetMenu = null;
      }
      state.errorMessage = null;
      state.presetButton = null;
      state.presetImages = null;
    },

    removePreset(state) {
      const presetMenu = state.presets[state.indexPresetMenu];
      if (presetMenu?.record_id) {
        state.presets[state.indexPresetMenu].operation_type = OperationType.Remove;
      } else {
        state.presets.splice(state.indexPresetMenu, 1);
      }

      // Update focus tab to previous tab, if not then focus next tab
      for (let i = state.indexPresetMenu - 1; i >= 0; i--) {
        const preset = state.presets[i];
        if (!preset) {
          continue;
        }
        if (preset.operation_type !== OperationType.Remove && preset.page_number) {
          state.indexPresetMenu = i;
          state.presetMenu = preset;
          state.presetButton = null;
          return;
        }
      }
      // If presets don't have previous tab then focus next tab
      for (let i = state.indexPresetMenu + 1; i < state.presets.length; i++) {
        const preset = state.presets[i];
        if (preset.operation_type !== OperationType.Remove && preset.page_number) {
          state.indexPresetMenu = i;
          state.presetMenu = preset;
          state.presetButton = null;
          return;
        }
      }

      state.indexPresetMenu = null;
      state.presetMenu = null;
      state.presetButton = null;
    },

    clearPreset(state) {
      state.errorMessage = null;
      state.presetButton = null;
      state.presets = [];
      state.presetMenu = null;
      state.presetImages = null;
      state.indexPresetMenu = null;
      state.posToken = null;
    },

    selectButton(state, action: PayloadAction<PresetMenuButton>) {
      state.presetButton = action.payload;
      state.errorMessage = null;
    },

    selectPreset(state, action: PayloadAction<number>) {
      state.presetMenu = state.presets[action.payload];
      state.indexPresetMenu = action.payload;
      state.presetButton = null;
      state.errorMessage = null;
    },

    dragPreset(state, action: PayloadAction<DropResult>) {
      const { source, destination } = action.payload;
      if (source.droppableId === destination?.droppableId) {
        state.presets = moveElement(state.presets, source.index, destination.index);
        state.indexPresetMenu = destination.index;
        state.presetMenu = state.presets[destination.index];
      }
    },

    setPresetDescription(state, action) {
      state.presetMenu.description = action.payload;
    },

    setCashMachine(state, action) {
      if (action.payload === false) state.presetMenu.is_display_on_customer_screen = false;
      state.presetMenu.is_display_on_cash_machine = action.payload;
    },

    setCustomerScreen(state, action) {
      state.presetMenu.is_display_on_customer_screen = action.payload;
    },

    updatePresetButton(state) {
      const index = state.presetMenu.preset_menu_button.findIndex(
        item =>
          item.button_column_number === state.presetButton.button_column_number &&
          item.button_row_number === state.presetButton.button_row_number &&
          item.operation_type !== OperationType.Remove,
      );
      if (index >= 0) {
        state.presetButton.operation_type = state.presetButton?.record_id ? OperationType.Edit : OperationType.New;
        state.presetMenu.preset_menu_button[index] = state.presetButton;
      } else {
        state.presetButton.operation_type = OperationType.New;
        state.presetMenu.preset_menu_button.push(state.presetButton);
      }
      state.presetMenu.operation_type = state.presetMenu?.record_id ? OperationType.Edit : OperationType.New;
      state.presets[state.indexPresetMenu] = state.presetMenu;
    },

    // PresetMenuButton setter
    setEventGroupCode(state, action: PayloadAction<TabSide>) {
      state.presetButton.event_group_code = action.payload.values[0];
      state.presetButton.group_code = action.payload.type;
    },

    setButtonDescription(state, action) {
      state.presetButton.description = action.payload;
    },

    setPresetButtonProduct(state, action) {
      state.presetButton.product = action.payload;
    },

    setButtonColorStyle(state, action) {
      state.presetButton.style_key = action.payload;
    },

    setButtonColumnSpan(state, action) {
      state.presetButton.button_column_span = action.payload;
    },

    setButtonRowSpan(state, action) {
      state.presetButton.button_row_span = action.payload;
    },

    setButtonImage(state, action) {
      if (action.payload) {
        state.presetButton.style_info = action.payload;
      }
    },

    setButtonSettingData(state, action) {
      state.presetButton.setting_data = action.payload;
    },

    setButtonStatus(state, action) {
      state.presetButton.display_status = action.payload;
    },

    setButtonAmount(state, action) {
      if (isNaN(action.payload)) {
        state.presetButton.amount = null;
      } else {
        state.presetButton.amount = action.payload;
      }
    },

    setErrorMessage(state, action) {
      state.errorMessage = action.payload;
    },

    clearErrorMessage(state) {
      state.presetButton.description = null;
      state.presetButton.setting_data = null;
      state.presetButton.product = null;
      state.errorMessage = null;
    },

    removePresetButton(state) {
      const index = state.presetMenu.preset_menu_button.findIndex(
        item =>
          item.button_column_number === state.presetButton.button_column_number &&
          item.button_row_number === state.presetButton.button_row_number,
      );

      if (index >= 0) {
        state.presetMenu.preset_menu_button.splice(index, 1);
        state.presets[state.indexPresetMenu] = state.presetMenu;
      }
      
      state.presetButton = null;
      state.errorMessage = null;
    },
    saveProduct(state, action) {
      state.presetButton.product = action.payload;
      const index = state.presetMenu.preset_menu_button.findIndex(
        item =>
          item.button_column_number === state.presetButton.button_column_number &&
          item.button_row_number === state.presetButton.button_row_number &&
          item.operation_type !== OperationType.Remove,
      );
      if (index >= 0) {
        state.presetMenu.preset_menu_button[index].product = action.payload;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getDetailPreset.fulfilled, (state, action) => {
        state.presets = action.payload.data.data.preset_menu;
        state.errorMessage = null;
        const index = state.presets?.findIndex(preset => preset.page_number);
        if (index >= 0) {
          state.indexPresetMenu = index;
          state.presetMenu = state.presets[index];

        }
      })
      .addCase(getPresetImages.fulfilled, (state, action) => {
        state.presetImages = action.payload.data.data;
        state.errorMessage = null;
      })
      .addMatcher(isRejected(getDetailPreset, getPresetImages), (state, action) => {
        state.errorMessage = action.error.message;
      });
  },
});

export const {
  selectButton,
  setEventGroupCode,
  removePresetButton,
  updatePresetButton,
  selectPreset,
  setButtonColumnSpan,
  setButtonColorStyle,
  setButtonDescription,
  setButtonImage,
  setButtonRowSpan,
  setButtonSettingData,
  setButtonStatus,
  setButtonAmount,
  addPreset,
  removePreset,
  dragPreset,
  setPresetDescription,
  updatePreset,
  clearPreset,
  setCashMachine,
  setCustomerScreen,
  saveProduct,
  setDefaultPreset,
  setCheckHidden,
  setSelectedColor,
  setErrorMessage,
  clearErrorMessage,
  setPresetButtonProduct
} = presetSlice.actions;

export default presetSlice.reducer;
