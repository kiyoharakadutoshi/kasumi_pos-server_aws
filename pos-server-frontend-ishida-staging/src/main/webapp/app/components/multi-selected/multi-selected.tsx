import React, { useEffect, useRef, useState } from 'react';
import './multi-selected.scss';
import { isNullOrUndefined, localizeString } from 'app/helpers/utils';
import InputTextCustom from '../input-text-custom/input-text-custom';
import CheckboxButton from '../checkbox-button/checkbox-button';

export const BUTTON_DROPDOWN_CLASS_NAME = 'multi-select-container__multi-select-button';

export interface IDropDownItem {
  value?: string | number;
  code?: string | number;
  name: string;
}

export interface MultiSelectProps {
  name?: string;
  label?: string;
  value?: IDropDownItem[];
  items: IDropDownItem[];
  onChange?: (item: IDropDownItem) => void;
  onChangeFunc?: (value: IDropDownItem[]) => void;
  disabled?: boolean;
  hasBorder?: boolean;
  hasBlankItem?: boolean;
  isRequired?: boolean;
  className?: string;
  isHiddenCode?: boolean;
  autoFocus?: boolean;
  dataType?: string;
  hasLocalized?: boolean;
  buttonClassName?: string;
}

const MultiSelect = ({
  label,
  value,
  items,
  onChange,
  onChangeFunc,
  disabled,
  hasBorder = true,
  hasBlankItem,
  isRequired,
  className,
  isHiddenCode,
  autoFocus,
  dataType,
  hasLocalized,
  buttonClassName,
}: MultiSelectProps) => {
  const listItems = React.useMemo(() => (hasBlankItem ? [{ name: '' }, ...items] : items), [hasBlankItem, items]);
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const menuRef = useRef<HTMLUListElement>(null);
  const [keyword, setKeyword] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<IDropDownItem[]>(value || []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showMenu) {
      if (e.key === ' ') {
        e.preventDefault();
        setShowMenu(true);
      }
      return;
    }

    if (showMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prevIndex => (prevIndex + 1) % listItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prevIndex => (prevIndex - 1 + listItems.length) % listItems.length);
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (focusedIndex !== -1) {
          onChange?.(listItems[focusedIndex]);
          setShowMenu(false);
        }
      }
    }
  }

  useEffect(() => {
    if (showMenu && focusedIndex !== -1 && menuRef.current) {
      const focusedItem = menuRef.current.children[focusedIndex] as HTMLElement;
      if (focusedItem) {
        const itemTop = focusedItem.offsetTop;
        const itemBottom = itemTop + focusedItem.offsetHeight;
        const containerTop = menuRef.current.scrollTop;
        const containerBottom = containerTop + menuRef.current.clientHeight;

        if (itemTop < containerTop) {
          menuRef.current.scrollTop = itemTop;
        } else if (itemBottom > containerBottom) {
          menuRef.current.scrollTop = itemBottom - menuRef.current.clientHeight;
        }
      }
    }
  }, [focusedIndex, showMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const classNameDropdown = () => {
    if (disabled) return 'multi-select-container__disabled';
    if (!hasBorder) return '';
    return 'multi-select-container__border';
  };

  const handleCheckboxChange = (newValue: IDropDownItem) => {
    setSelectedOptions(prev => {
      const exists = prev.some(item => item.value === newValue.value);
      return exists
        ? prev.filter(item => item.value !== newValue.value)
        : [...prev, newValue];
    });
  };

  useEffect(() => {
    onChangeFunc(selectedOptions);
  }, [selectedOptions]);

  const handleRemoveItem = (index) => {

    const listSelected = selectedOptions;
    listSelected.splice(index, 1);
    setSelectedOptions([...listSelected]);
  }

  const filteredItems = React.useMemo(() => {
    if (!keyword) return listItems;
    return listItems.filter(item =>
      item.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (!isNullOrUndefined(item.code) && item.code.toString().toLowerCase().includes(keyword.toLowerCase()))
    );
  }, [listItems, keyword, selectedOptions]);

  return (
    <div
      className={`multi-select-container multi-select-container ${classNameDropdown()} ${className ?? ''}`.trim()}
      ref={dropdownRef}
      autoFocus={autoFocus}
      onKeyDown={handleKeyDown}
      data-type={dataType}
    >
      {label && (
        <label className="multi-select-container__dropdown-title">
          {localizeString(label)}
          {isRequired && <span className="input-text-require">*</span>}
        </label>
      )}

      <button
        className={`${BUTTON_DROPDOWN_CLASS_NAME} ${buttonClassName ?? ''}`.trim()}
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled}
      >
        <label className="multi-select-container__button-text" style={{ '--height-resutl': Array.isArray(selectedOptions) && selectedOptions?.length > 4 ? '168px' : '114px' } as React.CSSProperties}>
          {Array.isArray(selectedOptions) && selectedOptions?.length > 0 && selectedOptions?.map((item, index) => (
            <div className='selected-item-store' key={index} >
              <span className='label-text'
                key={`label ${index}`}
              >
                {!isNullOrUndefined(item.code) && !isHiddenCode && `${item.code.toLocaleString()} : `}
                {hasLocalized ? localizeString(item.name) : item.name}
              </span>
              <span onClick={(event: React.MouseEvent) => {
                handleRemoveItem(index);
                event.stopPropagation();
              }} key={`close-icon ${index}`} className="remove-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14.828" height="14.828" viewBox="0 0 14.828 14.828">
                  <g transform="translate(1.414 1.414)"><line x1="12" y2="12" fill="none" stroke="#171616" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line>
                    <line x2="12" y2="12" fill="none" stroke="#171616" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line></g>
                </svg>
              </span>
            </div>

          ))}
        </label>
        <svg
          id="arrow_drop_down_circle"
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 30 30"
          className="multi-select-container__button-text button-location"
        >
          <path
            className="multi-select-container__icon-path"
            id="arrow_drop_down_circle-2"
            data-name="arrow_drop_down_circle"
            d="M13.3,16.423l4.166-4.166H9.132Zm0,7.291a10.142,10.142,0,0,1-4.062-.82A10.4,10.4,0,0,1,3.7,17.36a10.468,10.468,0,0,1,0-8.124A10.4,10.4,0,0,1,9.236,3.7a10.468,10.468,0,0,1,8.124,0,10.4,10.4,0,0,1,5.533,5.533,10.467,10.467,0,0,1,0,8.124,10.4,10.4,0,0,1-5.533,5.533A10.141,10.141,0,0,1,13.3,23.713Z"
            transform="translate(2.117 2.117)"
            fill="#001440"
          />
          <rect id="長方形_147744" data-name="長方形 147744" width="30" height="30" rx="4" fill="none" />
        </svg>
      </button>

      {showMenu && (
        <div className="multi-select-container__dropdown-list">
          <InputTextCustom
            value={keyword}
            icon={
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.3568 22.3749L12.7041 14.7624C12.0967 15.2458 11.3982 15.6284 10.6087 15.9104C9.81909 16.1923 8.9789 16.3333 8.08811 16.3333C5.88135 16.3333 4.01371 15.573 2.48518 14.0525C0.956648 12.5321 0.192383 10.6742 0.192383 8.47911C0.192383 6.28397 0.956648 4.42615 2.48518 2.90567C4.01371 1.38518 5.88135 0.624939 8.08811 0.624939C10.2949 0.624939 12.1625 1.38518 13.691 2.90567C15.2196 4.42615 15.9838 6.28397 15.9838 8.47911C15.9838 9.36522 15.8421 10.201 15.5587 10.9864C15.2752 11.7718 14.8906 12.4666 14.4047 13.0708L22.0575 20.6833L20.3568 22.3749ZM8.08811 13.9166C9.60651 13.9166 10.8972 13.388 11.96 12.3307C13.0229 11.2734 13.5544 9.98952 13.5544 8.47911C13.5544 6.96869 13.0229 5.68483 11.96 4.62754C10.8972 3.57025 9.60651 3.04161 8.08811 3.04161C6.5697 3.04161 5.27905 3.57025 4.21616 4.62754C3.15328 5.68483 2.62184 6.96869 2.62184 8.47911C2.62184 9.98952 3.15328 11.2734 4.21616 12.3307C5.27905 13.388 6.5697 13.9166 8.08811 13.9166Z"
                  fill="#545F95"
                />
              </svg>
            }
            placeholder={'店番または店名で検索'}
            onChange={(e: any) => setKeyword(e.target.value)}
            inputClassName={'sidebar-store__input_search'}
          />
          <div className="multi-select-container__dropdown-list-container">
            <div className={`${filteredItems.length > 3 ? "multi-select-container__scoll" : ""}`}>
              {filteredItems?.map((store, index) => (
                <div className="multi-select-container__dropdown-list-item" key={index}>
                  <CheckboxButton
                    id={`checkbox ${index}`}
                    onChange={() => handleCheckboxChange(store)}
                    checkBoxValue={store.value}
                    checked={selectedOptions.some((item) => store.value === item.value)}
                    textValue={`${store.code} : ${store.name}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MultiSelect;
