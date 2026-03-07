import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface MenuState {
  page: number;
}

const initialState: MenuState = {
  page: 1
};


const menuSlice = createSlice({
  name: 'menu-screen',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
  },

});

export const { setPage } = menuSlice.actions;

export default menuSlice.reducer;
