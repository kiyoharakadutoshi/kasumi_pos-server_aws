export interface MasterCompanyInterface {
  defaultForm?: IMasterCompany;
  valueForm: IMasterCompany;
  paymentMethods: IPaymentMethod[];
  isDirty?: boolean;
  disableConfirm?: boolean;
  isDirtyCheck?: boolean;
  keyErr?: string[];
}

export interface IPaymentMethod {
  paymentCode?: string;
  paymentName?: string;
}

export interface IMasterCompany {
  companyCode?: number;
  companyName: string;
  companyNameOfficial: string;
  companyNameOfficialShort: string;
  ageVerification: number;
  registrationNumber: string;
  paymentMethodStatus: boolean[];
}
