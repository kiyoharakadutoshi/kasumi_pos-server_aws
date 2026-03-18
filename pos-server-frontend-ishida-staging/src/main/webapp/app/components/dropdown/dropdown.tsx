import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import { ValidationRule } from 'react-hook-form';
import { Placement } from 'react-bootstrap/esm/types';
import { Overlay, Popover } from 'react-bootstrap';
import ReactDOM from 'react-dom';

// Components
import { DropdownIcon } from '../icons';
import { formatValue, isNullOrEmpty, localizeString } from '@/helpers/utils';
import ModalCommon, { IModalType } from '@/components/modal/modal-common';
import PopoverText from '@/components/popover/popover';

// Styles
import './dropdown.scss';

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
  onBlur?: () => void;
};

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
  errorPlacement = 'right',
  onBlur,
}: DropDownProps) => {
  const [showError, setShowError] = useState(false);
  const isError = !isNullOrEmpty(error);
  const listItems = React.useMemo(
    () => (hasBlankItem ? [{ name: '' }, ...(items ?? [])] : items ?? []),
    [hasBlankItem, items]
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const menuRef = useRef<HTMLUListElement>(null);
  const [indexDirtySelect, setIndexDirtySelect] = useState(-1);
  const showDirtyCheck = dirtyCheck && indexDirtySelect >= 0;
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [menuVisible, setMenuVisible] = useState(false);

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
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
    return (
      'dropdown-container__border ' +
      (isNullOrEmpty(label) ? 'dropdown-container__none-label' : 'dropdown-container__has-label')
    );
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

  const formatData = (item: IDropDownItem) => {
    const getName = () => {
      return hasLocalized ? localizeString(item?.name) : item?.name ?? '';
    };

    if (isHiddenCode) return getName();
    return formatValue(item?.code, getName());
  };

  /**
   * Update the dropdown position when the menu is shown
   */
  const updateDropdownPosition = React.useCallback(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const menuPositionStyle: React.CSSProperties = {
        position: 'absolute',
        left: rect.left + window.scrollX,
        minWidth: rect.width,
        maxWidth: 'fit-content',
        zIndex: 3000,
        visibility: 'visible',
      };

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        menuPositionStyle.top = undefined;
        menuPositionStyle.bottom = window.innerHeight - rect.top + window.scrollY + 2;
      } else {
        menuPositionStyle.top = rect.bottom + window.scrollY + 2;
        menuPositionStyle.bottom = undefined;
      }

      setMenuStyle(menuPositionStyle);
      setMenuVisible(true);
    }
  }, []);

  /**
   * Update the dropdown position when the menu is shown
   */
  useEffect(() => {
    if (showMenu && dropdownRef.current) {
      setMenuVisible(false);
      const raf = requestAnimationFrame(updateDropdownPosition);

      // Add event listeners for resize and scroll
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
      };
    } else {
      setMenuVisible(false);
      setMenuStyle({});
    }
  }, [showMenu, updateDropdownPosition]);

  return (
    <div
      onMouseEnter={() => {
        if (isError) setShowError(true);
      }}
      onMouseLeave={() => setShowError(false)}
      className={`dropdown-container ${classNameDropdown()} ${className ?? ''}  ${
        isNullOrEmpty(error) || disabled ? '' : 'dropdown-container_error'
      }`.trim()}
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
        <span className="dropdown-container__dropdown-title">
          {localizeString(label)}
          {isRequired && <span className="input-text-require">*</span>}
        </span>
      )}

      <button
        className={`${BUTTON_DROPDOWN_CLASS_NAME} ${buttonClassName ?? ''}`.trim()}
        onClick={() => setShowMenu(!showMenu)}
        onBlur={showMenu ? () => {} : onBlur}
        disabled={disabled}
        name={name}
        style={style}
      >
        <PopoverText
          classNameText="dropdown-container__button-text"
          lineHeight={null}
          text={formatData(listItems?.[selectedIndex])}
          lineLimit={1}
          height={null}
        />
        <DropdownIcon />
      </button>
      {showMenu &&
        menuVisible &&
        ReactDOM.createPortal(
          <ul className="dropdown-container__dropdown-list" ref={menuRef} style={menuStyle}>
            {listItems?.map((item, index) => (
              <li
                key={index}
                className={`dropdown-container__dropdown-item ${
                  index === focusedIndex
                    ? 'dropdown-container__dropdown-item-selected'
                    : 'dropdown-container__dropdown-item-not-selected'
                }`}
                onClick={() => onCLickItem(item, index)}
              >
                {formatData(item)}
              </li>
            ))}
          </ul>,
          document.body
        )}
      <Overlay show={!disabled && showError} target={dropdownRef?.current} placement={errorPlacement}>
        <Popover id="popover-basic">
          <Popover.Body>{isError ? error : ''}</Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};
export default Dropdown;
