import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import './dropdown.scss';
import { isNullOrEmpty, isNullOrUndefined, localizeString } from 'app/helpers/utils';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';
import { Overlay, Popover } from 'react-bootstrap';
import { Placement } from 'react-bootstrap/esm/types';
import { ValidationRule } from 'react-hook-form';

export const BUTTON_DROPDOWN_CLASS_NAME = 'dropdown-container__dropdown-button';

export interface IDropDownItem {
  value?: string | number;
  code?: string | number;
  name: string;
}

export type DropDownProps = Omit<ComponentProps<'select'>, 'onChange'> & {
  name?: string;
  itemsName?: string;
  label?: string;
  value?: string | number;
  items?: IDropDownItem[];
  onChange?: (item: IDropDownItem) => void;
  onChangeFunc?: (value: string | number) => void;
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
  dirtyCheck?: boolean;
  error?: string;
  errorPlacement?: Placement;
  localizeKey?: string;
  patternValidate?: ValidationRule<RegExp>;
}

const Dropdown = ({
  name,
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
  dirtyCheck,
  style,
  error,
  errorPlacement = 'right'
}: DropDownProps) => {
  const [showError, setShowError] = useState(false);
  const isError = !isNullOrEmpty(error);
  const listItems = React.useMemo(() => (hasBlankItem ? [{ name: '' }, ...items] : items), [hasBlankItem, items]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const menuRef = useRef<HTMLUListElement>(null);
  const [indexDirtySelect, setIndexDirtySelect] = useState(-1);
  const showDirtyCheck = dirtyCheck && indexDirtySelect >= 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showMenu) {
      if (e.key === ' ') {
        e.preventDefault();
        setShowMenu(true);
      }
      return;
    }

    if (showMenu) {
      if (showDirtyCheck) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prevIndex) => (prevIndex + 1) % listItems?.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prevIndex) => (prevIndex - 1 + listItems?.length) % listItems?.length);
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (focusedIndex !== -1) {
          onCLickItem(listItems?.[focusedIndex], focusedIndex);
        }
      }
    }
  };

  useEffect(() => {
    if (showMenu) {
      setFocusedIndex(selectedIndex);
    }
  }, [showMenu, selectedIndex]);

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
    const indexItem = listItems?.findIndex((item) => item.value === value);
    setSelectedIndex(indexItem >= 0 ? indexItem : 0);
  }, [value, listItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (!dirtyCheck || indexDirtySelect < 0) {
          setShowMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dirtyCheck, indexDirtySelect]);

  const classNameDropdown = () => {
    if (disabled) return 'dropdown-container__disabled';
    if (!hasBorder) return '';
    return 'dropdown-container__border ' + (isNullOrEmpty(label) ? 'dropdown-container__none-label' : 'dropdown-container__has-label');
  };

  const onCLickItem = (item: IDropDownItem, index: number) => {
    if (index === selectedIndex) {
      setShowMenu(false);
      return;
    }

    if (dirtyCheck) {
      setIndexDirtySelect(index);
      return;
    }

    setSelectedIndex(index);
    setShowMenu(false);
    onChangeFunc?.(item?.value);
    onChange?.(item);
  };

  return (
    <div
      onMouseEnter={() => {
        if (isError) setShowError(true);
      }}
      onMouseLeave={() => setShowError(false)}
      className={`dropdown-container ${classNameDropdown()} ${className ?? ''}  ${
        (isNullOrEmpty(error) || disabled) ? '' : 'dropdown-container_error'}`.trim()}
      ref={dropdownRef}
      autoFocus={autoFocus}
      onKeyDown={handleKeyDown}
      data-type={dataType}
      style={style}
    >
      <ModalCommon
        modalInfo={{
          type: IModalType.confirm,
          isShow: showDirtyCheck,
          message: localizeString('MSG_CONFIRM_002'),
        }}
        handleOK={() => {
          setIndexDirtySelect(-1);
          setSelectedIndex(indexDirtySelect);
          setShowMenu(false);
          onChangeFunc?.(listItems?.[indexDirtySelect]?.value);
          onChange?.(items?.[indexDirtySelect]);
        }}
        handleClose={() => setIndexDirtySelect(-1)}
      />
      {label && (
        <label className="dropdown-container__dropdown-title">
          {localizeString(label)}
          {isRequired && <span className="input-text-require">*</span>}
        </label>
      )}

      <button
        className={`${BUTTON_DROPDOWN_CLASS_NAME} ${buttonClassName ?? ''}`.trim()}
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled}
        name={name}
        style={style}
      >
        <label className="dropdown-container__button-text">
          {`${!isNullOrUndefined(listItems?.[selectedIndex]?.code) && !isHiddenCode
            ? `${listItems?.[selectedIndex]?.code}：`
            : ''
            }${hasLocalized ? localizeString(listItems?.[selectedIndex]?.name) : listItems?.[selectedIndex]?.name ?? ''}`}
        </label>
        <svg
          id="arrow_drop_down_circle"
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 30 30"
          className="dropdown-container__button-text"
        >
          <path
            className="dropdown-container__icon-path"
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
        <ul className="dropdown-container__dropdown-list" ref={menuRef}>
          {listItems?.map((item, index) => (
            <li
              key={index}
              className={`dropdown-container__dropdown-item ${index === focusedIndex
                ? 'dropdown-container__dropdown-item-selected'
                : 'dropdown-container__dropdown-item-not-selected'
                }`}
              onClick={() => onCLickItem(item, index)}
            >
              {!isNullOrUndefined(item.code) && !isHiddenCode && `${item.code}：`}
              {hasLocalized ? localizeString(item.name) : item.name}
            </li>
          ))}
        </ul>
      )}
      <Overlay show={showError} target={dropdownRef?.current} placement={errorPlacement}>
        <Popover id="popover-basic">
          <Popover.Body>{isError ? error : ''}</Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default Dropdown;
