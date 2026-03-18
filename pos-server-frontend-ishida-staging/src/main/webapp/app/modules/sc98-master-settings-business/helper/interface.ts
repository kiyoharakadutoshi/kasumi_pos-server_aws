import { RowBase } from '@/components/table/table-data/table-data';
import { IDropDownItem } from '@/components/dropdown/dropdown';

export interface IMasterSettingsBusiness extends RowBase {
  businessDateFisrt?: string;
  businessDayWeekFirst?: string;
  businessDayFirst?: number;
  businessDateSecond?: string;
  businessDayWeekSecond?: string;
  businessDaySecond?: number;
  businessDateThird?: string;
  businessDayWeekThird?: string;
  businessDayThird?: number;
}

export interface MasterSettingsBusinessInterface {
  dataBusinessDay: IMasterSettingsBusiness[];
  dataBusinessDayDefault: IMasterSettingsBusiness[];
  businessDayStatus: IDropDownItem[];
  businessDateFilter: string;
  disableClear: boolean;
  disableConfirm: boolean;
  selectedStore: number;
  isSidebarExpand: boolean;
}

export type TKeyIMasterSettingsBusiness = keyof IMasterSettingsBusiness;

export const keyIMasterSettingsBusiness: TKeyIMasterSettingsBusiness[] = [
  'businessDayFirst',
  'businessDaySecond',
  'businessDayThird'
]