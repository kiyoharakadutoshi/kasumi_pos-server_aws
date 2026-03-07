import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { serializeAxiosError } from 'app/reducers/reducer.utils';

export interface PresetLayoutState {
  loading: boolean;
  errorMessage: string;

}
const initialState: PresetLayoutState = {
  loading: false,
  errorMessage: '',
}


export interface ModalEditMachines {
  storeName: number,
  code:string,
  TypeCode: number,
  TypeNode:number,
  buttonLayoutCode:number,
  functionLayoutCode:number,
  keyboardLayoutCode:number,
  receiptMessageCode:number,
  ipAddress:string,
  macAddress:string,
  paymentTypeCode:number,
  startupTime:string,
  customerCountExcluded: boolean,
  morningDiscountExcluded: boolean,
  megaDiscountExcluded: boolean,
  posModel:string,
  cashMachineModel:string,
  ScannerModel:string,
  updateDate:string,
  updateEmployee:string,
  node1:string,
  node2:string,
  node3:string,
}


export type ApplicationPresetState = Readonly<typeof initialState>;

export const modalEditPaymentManchine = createAsyncThunk(
  'modalEdit/cash-registers',
  async (params: ModalEditMachines) => {
    try {
      const response = await axios.get<any>('cash-registers', {
        params: params
      });
      return response.data;
    } catch (error) {
      throw serializeAxiosError(error);
    }
  },
  {
    serializeError: serializeAxiosError,
  },
);

export const ApplicationPresetState = createSlice({
  name: 'applicationEmployeeSetting',
  initialState: initialState as ApplicationPresetState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(modalEditPaymentManchine.fulfilled, (state, action) => {

      });
  },
});
export default ApplicationPresetState.reducer;
