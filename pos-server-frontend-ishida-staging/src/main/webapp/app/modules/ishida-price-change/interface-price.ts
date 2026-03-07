import { IProductIshida } from '@/services/ishida-price-service';

export interface IPriceChange extends IProductIshida {
  group_code: string;
  product_code: string;
  new_price: number | null;
  success: boolean;
}

export interface IPriceState {
  prices: IPriceChange[];
  isDirtyConfirm: boolean;
}
