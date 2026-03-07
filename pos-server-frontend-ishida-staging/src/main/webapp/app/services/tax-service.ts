import { getDataWithParam, ResponseApiListExceed } from 'app/services/base-service';

export interface ITaxParam {
  selected_store: string;
}

export interface ITaxProduct {
  code?: string;
  description?: string;
  rate?: number;
}

export const getListTaxProduct = getDataWithParam<ITaxParam, ResponseApiListExceed<ITaxProduct>>('tax');
