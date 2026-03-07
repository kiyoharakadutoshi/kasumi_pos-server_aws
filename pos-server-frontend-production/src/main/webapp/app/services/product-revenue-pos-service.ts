import { getDataWithParam, ResponseApi, ResponseApiListExceed } from './base-service';
import {
  CashRegisterRevenue,
  CashRegisterRevenueResponseItems,
  ModalProductListResponseItems,
  ProductList,
} from 'app/modules/sc3201-product-revenue-pos/product-revenue-pos-interface';

export interface CashRegisterRevenueResponse {
  company_code: string;
  total_count: number;
  items: CashRegisterRevenueResponseItems[];
}

export interface CashMachineResponse extends ResponseApi {
  data: CashRegisterRevenueResponse;
}

export const getCashRegisterRevenue = getDataWithParam<CashRegisterRevenue, CashMachineResponse>(
  `report/sales/cash-register-revenue`
);

export const getProductList = getDataWithParam<ProductList, ResponseApiListExceed<ModalProductListResponseItems>>(`product`);
