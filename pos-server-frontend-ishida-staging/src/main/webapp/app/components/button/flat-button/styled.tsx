import styled, { css } from 'styled-components';

export const Button = styled.button`
  display: flex;
  justify-content: center;
  width: fit-content;
  align-items: center;
  border-radius: 8px;
`;

export const BtnNormal = styled(Button)`
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
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
          border: 1px solid #d4d4d4;
        `
      : css`
          background: #d2fafa 0 0 no-repeat padding-box;
        `}
  &:hover {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0% 0% no-repeat padding-box' : '#b4fafa 0% 0% no-repeat padding-box')};
  }

  &:active {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0% 0% no-repeat padding-box' : ' #96e6e6 0% 0% no-repeat padding-box')};
  }
`;

export const BtnClose = styled(Button)`
  padding: 14px;
  border: 1px solid #ff5c5c;
  text-align: center;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: 0;
  color: #333333;
  border-radius: 0;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
          border: 1px solid #d4d4d4;
        `
      : css`
          background: #fad2fa 0 0 no-repeat padding-box;
        `}
  &:hover {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0% 0% no-repeat padding-box' : '#f0b4f0 0% 0% no-repeat padding-box')};
  }

  &:active {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0% 0% no-repeat padding-box' : ' #e696e6 0% 0% no-repeat padding-box')};
  }
`;

export const BtnNormalIcon = styled(Button)`
  padding: 6px 24px;
  min-width: fit-content;
  text-align: center;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: 0;
  color: #545f95;
  background-color: white;
  border: none;
  border-radius: 12px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #545f95;
        `
      : css`
          background: white 0 0 no-repeat padding-box;
          color: #545f95;
        `}
  &:hover {
    ${({ disabled }) =>
    disabled
      ? css`
            background: #ededed 0 0 no-repeat padding-box;
            color: #999999;
          `
      : css`
          color: #545f95;
          background: #E6E6E6 0 0 no-repeat padding-box;
        `};
  }

  &:active {
    background: ${({ disabled }) => (disabled ? '#ededed 0% 0% no-repeat padding-box' : ' #96E6E6 0% 0% no-repeat padding-box')};
  }
`;

export const BtnDarkNormalIcon = styled(Button)`
  padding: 6px 24px;
  min-width: fit-content;
  text-align: center;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: 0;
  color: white;
  background-color: #545f95;
  border: none;
  border-radius: 12px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
        background: #9FA3B9 0 0 no-repeat padding-box;
        color: white;
        cursor: not-allowed;
      `
      : css`
          background: #545f95 0 0 no-repeat padding-box;
          color: white;
        `}
  &:hover {
    ${({ disabled }) =>
    disabled
      ? css`
        background: #9FA3B9 0 0 no-repeat padding-box;
        color: #ffffff;
          cursor: not-allowed;
          `
      : css`
            color: white;
            background: #636FAC 0 0 no-repeat padding-box;
          `};
  }

  &:active {
    background: ${({ disabled }) => (disabled ? '#9FA3B9 0% 0% no-repeat padding-box' : ' #35417D 0% 0% no-repeat padding-box')};
  }
`;

export const BtnNegative = styled(Button)`
  padding: 6px 12px;
  border: 1px solid #ff5c5c;
  min-width: fit-content;
  text-align: center;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: 0;
  color: #333333;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
          border: 1px solid #d4d4d4;
        `
      : css`
          background: #fad2fa 0 0 no-repeat padding-box;
        `}
  &:hover {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0% 0% no-repeat padding-box' : '#f0b4f0 0% 0% no-repeat padding-box')};
  }

  &:active {
    background: ${({ disabled }) => (disabled ? '#EDEDED 0% 0% no-repeat padding-box' : ' #e696e6 0% 0% no-repeat padding-box')};
  }
`;

export const BtnMainMenu = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #333333;
  text-align: center;
  letter-spacing: 0;
  color: #333333;
  border-radius: 0;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
          border: 1px solid #d4d4d4;
        `
      : css`
          background: #ffffff 0 0 no-repeat padding-box;
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
            color: #0f6db5;
          `};
  }

  &:active {
    ${({ disabled }) =>
    disabled
      ? css`
            background: #ededed 0 0 no-repeat padding-box;
          `
      : css`
            background: #e9f0f7 0 0 no-repeat padding-box;
            border: 1px solid #1c4476;
            color: #1c4476;
          `};
  }
`;

export const TextMainMenu = styled.div`
  text-align: left;
  width: 70px;
  height: 29px;
`;

export const BtnDefault = styled(Button)`
  padding: 6px 12px;
  min-width: fit-content;
  text-align: center;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: 0;
  border: 1px solid #0f6db5;
  color: #333333;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          background: #ededed 0 0 no-repeat padding-box;
          color: #999999;
          border: 1px solid #d4d4d4;
        `
      : css`
          background: #d2fafa 0 0 no-repeat padding-box;
        `}
  &:hover {
    ${({ disabled }) =>
    disabled
      ? css`
            background: #ededed 0 0 no-repeat padding-box;
            color: #999999;
            border: 1px solid #d4d4d4;
          `
      : css`
            color: #333333;
            background: #b4fafa 0 0 no-repeat padding-box;
            border: 1px solid #0f6db5;
          `};
  }

  &:active {
    background: ${({ disabled }) => (disabled ? '#ededed 0% 0% no-repeat padding-box' : ' #96E6E6 0% 0% no-repeat padding-box')};
  }
`;

export const BtnText = styled(Button)`
  padding: 6px 12px;
  min-width: fit-content;
  text-align: center;
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: normal;
  font-stretch: normal;
  font-size: 24px;
  line-height: 36px;
  border: none;
  letter-spacing: 0;
  color: #666666;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) =>
    disabled
      ? css`
          color: #999999;
        `
      : css`
          background-color: #fff;
        `}
  &:hover {
    ${({ disabled }) =>
    disabled
      ? css`
            color: #999999;
          `
      : css`
            color: #0f6db5;
          `};
  }

  &:active {
    color: ${({ disabled }) => (disabled ? '#999999' : ' #255B9D')};
  }
`;
