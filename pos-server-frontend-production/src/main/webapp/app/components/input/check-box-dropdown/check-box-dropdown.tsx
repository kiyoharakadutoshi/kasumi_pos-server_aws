import React, { useState, useEffect, useRef } from 'react';
import { DropdownButton, DropdownContainer, DropdownItem, DropdownMenu } from '../styled';
import { NormalCheckboxButton } from 'app/components/radio-button/radio-button';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

type SelectOption = {
  id: string;
  value: string;
  label: string;
};

type DropdownProps = {
  options: SelectOption[];
  defaultValue: string;
  width?: string;
  height?: string;
  fontSize?: string;
  disabled?: boolean;
};

const CheckBoxDropdown: React.FC<DropdownProps> = ({ options, width, height, fontSize, disabled, defaultValue }) => {
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
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
          />
        </svg>
      </DropdownButton>
      {isOpen && (
        <DropdownMenu style={{ width: width ?? 400 }}>
          <DropdownItem
            className={selectedValue === '' ? 'selected' : ''}
            style={{ fontSize: fontSize ?? FONT_SIZE }}
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
          {options.map(option => (
            <DropdownItem
              className={options.find(option => option.value === selectedValue)?.label === option.label ? 'selected' : ''}
              onClick={() => handleSelect(option)}
            >
              <NormalCheckboxButton
                checked={options.find(option => option.value === selectedValue)?.label === option.label}
                id={option?.id}
                checkBoxValue={option?.value}
                textValue={option?.value}
              />
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

export default CheckBoxDropdown;
