import styled, { css } from 'styled-components';

interface StyleInput {
  errInput?: boolean;
  disabled?: boolean;
  borderRadius?: number;
  borderColor?: string;
  backgroundColor?: string;
  padding?: string;
}

interface StyleForm {
  paddingBottom?: number;
}

interface DropdownButtonStyle {
  marginBottom?: number;
}

export const InputFont = styled.input`
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
`;

export const InputForm = styled.div<StyleForm>`
  display: flex;
  padding-bottom: ${({ paddingBottom }) => `${paddingBottom ?? 8}px`};
  position: relative;
  .unit-text {
    position: absolute;
    right: 10px;
    top:50%;
    transform:translateY(-50%);
    font-size: 18px;
  }
`;

export const InputTitle = styled.div`
  display: flex;
  color: #0F192F;
  align-items: center;
  padding: 4px;
`;

export const InputStyled = styled(InputFont) <StyleInput>`
  padding: ${({ padding }) => padding ?? '0 18px'};
  color: #464646;
  border: 3px solid ${({ borderColor: borderColor }) => borderColor ?? '#e5e5e5'};
  outline: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-radius: ${({ borderRadius }) => `${borderRadius ?? 6}px`};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};
  &::placeholder {
    color: #999;
  }

  ${({ disabled, backgroundColor }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
        `
      : css`
          background: ${backgroundColor ?? '#ffffff'} 0 0 no-repeat padding-box;
        `}

  ${({ errInput }) =>
    errInput &&
    css`
      background: #ffdede 0 0 no-repeat padding-box;
      border: 1px solid #ff5c5c;
      color: #fa5151;
      &::placeholder {
        color: #ffadad;
      }
    `}

  &:hover {
    ${({ disabled, errInput }) =>
    disabled
      ? errInput
        ? css`
              background: #ffdede 0 0 no-repeat padding-box;
            `
        : css`
              background: #ededed 0 0 no-repeat padding-box;
            `
      : css`
            background: #ffffff 0 0 no-repeat padding-box;
            border: 3px solid #B0B9D7;
            color: #333;
            &::placeholder {
              color: #999;
            }
          `}
  }

  &:focus {
    ${({ disabled }) =>
    disabled
      ? css`
            background: #ededed 0 0 no-repeat padding-box;
          `
      : css`
            background: #f9f9f9 0 0 no-repeat padding-box;
            border: 3px solid #B0B9D7;
            color: #333;
            &::placeholder {
              color: #999;
            }
          `}
  }

  &:active {
    ${({ disabled, errInput }) =>
    disabled
      ? errInput
        ? css`
              background: #ffdede 0 0 no-repeat padding-box;
            `
        : css`
              background: #ededed 0 0 no-repeat padding-box;
            `
      : css`
            background: #E7EAF0 0 0 no-repeat padding-box;
            border: 3px solid #B0B9D7;
            color: #333;
            &::placeholder {
              color: #999;
            }
          `}
  }
`;

export const NormalInputStyled = styled(InputFont) <StyleInput>`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #e5e5e5;
  outline: none;
  border-radius: 12px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};
  &::placeholder {
    color: #999;
  }

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
        `
      : css`
          background: #f9f9f9 0 0 no-repeat padding-box;
          color: #333333;
        `}

  ${({ errInput }) =>
    errInput &&
    css`
      background: #ffdede 0 0 no-repeat padding-box;
      border: 1px solid #ff5c5c;
      color: #fa5151;
      &::placeholder {
        color: #ffadad;
      }
    `}

  &:hover {
    ${({ disabled, errInput }) =>
    disabled
      ? errInput
        ? css`
              background: #ffdede 0 0 no-repeat padding-box;
            `
        : css`
              background: #ededed 0 0 no-repeat padding-box;
            `
      : css`
            background: #ededed 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
            color: #333;
            &::placeholder {
              color: #999;
            }
          `}
  }

  &:focus {
    ${({ disabled }) =>
    disabled
      ? css`
            background: #ededed 0 0 no-repeat padding-box;
          `
      : css`
            background: #f9f9f9 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
            color: #333;
            &::placeholder {
              color: #999;
            }
          `}
  }

  &:active {
    ${({ disabled, errInput }) =>
    disabled
      ? errInput
        ? css`
              background: #ffdede 0 0 no-repeat padding-box;
            `
        : css`
              background: #ededed 0 0 no-repeat padding-box;
            `
      : css`
            background: #e9f0f7 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
            color: #333;
            &::placeholder {
              color: #999;
            }
          `}
  }
`;

