import { BatchReportSearchType } from '@/modules/batch-report/batch-report-types';

export interface IBatchReportState {
  startDate: string;
  endDate: string;
  type: BatchReportSearchType;
  records: IBatchReport[];
  currentPage: number;
  totalPage: number;
  totalItem: number;
  hasNoData: boolean;
}

export interface IBatchReport {
  type: number | string;
  batch_id: string;
  start_date_time: string;
  end_date_time: string;
  duration: number;
  total_record: number;
  speed: number;
}

export interface IBatchReportSearchType {
  name: string;
  type: BatchReportSearchType;
}
