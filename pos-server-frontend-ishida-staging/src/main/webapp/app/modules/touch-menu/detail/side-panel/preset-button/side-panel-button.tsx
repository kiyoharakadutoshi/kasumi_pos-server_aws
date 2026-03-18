import React, { useEffect, useMemo, useState } from 'react';
import 'app/modules/touch-menu/detail/preset.scss';
import ColorPanel from '../color-panel';
import { ImageItem, SizeInput } from './input';
import SizePanelCategory from './side-panel-category';
import SizeFunction from './side-function';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { BUTTON_PRESET_REMOVE_CLASS, colorButtons, PresetMenuButton, TabSide, TabType } from '../../interface-preset';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import { GROUP_CODE_CATEGORIES, GROUP_CODE_FUNCTIONS, GROUP_CODE_PRODUCTS } from 'app/constants/constants';
import { translate } from 'react-jhipster';
import SizePanelProduct from './side-panel-product';
import { validateButtonSize as validateButtonSize, validateCategory, validatePresetButton, validateProduct } from './validate';
import {
  PresetImage,
  PresetState,
  removePresetButton,
  setButtonAmount,
  setButtonColorStyle,
  setButtonColumnSpan as setButtonColumnSpan,
  setButtonDescription,
  setButtonImage,
  setButtonRowSpan,
  setButtonSettingData,
  setButtonStatus,
  setEventGroupCode,
  updatePresetButton,
} from '../../reducer/preset-reducer';
import ModalPresetImage from '../../../modal/modal-preset-images/preset-images';
import { NOT_FOUND_DATA } from 'app/constants/api-constants';
import { getPresetImages } from 'app/services/preset-service';
import { OperationType } from 'app/components/table/table-common';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import CheckboxButton from 'app/components/checkbox-button/checkbox-button';
import { elementChangeKeyListener } from 'app/hooks/keyboard-hook';

const tabs: TabSide[] = [
  { name: 'detailMenu.buttonTab.product', values: GROUP_CODE_PRODUCTS, type: TabType.Product },
  { name: 'detailMenu.buttonTab.function', values: GROUP_CODE_FUNCTIONS, type: TabType.Function },
  { name: 'detailMenu.buttonTab.category', values: GROUP_CODE_CATEGORIES, type: TabType.CategoryProduct },
];

const colorHexs = colorButtons.map(color => color.color);

