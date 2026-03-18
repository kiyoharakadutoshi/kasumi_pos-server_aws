import { getDataWithParam, postData } from '@/services/base-service';

export interface IDepositWithdrawParams {
  type: number;
  name: string;
  name_type: number;
}

export interface IDepositWithdrawResponse {
  data: {
    items: {
      record_id: number;
      deposit_withdrawal_code: string;
      deposit_withdrawal_name: string;
      deposit_withdrawal_type: number;
    }[];
  };
}

export interface IMaintenanceBody {
  deposit_withdrawals: {
    operation_type: number;
    deposit_withdrawal_code: string;
    deposit_withdrawal_name?: string;
    deposit_withdrawal_type: number;
  }[];
}

export const getDepositWithdraw = getDataWithParam<IDepositWithdrawParams, IDepositWithdrawResponse>(
  'deposit-withdrawal'
);

export const depositWithdrawMaintenance = postData<IMaintenanceBody>('deposit-withdrawal/maintenance');
