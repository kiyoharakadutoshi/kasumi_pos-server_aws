import {OperationType} from 'app/modules/setting-master/enum-setting';

export interface IPaymentMachine {
  record_id: string;
  no: number;
  code: number;
  name: string;
  operation_type?: OperationType;
  operation_type_before?: OperationType;
}
