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
  code_level_two?: string;
  code_level_three?: string;
  code_level_four?: string;
  description: string;
  apply_date: string;
}

export interface HierachyLevelParentParam {
  parent_code?: string;
  parent_level?: string;
  target_level: string;
}

export interface IProductHierarchyLevelParent extends ResponseApi {
  data: {
    md_hierarchy_level: number;
    items: IProductHierarchyParent[];
  }
}

export interface IProductHierarchyParent extends ResponseApi {
  md_hierarchy_code: string;
  description: string;
}

export const getHierarchyLevel = getDataWithParam<
  {
    level?: number;
    filter_type?: number;
    filter_name?: string;
    filter_code?: string;
    limit?: number;
  },
  IHierarchyLevelAPI
>(`hierarchy-level`);

export const getHierachyLevelList = getDataWithParam<HierachyLevelParentParam, IProductHierarchyLevelParent>('product/hierarchies');
