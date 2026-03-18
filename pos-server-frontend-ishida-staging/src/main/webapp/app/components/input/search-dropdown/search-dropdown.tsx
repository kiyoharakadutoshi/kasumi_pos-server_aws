import React, { useState, useEffect, useRef } from 'react';
import { DropdownButton, DropdownContainer, DropdownItem, DropdownSearchMenu, MenuSearchData, SearchButton } from '../styled';
import { DefaultButton, TextButton } from '../../button/flat-button/flat-button';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

interface SelectOption {
  id: string;
  value: string;
  label: string;
}

interface DropdownProps {
  options: SelectOption[];
  defaultValue: string;
  width?: string;
  height?: string;
  fontSize?: string;
  disabled?: boolean;
}

const SearchDropdown: React.FC<DropdownProps> = ({ options, width, height, fontSize, disabled, defaultValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option: SelectOption) => {
    handleChange(option.value);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton
        style={{
          width: width ?? 400,
          height: height ?? HEIGHT_INPUT,
          fontSize: fontSize ?? FONT_SIZE,
        }}
        onClick={handleToggle}
        disabled={disabled}
      >
        {options.find(option => option.value === selectedValue)?.label || defaultValue}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-chevron-down"
          viewBox="0 0 16 16"
          style={{ color: '#999' }}
        >
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
          />
        </svg>
      </DropdownButton>
      {isOpen && (
        <DropdownSearchMenu style={{ width: width ?? 400 }}>
          <MenuSearchData>
            <DropdownItem
              className={selectedValue === '' ? 'selected' : ''}
              onClick={() =>
                handleSelect({
                  id: '',
                  value: '',
                  label: '',
                })
              }
            >
              {defaultValue}
            </DropdownItem>
            {options.map((option, index) => (
              <DropdownItem
                className={options.find(option => option.value === selectedValue)?.label === option.label ? 'selected' : ''}
                key={index}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </MenuSearchData>
          <SearchButton>
            <TextButton
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  className="bi bi-search"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              }
              text="詳細検索"
              width="88px"
              height="24px"
              fontSize="12px"
            />
            <DefaultButton
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  className="bi bi-plus-lg"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                  />
                </svg>
              }
              text="新規追加"
              width="88px"
              height="24px"
              fontSize="12px"
            />
          </SearchButton>
        </DropdownSearchMenu>
      )}
    </DropdownContainer>
  );
};

export default SearchDropdown;
