import { postData } from "./base-service";

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}
export const changePassword = postData<ChangePasswordRequest>('auth/change-password');