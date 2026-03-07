import { IMasterCategory } from '@/modules/master-category/master-category-interface';
import { deleteData, getDataWithParam, postData } from './base-service';

export const getHierarchyList = getDataWithParam<
  {
    store_code?: string;
    level?: number;
    filter_name?: string;
    filter_code: string;
    limit?: number;
  },
  IMasterCategory
>(`hierarchy-level`);

export const getListDiscountCategory = getDataWithParam<
  {
    selected_store: string;
  },
  IMasterCategory
>(`discount-categories`);

export const getDetailDiscountCategory = getDataWithParam<
  {
    selected_store: string;
    record_id: number;
  },
  IMasterCategory
>(`discount-category/detail`);

export const deleteDiscountCategory = deleteData<
  {
    selected_store: string;
    discount_md_hierarchy_code: string;
    md_hierarchy_code: string;
    md_hierarchy_level: string;
    apply_date_time: string;
  },
  any
>(`discount-category`);

interface paramSaveDiscount {
  selected_store: string;
  discount_md_hierarchy_code?: string;
  md_hierarchy_code: string;
  md_hierarchy_level: number;
  apply_date_time: string;
  // data from header condition
  start_date_time: string;
  end_date_time: string;
  start_service_time: string;
  end_service_time: string;
  type_time_service: number;
  discount_type_code: string;
  discount_value: number;
}
export const saveDiscountCategory = postData<{
  discount_categories: paramSaveDiscount[];
}>(`discount-categories/maintenance`);
