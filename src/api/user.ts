import { http } from "@/utils/http";
import { baseApi } from "./utils";
import type { CommonResult, ListResult } from "@/utils/http/types";

export type UserResult = {
  success: boolean;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（时间戳） */
    expires: number;
  };
  msg: string;
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（时间戳） */
    expires: number;
  };
  msg: string;
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", baseApi("/api/basic/login"), {
    data
  });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>(
    "post",
    baseApi("/api/basic/refreshToken"),
    { data }
  );
};

export const getUserList = (params?: object) => {
  return http.GET<ListResult>(baseApi("/api/sysUser/getList"), params);
};

export const getUserInfo = (params?: object) => {
  return http.GET<CommonResult>(baseApi("/api/sysUser/getInfo"), params);
};

export const addUser = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysUser/add"), data);
};

export const editUser = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysUser/edit"), data);
};

export const delUser = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysUser/del"), data);
};

export const setUserStatus = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysUser/setStatus"), data);
};

export const resetUserPassword = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysUser/resetPassword"), data);
};

export const getSelfInfo = () => {
  return http.GET<CommonResult>(baseApi("/api/sysUser/getSelfInfo"));
};

export const editSelfInfo = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysUser/editSelfInfo"), data);
};

export const editSelfPassword = (data?: object) => {
  return http.POST<CommonResult>(
    baseApi("/api/sysUser/editSelfPassword"),
    data
  );
};
