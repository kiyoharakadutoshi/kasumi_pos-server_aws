import { getDataWithParam, IBasePagingResponseApi } from '@/services/base-service';
import { IBatchReport } from '@/modules/batch-report/batch-report-interface';

export interface IBatchReportSearch {
  start_date: string;
  end_date: string;
  page: number;
  size: number;
  store_code: string;
}

export const getBatchReports = getDataWithParam<IBatchReportSearch, IBasePagingResponseApi<IBatchReport>>(
  'ishida/batch-report/search'
);
