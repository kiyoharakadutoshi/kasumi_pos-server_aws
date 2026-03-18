import { ExistedUserResponse, ListUserRequest, ListUserResponse, UserIdRequest, UserSaveCondition } from "@/modules/user-setting/interface-user";
import { getDataWithParam, postData } from "./base-service";

export const getUserList = getDataWithParam<ListUserRequest, ListUserResponse>('user-login-site');
export const checkExistUserLoginSite = getDataWithParam<UserIdRequest, ExistedUserResponse>('user-login-site/check-exist');
export const confirmUserList = postData<{ users :UserSaveCondition[]}>('user-login-site/maintenance');