
export enum BusinessTypeEnum {
  BreakingNew,
  DailyNew,
}

export const TYPE_OPTION_LIST: IRadioButtonBusinessType[] = [
  {
    name: 'checkTimeCashRegister.radio.breakingNew',
    type: BusinessTypeEnum.BreakingNew,
  },
  {
    name: 'checkTimeCashRegister.radio.dailyNew',
    type: BusinessTypeEnum.DailyNew,
  },
];

export interface IRadioButtonBusinessType {
  name: string;
  type: BusinessTypeEnum;
}

export type Period = {
  selected_store: string;
  business_type: string;
  start_period: string;
  end_period: string;
};
