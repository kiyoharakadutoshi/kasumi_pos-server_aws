import {createSlice, isRejected, PayloadAction} from '@reduxjs/toolkit';
import {IPaymentMachine} from 'app/modules/setting-master/add-cash-register-type/add-cash-register-type-interface';
import {getPaymentMachineType} from 'app/services/payment-machine-service';
import { OperationType } from 'app/components/table/table-common';

export interface IPaymentMachineState {
  payment_Machine: IPaymentMachine[];
  no_data_payment: boolean;
  default_payment_machine: IPaymentMachine[];
  is_err_code: boolean;
}

const initialState: IPaymentMachineState = {
  payment_Machine: [],
  no_data_payment: false,
  default_payment_machine: [],
  is_err_code: null
};

export type PaymentMachineSlice = Readonly<typeof initialState>;

export const PaymentMachineSlice = createSlice({
  name: 'payment-machine',
  initialState,
  reducers: {
    handleClickDelete(state, action: PayloadAction<IPaymentMachine>) {
      const index = state.payment_Machine.findIndex(payment => payment.no === action.payload.no);
      if (index !== -1) {
        const currentOperationType = state.payment_Machine[index].operation_type;
        const currentBeforeType = state.payment_Machine[index].operation_type_before;
        state.payment_Machine[index].operation_type =
          currentOperationType === OperationType.Remove ? currentBeforeType || null : OperationType.Remove;
      }
    },

    setErrCode(state, action) {
      state.is_err_code = action.payload;
    },

    handleClickUpdate(state, action: PayloadAction<IPaymentMachine>) {
      const index = state.payment_Machine.findIndex(payment => payment?.no === action.payload?.no);
      if (index !== -1) {
        if (state.payment_Machine[index].name !== action.payload.name || state.payment_Machine[index].code !== action.payload.code) {
          state.payment_Machine[index] = action.payload;
        }
      }
    },
    handleClickCreate(state, action) {
      state.payment_Machine.push(action.payload);
    },
    clearDataPaymentMachine(state) {
      state.payment_Machine = [];
      state.no_data_payment = false;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(getPaymentMachineType.fulfilled, (state, action) => {
        const paymentMachineList = action.payload.data.data;
        const paymentListNo: IPaymentMachine[] = paymentMachineList?.map((item, index) => ({
          ...item,
          no: index + 1
        }));

        state.payment_Machine = paymentListNo;
        state.default_payment_machine = paymentListNo;
        state.no_data_payment = paymentListNo?.length === 0;
      })
      .addMatcher(isRejected(getPaymentMachineType), (state) => {
        state.no_data_payment = true
      })
  },
});

export const { handleClickUpdate, clearDataPaymentMachine, setErrCode} = PaymentMachineSlice.actions;

export default PaymentMachineSlice.reducer;
