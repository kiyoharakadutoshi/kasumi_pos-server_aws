/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { IHeaderCondition, MasterCategoryFormData } from './master-category-interface';

enum Status {
  InProgress = 0,
  Completed = 1,
  NotStarted = 2,
  NG = 3,
}

export const StatusLabels: Record<Status, string> = {
  [Status.InProgress]: '実施中',
  [Status.Completed]: '終了',
  [Status.NotStarted]: '未実施',
  [Status.NG]: 'NG',
};

export const TIME_SERVICE = [
  {
    value: 0,
    code: '0',
    name: '通常',
  },
  {
    value: 1,
    code: '1',
    name: 'タイムサービス',
  },
];
// header condition default
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

export const headerConditionDefault: IHeaderCondition = {
  code_level_one: null,
  start_date_time: new Date(),
  end_date_time: tomorrow,
  time_service: 0,
  discountCash: '',
  discountPercent: '',
};

export const MasterCategoryDefault: MasterCategoryFormData = {
  listHierarchyLevel: null,
  listHierarchyLevelIsChecked: null,
  listDiscountCategory: null,
  itemDetailDiscount: null,
  headerCondition: headerConditionDefault,
  disableSearchCondition: true,
  selectedRows: null,
  selectedItemInModal: null,
  isShowTable: false,
  isShowTableDetail: false,
  disableConfirm: true,
  disabledClear: true,
  isResetExpanded: false,
};
