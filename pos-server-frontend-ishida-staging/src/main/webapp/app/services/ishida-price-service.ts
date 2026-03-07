import { getDataWithParam, postData } from '@/services/base-service';

interface ISuggestedProductParam {
  selected_store: number;
  plu?: string;
  my_company_code?: string;
}

interface IProductResponse {
  data: IProductIshida;
}

export interface IProductIshida {
  company_code: string;
  store_code: string;
  item_code: string;
  item_name: string;
  my_company_code: string;
  current_price: number;
}

export interface IPricesIshidaMaintenance {
  company_code: string;
  store_code: string;
  prices: IPriceChangeIshida[];
}

export interface IPriceChangeIshida {
  item_code: string;
  current_price: number;
}

export const suggestProduct = getDataWithParam<ISuggestedProductParam, IProductResponse>(`ishida/product/suggest`);

export const addIshidaPrices = postData<IPricesIshidaMaintenance>(`ishida/product/change`);
