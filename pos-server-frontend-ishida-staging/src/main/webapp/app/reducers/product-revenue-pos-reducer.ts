import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ProductRevenuePOS,
  IProductRevenuePosSearchState,
  FormDataRevenue,
  ModalProductListResponseItems,
} from 'app/modules/sc3201-product-revenue-pos/product-revenue-pos-interface';
import { TSortType } from 'app/components/table/table-data/interface-table';
import { convertDateServer } from 'app/helpers/date-utils';
import { IDropDownItem } from '@/components/dropdown/dropdown';

interface RevenuePos {
  key: keyof ProductRevenuePOS | null;
  value: TSortType | null;
  searchState: IProductRevenuePosSearchState;
  formData: FormDataRevenue;
  storeMachineCodeOptions: IDropDownItem[];
}

const emptyClassification: IDropDownItem[] = [];

const DEFAULT_VALUE: FormDataRevenue = {
  businessType: 0,
  startDate: convertDateServer(new Date()),
  endDate: convertDateServer(new Date()),
  displayedItemCount: null,
  storeMachineCode: null,
  outputUnit: 0,
  classification: null,
  pluCode: '',
  productName: '',
  tableData: [],
};

const initialState: RevenuePos = {
  key: null,
  value: null,
  searchState: { sort_column: null, sort_value: 'DESC' },
  formData: DEFAULT_VALUE,
  storeMachineCodeOptions: emptyClassification,
};

const ProductRevenuePosSlice = createSlice({
  name: 'productRevenuePos',
  initialState,
  reducers: {
    setFormData(state, action: PayloadAction<FormDataRevenue>) {
      state.formData = action.payload;
    },
    setStoreMachineCodeOptionsReducer(state, action: PayloadAction<IDropDownItem[]>) {
      state.storeMachineCodeOptions = action.payload;
    },
    setSort(state, action: PayloadAction<{ key: keyof ModalProductListResponseItems; value: TSortType }>) {
      state.searchState.sort_value = action.payload.value;
      state.searchState.sort_column = action.payload.key;
    },
    clearFormDataRevenue(state) {
      state.formData = initialState.formData;
      state.storeMachineCodeOptions = emptyClassification;
      state.searchState = initialState.searchState;
    },
  },
});

export const { setSort, setFormData, setStoreMachineCodeOptionsReducer, clearFormDataRevenue } =
  ProductRevenuePosSlice.actions;
export default ProductRevenuePosSlice.reducer;
