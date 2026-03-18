import { PresetSearch, ListPresetLayout, IPresetCreateValue, IPresetCopyValue } from 'app/modules/touch-menu/menu-preset/interface-preset';
import { ListPresetMenu } from 'app/modules/touch-menu/detail/interface-preset';
import { PresetImage } from 'app/modules/touch-menu/detail/reducer/preset-reducer';
import { getDataWithMethodPost, getDataWithParam, postData, ResponseApi } from './base-service';

export interface ListPresetLayoutResponse extends ResponseApi {
  data: ListPresetLayout;
}

export interface ListPresetMenuResponse extends ResponseApi {
  data: ListPresetMenu;
}

export interface ListPresetMenuResponse extends ResponseApi {
  data: ListPresetMenu;
}

export const getListPresetLayout = getDataWithParam<PresetSearch, ListPresetLayoutResponse>('presets');
export const getDetailPreset = getDataWithParam<
  {
    store_code: string;
    preset_layout_code: string;
    apply_date: string;
    preset_layout_name: string;
  },
  ListPresetMenuResponse
>('presets/detail');
export const savePresets = postData<ListPresetMenu>('preset/maintenance');
export const saveListPresets = postData<ListPresetMenu>('preset/maintenance/list');
export const getPresetImages = getDataWithParam<{ type: number; selected_store: string[] }, {data: PresetImage[]}>('preset-images');
export const copyPreset = postData<IPresetCopyValue>('preset/copy');
export const checkExistPresetLayout = getDataWithMethodPost<IPresetCreateValue, any>('presets/check-exist');
export const generateCode = getDataWithParam<{ target_stores: string[] }>('preset/generate-code');
