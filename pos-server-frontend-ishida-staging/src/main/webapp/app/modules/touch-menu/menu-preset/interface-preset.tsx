import { TBodyBase } from 'app/components/table/table-common';

export interface ListPresetLayout {
  preset_layouts: PresetLayout[];
  total_count: number;
}

export interface PresetLayout extends TBodyBase {
  record_id?: number;
  preset_layout_code: string;
  preset_layout_name: string;
  booking_date: string;
  store_code: string;
  store_name: string;
  page_number?: number;
  style_key?: string;
  button_column_count?: number;
  button_row_count?: number;
  multiStore?: boolean;
  is_copy_changed?: boolean;
}

export interface StoreLayout {
  code: string;
  name: string;
  checked?: boolean;
}

export interface PresetSearch {
  preset_layout_code?: string;
  preset_layout_code_type?: number;
  preset_layout_name?: string;
  preset_layout_name_type?: number;
  selected_stores: string[];
  selectedStoresBeforConfirm?: string[];
}


export interface IPresetExist {
  store_code?: string;
  store_name?: string;
  is_exist?: boolean;
}

export interface IGenerateCode {
  store_code?: string;
  id_value?: string;
}

export interface IPresetCreateValue {
  preset_layout_code: string;
  preset_layout_name?: string;
  booking_date: string;
  selected_stores: string[];
}

export interface IPresetCopyValue {
  preset_layout_code: string;
  preset_layout_name: string;
  booking_date: string;
  store: string;
  items: ItemPresetCopyValue[];
  page_number?: number
}

export interface ItemPresetCopyValue {
  preset_layout_code: string;
  preset_layout_name: string;
  booking_date: string;
  store: string;
}

export enum Action {
  create = 1,
  override,
}

export const presetSearchInit: PresetSearch = {
  preset_layout_code: '',
  preset_layout_code_type: 0,
  preset_layout_name: '',
  preset_layout_name_type: 0,
  selected_stores: [],
};

export const initPresetLayout: PresetLayout = {
  preset_layout_code: '',
  preset_layout_name: '',
  booking_date: null,
  store_code: '',
  store_name: '',
};
