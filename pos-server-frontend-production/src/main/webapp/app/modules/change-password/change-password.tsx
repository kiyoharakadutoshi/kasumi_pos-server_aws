import React, { useRef, useState } from "react";

// Component
import Header from '@/components/header/header';
import { AppDispatch, useAppSelector } from "app/config/store";

import FuncKeyDirtyCheckButton from "@/components/button/func-key-dirty-check/func-key-dirty-check-button";
import InputControl from "@/components/control-form/input-control";
import { changePassword, ChangePasswordRequest } from "@/services/change-password-service";
import { MAX_LENGTH_PASSWORD, MIN_LENGTH_PASSWORD } from "app/constants/constants";
import { isNullOrEmpty, localizeFormat, localizeString } from "app/helpers/utils";
import { UserDetail } from 'app/reducers/user-login-reducer';
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { changePasswordDefault } from "./change-password-interface";
import './change-password.scss';

const ChangePassword = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const userDetail: UserDetail = useAppSelector(state => state.loginReducer.userLogin?.user_detail);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');
  const [isErrorCurrentPassword, setIsErrorCurrentPassword] = useState(false);
  const [isErrorNewPassword, setIsErrorNewPassword] = useState(false);
  const [isErrorConfirmNewPassword, setIsErrorConfirmNewPassword] = useState(false);
  const formConfig = useForm({ defaultValues: changePasswordDefault });
  const { getValues, setValue, watch } = formConfig;

  const handleClickChangePassword = () => {
    clearError();
    const { currentPassword, newPassword, confirmNewPassword } = getValues();
    let isEmpty = false;
    isEmpty = validateCurrentPassword(currentPassword);
    isEmpty = validateNewPassword(newPassword, isEmpty);
    isEmpty = validateConfirmNewPassword(newPassword, confirmNewPassword, isEmpty);
    if (isEmpty) return;
    const updateParams: Readonly<ChangePasswordRequest> = {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword
    };
    dispatch(changePassword(updateParams))
      .unwrap()
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        const errors = typeof error === 'string' ? error.split('\n') : [];
        if (isNullOrEmpty(errors)) return;
        setErrorResponse(errors);
      });
  }

  const focusInputByDatatype = (datatype: string): void => {
    const input = document.querySelector(`input[datatype="${datatype}"]`);
    (input as HTMLInputElement)?.focus();
  }

  const errorName = (errors: string[], key: string, notKey?: string) => {
    const error = errors.find(value => value.includes(localizeString(key)) && (notKey ? !value.includes(localizeString(notKey)) : true));
    if (isNullOrEmpty(error)) {
      return null;
    }
    return { isError: true, error }
  }

  const validateCurrentPassword = (currentPassword: string): boolean => {
    if (isNullOrEmpty(currentPassword)) {
      setCurrentPasswordError(localizeFormat('MSG_VAL_001', 'changePasswordScreen.currentPassword'));
      setIsErrorCurrentPassword(true);
      focusInputByDatatype("current-password-input");
      return true;
    }
    return false;
  }
  const validateNewPassword = (newPassword: string, isEmpty: boolean): boolean => {
    if (isNullOrEmpty(newPassword)) {
      setNewPasswordError(localizeFormat('MSG_VAL_001', 'changePasswordScreen.newPassword'));
      setIsErrorNewPassword(true);
      if (!isEmpty) {
        focusInputByDatatype("new-password-input");
      }
      isEmpty = true;
    } else if (newPassword.length < MIN_LENGTH_PASSWORD || newPassword.length > MAX_LENGTH_PASSWORD) {
      setNewPasswordError(localizeFormat('MSG_VAL_056', 'changePasswordScreen.newPassword', String(MIN_LENGTH_PASSWORD), String(MAX_LENGTH_PASSWORD)));
      setIsErrorNewPassword(true)
      if (!isEmpty) {
        focusInputByDatatype("new-password-input");
      }
      isEmpty = true;
    }
    return isEmpty;
  }

  const validateConfirmNewPassword = (newPassword: string, confirmNewPassword: string, isEmpty: boolean): boolean => {
    if (isNullOrEmpty(confirmNewPassword)) {
      setConfirmNewPasswordError(localizeFormat('MSG_VAL_001', 'changePasswordScreen.confirmNewPassword'));
      setIsErrorConfirmNewPassword(true)
      if (!isEmpty) {
        focusInputByDatatype("confirm-new-password-input");
      }
      isEmpty = true;
    } else if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError(localizeFormat('MSG_VAL_057', 'changePasswordScreen.newPassword', 'changePasswordScreen.confirmNewPassword'));
      setIsErrorConfirmNewPassword(true)
      if (!isEmpty) {
        focusInputByDatatype("confirm-new-password-input");
      }
      isEmpty = true;
    }
    return isEmpty;
  }

  const setErrorResponse = (errors: string[]) => {
    const currentPasswordErr = errorName(errors, 'changePasswordScreen.currentPassword');
    let isFocus = false;
    if (currentPasswordErr?.isError === true) {
      isFocus = true;
      setCurrentPasswordError(currentPasswordErr.error);
      setIsErrorCurrentPassword(currentPasswordErr.isError);
      focusInputByDatatype("current-password-input");
    }
    const newPasswordErr = errorName(errors, 'changePasswordScreen.newPassword', 'changePasswordScreen.confirmNewPassword');
    if (newPasswordErr?.isError === true) {
      setNewPasswordError(newPasswordErr.error);
      setIsErrorNewPassword(newPasswordErr.isError);
      if (!isFocus) {
        isFocus = true;
        focusInputByDatatype("new-password-input");
      }
    }
    const confirmNewPasswordErr = errorName(errors, 'changePasswordScreen.confirmNewPassword');
    if (confirmNewPasswordErr?.isError === true) {
      setConfirmNewPasswordError(confirmNewPasswordErr.error);
      setIsErrorConfirmNewPassword(confirmNewPasswordErr.isError);
      if (!isFocus) {
        focusInputByDatatype("confirm-new-password-input");
      }
    }
  }

  const clearError = () => {
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');
    setIsErrorCurrentPassword(false);
    setIsErrorNewPassword(false);
    setIsErrorConfirmNewPassword(false);
  }

  return (
    <div className="page-change-password">
      <div className="page-change-password__wrapper">
        <FormProvider {...formConfig}>
          <Header
            title="changePasswordScreen.title"
            csv={{ disabled: true, listTitleTable: [], csvData: null, fileName: null }}
            printer={{ disabled: true }}
            hasESC={true}
            confirmBack={watch('currentPassword') !== '' || watch('newPassword') !== '' || watch('confirmNewPassword') !== ''}
          />
          <div className="page-change-password__content">
            <div className="page-change-password__list">
              <div className="page-change-password__list-item">
                <div className="page-change-password__old-password">
                  <InputControl
                    labelText={'changePasswordScreen.userId'}
                    value={userDetail?.user_name}
                    widthInput={'915px'}
                    disabled
                  />
                  <InputControl
                    labelText={'changePasswordScreen.userName'}
                    value={userDetail?.user_name}
                    widthInput={'915px'}
                    disabled
                  />
                  <InputControl
                    name="currentPassword"
                    labelText={'changePasswordScreen.currentPassword'}
                    isRequire={true}
                    widthInput={'915px'}
                    isError={isErrorCurrentPassword}
                    errorText={currentPasswordError}
                    type={"password"}
                    autoFocus={true}
                    datatype="current-password-input"
                    onChange={(e: any) => {
                      setIsErrorCurrentPassword(false)
                      setCurrentPasswordError('');
                    }}
                  />
                </div>
                <div className="page-change-password__new-password">
                  <InputControl
                    name="newPassword"
                    labelText={'changePasswordScreen.newPassword'}
                    isRequire={true}
                    widthInput={'915px'}
                    isError={isErrorNewPassword}
                    errorText={newPasswordError}
                    type={"password"}
                    datatype="new-password-input"
                    onChange={(e: any) => {
                      setIsErrorNewPassword(false)
                      setNewPasswordError('');
                    }}
                  />
                  <InputControl
                    name="confirmNewPassword"
                    labelText={'changePasswordScreen.confirmNewPassword'}
                    isRequire={true}
                    widthInput={'915px'}
                    isError={isErrorConfirmNewPassword}
                    errorText={confirmNewPasswordError}
                    type={"password"}
                    datatype="confirm-new-password-input"
                    onChange={(e: any) => {
                      setIsErrorConfirmNewPassword(false)
                      setConfirmNewPasswordError('');
                    }}
                  />
                </div>
              </div>
              <div className="page-change-password__change-password">
                <FuncKeyDirtyCheckButton
                  funcKey={'F9'}
                  text={'changePasswordScreen.confirm'}
                  onClickAction={handleClickChangePassword}
                />
              </div>
            </div>

          </div>
        </FormProvider>
      </div>
    </div>
  )
}
export default ChangePassword;
