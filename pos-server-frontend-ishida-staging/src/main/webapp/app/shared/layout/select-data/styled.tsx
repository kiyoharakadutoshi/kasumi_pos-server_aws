import styled, { css } from 'styled-components';

export const SelectDataInputStyled = styled.select`
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  height: 35px;
  width: 12vw;
  padding: 10px 12px;
  background: #f9f9f9 0 0 no-repeat padding-box;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  outline: none;
  margin-right: 2px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
        `
      : css`
          background: white;
          color: #333333;
        `}

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

export const SelectOption = styled.option`
  background: #ffffff 0 0 no-repeat padding-box;
`;
