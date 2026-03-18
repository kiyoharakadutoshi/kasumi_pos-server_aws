import styled, { css } from 'styled-components';

export const Button = styled.button`
  display: flex;
  justify-content: center;
  width: fit-content;
  align-items: center;
`;

export const BtnSub = styled(Button)`
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  box-shadow: 0 4px 4px #0000004d;
  color: #fff;
  border: none;
  padding: 10px 20px;
  margin-left: 8px;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
        `
      : css`
          background: #2d7de6 0 0 no-repeat padding-box;
        `}
  &:hover {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0 0 no-repeat padding-box' : '#2D64B4 0 0 no-repeat padding-box')};
  }

  &:active {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0 0 no-repeat padding-box' : ' #2D5AB4 0 0 no-repeat padding-box')};
  }
`;

export const BtnNegative = styled(Button)`
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  box-shadow: 0 4px 4px #0000004d;
  color: #fff;
  border: none;
  padding: 2px 12px 3px 12px;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  white-space: nowrap;

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
        `
      : css`
          background: #fa1e1e 0 0 no-repeat padding-box;
        `}
  &:hover {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0 0 no-repeat padding-box' : '#DC1E1E 0 0 no-repeat padding-box')};
  }

  &:active {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0 0 no-repeat padding-box' : ' #BE1E1E 0 0 no-repeat padding-box')};
  }
`;
