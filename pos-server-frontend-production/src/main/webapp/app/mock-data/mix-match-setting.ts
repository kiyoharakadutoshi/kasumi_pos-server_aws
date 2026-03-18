import { ISpecialPromotion } from 'app/modules/special-promotion/interface/special-sale-interface';

export const mixMatch: ISpecialPromotion[] = Array.from({ length: 10 }, (_, index) => ({
  record_id: index,
  company_code: `COMP${index + 1}`,
  store_code: `STORE${index + 1}`,
  valid: 3,
  status: '0',
  my_company_code: `0110230${index % 10}`,
  item_code: `000000000000${index % 10}`,
  item_name: `あいうえおかきくけこさしすせそたちつてとなにぬねの`,
  discount_method_code: `DM${index + 1}`,
  discount_value: index * 5,
  special_price: '100,000',
  unit_price: 120000 - index * 15,
  current_price: 110000 - index * 12,
  unit_member_price: 105000 - index * 8,
  type_code: '1',
  start_date: `2024/10/31`,
  end_date: `2024/12/010`,
  start_time: '02:00',
  end_time: '03:00'
}));

export const mixMatch2: ISpecialPromotion[] = Array.from({ length: 10 }, (_, index) => ({
  record_id: index,
  company_code: `COMP${index + 1}`,
  store_code: `STORE${index + 1}`,
  valid: 3,
  status: '1',
  my_company_code: `01${index % 10}`,
  item_code: `0000000${index % 10} あいうえおかき`,
  item_name: `2024/10/31 07:00`,
  discount_method_code: `DM${index + 1}`,
  discount_value: index * 5,
  special_price: '2024/10/31 07:00',
  unit_price: 120000 - index * 15,
  current_price: 10000,
  unit_member_price: 105000 - index * 8,
  type_code: '1',
  start_date: `2024/10/31`,
  end_date: `2024/12/010`,
  start_time: '02:00',
  end_time: '03:00'
}));

export const addItem = (query: any) => {
  return [{
    record_id: 1,
    company_code: query?.company_code,
    store_code: query?.store_code,
    valid: query?.valid,
    status: query?.status,
    my_company_code: query?.my_company_code,
    item_code: query?.item_code,
    item_name: query?.description,
    discount_method_code: null,
    discount_value: query?.discount_value,
    special_price: query?.special_price,
    unit_price: query?.unit_price,
    current_price: query?.current_price,
    unit_member_price: null,
    type_code: null,
    start_date: `2024/10/31`,
    end_date: `2024/12/010`,
    start_time: '02:00',
    end_time: '03:00'
  }].concat(Array.from({ length: 9 }, (_, index) => ({
    record_id: index,
    company_code: null,
    store_code: null,
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
    start_date: null,
    end_date: null,
    start_time: null,
    end_time: null
  })));
};
