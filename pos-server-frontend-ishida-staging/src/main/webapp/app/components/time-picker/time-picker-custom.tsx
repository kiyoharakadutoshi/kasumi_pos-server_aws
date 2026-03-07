import React, { useState, useEffect, useRef } from 'react';
import { DropdownButton, DropdownContainer, DropdownForm } from '../input/styled';
import { Position } from 'app/components/date-picker/date-picker';
import styled from 'styled-components';
import lodash from 'lodash';
import { timeString } from 'app/helpers/date-utils';
import { FONT_SIZE, HEIGHT_INPUT } from 'app/constants/constants';

const TimePickerMenu = styled.ul<{
  position?: Position;
}>`
  z-index: 10;
  position: absolute;
  width: 100%;
  height: 152px;
  margin: 0;
  padding: 5px;
  background: #ffffff 0 0 no-repeat padding-box;
  border-radius: 4px;
  box-shadow: 2px 6px 10px 4px #0000004d;
  ${({ position }) => (position === Position.Top ? 'bottom: 40px' : 'top: 40px')};
  left: 5px;

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    margin: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e5e5e5 0 0 no-repeat padding-box;
    border-radius: 6px;
    border: 2px solid transparent;
  }
`;

const ScrollContainer = styled.div`
  height: 140px;
  overflow-y: scroll;
  
`;

export const PickerItem = styled.div`
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  display: flex;
  align-items: center;
  color: #666666;
  height: 24px;
  padding: 10px 12px;
  cursor: pointer;

  &:hover,
  &:active {
    background: #e5e5e5 0 0 no-repeat padding-box;
    color: #0f6db5;
  }

  &.selected {
    color: #255b9d;
    background: #d6e3f3 0 0 no-repeat padding-box;
  }
`;

enum TimeType {
  Hour,
  Min,
  Second,
}

