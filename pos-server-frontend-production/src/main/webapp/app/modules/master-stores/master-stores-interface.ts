import { TBodyBase } from 'app/components/table/table-common';
import { IPagingResponseApi } from 'app/services/base-service';

export interface IMasterStores extends TBodyBase {
  record_id?: number;
  code?: string;
  name?: string;
  short_name?: string;
  post_code?: string;
  address?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  phone_number?: string;
  start_hours?: string;
  end_hours?: string;
  business_type_code?: string;
  default_point?: number;
  total_pos?: number;
  operation_type?: number;
  operation_type_before?: number;
}

export interface MasterStoreSearchCondition {
  code?: string;
  code_filter_type?: number;
  name?: string;
  name_filter_type?: number;
  store_type?: number;
}
export interface MasterStoreSaveCondition {
  operation_type: number;
  operation_type_before?: number;
  code: string;
  name: string;
  short_name: string;
  post_code?: string;
  address?: string;
  address1?: string;
  address2: string;
  address3: string;
  phone_number?: string;
  start_hours?: string;
  end_hours?: string;
  business_type_code?: string;
  default_point?: number;
  total_pos?: number;
  record_id?: number;
  copy?: boolean;
}

export interface MasterStoreState {
  masterStoresList?: IMasterStores[];
  saveDataSuccess?: boolean;
  masterStoreSearchCondition?: MasterStoreSearchCondition;
  masterStoreSaveCondition?: MasterStoreSaveCondition;
  masterStoreSelected?: any;
  noData?: boolean;
  total_count?: number;
  isExisted?: boolean;
}
export interface IMasterStoresResponse extends IPagingResponseApi {
  store_list: IMasterStores[];
}
export interface IDataMasterStoresResponse {
  data: IMasterStoresResponse;
}

export const masterStoreSearchConditionInit: MasterStoreSearchCondition = {
  code: '',
  code_filter_type: 0,
  name: '',
  name_filter_type: 0,
  store_type: null,
};

export const masterStoreSaveConditionInit: MasterStoreSaveCondition = {
  operation_type: 1,
  operation_type_before: 0,
  code: null,
  name: null,
  short_name: null,
  post_code: null,
  address1: null,
  address2: null,
  address3: null,
  phone_number: null,
  start_hours: '09:00',
  end_hours: '22:00',
  business_type_code: null,
  default_point: null,
  total_pos: null,
  copy: false,
};
