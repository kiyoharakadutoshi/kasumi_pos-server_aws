import { BLUE_001440, BLUE_D0DBF3 } from 'app/constants/color';
import { dataDefaultDropdown, dataMessageDefault } from 'app/modules/setting-master/interface-setting';
import { INAGEYA_CODE, KASUMI_CODE } from 'app/constants/constants';

export const LIST_COMPANY = [
  {
    value: KASUMI_CODE,
    code: KASUMI_CODE,
    name: 'カスミ',
    mainColor: BLUE_001440,
    backgroundColor: BLUE_D0DBF3,
    settingMaster: null,
    employeeBarCode: '250000',
  },
  {
    value: INAGEYA_CODE,
    code: INAGEYA_CODE,
    name: 'いなげや',
    mainColor: BLUE_001440,
    backgroundColor: BLUE_D0DBF3,
    settingMaster: {
      functionLayout: dataDefaultDropdown,
      keyboardLayout: dataDefaultDropdown,
      receiptMessage: dataMessageDefault,
    },
    employeeBarCode: '1701',
  },
];

export const STORE_CODE_LENGTH_DEFAULT = 5;
export const STORE_CODE_KEYS = ['store_code', 'store_codes']
export const SELECTED_STORE_KEYS = ['selected_stores', 'selected_store', 'store_code']

export const COMPANY_STORE_CODE = {
  [KASUMI_CODE]: STORE_CODE_LENGTH_DEFAULT,
  [INAGEYA_CODE]: STORE_CODE_LENGTH_DEFAULT,
};
