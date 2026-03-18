import { toDateString } from 'app/helpers/date-utils';
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SERVER_DATE_FORMAT, SERVER_DATE_FORMAT_COMPACT } from 'app/constants/date-constants';
import { InputText } from 'app/components/input/input';

const DatePickerContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export enum Position {
  Top,
  Bottom,
  Left,
}

const DatePickerCalendar = styled.div<{
  isVisible: boolean;
  position: Position;
  left?: string;
}>`
  position: absolute;
  ${({ position }) => (position === Position.Top ? 'bottom: 40px' : 'top: 100%')};
  left: ${({ left }) => left || 0};
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
  z-index: 1;
  height: 387px;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
`;

const DatePickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const DatePickerNavButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
`;

const DatePickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 8px;
`;

const DatePickerDay = styled.div<{
  isSelected?: boolean;
  isToday?: any;
  fontSize?: number;
}>`
  width: 37px;
  height: 37px;
  line-height: 37px;
  border-radius: 50%;
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '24px')};
  text-align: center;
  cursor: pointer;
  background-color: ${({ isSelected }) => (isSelected ? '#007bff' : 'transparent')};
  color: ${({ isSelected, isToday }) => (isSelected ? 'white' : isToday ? '#007bff' : 'inherit')};
`;

interface IDatePickerProps {
  initValue?: Date;
  position?: Position;
  widthInput?: string;
  onChange: (date: Date) => void;
  left?: string;
  fontSize?: number;
  heightDateTime?: string;
  isFormatDate?: boolean;
  colorInput?: string;
  className?: string;
  tabIndex?: number;
}

const dateOfWeeks = ['日', '月', '火', '水', '木', '金', '土'];

const dateStringOfDate = (date?: Date) => {
  const selectDate = date ?? new Date();
  return `${toDateString(selectDate, SERVER_DATE_FORMAT)} (${dateOfWeeks[selectDate.getDay()]})`;
};
const dateStringOfDateCompact = (date?: Date) => {
  const selectDate = date ?? new Date();
  return `${toDateString(selectDate, SERVER_DATE_FORMAT_COMPACT)}(${dateOfWeeks[selectDate.getDay()]})`;
};

const DatePicker: React.FC<IDatePickerProps> = ({
  initValue,
  position,
  widthInput,
  onChange,
  left,
  fontSize,
  heightDateTime,
  isFormatDate,
  className,
  tabIndex,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initValue);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [dateString, setDateString] = useState<string>(!isFormatDate ? dateStringOfDate(initValue) : dateStringOfDateCompact(initValue));
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
      !isFormatDate ? setDateString(dateStringOfDate(selectedDate)) : setDateString(dateStringOfDateCompact(selectedDate));
      onChange(selectedDate);
    }
  }, [selectedDate, isCalendarVisible]);

  useEffect(() => {
    if (
      selectedDate?.getFullYear() !== initValue?.getFullYear() ||
      selectedDate?.getMonth() !== initValue?.getMonth() ||
      selectedDate?.getDate() !== initValue?.getDate()
    ) {
      setSelectedDate(initValue);
    }
  }, [initValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsCalendarVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setIsCalendarVisible(false);
  };

  const getCurrentMonthDays = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (date: Date | null) =>
    date &&
    date.getFullYear() === new Date().getFullYear() &&
    date.getMonth() === new Date().getMonth() &&
    date.getDate() === new Date().getDate();

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    if (inputValue.length === 0) {
      setDateString(inputValue);
      onChange && onChange(null);
      return;
    }

    inputValue = inputValue.replace(/\s?\(?[^0-9/]?\)?$/, '');
    if (
      /^((\d{0,4})|(\d{4}(\/)?(0|0[1-9]|1[0-2]?)?)|(\d{4}(\/)?(0[^0]|0[1-9]|1[0-2])(\/)?([0-3]|0[1-9]|[1-2][0-9]|3[0-1])?))?$/.test(
        inputValue,
      )
    ) {
      setDateString(inputValue);
    }
  };

  const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateInit = initValue ? new Date(initValue) : new Date();
    const inputValue = e.target.value.replace(/\//g, '');
    if (inputValue.length < 6) {
      setSelectedDate(dateInit);
      return;
    }
    if (inputValue.length === 8) {
      const yearNum = parseInt(inputValue.substring(0, 4), 10);
      const month = parseInt(inputValue.substring(4, 6), 10) - 1;
      const day = parseInt(inputValue.substring(6, 8), 10);
      const date = new Date(yearNum, month, day);
      if (date && date.getFullYear() === yearNum && date.getMonth() === month && date.getDate() === day) {
        setSelectedDate(date);
        return;
      }
    }
    setSelectedDate(dateInit);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      setIsCalendarVisible(false);
    }

    if (event.key === ' ') {
      event.preventDefault();
      setIsCalendarVisible(!isCalendarVisible);
    }
  };

  return (
    <DatePickerContainer ref={pickerRef}>
      <div onClick={() => setIsCalendarVisible(true)}>
        <InputText
          height={heightDateTime}
          fontSize={fontSize}
          value={dateString}
          width={widthInput}
          onChange={handleOnChange}
          onBlur={onBlur}
          marginBottom={0}
          onKeyDown={event => handleKeyDown(event)}
          className={className}
          tabIndex={tabIndex}
        />
      </div>
      {isCalendarVisible && (
        <DatePickerCalendar isVisible={isCalendarVisible} position={position} left={left}>
          <DatePickerHeader>
            <DatePickerNavButton onClick={handlePreviousMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="20px" height="20px">
                <path
                  fill="#444444"
                  d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
                />
              </svg>
            </DatePickerNavButton>
            <span style={{ fontWeight: '600' }}>
              {currentDate.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <DatePickerNavButton onClick={handleNextMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="20px" height="20px">
                <path
                  fill="#444444"
                  d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                />
              </svg>
            </DatePickerNavButton>
          </DatePickerHeader>
          <DatePickerGrid>
            {dateOfWeeks.map((date, index) => (
              <DatePickerDay key={index}>{date}</DatePickerDay>
            ))}
            {getCurrentMonthDays().map((date, index) => (
              <DatePickerDay
                fontSize={fontSize}
                key={index}
                isSelected={selectedDate && selectedDate?.toDateString() === date?.toDateString()}
                isToday={isToday(date)}
                onClick={() => date && handleDateChange(date)}
              >
                {date?.getDate() || ''}
              </DatePickerDay>
            ))}
          </DatePickerGrid>
        </DatePickerCalendar>
      )}
    </DatePickerContainer>
  );
};

export default DatePicker;
