import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { serializeAxiosError } from 'app/reducers/reducer.utils';
import { postCashRegister } from 'app/services/setting-master-service';

export interface PresetLayoutState {
  loading: boolean;
  errorMessage: string;
  cashRegister?: cashRegister;
}
const initialState = {
  search_name: '',
  loading: false,
  errorMessage: '',
  cashRegister: null,
};

export type ApplicationPresetState = Readonly<typeof initialState>;

interface cashRegister {
  operation_type: number;
  record_id?: number;
  code: string;
  name: string;
}

export const ApplicationPresetState = createSlice({
  name: 'applicationEmployeeSetting',
  initialState: initialState as ApplicationPresetState,
  reducers: {},
  extraReducers(builder) {
    builder
      // .addCase(postEmployeeList.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.errorMessage = null;
      // })
      .addCase(postCashRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.cashRegister = action.payload.data;
        state.errorMessage = null;
      });
  },
});

export default ApplicationPresetState.reducer;
