import { RowBase } from 'app/components/table/table-data/table-data';
import { IProduct } from 'app/services/product-service';
import { FormTableDataBase } from 'app/components/table/table-data/interface-table';

interface ProductManagementFormData extends FormTableDataBase<IMixMatchSpecialPrice> {
  product: IProduct;
  mixMatchs?: IMixMatchSpecialPrice[];
  recordSelected?: IMixMatchSpecialPrice;
  product_code: string;
  group_code: string;
  item_code: string;
}

export type MixMatchsType = '01' | '02' | '03';

export type TKeyProductManagement = keyof ProductManagementFormData;

export interface ISpecialPriceInfo {
  special_price: number;
  discount_value?: number;
}

export interface ICombinationOption {
  quantity: number;
  price: number;
  one_price?: number;
}

export interface IMixMatchSpecialPrice extends RowBase {
  store_code: string;
  promotion_code: string;
  start_date_time: string;
  end_date_time: string;
  status: number;
  code?: string;
  type?: MixMatchsType;
  combination_options?: ICombinationOption[];
  special_price_info?: ISpecialPriceInfo;
}

export const ProductManagementDefault: ProductManagementFormData = {
  product: {
    my_company_code: '',
    item_code: '',
    description: '',
    unit_price: null,
    current_price: null,
  },
  product_code: '',
  group_code: '',
  item_code: '',
  mixMatchs: [],
  recordSelected: null,
};
