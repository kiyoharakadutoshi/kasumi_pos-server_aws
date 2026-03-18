import { getDataWithParam, postData } from '@/services/base-service';

export interface IMasterCompanyServiceResponse {
  data: {
    company_code: number;
    company_name: string;
    company_name_official: string;
    company_name_official_short: string;
    age_verification_ptn: number;
    registration_number: string;
    payment_ids?: string[];
  };
}

export interface IUpdateCompanyInfoRequest {
  company_name?: string;
  company_name_official?: string;
  company_name_official_short?: string;
  age_verification_ptn?: number;
  registration_number?: string;
  payment_ids?: string[];
}

export const getCompanyInfo = getDataWithParam<null, IMasterCompanyServiceResponse>('company');

export const updateCompanyInfo = postData<IUpdateCompanyInfoRequest>('company/update');
