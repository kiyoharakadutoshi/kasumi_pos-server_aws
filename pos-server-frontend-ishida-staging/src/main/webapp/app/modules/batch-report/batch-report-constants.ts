import { IBatchReportState } from '@/modules/batch-report/batch-report-interface';
import { convertDateServer } from '@/helpers/date-utils';
import { BatchReportSearchType } from '@/modules/batch-report/batch-report-types';

export const batchReportState: IBatchReportState = {
  type: BatchReportSearchType.New,
  startDate: convertDateServer(new Date()),
  endDate: convertDateServer(new Date()),
  records: [],
  currentPage: 1,
  totalPage: 0,
  totalItem: 0,
  hasNoData: false,
};

export const recordType = {
  1: 'batchReport.import',
  0: 'batchReport.export',
};
