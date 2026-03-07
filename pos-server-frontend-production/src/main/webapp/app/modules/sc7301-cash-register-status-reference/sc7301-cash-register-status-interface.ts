import { IDropDownItem } from 'app/components/dropdown/dropdown';

export const cashRegisterStatusReferenceItems: IDropDownItem[] = [
  { value: null, name: 'cashRegisterStatus.all' },
  { value: 0, name: 'cashRegisterStatus.notStarted' },
  { value: 1, name: 'cashRegisterStatus.alreadyStarted' },
  { value: 2, name: 'cashRegisterStatus.reflected' },
];

export const cashRegisterStatusItems: IDropDownItem[] = [
  { value: null, name: 'cashRegisterStatus.all' },
  { value: 0, name: 'cashRegisterStatus.inactiveStatus' },
  { value: 1, name: 'cashRegisterStatus.unopenedStatus' },
  { value: 2, name: 'cashRegisterStatus.unpaidStatus' },
  { value: 3, name: 'cashRegisterStatus.settledStatus' },
];

export const equipmentFailureItems: IDropDownItem[] = [
  { value: null, name: 'cashRegisterStatus.all' },
  { value: 0, name: 'cashRegisterStatus.none' },
  { value: 1, name: 'cashRegisterStatus.error' },
];

export const cashRegisterStatusReference = {
  0: 'cashRegisterStatus.notStarted',
  1: 'cashRegisterStatus.alreadyStarted',
  2: 'cashRegisterStatus.reflected',
};

export const cashRegisterStatusOption = {
  0: 'cashRegisterStatus.inactiveStatus',
  1: 'cashRegisterStatus.unopenedStatus',
  2: 'cashRegisterStatus.unpaidStatus',
  3: 'cashRegisterStatus.settledStatus',
};

export const equipmentFailure = {
  0: 'cashRegisterStatus.none',
  1: 'cashRegisterStatus.error',
};
