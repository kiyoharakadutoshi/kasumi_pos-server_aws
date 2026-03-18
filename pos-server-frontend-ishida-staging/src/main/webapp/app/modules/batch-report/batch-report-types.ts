import { IBatchReportSearchType } from '@/modules/batch-report/batch-report-interface';

export enum BatchReportSearchType {
  New = '0',
  Daily = '1',
}

export const batchReportTypes: IBatchReportSearchType[] = [
  { name: 'detailCashRegisterReport.new', type: BatchReportSearchType.New },
  { name: 'detailCashRegisterReport.daily', type: BatchReportSearchType.Daily },
];
