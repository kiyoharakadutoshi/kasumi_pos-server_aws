import React, { useState, useEffect, useRef } from 'react';
import { DropdownButton, DropdownContainer, DropdownItem, DropdownMenu } from '../styled';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  value?: string[];
  width?: string;
  height?: string;
  defaultValue?: string;
  fontSize?: string;
  disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, width, height, fontSize, value, defaultValue, disabled }) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(Array.isArray(value) ? value : []);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleChange = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton
        style={{
          width: width ?? 400,
          height: height ?? HEIGHT_INPUT,
          fontSize: fontSize ?? FONT_SIZE,
        }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedValues.length > 0 ? (
          <div>
            {selectedValues.map((value, index) => (
              <span key={index}>
                {options.find(option => option.value === value)?.label}
                {index < selectedValues.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        ) : (
          <div>{defaultValue}</div>
        )}
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
          <DropdownItem className={selectedValues?.length === 0 ? 'selected' : ''} onClick={() => setSelectedValues([])}>
            {defaultValue}
          </DropdownItem>
          {options.map((option, index) => (
            <DropdownItem
              key={index}
              className={selectedValues.includes(option.value) ? 'selected' : ''}
              onClick={() => handleChange(option.value)}
            >
              {option.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

export default MultiSelectDropdown;