export const MessageError = styled.div`
  color: #fa5151;
  font: normal normal normal 12px/20px Noto Sans CJK JP;
  text-align: left;
  padding: 4px 12px;
`;

export const TextAreaInputStyled = styled.textarea<StyleInput>`
  font: normal normal normal 14px/20px Noto Sans CJK JP;
  line-height: 26px;
  min-height: 80px;
  max-height: 200px;
  padding: 10px 12px;
  background: white 0 0 no-repeat padding-box;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  outline: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};
  &::placeholder {
    color: #999;
  }

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
        `
      : css`
          background: white 0 0 no-repeat padding-box;
          color: #464646;
        `}

  ${({ errInput }) =>
    errInput &&
    css`
      background: #ffdede 0 0 no-repeat padding-box;
      border: 1px solid #ff5c5c;
      color: #fa5151;
      &::placeholder {
        color: #ffadad;
      }
    `}

  &:hover {
    ${({ disabled, errInput }) =>
    disabled
      ? errInput
        ? css`
              background: #ffdede 0 0 no-repeat padding-box;
            `
        : css`
              background: #ededed 0 0 no-repeat padding-box;
            `
      : css`
            background: white 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
            color: #464646;
            &::placeholder {
              color: #999;
            }
          `}
  }

  &:focus {
    ${({ disabled }) =>
    disabled
      ? css`
            background: #ededed 0 0 no-repeat padding-box;
          `
      : css`
            background: white 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
            color: #464646;
            &::placeholder {
              color: #999;
            }
          `}
  }

  &:active {
    ${({ disabled, errInput }) =>
    disabled
      ? errInput
        ? css`
              background: #ffdede 0 0 no-repeat padding-box;
            `
        : css`
              background: #ededed 0 0 no-repeat padding-box;
            `
      : css`
            background: #e7eaf0 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
            color: #464646;
            &::placeholder {
              color: #999;
            }
          `}
  }
`;

export const InputFileStyled = styled(InputFont)`
  &[type='file'] {
    display: none;
  }
`;

export const CustomUpload = styled.label<StyleInput>`
  display: flex;
  align-items: center;
  justify-content: center;
  font: normal normal normal 14px/20px Noto Sans CJK JP;
  height: 40px;
  width: 528px;
  padding: 10px 12px;
  background: #f9f9f9 0 0 no-repeat padding-box;
  border-radius: 12px;
  outline: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          border: 1px dashed #e5e5e5;
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
        `
      : css`
          border: 1px dashed #e5e5e5;
          background: #f9f9f9 0 0 no-repeat padding-box;
          color: #333333;
        `}

  ${({ errInput }) =>
    errInput &&
    css`
      border: 1px solid #ff5c5c;
      background: #ffdede 0 0 no-repeat padding-box;
      color: #f92525;
    `}


  &:hover {
    ${({ disabled, errInput }) =>
    disabled
      ? errInput
        ? css`
              border: 1px solid #ff5c5c;
              background: #ffdede 0 0 no-repeat padding-box;
              color: #f92525;
            `
        : css`
              border: 1px dashed #e5e5e5;
              background: #ededed 0 0 no-repeat padding-box;
              color: #999999;
            `
      : css`
            background: #ededed 0 0 no-repeat padding-box;
            border: 1px dashed #0f6eb5;
            color: #0f6eb5;
          `}
  }

  &:focus {
    ${({ disabled, errInput }) =>
    disabled
      ? errInput
        ? css`
              border: 1px solid #ff5c5c;
              background: #ffdede 0 0 no-repeat padding-box;
              color: #f92525;
            `
        : css`
              border: 1px dashed #e5e5e5;
              background: #ededed 0 0 no-repeat padding-box;
              color: #999999;
            `
      : css`
            background: #f9f9f9 0 0 no-repeat padding-box;
            border: 1px dashed #0f6db5;
            color: #0f6eb5;
          `}
  }

  &:active {
    ${({ disabled, errInput }) =>
    disabled
      ? errInput
        ? css`
              border: 1px solid #ff5c5c;
              background: #ffdede 0 0 no-repeat padding-box;
              color: #f92525;
            `
        : css`
              border: 1px dashed #e5e5e5;
              background: #ededed 0 0 no-repeat padding-box;
              color: #999999;
            `
      : css`
            background: #e9f0f7 0 0 no-repeat padding-box;
            border: 1px dashed #0f6db5;
            color: #0f6eb5;
          `}
  }
`;

