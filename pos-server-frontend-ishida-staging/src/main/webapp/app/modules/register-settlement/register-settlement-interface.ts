import { RowBase } from '@/components/table/table-data/table-data';
import { Row } from '@tanstack/react-table';
export interface FormTableDataBase<TRow extends RowBase> {
  selectedRows?: Row<TRow>[];
  showNoData?: boolean;
}

export interface RegisterSettlementInterface extends FormTableDataBase<IRegisterSettlement> {
  businessOpenDate: string;
  listData: IRegisterSettlement[];
  isFirstRender: boolean;
}

export interface IRegisterSettlement extends RowBase {
  record_id?: any;
  cash_register_code?: string;
  cash_register_name?: string;
  cash_register_status?: number;
  close_status?: number;
  current_cash?: number;
}
