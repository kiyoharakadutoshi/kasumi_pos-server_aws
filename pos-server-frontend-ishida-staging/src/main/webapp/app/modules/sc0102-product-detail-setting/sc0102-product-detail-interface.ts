import { IDropDownItem } from 'app/components/dropdown/dropdown';
import { RowBase } from 'app/components/table/table-data/table-data';
import { OperationType } from 'app/components/table/table-common';
import { getProductCode } from 'app/helpers/utils';

export interface IProductFormData {
  productInfo?: IProductDetail;
  listTax: IDropDownItem[];
  listCodeLevelOne: IDropDownItem[];
  listCodeLevelTwo: IDropDownItem[];
  listCodeLevelThree: IDropDownItem[];
  listCodeLevelFour: IDropDownItem[];
  productInfoDefault?: IProductDetail;
  disableConfirm?: boolean;
  errorDetail?: boolean;
  product_code?: string;
  isDirty?: boolean;
  errorItemCode?: string;
}

export interface ItemCode {
  record_id?: number;
  operation_type?: OperationType;
  item_code?: string;
}

export interface JANItem extends ItemCode {
  jan_code?: string;
  deleted?: boolean;
  item_code?: string;
}

export interface IProductDetail extends IProductUpdate, RowBase {
  tax_group_name: string;
  tax_rate: number;
  level_one: number;
  description_level_one: string;
  level_two: number;
  description_level_two: string;
  level_three: number;
  description_level_three: string;
  level_four: number;
  description_level_four: string;
  create_date: string;
  update_date: string;
  employee_update: string;
  apply_date?: string;
  children: JANItem[];
}

export type TKeyIProductDetail = keyof IProductDetail;

export interface INewProduct {
  selected_stores: string[];
  my_company_code: string;
  item_code: string;
  tax_group_code: string;
  code_level_one: string;
  code_level_two: string;
  code_level_three: string;
  code_level_four: string;
  unit_price: number | string;
  member_price: number | string;
  original_price?: number | string;
  product_name: string;
  receipt_name: string;
  kana_name?: string;
  is_item_manual_discount: number | string;
  is_sub_total_discount: number | string;
  membership_price_type: number | string;
  number_of_order: number | string;
  order_unit: string;
  number_of_unit: number | string;
  unit: string;
  standard_unit: number | string;
  storage_time: string;
  storage_unit: string;
  partner_code: string;
  standard_number?: number | string;
}

export interface IProductUpdate {
  record_id?: number;
  store_code: string;
  my_company_code: string;
  item_code: string;
  apply_date?: string;
  tax_group_code: string;
  code_level_one: string;
  code_level_two: string;
  code_level_three: string;
  code_level_four: string;
  unit_price: number;
  member_price: number;
  membership_price_type?: number;
  original_price: number;
  product_name: string;
  receipt_name: string;
  kana_name: string;
  children: JANItem[];
  number_of_order: number;
  order_unit: string;
  number_of_unit: number;
  unit: string;
  standard_unit: number;
  storage_time: string;
  storage_unit: string;
  partner_code: string;
  standard_number: number;
  is_item_manual_discount: number;
  is_sub_total_discount: number;
}

export const createDataProductUpdate = (data: IProductDetail) => {
  const listJanCode: ItemCode[] = data?.children
    ?.filter((item: JANItem) => (item.record_id && item.deleted) || (item.operation_type && !item.deleted))
    ?.map((item: JANItem) => ({
      record_id: item.record_id,
      item_code: item.jan_code,
      operation_type: item.operation_type ?? OperationType.Remove,
    }));

  const productUpdate: IProductUpdate = {
    record_id: data?.record_id,
    code_level_four: data?.code_level_four,
    code_level_one: data?.code_level_one,
    code_level_three: data?.code_level_three,
    code_level_two: data?.code_level_two,
    item_code: data?.item_code,
    kana_name: data?.kana_name,
    member_price: data?.member_price,
    my_company_code: `00000${data.code_level_one}${getProductCode(data?.my_company_code)}`,
    number_of_order: data?.number_of_order,
    number_of_unit: data?.number_of_unit,
    order_unit: data?.order_unit,
    original_price: data?.original_price,
    partner_code: data?.partner_code,
    product_name: data?.product_name,
    receipt_name: data?.receipt_name,
    unit_price: data?.unit_price,
    standard_unit: data?.standard_unit,
    storage_time: data?.storage_time,
    storage_unit: data?.storage_unit,
    store_code: data?.store_code,
    tax_group_code: data?.tax_group_code,
    unit: data?.unit,
    standard_number: data?.standard_number,
    children: listJanCode,
    is_item_manual_discount: data?.is_item_manual_discount,
    is_sub_total_discount: data?.is_sub_total_discount,
    membership_price_type: data?.membership_price_type,
    apply_date: data?.apply_date
  };
  return productUpdate;
};

export const keyIProductDetails: TKeyIProductDetail[] = [
  'tax_group_code',
  'tax_rate',
  'code_level_one',
  'code_level_two',
  'code_level_three',
  'code_level_four',
  'unit_price',
  'member_price',
  'original_price',
  'product_name',
  'receipt_name',
  'kana_name',
  'is_item_manual_discount',
  'is_sub_total_discount',
  'membership_price_type',
  'number_of_order',
  'order_unit',
  'number_of_unit',
  'unit',
  'standard_unit',
  'storage_time',
  'storage_unit',
  'partner_code',
  'standard_number',
];

export const defaultProductDetail: IProductFormData = {
  productInfo: null,
  listTax: [],
  listCodeLevelOne: [],
  listCodeLevelTwo: [],
  listCodeLevelThree: [],
  listCodeLevelFour: [],
  productInfoDefault: null,
  disableConfirm: true,
  product_code: null,
  isDirty: null,
  errorItemCode: null
};
