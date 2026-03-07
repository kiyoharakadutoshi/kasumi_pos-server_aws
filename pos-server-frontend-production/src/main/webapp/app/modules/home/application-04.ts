import axios from 'axios';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { serializeAxiosError } from '../../reducers/reducer.utils';

const initialState = {
  selectedStore: '',
  itemCode: '',
  belongTo: 1,
};

export type ApplicationProfileState = Readonly<typeof initialState>;

export const postProduct = createAsyncThunk(
  'application-04/post_product',
  async (data: { selectedStore: string; itemCode: string; belongTo: number }) => {
    try {
      const response = await axios.post<any>('product/belong-to', data);
      return response.data;
    } catch (error) {
      throw serializeAxiosError(error);
    }
  },
  {
    serializeError: serializeAxiosError,
  },
);

export const ApplicationProfileSlice = createSlice({
  name: 'applicationProfile',
  initialState: initialState as ApplicationProfileState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(postProduct.fulfilled, (state, action) => {
      state.selectedStore = action.payload.selectedStore;
      state.itemCode = action.payload.itemCode;
      state.belongTo = action.payload.belongTo;
    });
  },
});

export default ApplicationProfileSlice.reducer;
