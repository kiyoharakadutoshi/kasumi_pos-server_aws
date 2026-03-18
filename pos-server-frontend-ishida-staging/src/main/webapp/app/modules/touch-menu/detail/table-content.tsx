import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import './preset.scss';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import {
  colorButtons,
  colorPresets,
  initPreMenuButton,
  IPositionButton,
  PresetMenu,
  PresetMenuButton,
} from '@/modules/touch-menu/detail/interface-preset';
import { useAppDispatch, useAppSelector } from '@/config/store';
import {
  addPreset,
  dragPreset,
  PresetState,
  selectButton,
  selectPreset,
  setButtonDescription,
  setErrorMessage,
  setPresetButtonProduct,
} from './reducer/preset-reducer';
import {
  GROUP_CODE_PRODUCTS,
  MAX_MENU_BUTTON_COLUMN,
  MAX_MENU_BUTTON_ROW,
  MAX_PRESET_TAB,
} from '@/constants/constants';
import {
  convertQueryStringToObject,
  getGroupCode,
  getProductCode,
  isNullOrEmpty,
  localizeString,
} from '@/helpers/utils';
import { useLocation } from 'react-router';
import { convertDateServer } from '@/helpers/date-utils';
import { OperationType } from '@/components/table/table-common';
import { PresetLayout } from '@/modules/touch-menu/menu-preset/interface-preset';
import PopoverText from '@/components/popover/popover';
import { NOT_FOUND_CODE, NOT_FOUND_DATA } from '@/constants/api-constants';
import { formatNumberWithCommas } from '@/helpers/number-utils';
import { productPresetInfo } from '@/services/product-service';

