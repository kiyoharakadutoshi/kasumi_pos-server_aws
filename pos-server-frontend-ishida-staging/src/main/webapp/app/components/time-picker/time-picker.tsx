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

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
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
  timePicked?: (hour: number, min: number, second: number) => void;
  dataTypeTime?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' : ''}${i}`);
const minutes = Array.from({ length: 60 }, (_, i) => `${i < 10 ? '0' : ''}${i}`);
const seconds = Array.from({ length: 60 }, (_, i) => `${i < 10 ? '0' : ''}${i}`);

const TimePicker: React.FC<TimePickerProps> = ({
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
  const [hour, setHour] = useState<string>(lodash.toString(initValue?.getHours()));
  const inputRefHour = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);

  const [min, setMin] = useState<string>(lodash.toString(initValue?.getMinutes()));
  const inputRefMin = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);

  const [second, setSecond] = useState<string>(lodash.toString(initValue?.getSeconds()));
  const inputRefSecond = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  const handleSelectItem = (type: TimeType, value: string, index: number) => {
    switch (type) {
      case TimeType.Hour:
        setHour(value);
        scrollToItem(hourRef, index);
        break;
      case TimeType.Min:
        setMin(value);
        scrollToItem(minRef, index);
        break;
      case TimeType.Second:
        setSecond(value);
        scrollToItem(secondRef, index);
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
      scrollToItem(hourRef, parseInt(hour, 10), false);
      scrollToItem(minRef, parseInt(min, 10), false);
      if (hasSecond) scrollToItem(secondRef, parseInt(second, 10), false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initValue) {
      const time = timeString(initValue);
      setHour(time.hour);
      setMin(time.minute);
      setSecond(time.second);
    }
  }, [initValue]);

  useEffect(() => {
    handleBlur(TimeType.Hour);
    handleBlur(TimeType.Min);
    handleBlur(TimeType.Second);
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
    if (!isOpen) {
      handleTimePicked();
    }
  }, [isOpen]);

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
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value) && +value <= 23) {
      setHour(value);
    }
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value) && +value <= 59) {
      setMin(value);
    }
  };

  const handleSecondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value) && +value <= 59) {
      setSecond(value);
    }
  };

  const handleBlur = (type: TimeType) => {
    switch (type) {
      case TimeType.Hour:
        setHour(hour.padStart(2, '0'));
        break;
      case TimeType.Min:
        setMin(min.padStart(2, '0'));
        break;
      case TimeType.Second:
        setSecond(second.padStart(2, '0'));
        break;
      default:
        break;
    }
    handleTimePicked();
  };

  const handleTimePicked = () => {
    if (hour.length <= 2 && min.length <= 2 && second.length <= 2) {
      const hourNum = parseInt(hour, 10);
      if (isNaN(hourNum)) {
        return;
      }
      const minNum = parseInt(min, 10);
      if (isNaN(minNum)) {
        return;
      }
      const secondNum = parseInt(second, 10);
      if (hasSecond && isNaN(secondNum)) {
        return;
      }
      if (timePicked) timePicked(hourNum, minNum, secondNum);
    }
  };

  const handleKeyDown = (event: any, type: TimeType) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      const input = document.querySelector(`input[data-type='${dataTypeTime}-${type}']`);
      setTimeout(() => {
        (input as HTMLInputElement)?.blur();
      }, 100);
      setIsOpen(false);
    }
  };

  return (
    <DropdownContainer ref={pickerRef}>
      <DropdownForm>
        <DropdownButton
          marginBottom={0}
          style={{
            width: width ?? 'fit-content',
            height: height ?? HEIGHT_INPUT,
            fontSize: fontSize ?? FONT_SIZE,
          }}
          className={'input-time-picker'}
          onClick={handleToggle}
          disabled={disabled}
        >
          <input
            disabled={disabled}
            type="text"
            className="form-control"
            value={hour}
            onChange={handleHourChange}
            onFocus={() => handleFocus(inputRefHour)}
            onMouseDown={handleMouseDown}
            onBlur={() => handleBlur(TimeType.Hour)}
            ref={inputRefHour}
            style={{
              fontSize: fontSize ?? FONT_SIZE,
              width: '30px',
              textAlign: 'right',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              padding: '0',
              color: disabled ? '#999999' : '#464646',
              fontWeight: 500
            }}
            maxLength={4}
            data-type={`${dataTypeTime}-${TimeType.Hour}`}
            onKeyDown={event => handleKeyDown(event, TimeType.Hour)}
          />

          <span style={{ color: 'black' }}>:</span>
          <input
            disabled={disabled}
            type="text"
            className="form-control"
            value={min}
            onChange={handleMinChange}
            onFocus={() => handleFocus(inputRefMin)}
            onMouseDown={handleMouseDown}
            ref={inputRefMin}
            onBlur={() => handleBlur(TimeType.Min)}
            style={{
              fontSize: fontSize ?? FONT_SIZE,
              width: min === 'mm' ? 44 : 30,
              textAlign: 'center',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              padding: '0',
              color: disabled ? '#999999' : '#464646',
              fontWeight: 500
            }}
            data-type={`${dataTypeTime}-${TimeType.Min}`}
            onKeyDown={event => handleKeyDown(event, TimeType.Min)}
            maxLength={2}
          />
          {hasSecond && (
            <>
              :
              <input
                disabled={disabled}
                type="text"
                className="form-control"
                value={second}
                onChange={handleSecondChange}
                onFocus={() => handleFocus(inputRefSecond)}
                onMouseDown={handleMouseDown}
                ref={inputRefSecond}
                onBlur={() => handleBlur(TimeType.Second)}
                style={{
                  fontSize: fontSize ?? FONT_SIZE,
                  width: min === 'ss' ? 44 : 30,
                  textAlign: 'left',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  padding: '0',
                  color: disabled ? '#999999' : '#464646',
                  fontWeight: 500
                }}
                maxLength={2}
                data-type={`${dataTypeTime}-${TimeType.Second}`}
                onKeyDown={event => handleKeyDown(event, TimeType.Second)}
              />
            </>
          )}
        </DropdownButton>
        {isOpen && (
          <TimePickerMenu className="time-picker-menu" style={{ width: width ?? hasSecond ? 180 : 120 }} position={position}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <ScrollContainer style={{ paddingBottom: '102px' }} ref={hourRef}>
                {hours.map((option, index) => (
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
              <div style={{ borderLeft: '1px solid #666666', height: '142px' }}></div>
              <ScrollContainer style={{ paddingBottom: '102px' }} ref={minRef}>
                {minutes.map((option, index) => (
                  <PickerItem
                    style={{
                      height: height ?? HEIGHT_INPUT,
                      fontSize: fontSize ?? FONT_SIZE,
                    }}
                    className={`picker-item${min && min === option ? ' selected' : ''}`}
                    key={index}
                    onClick={() => handleSelectItem(TimeType.Min, option, index)}
                  >
                    {option}
                  </PickerItem>
                ))}
              </ScrollContainer>
              {hasSecond && (
                <>
                  <div style={{ borderLeft: '1px solid #666666', height: '142px' }}></div>
                  <ScrollContainer style={{ paddingBottom: '102px' }} ref={secondRef}>
                    {seconds.map((option, index) => (
                      <PickerItem
                        style={{
                          height: height ?? HEIGHT_INPUT,
                          fontSize: fontSize ?? FONT_SIZE,
                        }}
                        className={`picker-item${second && second === option ? ' selected' : ''}`}
                        key={index}
                        onClick={() => handleSelectItem(TimeType.Second, option, index)}
                      >
                        {option}
                      </PickerItem>
                    ))}
                  </ScrollContainer>
                </>
              )}
            </div>
          </TimePickerMenu>
        )}
      </DropdownForm>
    </DropdownContainer>
  );
};

export default TimePicker;
