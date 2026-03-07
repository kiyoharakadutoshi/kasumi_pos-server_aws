import { IStoreInfo } from "app/reducers/store-reducer";
import { getDataWithParam, ResponseApi } from "./base-service";

interface StoreResponse extends ResponseApi {
  data: {
    items: IStoreInfo[]
  }
}

export const getListStore = getDataWithParam<null, StoreResponse>('users/stores')
