import { IPriceChange, IPriceState } from '@/modules/ishida-price-change/interface-price';

export const priceDefault: IPriceChange = {
  company_code: '100',
  group_code: '',
  product_code: '',
  new_price: null,
  current_price: null,
  item_code: '',
  item_name: '',
  my_company_code: '',
  store_code: null,
  success: false,
};

export const priceDataDefault: IPriceState = {
  prices: Array.from({ length: 10 }, () => priceDefault),
  isDirtyConfirm: false,
};
