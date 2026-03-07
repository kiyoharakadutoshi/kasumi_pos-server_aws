import React, { useEffect } from 'react';
import '../preset.scss';
import ColorPanel from 'app/modules/touch-menu/detail/side-panel/color-panel';
import { colorPresets, PresetMenu } from 'app/modules/touch-menu/detail/interface-preset';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import {
  removePreset,
  setCashMachine,
  setCheckHidden,
  setCustomerScreen,
  setPresetDescription,
  setSelectedColor,
  updatePreset,
} from '../reducer/preset-reducer';
import { localizeString } from 'app/helpers/utils';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import CheckboxButton from 'app/components/checkbox-button/checkbox-button';

const listColorHex = colorPresets?.map(color => color.color);

const SidePanel = () => {
  const dispatch = useAppDispatch();
  const presetReducer = useAppSelector(state => state.presetReducer);
  const presetMenu: PresetMenu = presetReducer.presetMenu;
  const indexPresetMenu: number = presetReducer.indexPresetMenu;
  const hiddenTab = presetReducer.checkHidden;
  const selectColor = presetReducer?.selectColor;

  useEffect(() => {
    dispatch(setCheckHidden(presetMenu?.is_hidden ?? false));
    dispatch(setSelectedColor(colorPresets?.find(item => item.type === presetMenu?.style_key) ?? colorPresets[0]))
  }, [indexPresetMenu]);

  const handleSubmit = () => {
    dispatch(updatePreset({ ...presetMenu, style_key: selectColor.type, is_hidden: hiddenTab }));
  };

  return (
    <div style={{ width: '400px' }}>
      {presetMenu && (
        <div className={'side-panel'}>
          <div className={'title-side-panel'}>{localizeString('detailMenu.presetTab.title')}</div>
          <div className={'body-side-panel'}>
            <div className={'text-area-side-panel'}>
              <div className='side-panel-item-name'>{localizeString('detailMenu.presetTab.name')}</div>
              <InputTextCustom
                widthInput={'100%'}
                value={presetMenu.description ?? ""}
                maxLength={50}
                onChange={(e: any) => dispatch(setPresetDescription(e.target.value))}
                hasTrim
                disabled={presetMenu?.is_hidden}
                autoFocus={true}
                name='preset-description'
              />
            </div>
            <ColorPanel
              title="detailMenu.presetTab.color"
              colors={listColorHex}
              onChange={(_, index) => dispatch(setSelectedColor(colorPresets[index]))}
              value={selectColor?.color}
              disabled={presetMenu?.is_hidden}
            />

            <div className={'check-box-side-panel'}>
              <div className='side-panel-item-name'>{localizeString('detailMenu.presetTab.settingTitle')}</div>
              <div className={'check-box-button-side-panel'}>
                <CheckboxButton
                  id={'check-box-button-empty-preset'}
                  textValue={localizeString('detailMenu.presetTab.empty')}
                  checked={hiddenTab}
                  onChange={() => dispatch(setCheckHidden(!hiddenTab))}
                />
              </div>
              <div className={'check-box-button-side-panel'}>
                <CheckboxButton
                  id={'check-box-button-cash-machine-preset'}
                  textValue={localizeString('detailMenu.presetTab.cashMachineDisplay')}
                  disabled={presetMenu?.is_hidden}
                  checked={presetMenu?.is_display_on_cash_machine}
                  onChange={() => dispatch(setCashMachine(!presetMenu?.is_display_on_cash_machine))}
                />
              </div>
              <div className={'check-box-button-side-panel'}>
                <CheckboxButton
                  id={'check-box-button-customer-preset'}
                  textValue={localizeString('detailMenu.presetTab.customerDisplay')}
                  checked={presetMenu?.is_display_on_customer_screen}
                  disabled={!presetMenu?.is_display_on_cash_machine || presetMenu?.is_hidden}
                  onChange={() => dispatch(setCustomerScreen(!presetMenu?.is_display_on_customer_screen))}
                />
              </div>
            </div>
            <div className={'button-side-panel'}>
              <div className="button-normal">
                <ButtonPrimary widthBtn={'100px'} text="detailMenu.buttonTab.remove" onClick={() => dispatch(removePreset())} />
              </div>
              <div className="button-normal">
                <ButtonPrimary widthBtn={'100px'} text="detailMenu.apply" onClick={handleSubmit} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidePanel;
