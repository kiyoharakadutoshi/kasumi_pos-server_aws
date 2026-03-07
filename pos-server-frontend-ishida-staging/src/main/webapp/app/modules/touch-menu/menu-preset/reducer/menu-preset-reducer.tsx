import { createSlice, isRejected, PayloadAction } from '@reduxjs/toolkit';
import { IGenerateCode, PresetLayout, PresetSearch, presetSearchInit } from '../interface-preset';
import {
  copyPreset,
  generateCode,
  getListPresetLayout,
  saveListPresets,
  savePresets,
} from 'app/services/preset-service';
import { OperationType, SelectedRow } from 'app/components/table/table-common';

export type PresetSearchKey = keyof PresetSearch;

export interface MenuPresetState {
  presetLayouts: PresetLayout[];
  presetLayoutDefaults?: PresetLayout[];
  saveDataSuccess: boolean;
  presetSearch: PresetSearch;
  listCodeGenerate?: IGenerateCode[];
  presetSelected?: SelectedRow;
  noData: boolean;
  total_count?: number;
}

const initialState: MenuPresetState = {
  presetLayouts: [],
  presetLayoutDefaults: null,
  saveDataSuccess: false,
  presetSearch: presetSearchInit,
  presetSelected: null,
  listCodeGenerate: [],
  noData: false,
};

const menuPresetSlice = createSlice({
  name: 'preset',
  initialState,
  reducers: {
    addMenuPreset(state, action: PayloadAction<PresetLayout>) {
      state.presetLayouts = state.presetLayouts ? [action.payload, ...state.presetLayouts] : [action.payload];
      state.presetLayoutDefaults =
        state.presetLayoutDefaults?.length > 0 ? [action.payload, ...state.presetLayoutDefaults] : [action.payload];
      if (state.presetSelected?.index) {
        state.presetSelected.index += 1;
      }
    },

    setMenuPreset(state, action: PayloadAction<PresetLayout[]>) {
      state.presetLayouts = action.payload;
    },

    deleteSelectedPreset(state) {
      const index = state.presetSelected?.index;
      if (index >= 0 && index < state.presetLayouts.length) {
        const preset = state.presetLayouts[state.presetSelected?.index];
        state.presetLayouts[index].operation_type =
          preset.operation_type !== OperationType.Remove ? OperationType.Remove : preset.operation_type_before;
        state.presetSelected.row = state.presetLayouts[index];
      }
    },

    updatePresetLayout(state, action: PayloadAction<PresetLayout>) {
      const index = state.presetSelected?.index;
      if (index >= 0 && index < state.presetLayouts.length) {
        if (action.payload.copy && action.payload.is_copy_changed === true) {
          state.presetLayouts[index] = state.presetLayoutDefaults?.[index];
          state.presetLayouts = [action.payload, ...state.presetLayouts];
          state.presetLayoutDefaults = [action.payload, ...state.presetLayoutDefaults];
          state.presetSelected = null;
          return;
        }

        state.presetLayouts[index] = action.payload;
        state.presetSelected.row = action.payload;
      }
    },

    copyPresetLayout(state, action: PayloadAction<PresetLayout[]>) {
      state.presetLayouts = action.payload;
      state.presetLayoutDefaults = action.payload?.slice(0, action.payload?.length - state.presetLayoutDefaults.length).concat(state.presetLayoutDefaults);
    },

    selectPresetLayout(state, action: PayloadAction<SelectedRow>) {
      state.presetSelected = action.payload;
    },

    setValuePresetSearch(state, action: PayloadAction<{ key: PresetSearchKey; value: string | number | string[] }>) {
      state.presetSearch[action.payload.key as string] = action.payload.value;
    },

    clearStatus(state) {
      state.saveDataSuccess = false;
    },

    clearMenuPreset(state) {
      state.presetLayouts = [];
      state.presetLayoutDefaults = null;
      state.saveDataSuccess = false;
      // state.presetSearch = presetSearchInit;
      state.presetSelected = null;
      state.noData = false;
      state.total_count = null;
    },

    setNodata(state, action) {
      state.noData = action.payload;
      state.presetLayouts = [];
      state.presetLayoutDefaults = null;
    },
    clearDataSearch(state) {
      state.presetSearch.preset_layout_code = '';
      state.presetSearch.preset_layout_code_type = 0;
      state.presetSearch.preset_layout_name_type = 0;
      state.presetSearch.preset_layout_name = '';
    },
  },
  extraReducers(builder) {
    builder.addCase(getListPresetLayout.fulfilled, (state, action) => {
      state.presetLayouts = action.payload.data.data?.preset_layouts;
      state.presetLayoutDefaults = state.presetLayouts;
      state.total_count = action.payload.data.data?.total_count;
      state.noData = state.presetLayouts?.length === 0;
      state.presetSelected = null;
    });
    builder.addCase(generateCode.fulfilled, (state, action) => {
      state.listCodeGenerate = action.payload.data?.items;
      // state.presetSelected = null;
    });
    builder.addCase(savePresets.fulfilled, (state) => {
      state.saveDataSuccess = true;
    });
    builder.addCase(saveListPresets.fulfilled, (state) => {
      state.saveDataSuccess = true;
    });
    builder.addCase(copyPreset.fulfilled, (state) => {
      state.saveDataSuccess = true;
    });
    builder.addCase(getListPresetLayout.rejected, (state) => {
      state.noData = true;
      state.presetLayouts = [];
      state.presetLayoutDefaults = [];
    });
    builder.addMatcher(
      isRejected(getListPresetLayout, savePresets, saveListPresets, generateCode, copyPreset),
      (state) => {
        state.saveDataSuccess = false;
      }
    );
  },
});

export const {
  addMenuPreset,
  deleteSelectedPreset,
  updatePresetLayout,
  selectPresetLayout,
  clearStatus,
  copyPresetLayout,
  setValuePresetSearch,
  clearMenuPreset,
  setNodata,
  clearDataSearch,
} = menuPresetSlice.actions;

export default menuPresetSlice.reducer;
