import { http } from "@/utils/http";
import type { CommonResult, ListResult } from "@/utils/http/types";
import { baseApi } from "./utils";

// getMenuList 获取菜单列表
export const getMenuList = (params?: object) => {
  return http.GET<ListResult>(baseApi("/api/sysMenu/getList"), params);
};

// getMenuInfo 获取菜单信息
export const getMenuInfo = (params?: object) => {
  return http.GET<CommonResult>(baseApi("/api/sysMenu/getInfo"), params);
};

// addMenu 新增菜单
export const addMenu = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysMenu/add"), data);
};

// editMenu 编辑菜单
export const editMenu = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysMenu/edit"), data);
};

// delMenu 删除菜单
export const delMenu = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysMenu/del"), data);
};
