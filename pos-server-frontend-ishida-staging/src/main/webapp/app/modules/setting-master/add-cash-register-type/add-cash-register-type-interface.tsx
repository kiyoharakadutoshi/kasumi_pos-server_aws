import { OperationType } from 'app/components/table/table-common';

export interface IPaymentMachine {
  record_id: string;
  no: number;
  code: string;
  name: string;
  operation_type?: OperationType;
  operation_type_before?: OperationType;
}