const SidePanelButton = () => {
  const dispatch = useAppDispatch();
  const preset: PresetState = useAppSelector(state => state.presetReducer);
  const presetMenuButton: PresetMenuButton = useAppSelector(state => state.presetReducer.presetButton);
  const presetButtons: PresetMenuButton[] = useAppSelector(state => state.presetReducer.presetMenu.preset_menu_button).filter(
    (item: PresetMenuButton) => item.operation_type !== OperationType.Remove,
  );
  const presetImages: PresetImage[] = useAppSelector(state => state.presetReducer.presetImages);
  const errorMessageProduct: string = useAppSelector(state => state.productReducer.errorMessage);
  const errorMessageCategory: string = useAppSelector(state => state.hierarchyLevelReducer.errorMessage);
  const [displayStatus, setDisplayStatus] = useState<number>(presetMenuButton?.display_status ?? 1);
  const [pluCode, setPLUCode] = useState<string>('');
  const [descriptionProduct, setDescriptionProduct] = useState<string>('');

  const [categoryCode, setCategoryCode] = useState<string>('');
  const [descriptionCategory, setDescriptionCategory] = useState<string>('');

  const [functionCode, setFunctionCode] = useState<string>('');
  const [descriptionFunction, setDescriptionFunction] = useState<string>('');

  const getSelectTab = useMemo(() => {
    if (isNullOrEmpty(presetMenuButton?.event_group_code)) {
      return tabs[0];
    }
    const tab = tabs.find(item => item.values.includes(presetMenuButton?.event_group_code));
    if (tab) {
      return tab;
    }
    return tabs[1];
  }, [presetMenuButton.event_group_code]);

  const [selectedTab, setSelectedTab] = useState<TabSide | null>(getSelectTab);

  const selectedColor = useMemo(() => {
    let color = colorButtons.find(item => item.type === presetMenuButton?.style_key);
    if (!color) {
      color = colorButtons[0];
      dispatch(setButtonColorStyle(color.type));
    }
    return color;
  }, [presetMenuButton?.style_key]);

  const [showModalImage, setShowModalImage] = useState(false);

  elementChangeKeyListener(selectedTab);

  const descriptionOption = useMemo(() => {
    switch (selectedTab?.type) {
      case TabType.CategoryProduct:
        return descriptionCategory;
      case TabType.Function:
        return descriptionFunction;
      default:
        return descriptionProduct;
    }
  }, [descriptionCategory, descriptionFunction, descriptionProduct, selectedTab?.type, preset.presetButton.description, preset.presetButton.setting_data]);

  const handleChangeDescription = (value: string) => {
    switch (selectedTab?.type) {
      case TabType.CategoryProduct:
        setDescriptionCategory(value);
        break;
      case TabType.Function:
        setDescriptionFunction(value);
        break;
      default:
        setDescriptionProduct(value);
        break;
    }
  };

  useEffect(() => {
    const tab = getSelectTab;
    setSelectedTab(tab);
    setDisplayStatus(presetMenuButton?.display_status ?? 1);
    setFunctionCode('');
    setPLUCode('');
    setDescriptionProduct('');
    setDescriptionCategory('');
    setDescriptionFunction('');
    setCategoryCode('');
    switch (tab.type) {
      case TabType.CategoryProduct:
        setDescriptionCategory(presetMenuButton?.description);
        setCategoryCode(presetMenuButton?.setting_data);
        break;
      case TabType.Function:
        setDescriptionFunction(presetMenuButton?.description);
        setFunctionCode(presetMenuButton?.setting_data);
        break;
      default:
        setDescriptionProduct(presetMenuButton?.description);
        setPLUCode(presetMenuButton?.setting_data);
        break;
    }
  }, [presetMenuButton?.button_column_number, presetMenuButton?.button_row_number, presetMenuButton?.description, preset.presetButton.description]);

  useEffect(() => {
    if (errorMessageProduct === NOT_FOUND_DATA || preset.errorMessage === NOT_FOUND_DATA) {
      setDescriptionProduct(translate('MSG_ERR_001'));
    }
  }, [errorMessageProduct, preset.errorMessage]);

  useEffect(() => {
    if (errorMessageCategory === NOT_FOUND_DATA) {
      setDescriptionCategory(translate('MSG_ERR_001'));
    }
  }, [errorMessageCategory]);

  const handleSearchImages = () => {
    dispatch(getPresetImages({ type: 0, selected_store: [presetMenuButton.store_code] }))
      .unwrap()
      .then(res => {
        if (res.data.data?.length > 0) {
          setShowModalImage(true);
        }
      })
      .catch(() => { });
  };

  const handleClosePresetImages = (presetImage?: PresetImage) => {
    setShowModalImage(false);
    presetImage && dispatch(setButtonImage(presetImage.image_url));
  };

  const removeButton = () => {
    dispatch(removePresetButton());
  };

  const handleConfirm = () => {
    switch (selectedTab?.type) {
      case TabType.Function:
        dispatch(setButtonSettingData(functionCode));
        dispatch(setButtonDescription(descriptionFunction));
        break;
      case TabType.CategoryProduct:
        if (validateCategory(categoryCode, isNullOrEmpty(errorMessageCategory), dispatch)) {
          dispatch(setButtonSettingData(categoryCode));
          dispatch(setButtonDescription(descriptionCategory));
          break;
        }
        return;
      default:
        if (validateProduct(preset.presetButton.product, pluCode, isNullOrEmpty(errorMessageProduct), dispatch)) {
          dispatch(setButtonSettingData(pluCode));
          dispatch(setButtonDescription(descriptionProduct));
          break;
        }
        return;
    }

    if (!validatePresetButton(descriptionOption, presetMenuButton?.style_key, dispatch)) {
      return;
    }

    if (!validateButtonSize(presetMenuButton, presetButtons, dispatch)) {
      return;
    }
    dispatch(setButtonStatus(displayStatus));
    dispatch(setEventGroupCode(selectedTab));
    dispatch(updatePresetButton());
    clearDataApply();
  };

  const clearDataApply = () => {
    switch (selectedTab.type) {
      case TabType.CategoryProduct:
        setPLUCode('');
        setDescriptionProduct('');
        setFunctionCode('');
        setDescriptionFunction('');
        break;
      case TabType.Function:
        setPLUCode('');
        setDescriptionProduct('');
        setCategoryCode('');
        dispatch(setButtonAmount(''));
        setDescriptionCategory('');
        break;
      default:
        setFunctionCode('');
        setDescriptionFunction('');
        setCategoryCode('');
        dispatch(setButtonAmount(''));
        setDescriptionCategory('');
        break;
    }
  };

  const disableButton = () => {
    return presetMenuButton.display_status === 0;
  };

  const handleChangeTab = (tab: TabSide) => {
    if (disableButton()) return;
    setSelectedTab(tab);
  };

  const onKeydownTab = (event: React.KeyboardEvent<HTMLDivElement>, tab: TabSide) => {
    if (event.key === ' ') {
      event.stopPropagation();
      event.preventDefault();
      handleChangeTab(tab);
    }
  };

  const clearDescriptionProduct = () => {
    setDescriptionProduct('');
  }

  return (
    <div>
      {showModalImage && <ModalPresetImage presetImages={presetImages} closeModal={handleClosePresetImages} />}
      <div className={'side-panel'}>
        <div className={'title-side-panel'}>{localizeString('detailMenu.buttonTab.title')}</div>
        <div className={'body-side-panel'}>
          <span className="side-panel-item-name">{localizeString('detailMenu.buttonTab.name')}</span>
          <div className="grid-container">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className={`grid-item ${tab === selectedTab ? 'edit-tab' : 'normal-tab'}`}
                onClick={() => handleChangeTab(tab)}
                tabIndex={0}
                onKeyDown={(event) => onKeydownTab(event, tab)}
              >
                {localizeString(tab.name)}
              </div>
            ))}
          </div>
          <div className="body-edit-side">
            {selectedTab && (
              <>
                {selectedTab?.type === TabType.CategoryProduct ? (
                  <SizePanelCategory
                    category={categoryCode}
                    onChangeCategory={setCategoryCode}
                    onChangeDescription={setDescriptionCategory}
                  />
                ) : selectedTab?.type === TabType.Function ? (
                  <SizeFunction functionCode={functionCode} onChangeFunctionCode={setFunctionCode} />
                ) : (
                  <SizePanelProduct
                    onChangePLU={(value) => {
                      if (isNullOrEmpty(value)) {
                        return;
                      }
                      setPLUCode(value);
                    }}
                    plu={pluCode}
                    productButton={presetMenuButton.product}
                    onChangeDescription={(value) => {
                      setDescriptionProduct(value);
                    }}
                    handleOnBlurPLU={clearDescriptionProduct}
                  />
                )}
              </>
            )}
            <div className=" flex disable-preset">
              <span className="side-panel-item-name">{localizeString('detailMenu.buttonTab.buttonName')}</span>
              <CheckboxButton
                textValue={localizeString('detailMenu.buttonTab.disableButton')}
                checked={displayStatus === 0}
                onChange={() => setDisplayStatus(displayStatus === 1 ? 0 : 1)}
              />
            </div>
            <InputTextCustom
              widthInput={'100%'}
              value={descriptionOption}
              onChange={(value: any) => handleChangeDescription(value.target.value)}
              maxLength={50}
              datatype="description"
              disabled={disableButton()}
              hasTrim
            />
            <ColorPanel
              title="detailMenu.buttonTab.buttonColor"
              value={selectedColor?.color}
              colors={colorHexs}
              onChange={(_, index) => dispatch(setButtonColorStyle(colorButtons[index].type))}
              disabled={disableButton()}
            />
            <span className="side-panel-item-name">ボタンサイズ</span>
            <div className="flex size-button">
              <SizeInput
                title="detailMenu.buttonTab.height"
                value={presetMenuButton?.button_row_span}
                defaultValue={1}
                onChange={(value) => dispatch(setButtonRowSpan(value))}
                maxLength={1}
                maxValue={5}
                minValue={1}
                disabled={disableButton()}
                classNameSizeInput={'size-input-item'}
              />
              <SizeInput
                title="detailMenu.buttonTab.width"
                value={presetMenuButton?.button_column_span}
                defaultValue={1}
                onChange={(value) => dispatch(setButtonColumnSpan(value))}
                maxValue={10}
                minValue={1}
                disabled={disableButton()}
                classNameSizeInput={'size-input-item'}
              />
            </div>
            <ImageItem title="detailMenu.buttonTab.image" src={presetMenuButton?.style_info} />

            <div className={'flex footer-edit-button'}>
              <div className="button-normal">
                <ButtonPrimary
                  widthBtn="90px"
                  text="detailMenu.buttonTab.reference"
                  onClick={handleSearchImages}
                  disabled={disableButton()}
                />
              </div>
              <div className="button-normal">
                <ButtonPrimary className={BUTTON_PRESET_REMOVE_CLASS} widthBtn="90px" text="detailMenu.buttonTab.remove" onClick={removeButton} />
              </div>
              <div className="button-normal">
                <ButtonPrimary widthBtn="90px" text="detailMenu.apply" onClick={handleConfirm} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SidePanelButton;
