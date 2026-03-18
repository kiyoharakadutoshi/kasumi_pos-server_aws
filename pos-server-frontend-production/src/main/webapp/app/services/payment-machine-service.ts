import { getDataWithMethodPost, getDataWithParam, ResponseApi } from 'app/services/base-service';
import { IPaymentMachine } from 'app/modules/setting-master/add-cash-register-type/add-cash-register-type-interface';

export interface ListPaymentMachineTypeResponse extends ResponseApi {
  data: IPaymentMachine[];
}

/** API-7103 **/
export const getPaymentMachineType = getDataWithParam<{ type_name?: string }, ListPaymentMachineTypeResponse>(
  'cash-register-type',
  'add-cash-register-type',
);
/** API-7104 **/
export const postPaymentMachine = getDataWithMethodPost<{ cash_register_types: IPaymentMachine[] }>('cash-register-type/maintainance');