export const CustomUploadButton = styled.label`
  display: flex;
  justify-content: center;
  width: fit-content;
  align-items: center;
  border-radius: 8px;
  padding: 6px 12px;
  min-width: fit-content;
  border: 1px solid #0f6db5;
  text-align: center;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: 0;
  color: #333333;
  cursor: pointer;

  background: #d2fafa 0 0 no-repeat padding-box;

  &:hover {
    background: #b4fafa 0 0 no-repeat padding-box;
  }

  &:active {
    background: #96e6e6 0 0 no-repeat padding-box;
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
`;

export const DropdownForm = styled.div`
  display: flex;
`;

export const DropdownButton = styled.button<DropdownButtonStyle>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  line-height: 30px;
  padding: 4px 12px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  margin-bottom: ${({ marginBottom }) => `${marginBottom ?? 8}px`};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
        `
      : css`
          background: #f9f9f9 0 0 no-repeat padding-box;
          color: #333333;
        `}

  &:hover {
    ${({ disabled }) =>
    disabled
      ? css`
            background: #ededed 0 0 no-repeat padding-box;
          `
      : css`
            background: #ededed 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
            color: #333;
          `}
  }

  &:focus {
    ${({ disabled }) =>
    disabled
      ? css`
            background: #ededed 0 0 no-repeat padding-box;
          `
      : css`
            background: #f9f9f9 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
            color: #333;
          `}
  }

  &:active {
    ${({ disabled }) =>
    disabled
      ? css`
            background: #ededed 0 0 no-repeat padding-box;
          `
      : css`
            background: #e9f0f7 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
            color: #333;
          `}
  }
`;

export const DropdownMenu = styled.ul<{
  position?: 'top' | 'bottom';
}>`
  z-index: 10;
  position: absolute;
  width: 100%;
  max-height: 160px;
  overflow-y: auto;
  margin: 0;
  padding: 12px 0;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 2px 6px 10px 4px #0000004d;
  ${({ position }) => (position === 'top' ? 'bottom: 50px' : '')};

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

export const DropdownItem = styled.li`
  font-family: 'Noto Sans JP', sans-serif;
  display: flex;
  align-items: center;
  color: #666666;
  height: 24px;
  padding: 10px 12px;
  cursor: pointer;
  white-space: break-spaces;
  overflow-wrap: anywhere;

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

export const DropdownSearchMenu = styled.ul`
  position: absolute;
  height: 270px;
  margin: 0;
  padding: 12px 0;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 2px 6px 10px 4px #0000004d;
  z-index: 1;
`;

export const MenuSearchData = styled.div`
  overflow-y: auto;
  height: 200px;
  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e5e5 0 0 no-repeat padding-box;
    border-radius: 6px;
    border-right: 2px solid transparent;
    border-left: 2px solid transparent;
  }
`;

export const SearchButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 12px;
  height: 48px;
  width: 100%;
  position: absolute;
  bottom: 0;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e5e5e5;
`;
