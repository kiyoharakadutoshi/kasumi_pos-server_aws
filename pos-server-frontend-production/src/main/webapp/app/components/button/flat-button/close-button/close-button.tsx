import React from "react";
import { BtnClose } from "../styled";

interface CloseButtonProps {
  onClick?: any;
  height?: string;
  width?: string;
  fontSize?: string;
  disabled?: boolean;
}

const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  height,
  width,
  disabled,
}) => {
  return (
    <BtnClose
      style={{
        height: height ?? 48,
        width: width ?? 48,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        width="19.961"
        height="19.8"
        viewBox="0 0 19.8 19.8"
      >
        <path
          id="ic-close-up"
          d="M19.846,1.442,18.511.1H17.343L10,7.651,2.657.1H1.489L.154,1.442a1.349,1.349,0,0,0,0,1.175L7.664,10,.154,17.383a1.349,1.349,0,0,0,0,1.175L1.489,19.9H2.657L10,12.349,17.343,19.9h1.168l1.335-1.342a1.349,1.349,0,0,0,0-1.175L12.336,10l7.51-7.383A1.349,1.349,0,0,0,19.846,1.442Z"
          transform="translate(-0.019 -0.1)"
        />
      </svg>
    </BtnClose>
  );
};

export default CloseButton;
