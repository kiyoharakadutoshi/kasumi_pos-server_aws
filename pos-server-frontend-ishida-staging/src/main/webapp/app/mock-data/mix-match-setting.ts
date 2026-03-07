
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
