import React from 'react';
import './printer.scss';
import { KEYDOWN } from 'app/constants/constants';

export interface IPrinterProps {
  action?: () => void;
  disabled?: boolean;
}

export const Printer: React.FC<IPrinterProps> = ({ action, disabled }) => {
  const onKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === KEYDOWN.Space) {
      event.preventDefault();
      event.stopPropagation();
      action();
    }
  };

  return (
    <div tabIndex={0} onKeyDown={onKeydown} className={`${disabled ? 'printer-disabled' : 'printer-enabled'}`} onClick={action}>
      <svg className="print-icon" width="42" height="38" viewBox="0 0 42 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M33.3333 8.33333H8.33333V0H33.3333V8.33333ZM33.3333 19.7917C33.9236 19.7917 34.4184 19.592 34.8177 19.1927C35.217 18.7934 35.4167 18.2986 35.4167 17.7083C35.4167 17.1181 35.217 16.6233 34.8177 16.224C34.4184 15.8247 33.9236 15.625 33.3333 15.625C32.7431 15.625 32.2483 15.8247 31.849 16.224C31.4497 16.6233 31.25 17.1181 31.25 17.7083C31.25 18.2986 31.4497 18.7934 31.849 19.1927C32.2483 19.592 32.7431 19.7917 33.3333 19.7917ZM29.1667 33.3333V25H12.5V33.3333H29.1667ZM33.3333 37.5H8.33333V29.1667H0V16.6667C0 14.8958 0.607639 13.4115 1.82292 12.2135C3.03819 11.0156 4.51389 10.4167 6.25 10.4167H35.4167C37.1875 10.4167 38.6719 11.0156 39.8698 12.2135C41.0677 13.4115 41.6667 14.8958 41.6667 16.6667V29.1667H33.3333V37.5Z" />
      </svg>
    </div>
  );
};
