import { CashReport } from 'app/services/cash-report-service';

interface TitleName {
  id: number;
  name: string;
  width?: string;
}

export interface Count {
  id: number;
  name: string;
}
export interface NormalTableProps {
  titleTable: TitleName[];
  dataCashReport: CashReport[];
  listCount: Count[];
}
