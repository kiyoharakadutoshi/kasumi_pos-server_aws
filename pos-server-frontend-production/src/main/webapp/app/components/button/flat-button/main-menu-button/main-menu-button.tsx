import React from 'react';
import { BtnMainMenu, TextMainMenu } from '../styled';
import { FONT_SIZE } from 'app/constants/constants';

interface MainMenuButtonProps {
  icon?: any;
  fontSize?: string;
  text?: string;
  height?: string;
  width?: string;
  onClick?: any;
  disabled?: boolean;
}

const MainMenuButton: React.FC<MainMenuButtonProps> = ({ height, width, icon, fontSize, text, onClick, disabled }) => {
  return (
    <BtnMainMenu
      style={{
        height: height ?? 48,
        width: width ?? 128,
        fontSize: fontSize ?? FONT_SIZE,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon ?? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="34"
          height="27"
          fill="currentColor"
          className="bi bi-house-door"
          viewBox="0 0 16 16"
          style={{
            marginRight: 6,
          }}
        >
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
        </svg>
      )}
      <TextMainMenu>{text ?? 'ﾒｲﾝﾒﾆｭｰ'}</TextMainMenu>
    </BtnMainMenu>
  );
};

export default MainMenuButton;
