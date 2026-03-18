import { IMasterCode } from "app/reducers/master-reducer";
import { getDataWithMethodPost, ResponseApi } from "./base-service";

export interface IMasterCodeResponse extends ResponseApi {
  data: IMasterCode[];
}

export const getMasters = getDataWithMethodPost<{ master_code: string[] }, IMasterCodeResponse>('code-master')