const TableContent = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isClicked = useRef(false);

  const presetReducer: PresetState = useAppSelector((state) => state.presetReducer);
  const [positionButtons, setPositionButtons] = useState<IPositionButton[]>([]);
  const presetDetail: PresetLayout = convertQueryStringToObject(location.search);

  const presetButtons = useMemo(
    () =>
      presetReducer.presetMenu?.preset_menu_button?.filter((button) => button.operation_type !== OperationType.Remove),
    [presetReducer.presetMenu]
  );

  const presetMenus = useMemo(
    () =>
      presetReducer.presets
        .map((preset, index) => ({
          ...preset,
          index,
        }))
        .filter((preset) => preset.operation_type !== OperationType.Remove && preset.page_number),
    [presetReducer.presets]
  );

  const handleAddTab = () => {
    if (presetReducer?.presets?.length > 0) {
      const addDefaultData = {
        operation_type: 1,
        record_id: null,
        store_code: presetDetail?.store_code,
        preset_layout_code: presetDetail?.preset_layout_code,
        preset_layout_name: presetReducer?.presets[0].preset_layout_name,
        booking_date: presetDetail?.booking_date,
        page_number: presetReducer.presets?.length + 1,
        description: localizeString('detailMenu.presetTab.newTab'),
        button_column_count: MAX_MENU_BUTTON_COLUMN,
        button_row_count: MAX_MENU_BUTTON_ROW,
        style_key: 'PresetRadioButtonLeftStyle1',
        preset_menu_button: [],
        is_hidden: false,
        is_display_on_cash_machine: false,
        is_display_on_customer_screen: false,
      };
      dispatch(addPreset(addDefaultData));
    }
  };

  useLayoutEffect(() => {
    if (presetReducer?.presetMenu) {
      createPositionButtons();
    } else {
      setPositionButtons([]);
    }
  }, [presetReducer?.presetMenu]);

  const onDragEnd = (result: DropResult) => {
    if (result?.source?.index >= 0 && result?.destination?.index >= 0) {
      result.source.index = presetMenus[result.source.index].index;
      result.destination.index = presetMenus[result.destination.index].index;
      dispatch(dragPreset(result));
    }
  };

  /**
   * Create position button when data change
   */
  const createPositionButtons = () => {
    const occupied = new Set<string>();
    const buttonMap = new Map<string, PresetMenuButton>();

    /**
     * Get list of positions occupied by buttons
     * The occupied button will be placed in that button's position
     */
    presetButtons?.forEach((button) => {
      const rowStart = button.button_row_number;
      const rowEnd = rowStart + button.button_row_span;
      const colStart = button.button_column_number;
      const colEnd = colStart + button.button_column_span;

      // Create position
      for (let i = rowStart; i < rowEnd; i++) {
        for (let j = colStart; j < colEnd; j++) {
          const key = `${i},${j}`;
          occupied.add(key);
        }
      }

      // Set button for position
      const originKey = `${button.button_row_number},${button.button_column_number}`;
      buttonMap.set(originKey, button);
    });

    const newPositionsButtons: IPositionButton[] = [];

    /**
     * Get list of empty positions
     * Occupied button will be added to that button's position
     */
    for (let y = 1; y <= MAX_MENU_BUTTON_ROW; y++) {
      for (let x = 1; x <= MAX_MENU_BUTTON_COLUMN; x++) {
        const key = `${y},${x}`;

        // Add empty position
        if (!occupied.has(key)) {
          newPositionsButtons.push({ x, y });
          continue;
        }

        // Add button
        if (buttonMap.has(key)) {
          newPositionsButtons.push({
            x,
            y,
            button: buttonMap.get(key),
          });
        }
      }
    }

    setPositionButtons(newPositionsButtons);
  };

  const getSuggestingProductionAsync = async (item: PresetMenuButton) => {
    await dispatch(
      productPresetInfo({
        code: String(item.setting_data),
      })
    )
      .unwrap()
      .then((response_) => {
        const response = response_.data.data;

        dispatch(
          selectButton({
            ...item,
            product: {
              ...item.product,
              item_code: response.item_code,
              item_info_group_code: getGroupCode(response.my_company_code),
              item_product_code: getProductCode(response.my_company_code),
              item_unit_price_fmt: `￥${formatNumberWithCommas(String(response.unit_price))}`,
            },
          })
        );
      })
      .catch((error) => {
        if (error?.response?.data?.code === NOT_FOUND_CODE) {
          dispatch(setErrorMessage(NOT_FOUND_DATA));
          dispatch(setButtonDescription(null));
          dispatch(setPresetButtonProduct(null));
        }
      });
  };

  const handleSelectButton = (item?: PresetMenuButton) => {
    if (isClicked.current || presetReducer.presetMenu?.is_hidden) return;

    isClicked.current = true;

    // Reset after 200ms
    setTimeout(() => {
      isClicked.current = false;
    }, 200);

    dispatch(selectButton(item));

    if (isNullOrEmpty(item.setting_data) || !GROUP_CODE_PRODUCTS.includes(item.event_group_code)) {
      return;
    }

    getSuggestingProductionAsync(item);
  };

  const handleSelectEmptyButton = (position: IPositionButton) => {
    handleSelectButton({
      ...initPreMenuButton,
      store_code: presetDetail?.store_code,
      button_column_number: position.x,
      button_row_number: position.y,
      button_column_span: 1,
      button_row_span: 1,
      preset_layout_code: presetDetail?.preset_layout_code,
      event_group_code: '1',
      booking_date: convertDateServer(new Date()),
      page_number: presetReducer?.presetMenu?.page_number ?? 1,
    });
  };

  const handleSelectPreset = (index: number) => {
    dispatch(selectPreset(presetMenus[index].index));
  };

  const colorTab = (preset?: PresetMenu) => {
    return colorPresets?.find((item) => item?.type === preset?.style_key)?.color ?? colorPresets[0].color;
  };

  const opacityTab = (preset?: PresetMenu) => {
    return preset?.is_hidden ? 0.5 : 1;
  };

  const tabKeydown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === ' ') {
      handleSelectPreset(index);
      event.stopPropagation();
      event.preventDefault();

      // Re-focus preset to prevent dragging issue use Space key
      setTimeout(() => {
        const firstElement: HTMLElement = document.querySelector(`.tab-focus${index}`);
        firstElement?.focus();
      }, 120);
    }
  };

  const addTabKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === ' ') {
      handleAddTab();
      event.stopPropagation();
      event.preventDefault();
    }
  };

  const selectPresetButtonKeydown = (event: React.KeyboardEvent<HTMLDivElement>, button: PresetMenuButton) => {
    if (event.key === ' ') {
      handleSelectButton(button);
      event.stopPropagation();
      event.preventDefault();
    }
  };

  const selectEmptyButtonKeydown = (event: React.KeyboardEvent<HTMLDivElement>, position: IPositionButton) => {
    if (event.key === ' ') {
      handleSelectEmptyButton(position);
      event.stopPropagation();
      event.preventDefault();
    }
  };

  return (
    <div className={'body-content'}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categories" type="CATEGORY" direction="vertical">
          {(provided) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef} className="category-tabs">
                {presetMenus?.map((preset, index) => (
                  <Draggable key={index} draggableId={`${index}`} index={index}>
                    {(providedChild) => (
                      <div
                        onKeyDown={(event) => tabKeydown(event, index)}
                        className={`tab-preset-container tab-focus${index}`}
                        ref={providedChild.innerRef}
                        {...providedChild.draggableProps}
                        {...providedChild.dragHandleProps}
                        onClick={() => {
                          handleSelectPreset(index);
                        }}
                      >
                        <div
                          className={`tab-preset ${preset.index === presetReducer.indexPresetMenu ? 'active tab-preset-select' : ''}`}
                          style={{ backgroundColor: colorTab(preset), opacity: opacityTab(preset) }}
                        >
                          <PopoverText text={preset?.description} lineLimit={2} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {presetMenus?.length < MAX_PRESET_TAB && (
                  <div className="add-tab-preset" onClick={handleAddTab} tabIndex={0} onKeyDown={addTabKeydown}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="52"
                      height="52"
                      fill="currentColor"
                      className="bi bi-plus"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                    </svg>
                  </div>
                )}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
      <div
        className="list-preset-container"
        style={{
          opacity: presetReducer.presetMenu ? 1 : 0,
        }}
      >
        <div
          className={`list-preset-button`}
          style={{
            gridTemplateColumns: `repeat(${MAX_MENU_BUTTON_COLUMN}, 1fr)`,
            gridTemplateRows: `repeat(${MAX_MENU_BUTTON_ROW}, 1fr)`,
            backgroundColor: colorTab(presetReducer.presetMenu),
            opacity: presetReducer.presetMenu ? opacityTab(presetReducer.presetMenu) : 0,
          }}
        >
          {positionButtons?.map((item, idx) => {
            if (item.button) {
              const heightImg =
                item.button.button_row_span > item.button.button_column_span
                  ? (item.button.button_column_span / item.button.button_row_span) * 100
                  : 65;
              return (
                <div
                  key={idx}
                  className={`preset-button-container`}
                  style={{
                    gridColumn: `${item.button.button_column_number} / span ${item.button.button_column_span}`,
                    gridRow: `${item.button.button_row_number} / span ${item.button.button_row_span}`,
                    aspectRatio: `${item.button.button_column_span} / ${item.button.button_row_span}`,
                  }}
                >
                  <PopoverText
                    onKeyDown={(event) => selectPresetButtonKeydown(event, item.button)}
                    tabIndex={0}
                    className={`preset-button preset-button-click ${
                      item.button.button_column_number === presetReducer?.presetButton?.button_column_number &&
                      item.button.button_row_number === presetReducer?.presetButton?.button_row_number
                        ? 'selected-item'
                        : 'normal-item'
                    }`}
                    style={{
                      backgroundColor: colorButtons.find((color) => color.type === item.button.style_key)?.color ?? colorButtons[0].color,
                      opacity: item.button.display_status === 0 ? 0.5 : 1,
                    }}
                    onClick={() => handleSelectButton(item.button)}
                    text={item.button.description}
                    valueChangePopover={item}
                    height={item.button.style_info?.length > 0 ? `${98 - heightImg}%` : '100%'}
                    alignItems="start"
                  >
                    {item.button.style_info?.length > 0 && (
                      <div className="item-img" style={{ height: `${heightImg}%` }}>
                        <img src={item.button.style_info} alt="Icon" />
                      </div>
                    )}
                  </PopoverText>
                </div>
              );
            }

            return (
              <div key={idx} className={`preset-button-container`}>
                <div
                  tabIndex={0}
                  onKeyDown={(event) => selectEmptyButtonKeydown(event, item)}
                  onClick={() => handleSelectEmptyButton(item)}
                  className={`preset-button-empty preset-button-click ${
                    item.x === presetReducer?.presetButton?.button_column_number &&
                    item.y === presetReducer?.presetButton?.button_row_number
                      ? 'selected-item'
                      : 'button-default-focus'
                  }`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TableContent;
