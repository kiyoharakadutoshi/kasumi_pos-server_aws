import { IBudgetList, SaveBudget } from '@/modules/budget-registration/budget-registration-interface';
import { getDataWithParam, postData, ResponseApi } from './base-service';

export interface IBudgetResponse extends ResponseApi {
  data?: IBudgetList;
}

export const getBudgetList = getDataWithParam<
  {
    selected_store?: string;
    apply_date?: string | Date;
    md_hierarchy_code?: string;
  },
  IBudgetResponse
>(`budgets`);

export const saveBudget = postData<SaveBudget>(`budgets`);
