import './normal-dropdown.scss';
import React, { useState, useEffect, useRef } from 'react';
import { DropdownButton, DropdownContainer, DropdownForm, DropdownItem, DropdownMenu, InputTitle } from '../styled';
import _ from 'lodash';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

export interface SelectOption {
  id: string;
  value: string | number;
  label: string | React.ReactNode;
}

interface DropdownProps {
  text?: string | React.ReactNode;
  required?: boolean;
  widthText?: string;
  position?: 'top' | 'bottom';
  options: SelectOption[];
  defaultValue?: string | React.ReactNode;
  width?: string;
  value?: string | number;
  height?: string;
  fontSize?: string;
  disabled?: boolean;
  marginBottom?: number;
  onDropdownChange?: any;
  selectedDataDropdown?: any;
  backgroundColor?: string;
  className?:string;
  noneIcon?: boolean
}

const NormalDropdown: React.FC<DropdownProps> = ({
  text,
  required,
  widthText,
  options,
  position,
  value,
  width,
  height,
  fontSize,
  disabled,
  defaultValue,
  onDropdownChange,
  marginBottom,
  selectedDataDropdown,
  backgroundColor,
  className,
  noneIcon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedValue, setSelectedValue] = useState(value ?? '');
  const [selectedData, setSelectedData] = useState(selectedDataDropdown);

  const handleChange = (valueChange: string, label: any) => {
    setSelectedValue(valueChange);
    setSelectedData(label);
    onDropdownChange?.(label, valueChange);
  };

  useEffect(() => {
    setSelectedValue(value ?? '');
    const data = options.find(data => _.toString(data.value) === _.toString(value))?.label;
    setSelectedData(data);
  }, [value, options]);

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
    handleChange(_.toString(option.value), option.label);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownForm>
        {text && (
          <InputTitle
            className="title-name"
            style={{
              height: height ?? HEIGHT_INPUT,
              width: widthText ?? 'fit-content',
              fontSize: fontSize ?? FONT_SIZE,
              backgroundColor: backgroundColor,
            }}
          >
            {text}
            {required && <span style={{ color: '#FA1E1E' }}>*</span>}
          </InputTitle>
        )}
        <div>
          <DropdownButton
            style={{
              width: width ?? 400,
              height: height ?? HEIGHT_INPUT,
              fontSize: fontSize ?? FONT_SIZE,
            }}
            onClick={handleToggle}
            disabled={disabled}
            marginBottom={marginBottom}
            className={className}
          >
            <div className="selected-item-button">{selectedData ? selectedData : defaultValue ? defaultValue : options[0]?.label}</div>
            {!noneIcon &&
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-chevron-down"
                viewBox="0 0 16 16"
                style={{ color: '#999999' }}
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
                />
              </svg>
            }
          </DropdownButton>
          {isOpen && (
            <DropdownMenu style={{ width: width ?? 400 }} position={position}>
              {defaultValue && (
                <DropdownItem
                  style={{
                    height: height ?? HEIGHT_INPUT,
                    fontSize: fontSize ?? FONT_SIZE,
                  }}
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
              )}
              {options?.map((option, index) => (
                <DropdownItem
                  style={{
                    height: height ?? 'fit-content',
                    fontSize: fontSize ?? FONT_SIZE,
                    lineHeight: `calc(${fontSize ?? FONT_SIZE} + 4px)`,
                  }}
                  className={
                    (defaultValue || selectedData ? selectedData === option.label : options[0]?.label === option.label) ? 'selected' : ''
                  }
                  key={index}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </div>
      </DropdownForm>
    </DropdownContainer>
  );
};

export default NormalDropdown;
