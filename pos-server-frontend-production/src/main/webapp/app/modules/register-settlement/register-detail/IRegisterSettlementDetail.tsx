import { RowBase } from 'app/components/table/table-data/table-data';
import { Row } from '@tanstack/react-table';

export interface FormTableDataBase<TRow extends RowBase> {
  selectedRows?: Row<TRow>[];
  showNoData?: boolean;
}

export interface RegisterDetailInterFace extends FormTableDataBase<IRegisterSettlementDetail> {
  listRegisterDetailDefault?: {
    table1: IRegisterSettlementDetail[];
    table2: IRegisterSettlementDetail[];
  };
  listRegisterDetail?: {
    table1: IRegisterSettlementDetail[];
    table2: IRegisterSettlementDetail[];
  };

  isDirtyCheck: boolean;
  disableConfirm?: boolean;
  isDisableDataTable: boolean;
}

export interface IRegisterSettlementDetail extends RowBase {
  record_id?: any;
  item_name?: string;
  before_correction?: any;
  after_correction?: any;
  disable?: boolean;
  format?: string;
  isChildren?: boolean;
}

// remember delete when set up base success
export interface IRegisterSettlementData extends RowBase {
  item_name?: string;
  before_correction?: any;
  after_correction?: any;
  disable?: boolean;
  format?: 'plus' | 'negative' | '';
}
