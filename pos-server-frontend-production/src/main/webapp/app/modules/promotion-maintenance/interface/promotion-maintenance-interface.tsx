import { RowBase } from '@/components/table/table-data/table-data';
import { FormTableDataBase } from 'app/components/table/table-data/interface-table';

export interface IPromotionMaintenance extends RowBase {
  id_delete_flag: boolean;
  promotion_code: any;
  promotion_name: string;
  promotion_name_default: string;
  promotion_cate: string;
  start_date: string;
  start_date_default: string;
  end_date: string;
  end_date_default: string;
  start_time: string;
  start_time_default: string;
  end_time: string;
  end_time_default: string;
  record_idx: number;
}

export interface IPromotionMaintenanceList extends FormTableDataBase<IPromotionMaintenance> {
  disableConfirm: boolean;
  promotionCode: string;
  totalItem: number;
  totalPage: number;
  currentPage: number;
  dataList: IPromotionMaintenance[];
  isDirty?: boolean;
  disabledClear?: boolean;
}
