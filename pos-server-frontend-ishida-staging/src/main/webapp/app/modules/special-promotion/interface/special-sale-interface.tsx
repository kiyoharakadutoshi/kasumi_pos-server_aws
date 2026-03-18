import React from 'react';
import { TBodyBase, TSortType } from 'app/components/table/table-data/interface-table';
import { convertDateServer, getNextDate } from 'app/helpers/date-utils';
import { IDropDownItem } from 'app/components/dropdown/dropdown';

export type TStatus = '0' | '1';
export type TTimeService = '0' | '1';

export enum DiscountMethodCode {
  Percent = '02',
  Amount = '03',
}

export const promotionStatus: IDropDownItem[] = [
  { value: '0', name: 'specialPromotion.inProgress', code: '0' },
  { value: '1', name: 'specialPromotion.canceled', code: '1' },
];

export const timeServiceStatus: IDropDownItem[] = [
  { value: '0', name: 'specialPromotion.normal', code: '0' },
  { value: '1', name: 'specialPromotion.timeService', code: '1' },
];

export type SpecialPromotionKey = keyof ISpecialPromotion;

export const keyPromotionsCheck: SpecialPromotionKey[] = [
  'status',
  'my_company_code',
  'item_code',
  'special_price',
  'discount_value',
  'type_code',
  'start_date',
  'end_date',
  'start_time',
  'end_time',
];

export interface ISpecialPromotion extends TBodyBase {
  company_code?: number;
  store_code: string;
  valid: number;
  status: TStatus;
  my_company_code: string;
  item_code: string;
  item_name: string;
  discount_method_code: string;
  discount_value: number;
  special_price: string;
  unit_price: number;
  current_price: number;
  type_code: TTimeService;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  checkbox?: boolean;
}

export interface ISpecialPromotionError {
  status?: string;
  my_company_code?: string;
  item_code?: string;
  discount_value?: number;
  special_price?: string;
  type_code?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
}

export interface ISearchPromotionView {
  isStandardPrice: boolean;
  setIsStandardPrice: React.Dispatch<React.SetStateAction<boolean>>;
  isPercentPrice: boolean;
  setIsPercentPrice: React.Dispatch<React.SetStateAction<boolean>>;
  enabledPLU: boolean;
  editPromotion?: boolean;
  storeCode?: string;
}

export interface IApplyPromotionView {
  enabledPLU: boolean;
  setEnabledPLU: React.Dispatch<React.SetStateAction<boolean>>;
  isPercentPrice: boolean;
}

export interface IApplyPromotionState extends IApplyTimeService {
  discount_rate?: string;
  status: TStatus;
}

export interface IApplyTimeService {
  type_code: TTimeService;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
}

export interface ISpecialPromotionSearchState {
  promotion_code?: string;
  md_hierarchy_code1?: string;
  sort_column: keyof ISpecialPromotion;
  sort_value: TSortType;
}

export interface ISpecialPromotionSearch extends ISpecialPromotionSearchState {
  selected_store: string;
  discount_method_code?: string;
  item_code?: string;
  page_number?: number;
  limit?: number;
}

export interface ISearchSpecialPromotionHandle {
  getSpecialPromotions: (
    pagingAction?: 'next' | 'prev' | 'first' | 'last',
    sortColumn?: keyof ISpecialPromotion,
    sortValue?: TSortType,
  ) => void;
  suggestPromotion?: (code: string, storeCode?: string) => void;
}

export const addPromotions = (existItemCount?: number, store_code?: string, company_code?: number) => {
  return Array.from({ length: 11 - (existItemCount ?? 0) }, () => ({
    company_code,
    store_code,
    valid: null,
    status: null,
    my_company_code: null,
    item_code: null,
    item_name: null,
    discount_method_code: null,
    discount_value: null,
    special_price: null,
    unit_price: null,
    current_price: null,
    unit_member_price: null,
    type_code: null,
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    operation_type: null,
  }));
};

export const initSpecialPromotion = (store_code?: string) => ({
  company_code: null,
  store_code,
  valid: null,
  status: null,
  my_company_code: null,
  item_code: null,
  item_name: null,
  discount_method_code: null,
  discount_value: null,
  special_price: null,
  unit_price: null,
  current_price: null,
  unit_member_price: null,
  type_code: null,
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  operation_type: null,
});

export const promotionValid = {
  0: '実施中',
  1: '終了',
  2: '未実施',
  3: '中止',
  4: 'NG',
  5: '新規',
  6: '変更'
};

const nextDate = getNextDate(new Date());

export const applyPromotionInit = (startTime: string, endTime: string) => {
  const data: IApplyPromotionState = {
    status: '0',
    start_date: convertDateServer(new Date()),
    end_date: convertDateServer(nextDate),
    start_time: startTime ?? '07:00',
    end_time: endTime ?? '02:00',
    discount_rate: '',
    type_code: '0',
  };
  return data;
};

export const promotionInit = { items: addPromotions(), total_item: 0, total_page: 0, current_page: null };
