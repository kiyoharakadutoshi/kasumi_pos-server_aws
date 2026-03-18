import { LanguageOption } from '@/constants/constants';
import { TBodyBase } from '@/components/table/table-common';
import { IPagingResponseApi } from '@/services/base-service';
import { ActionTypeButtonMasterStores } from './enum-master-stores';

export interface IMasterStoreRecord extends TBodyBase {
  record_id?: number;
  store_code?: string;
  name?: string;
  short_name?: string;
  post_code?: string;
  address?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  phone_number?: string;
  business_type_code?: string;
  total_pos?: number;
  operation_type?: number;
  operation_type_before?: number;
  payment_methods?: string[];
  copy?: boolean;
  tran_relay_flag?: number;
  code_pay_no_aeonpay?: string;
  code_pay_no_etc?: string;
  code_pay_no_aeongift?: string;
  business_day_mon?: BusinessDay;
  business_day_tue?: BusinessDay;
  business_day_wed?: BusinessDay;
  business_day_thu?: BusinessDay;
  business_day_fri?: BusinessDay;
  business_day_sat?: BusinessDay;
  business_day_sun?: BusinessDay;
}

export interface IMasterStoreSearchCondition {
  code?: string;
  code_filter_type?: number;
  name?: string;
  name_filter_type?: number;
  store_type?: number;
}
export interface MasterStoreExportCsvCondition extends IMasterStoreSearchCondition {
  language?: LanguageOption;
}

export interface MasterStoreSaveConditionParam {
  store_list: MasterStoreSaveCondition[];
}
export interface MasterStoreSaveCondition {
  operation_type: number;
  operation_type_before?: number;
  store_code: string;
  name: string;
  short_name: string;
  post_code?: string;
  address?: string;
  address1?: string;
  address2: string;
  address3: string;
  phone_number?: string;
  business_type_code?: string;
  payment_method?: boolean;
  total_pos?: number;
  record_id?: number;
  copy?: boolean;
  tran_relay_flag?: number;
}

export interface MasterStoreState {
  masterStoresList?: IMasterStoreRecord[];
  saveDataSuccess?: boolean;
  masterStoreSearchCondition?: IMasterStoreSearchCondition;
  masterStoreSaveCondition?: MasterStoreSaveCondition;
  masterStoreListDefault?: IMasterStoreRecord[];
  masterStoreSelected?: any;
  noData?: boolean;
  total_count?: number;
  isExisted?: boolean;
  modalAction?: ActionTypeButtonMasterStores;
  businessTypeName?: BusinessTypeName[];
}
export interface IMasterStoresResponse extends IPagingResponseApi {
  store_list: IMasterStoreRecord[];
  total_count: number;
}
export interface IDataMasterStoresResponse {
  data: IMasterStoresResponse;
}

export const masterStoreSearchConditionInit: IMasterStoreSearchCondition = {
  code: '',
  code_filter_type: 0,
  name: '',
  name_filter_type: 0,
  store_type: null,
};

export const masterStoreSaveConditionInit: MasterStoreSaveCondition = {
  operation_type: 1,
  operation_type_before: 0,
  store_code: null,
  name: null,
  short_name: null,
  post_code: null,
  address1: null,
  address2: null,
  address3: null,
  phone_number: null,
  business_type_code: null,
  total_pos: null,
  copy: false,
};

export interface IPaymentMethod {
  code_no: string;
  code_value: string;
}
export interface FormDataMasterStore {
  paymentMethod: IPaymentMethod[];
}
export interface BusinessDay {
  day?: string;
  business_day: any;
  business_open: string;
  business_close: string;
}

export interface FormDataBasicInfo {
  initialData: IMasterStoreRecord;
}
export interface FormDataBusinessHours {
  businessDays: BusinessDay[];
  businessDaysDefault?: BusinessDay[];
}

export interface PaymentMethod {
  code_value: string;
  code_no: string;
  checked?: boolean;
}
export interface FormDataPayment {
  paymentMethods: PaymentMethod[];
  code_pay_no_aeonpay?: string;
  code_pay_no_etc?: string;
  code_pay_no_aeongift?: string;
}

export interface PaymentMethodParam {
  payment_methods?: string[];
  code_pay_no_aeonpay?: string;
  code_pay_no_etc?: string;
  code_pay_no_aeongift?: string;
}

export interface BusinessTypeName {
  value: string;
  code: string;
  name: string;
}