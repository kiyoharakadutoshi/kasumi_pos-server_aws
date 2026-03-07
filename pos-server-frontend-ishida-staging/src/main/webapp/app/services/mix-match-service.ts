import { deleteData, getDataWithParam, postData } from './base-service';

export interface IMixMatchOptionSettings {
  type_one: number;
  type_two: number;
  type_three: number;
}

export interface IGenerateMixMatchCodeResponse {
  data: {
    store_code: string;
    promotion_code: string;
    mix_match_code: string;
    settings: IMixMatchOptionSettings;
  };
}

export interface IGenerateMixMatchCodeRequest {
  selected_store: string;
  promotion_code: string;
}

export interface IMixMatchDetailRequest {
  selected_store: string;
  promotion_code?: string;
  mix_match_code: string;
  item_code?: string;
}

export interface MixMatchDetailOption {
  quantity: number;
  price: number;
}

interface MaxMatchDetailProducts {
  my_company_code: string;
  plu_code: string;
  name: string;
  standard_price: number;
  current_price: number;
  status: number;
  valid: number;
}

export interface IMixMatchDetailResponse {
  data: {
    record_id: number;
    company_code: number;
    store_code: string;
    promotion_code: string;
    code: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    time_service: number;
    type: string;
    status: number;
    options: MixMatchDetailOption[];
    products: MaxMatchDetailProducts[];
    settings: {
      type_one: number;
      type_two: number;
      type_three: number;
    };
  };
}

interface ProductUpdateMixMatch {
  plu_code: string;
  status: number;
  category_code: string;
}

export interface IUpdateMixMatch {
  store_code: string;
  promotion_code: string;
  code: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  time_service: number;
  type: string;
  status: number;
  option: MixMatchDetailOption[];
  product: ProductUpdateMixMatch[];
}

export interface IMixMatchsDeleteParam {
  selected_store: string;
  mix_match_code: string;
}

/**
 * AP0501: Get Mix Match Detail
 */
export const getMixMatchDetail = getDataWithParam<IMixMatchDetailRequest, IMixMatchDetailResponse>(
  'combinations/detail'
);
// AP0502
export const getGeneratingMixMatchCode = getDataWithParam<IGenerateMixMatchCodeRequest, IGenerateMixMatchCodeResponse>(
  'combinations/generate-code'
);
/**
 * AP0503: Delete mix-Match
 */
export const deleteMixMatch = deleteData<IMixMatchsDeleteParam>('combinations/delete');
/**
 * AP0504: Update mix-Match
 */
export const postUpdateMixMatch = postData<IUpdateMixMatch>('combinations/maintenance');

