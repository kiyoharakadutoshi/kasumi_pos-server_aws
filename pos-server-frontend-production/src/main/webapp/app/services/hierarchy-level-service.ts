import { getDataWithParam, ResponseApi } from './base-service';
import { TBodyBase } from 'app/components/table/table-common';

export interface IHierarchyLevelAPI extends ResponseApi {
  data: IHierarchyLevel;
}

export interface IHierarchyLevel {
  items: IHierarchyLevelInfo[];
  total_count: number;
}

export interface HierachyLevelParam {
  store_code: string;
  code_level_one?: string;
  code_level_two?: string;
  code_level_three?: string;
  code_level_four?: string;
}

export type TKeyHierachyLevelParam = keyof HierachyLevelParam;

export interface IProductHierarchyLevel extends ResponseApi {
  data: IHierarchyLevelInfo;
}

export interface IHierarchyLevelInfo extends TBodyBase {
  code_level_one: string;
  level_one: number;
  description_level_one: string;
  apply_date_level_one: string;
  code_level_two?: string;
  level_two?: number;
  description_level_two?: string;
  apply_date_level_two?: string;
  code_level_three?: string;
  level_three?: number;
  description_level_three?: string;
  apply_date_level_three?: string;
  code_level_four?: string;
  level_four?: number;
  description_level_four?: string;
  apply_date_level_four?: string;
}

export const getHierarchyLevel = getDataWithParam<
  {
    store_code?: string;
    level?: number;
    filter_name?: string;
    filter_code?: string;
    limit?: number;
  },
  IHierarchyLevelAPI
>(`hierarchy-level`);

export const getDetailHierachyLevel = getDataWithParam<HierachyLevelParam, IProductHierarchyLevel>('product/hierarchy-level');
