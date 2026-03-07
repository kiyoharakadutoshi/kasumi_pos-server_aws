import { IHeaderCondition, SaleReportInterface } from './sales-report-interface';

export const OUTPUT_UNITS = [
  {
    value: 0,
    code: '1',
    name: '部門',
  },
  {
    value: 1,
    code: '2',
    name: '品群',
  },
  {
    value: 2,
    code: '3',
    name: '品種',
  },
  {
    value: 3,
    code: '4',
    name: '分類',
  },
];

export const reportTypeData = [
  {
    id: 0,
    value: 0,
    name: '速報',
  },
  {
    id: 1,
    value: 1,
    name: '日報',
  },
];

export const defaultHeaderCondition: IHeaderCondition = {
  start_date: new Date(),
  end_date: new Date(),
  output_type: 0,
  md_hierarchy_level: 0,
};

export const defaultSaleReport: SaleReportInterface = {
  dataReportList: null,
  headerCondition: defaultHeaderCondition,
  isGroupTable: true,
  disableButtonUpperLevel: false,
  disableButtonLowerLevel: false,
  preHierarchyCode: [],
  report_type: 0,
  isDateError: false,
  parent_code: null,
  parent_name: null,
};
