import { http } from "@/utils/http";
import type { CommonResult, ListResult } from "@/utils/http/types";
import { baseApi } from "./utils";

export const getRoleList = (params?: object) => {
  return http.GET<ListResult>(baseApi("/api/sysRole/getList"), params);
};

export const getRoleInfo = (params?: object) => {
  return http.GET<CommonResult>(baseApi("/api/sysRole/getInfo"), params);
};

export const addRole = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysRole/add"), data);
};

export const editRole = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysRole/edit"), data);
};

export const delRole = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysRole/del"), data);
};

export const getRoleMenuIds = (params?: object) => {
  return http.GET<CommonResult>(baseApi("/api/sysRole/getMenuIds"), params);
};

export const getRoleMenu = (params?: object) => {
  return http.GET<CommonResult>(baseApi("/api/sysRole/getMenu"), params);
};

export const setRoleMenuAuth = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysRole/setMenuAuth"), data);
};

export const getRoleDeptIds = (params?: object) => {
  return http.GET<CommonResult>(baseApi("/api/sysRole/getDeptIds"), params);
};

export const setRoleDataAuth = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysRole/setDataAuth"), data);
};

export const setRoleStatus = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysRole/setStatus"), data);
};
