import { createSlice, isRejected } from '@reduxjs/toolkit';
import { getMasters } from 'app/services/master-service';

export interface MasterState {
  errorMessage: string;
  masters?: IMasterCode[];
}

export interface ItemMasterCode {
  event_group_code: string;
  event_group_name: string;
  setting_data_type: string;
  code_value_extend: number;
}

export interface IMasterCode {
  master_code: string;
  items: ItemMasterCode[];
}

const initialState: MasterState = {
  errorMessage: null,
  masters: null,
};

const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getMasters.fulfilled, (state, action) => {
        state.masters = action.payload.data.data;
        state.errorMessage = null;
      })
      .addMatcher(isRejected(getMasters), (state, action) => {
        state.errorMessage = action.error.message;
      });
  },
});

export default masterSlice.reducer;
