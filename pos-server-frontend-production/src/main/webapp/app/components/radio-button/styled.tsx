import styled, { css } from 'styled-components';

interface TextRadioStyled {
  disabledText?: boolean;
}

export const RadioButton = styled.div`
  display: flex;
  align-items: center;
`;
export const CheckboxStyled = styled.div`
  display: flex;
  align-items: center;
`;
export const RadioStyled = styled.input`
  &[type='radio'] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 24px;
    height: 24px;
    margin: 0;
    border-radius: 50%;
    outline: none;
    transition: border-color 0.3s;
    position: relative;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      transition: background-color 0.3s;
    }
    ${({ disabled }) =>
    !disabled
      ? css`
            border: 2px solid #333333;
            &:before {
              background: transparent;
            }

            &:hover {
              border: 2px solid #0f6db5;
              &:before {
                background-color: transparent;
              }
            }

            &:focus {
              border: 2px solid #0f6db5;
              &:before {
                background: transparent;
              }
            }

            &:active {
              border: 2px solid #255b9d;
              &:before {
                background-color: transparent;
              }
            }

            &:checked {
              border: 2px solid #333333;

              &:before {
                background: #0f6eb5 0 0 no-repeat padding-box;
              }

              &:hover {
                border: 2px solid #0f6db5;
                &:before {
                  background: #0f6db5 0 0 no-repeat padding-box;
                }
              }
              &:focus {
                border: 2px solid #0f6db5;
                &:before {
                  background: #0f6db5 0 0 no-repeat padding-box;
                }
              }
              &:active {
                border: 2px solid #255b9d;
                &:before {
                  background: #255b9d 0 0 no-repeat padding-box;
                }
              }
            }
          `
      : css`
            border: 2px solid #999999;
            &:before {
              background: #999999 0 0 no-repeat padding-box;
            }
          `}
  }
`;

export const CheckBoxStyled = styled.input`
  &[type='checkbox'] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 24px;
    height: 24px;
    margin: 0;
    border-radius: 1px;
    outline: none;
    transition: border-color 0.3s;
    position: relative;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 24px;
      transition: background-color 0.3s;
    }
    ${({ disabled }) =>
    !disabled
      ? css`
            border: 2px solid #333333;
            &:before {
              background: transparent;
            }

            &:hover {
              border: 2px solid #0f6db5;
              &:before {
                background-color: transparent;
              }
            }

            &:focus {
              border: 2px solid #0f6db5;
              &:before {
                background: transparent;
              }
            }

            &:active {
              border: 2px solid #255b9d;
              &:before {
                background-color: transparent;
              }
            }

            &:checked {
              border: 2px solid #333333;

              &:before {
                background: #0f6eb5
                  url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2724%27%20height%3D%2724%27%20fill%3D%27%23ffffff%27%20viewBox%3D%270%200%2016%2016%27%3E%0A%20%20%3Cpath%20d%3D%27M10.97%204.97a.75.75%200%200%201%201.07%201.05l-3.99%204.99a.75.75%200%200%201-1.08.02L4.324%208.384a.75.75%200%201%201%201.06-1.06l2.094%202.093%203.473-4.425z%27%2F%3E%0A%3C%2Fsvg%3E')
                  0 0 no-repeat padding-box;
                border-radius: 1px;
              }

              &:hover {
                border: 2px solid #0f6db5;
                &:before {
                  background: #0f6eb5
                    url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2724%27%20height%3D%2724%27%20fill%3D%27%23ffffff%27%20viewBox%3D%270%200%2016%2016%27%3E%0A%20%20%3Cpath%20d%3D%27M10.97%204.97a.75.75%200%200%201%201.07%201.05l-3.99%204.99a.75.75%200%200%201-1.08.02L4.324%208.384a.75.75%200%201%201%201.06-1.06l2.094%202.093%203.473-4.425z%27%2F%3E%0A%3C%2Fsvg%3E')
                    0 0 no-repeat padding-box;
                  border-radius: 1px;
                }
              }
              &:focus {
                border: 2px solid #0f6db5;
                &:before {
                  background: #0f6eb5
                    url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2724%27%20height%3D%2724%27%20fill%3D%27%23ffffff%27%20viewBox%3D%270%200%2016%2016%27%3E%0A%20%20%3Cpath%20d%3D%27M10.97%204.97a.75.75%200%200%201%201.07%201.05l-3.99%204.99a.75.75%200%200%201-1.08.02L4.324%208.384a.75.75%200%201%201%201.06-1.06l2.094%202.093%203.473-4.425z%27%2F%3E%0A%3C%2Fsvg%3E')
                    0 0 no-repeat padding-box;
                  border-radius: 1px;
                }
              }
              &:active {
                border: 2px solid #255b9d;
                &:before {
                  background: #0f6eb5
                    url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2724%27%20height%3D%2724%27%20fill%3D%27%23ffffff%27%20viewBox%3D%270%200%2016%2016%27%3E%0A%20%20%3Cpath%20d%3D%27M10.97%204.97a.75.75%200%200%201%201.07%201.05l-3.99%204.99a.75.75%200%200%201-1.08.02L4.324%208.384a.75.75%200%201%201%201.06-1.06l2.094%202.093%203.473-4.425z%27%2F%3E%0A%3C%2Fsvg%3E')
                    0 0 no-repeat padding-box;
                  border-radius: 1px;
                }
              }
            }
          `
      : css`
            border: 2px solid #999999;
            &:before {
              background: #999999 0 0 no-repeat padding-box;
            }
          `}
  }
`;

export const TextCheckBox = styled.label<TextRadioStyled>`
  font-family: 'Noto Sans JP', sans-serif;
  padding-left: 8px;
  display: flex;
  align-items: center;

  ${({ disabledText: disabledtext }) =>
    disabledtext
      ? css`
          color: #999999;
          cursor: not-allowed;
        `
      : css`
          color: #333333;

          cursor: pointer;
        `}
`;
