import React from 'react';
import { FONT_SIZE } from 'app/constants/constants';
import './menu-button.scss';

interface MenuButtonProps {
  code?: string;
  name: string;
  height?: string;
  width?: string;
  fontSize?: string;
  onClick?: any;
  disabled?: boolean;
  classBtn?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ code, name, height, width, fontSize, onClick, disabled, classBtn }) => {
  return (
    <button onClick={onClick} disabled={disabled} className={classBtn}>
      {code}
      <span className="menu-button-name">{name}</span>
    </button>
  );
};

export default MenuButton;