interface TimePickerProps {
  position?: Position;
  hasSecond?: boolean;
  initValue?: Date;
  disabled?: boolean;
  width?: string;
  height?: string;
  fontSize?: string;
  timePicked?: (hour?: number, min?: number, second?: number) => void;
  dataTypeTime?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' : ''}${i}`);
const timeSlots = hours.flatMap(hour => [`${hour}:00`, `${hour}:30`]).concat('23:59');

const TimePickerCustom: React.FC<TimePickerProps> = ({
  position,
  hasSecond,
  initValue,
  disabled,
  width,
  height,
  fontSize,
  timePicked,
  dataTypeTime,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [hour, setHour] = useState<string>(lodash.toString(`${lodash.padStart(lodash.toString(initValue?.getHours()), 2, '0')}:${lodash.padStart(lodash.toString(initValue?.getMinutes()), 2, '0')}`));
  const inputRefHour = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const [min, setMin] = useState<string>(lodash.toString(initValue?.getMinutes()));
  const inputRefMin = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);

  const [second, setSecond] = useState<string>(lodash.toString(initValue?.getSeconds()));
  const inputRefSecond = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setHour(lodash.toString(`${lodash.padStart(lodash.toString(initValue?.getHours()), 2, '0')}:${lodash.padStart(lodash.toString(initValue?.getMinutes()), 2, '0')}`))
  }, [initValue])

  const handleSelectItem = (type: TimeType, value: string, index: number) => {
    switch (type) {
      case TimeType.Hour:
        setHour(value);

        // scrollToItem(hourRef, index);
        break;
      case TimeType.Min:
        setMin(value);
        // scrollToItem(minRef, index);
        break;
      case TimeType.Second:
        setSecond(value);
        // scrollToItem(secondRef, index);
        break;
      default:
        break;
    }
  };

  const scrollToItem = (ref: React.MutableRefObject<HTMLInputElement>, index: number, animated: boolean = true) => {
    if (ref.current) {
      ref.current?.scrollTo({
        behavior: animated ? 'smooth' : 'instant',
        top: index * (height ? parseInt(height, 10) : HEIGHT_INPUT),
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      const [selectedHour, selectedMin] = hour.split(":").map(Number);

      const selectedIndex = timeSlots.findIndex(
        (slot) => parseInt(slot.split(":")[0], 10) === selectedHour && parseInt(slot.split(":")[1], 10) === selectedMin
      );

      if (selectedIndex !== -1) {
        scrollToItem(hourRef, selectedIndex, false);
      }
    }
  }, [isOpen]);


  useEffect(() => {
    handleBlur();

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    handleTimePicked();

  }, [isOpen, hour]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleFocus = (inputRef: React.MutableRefObject<HTMLInputElement>) => {
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e) {
      e.currentTarget.focus();
      e.currentTarget.select();
    }
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');

    if (value.length === 4) {
      let hourInput = parseInt(value.slice(0, 2), 10);
      let minute = parseInt(value.slice(2, 4), 10);

      if (hourInput > 23 || minute > 59) {
        setHour('00:00');
        return;
      }

      if (hourInput === 23 && minute === 59) {
        setHour('23:59');
        return;
      }

      if (minute >= 0 && minute < 29) {
        minute = 0;
      } else if (minute >= 30 && minute <= 59) {
        minute = 30;
      }

      const formattedHour = hourInput.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const formattedTime = `${formattedHour}:${formattedMinute}`;

      setHour(formattedTime);
    } else {
      setHour(value);
    }
  };


  const handleBlur = () => {
    const hourInput = parseInt(hour.slice(0, 2), 10);
    const minute = parseInt(hour.slice(2, 4), 10);
    if (hourInput > 23 || minute > 59 || hour.length < 5) {
      setHour('00:00')
    }

    handleTimePicked();
  };

  const handleTimePicked = () => {
    const [hourStr, minStr] = hour.split(':');
    const hourNum = parseInt(hourStr, 10);
    const minNum = parseInt(minStr, 10);
    if (isNaN(hourNum) || isNaN(minNum)) {
      return;
    }
    if (timePicked) timePicked(hourNum, minNum);
  };

  const handleKeyDown = (event: any, type: TimeType) => {

    if (event.key === ' ') {
      event.preventDefault();

      setIsOpen(!isOpen);
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <DropdownContainer className='drop-down-container' ref={pickerRef}>
      <DropdownForm className='drop-down-form'>
        <DropdownButton
          marginBottom={0}
          style={{
            width: width ?? 'fit-content',
            height: height ?? '100%',
            fontSize: fontSize ?? FONT_SIZE,
          }}
          className={'input-time-picker'}
          onClick={handleToggle}
          disabled={disabled}
        >
          <input
            disabled={disabled}
            type="text"
            className="form-control input-picker-style"
            value={hour}
            onChange={handleHourChange}
            onFocus={() => handleFocus(inputRefHour)}
            onMouseDown={handleMouseDown}
            onBlur={() => handleBlur()}
            ref={inputRefHour}
            style={{
              fontSize: fontSize ?? FONT_SIZE,
              textAlign: 'center',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              padding: '0',
              color: disabled ? '#999999' : '#333333',
              backgroundColor: disabled && '#d9dce1',
              cursor: disabled && 'not-allowed'

            }}
            maxLength={4}
            data-type={`${dataTypeTime}-${TimeType.Hour}`}
            onKeyDown={event => handleKeyDown(event, TimeType.Hour)}
          />

        </DropdownButton>
        {isOpen && (
          <TimePickerMenu className="time-picker-menu" position={position}>
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
              <ScrollContainer ref={hourRef}>
                {timeSlots.map((option, index) => (
                  <PickerItem
                    style={{
                      height: height ?? HEIGHT_INPUT,
                      fontSize: fontSize ?? FONT_SIZE,
                    }}
                    className={`picker-item${hour && hour === option ? ' selected' : ''}`}
                    key={index}
                    onClick={() => handleSelectItem(TimeType.Hour, option, index)}
                  >
                    {option}
                  </PickerItem>
                ))}
              </ScrollContainer>
            </div>
          </TimePickerMenu>
        )}
      </DropdownForm>
    </DropdownContainer>
  );
};

export default TimePickerCustom;
