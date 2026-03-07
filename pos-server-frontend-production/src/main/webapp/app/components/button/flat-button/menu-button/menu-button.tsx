import React from "react";
import styled, { css } from "styled-components";

interface ButtonProps {
  disabled?: boolean;
}

const MenuButton = styled.button<ButtonProps>`
  width: 664px;
  height: 48px;
  border: none;
  border-radius: 12px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  ${({ disabled }) =>
    disabled
      ? css`
          background-color: #ededed;
          color: #999999;
        `
      : css`
          background: #1c4476;
        `}

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#ededed" : "#255b9d")};
  }

  &:active {
    background-color: ${({ disabled }) =>
      disabled
        ? css`
            background: #ededed 0% 0% no-repeat padding-box;
          `
        : css`
            background: #0f4678 0% 0% no-repeat padding-box;
            color: #d6e3f3;
          `};
  }
`;

export default MenuButton;
