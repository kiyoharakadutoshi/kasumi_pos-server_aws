export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const changePasswordDefault: ChangePasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
}