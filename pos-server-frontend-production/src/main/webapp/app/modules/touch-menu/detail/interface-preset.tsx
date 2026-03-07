import { OperationType } from 'app/components/table/table-common';

export const BUTTON_PRESET_REMOVE_CLASS = "button-preset-remove";

export enum TabType {
  Product = 1,
  CategoryProduct = 2,
  Function = 3,
}

export interface ListPresetMenu {
  target_booking_date?: string;
  preset_menu: PresetMenu[];
}

export interface PresetMenu {
  record_id?: number;
  store_code: string;
  preset_layout_code: string;
  preset_layout_name: string;
  booking_date: string;
  page_number?: number;
  description?: string;
  is_display_on_cash_machine?: boolean
  is_display_on_customer_screen?: boolean
  button_column_count?: number;
  button_row_count?: number;
  style_key?: string;
  preset_menu_button?: PresetMenuButton[];
  operation_type?: OperationType;
  is_hidden?: boolean;
}

export interface ProductResponse {
  item_code: string;
  item_category: string;
  item_name: string;
  item_unit_price_fmt: string;
  item_info_group_code: string;
  item_product_code: string;
}

export interface PresetMenuButton {
  operation_type?: OperationType;
  record_id?: number;
  store_code: string;
  preset_layout_code: string;
  page_number?: number;
  booking_date: string;
  group_code: number;
  button_column_number: number;
  button_row_number: number;
  button_column_span: number;
  button_row_span: number;
  description: string;
  style_key: string;
  event_group_code?: string;
  setting_data: string;
  style_info: string;
  display_status: number;
  amount?: number;
  price?: string;
  product?: ProductResponse;
}

export interface ColorInfo {
  color: string;
  type: string;
}

export interface TabSide {
  name: string;
  values: string[];
  type: TabType;
}

export interface ColorButton {
  color: string;
  type: string;
}

interface Reaction {
  thumbsUp: number;
  hooray: number;
  heart: number;
  rocket: number;
  eyes: number;
}
interface Post {
  id: string;
  title: string;
  content: string;
  user: string;
  date: string;
  reactions: Reaction;
}
export interface PostsState {
  posts: Post[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: null | string;
}
interface User {
  id: string;
  name: string;
}
interface UsersState {
  users: User[];
  loading: boolean;
  error: null | string;
}
export interface RowData {
  area: string;
  storeCode: string;
  businessTypeCode: string;
  branchName: string;
  reservationDate: string;
}
export interface RootState {
  posts: PostsState;
  users: UsersState;
  preset: RowData;
}

export interface RowData {
  area: string;
  storeCode: string;
  businessTypeCode: string;
  branchName: string;
  reservationDate: string;
}

export interface IPosition {
  x: number;
  y: number;
}

export interface IBaseProduct {
  group_code?: string;
  product_code?: string;
  PLU?: string;
  price?: string;
}

export interface ICategoryRef {
  getData: () => string;
}

export interface IProductRef {
  getData: () => IBaseProduct;
}

export interface IFunctionRef {
  getData: () => string;
}

export const initPreMenuButton: PresetMenuButton = {
  store_code: '',
  preset_layout_code: '',
  page_number: 1,
  booking_date: '',
  button_column_number: 1,
  button_row_number: 1,
  button_column_span: 0,
  button_row_span: 0,
  description: '',
  style_key: '',
  setting_data: '',
  style_info: '',
  display_status: 1,
  group_code: 0,
};

export const colorPresets: ColorInfo[] = [
  { color: '#c1ebff', type: 'PresetRadioButtonLeftStyle1' },
  { color: '#daf5cd', type: 'PresetRadioButtonLeftStyle2' },
  { color: '#ffdcfa', type: 'PresetRadioButtonLeftStyle3' },
  { color: '#fff9b6', type: 'PresetRadioButtonLeftStyle4' },
  { color: '#e5e5e5', type: 'PresetRadioButtonLeftStyle5' },
  { color: '#cac7f7', type: 'PresetRadioButtonLeftStyle6' },
  { color: '#e5d6c6', type: 'PresetRadioButtonLeftStyle7' },
];

export const colorButtons: ColorButton[] = [
  { color: '#8ce1ff', type: 'PresetButtonStyle1' },
  { color: '#BEFB9B', type: 'PresetButtonStyle2' },
  { color: '#FFC6FF', type: 'PresetButtonStyle3' },
  { color: '#FEFE5C', type: 'PresetButtonStyle4' },
  { color: '#c0c0c0', type: 'PresetButtonStyle5' },
  { color: '#AA96EC', type: 'PresetButtonStyle6' },
  { color: '#FEC888', type: 'PresetButtonStyle7' },
  { color: '#dbac7a', type: 'PresetButtonStyle8' },
];
