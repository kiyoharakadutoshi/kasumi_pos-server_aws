import { IDropDownItem } from '@/components/dropdown/dropdown';
import { convertDateServer } from '@/helpers/date-utils';

export const ITEM_MANUAL_DISCOUNT_PROHIBITION_OPTIONS: IDropDownItem[] = [
  {
    name: 'マニュアル割引除外なし',
    value: 0,
    code: '0',
  },
  {
    name: 'マニュアル割引除外',
    value: 1,
    code: '1',
  },
];

export const SUBTOTAL_DISCOUNT_PROHIBITION_OPTIONS: IDropDownItem[] = [
  {
    name: '対象外',
    value: 0,
    code: '0',
  },
  {
    name: '対象',
    value: 1,
    code: '1',
  },
];

export const MEMBER_PRIDE_METHOD_TYPE_OPTIONS: IDropDownItem[] = [
  {
    name: '値引額',
    value: 1,
    code: '1',
  },
  {
    name: '%値引',
    value: 2,
    code: '2',
  },
  {
    name: '新売価',
    value: 6,
    code: '6',
  },
];

export const INPUT_NAME = {
  store_code: '',
  my_company_code: '商品コード',
  item_code: 'PLUコード',
  tax_group_code: '税種別コード',
  code_level_one: '部門',
  code_level_two: '品群',
  code_level_three: '品種',
  code_level_four: '分類',
  standard_price: '定番売価',
  member_price: '会员売価',
  original_price: '原価',
  product_name: '商品名称',
  receipt_name: 'レシート商品名称',
  kana_name: 'カナ名称',
  is_item_manual_discount: '単品値引き除外',
  is_sub_total_discount: '小計マニュアル値引き除外',
  membership_price_type:'会員価格方式',
  number_of_order: '発注入り数',
  order_unit: '発注単位',
  number_of_unit: 'ユニット数',
  unit: 'ユニット単位',
  standard_unit: '規格単位',
  storage_time: '保存期限',
  storage_unit: '保存単位',
  partner_code: '取引先コード',
}

export const PRODUCT_DETAIL = {
  children: [],
  code_level_four: '',
  code_level_one: '',
  code_level_three: '',
  code_level_two: '',
  create_date: convertDateServer(new Date()),
  description_level_four: '',
  description_level_one: '',
  description_level_three: '',
  description_level_two: '',
  employee_update: '',
  is_item_manual_discount: 0,
  is_sub_total_discount: 0,
  item_code: '',
  kana_name: '',
  level_four: 4,
  level_one: 1,
  level_three: 3,
  level_two: 2,
  member_price: null,
  my_company_code: '',
  number_of_order: null,
  number_of_unit: null,
  order_unit: '',
  original_price: null,
  partner_code: '',
  product_name: '',
  receipt_name: '',
  standard_number: null,
  unit_price: null,
  standard_unit: null,
  storage_time: '',
  storage_unit: null,
  store_code: '',
  tax_group_code: null,
  tax_group_name: null,
  tax_rate: null,
  unit: null,
  update_date: '',
  created_by:''
}
