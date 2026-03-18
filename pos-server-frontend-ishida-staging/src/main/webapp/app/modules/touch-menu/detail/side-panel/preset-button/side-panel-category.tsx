import React, { useState } from 'react';
import 'app/modules/touch-menu/detail/preset.scss';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { PresetMenuButton } from '../../interface-preset';
import { MAX_LENGTH_PRICE } from 'app/constants/constants';
import { setButtonAmount } from '../../reducer/preset-reducer';
import { clearHierarchyLevel, clearHierarchyMessageError } from 'app/reducers/hierarchy-level-reducer';
import ModalListCategoryProduct from 'app/shared/category-product/category-product';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import lodash from 'lodash';
import { getHierarchyLevel, IHierarchyLevelInfo } from 'app/services/hierarchy-level-service';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { isInageyaHook } from 'app/hooks/hook-utils';

const SizePanelCategory = ({
  category,
  onChangeCategory,
  onChangeDescription,
}: {
  category: string;
  onChangeCategory: (value: string) => void;
  onChangeDescription: (value: string) => void;
}) => {
  const dispatch = useAppDispatch();
  const isInageya = isInageyaHook();
  const presetButton: PresetMenuButton = useAppSelector((state) => state.presetReducer.presetButton);
  const [showModalCategory, setShowModalCategory] = useState(false);

  const suggestCategory = (value?: string) => {
    if (!isNullOrEmpty(value) && value !== undefined) {
      dispatch(clearHierarchyMessageError());
      dispatch(getHierarchyLevel({
        level: isInageya ? 2 : 3,
        filter_type:2,
        filter_code: value,
      }))
        .unwrap()
        .then((response) => {
          const hierarchyLevel = response.data?.data?.items;
          if (hierarchyLevel?.length > 0) {
            onChangeDescription(hierarchyLevel[0].description);
          }
        })
        .catch(() => {});
    }
  };

  const disableButton = () => {
    return presetButton.display_status === 0;
  };

  const finishSearchCategory = (data?: IHierarchyLevelInfo) => {
    setShowModalCategory(false);
    if (data) {
      onChangeCategory(isInageya ? data.code_level_two : data.code_level_three);
      onChangeDescription(data.description?? '');
      dispatch(clearHierarchyMessageError());
    }
    dispatch(clearHierarchyLevel());
  };

  return (
    <>
      <div className="container-side-panel-category">
        <ModalListCategoryProduct
          showModal={showModalCategory}
          store_code={presetButton?.store_code}
          closeModal={finishSearchCategory}
        />
        <span className="side-panel-item-name">{localizeString('detailMenu.buttonTab.categoryCode')}</span>
        <div className="flex search-category">
          <InputTextCustom
            width="100%"
            value={category}
            maxLength={10}
            onChange={(e: any) => onChangeCategory(e.target.value)}
            onBlur={() => suggestCategory(category)}
            datatype="setting_data"
            disabled={disableButton()}
            type={'number'}
          />
          <div className="button-normal">
            <ButtonPrimary
              disabled={disableButton()}
              onClick={() => setShowModalCategory(true)}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 14">
                  <g id="menu" transform="translate(1 1)">
                    <line
                      id="Line_283"
                      data-name="Line 283"
                      x2="18"
                      transform="translate(0 6)"
                      fill="none"
                      stroke="#fff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <line
                      id="Line_284"
                      data-name="Line 284"
                      x2="18"
                      fill="none"
                      stroke="#fff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <line
                      id="Line_285"
                      data-name="Line 285"
                      x2="18"
                      transform="translate(0 12)"
                      fill="none"
                      stroke="#fff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
              }
            />
          </div>
        </div>
      </div>
      <div>
        <span className="side-panel-item-name">{localizeString('detailMenu.buttonTab.amount')}</span>
        <InputTextCustom
          width="100%"
          maxLength={MAX_LENGTH_PRICE}
          value={lodash.toString(presetButton?.amount)}
          onChange={(e: any) => dispatch(setButtonAmount(parseInt(e.taget?.value, 10)))}
          datatype="amount"
          disabled={true}
          type="number"
        />
      </div>
    </>
  );
};

export default SizePanelCategory;
