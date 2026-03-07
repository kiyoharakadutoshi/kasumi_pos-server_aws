import { IMasterCompany, MasterCompanyInterface } from './interface';

const MASTER_COMPANY_DEFAULT: IMasterCompany = {
  companyCode: null,
  companyName: '',
  companyNameOfficial: '',
  companyNameOfficialShort: '',
  ageVerification: 2,
  registrationNumber: '',
  paymentMethodStatus: [],
};

export const MASTER_COMPANY_VALUE_FORM: MasterCompanyInterface = {
  valueForm: MASTER_COMPANY_DEFAULT,
  paymentMethods: [],
  keyErr: [],
};

export const AGE_VERIFICATION_OPTIONS = [
  {
    id: 2,
    value: 2,
    name: '2段階',
  },
  {
    id: 3,
    value: 3,
    name: '3段階',
  },
];
