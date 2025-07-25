import { http } from "@/utils/http";
import type { CommonResult, ListResult } from "@/utils/http/types";
import { baseApi } from "./utils";

export const getDeptTree = () => {
  return http.GET<CommonResult>(baseApi("/api/sysDept/getTree"));
};

export const getDeptList = (params?: object) => {
  return http.GET<ListResult>(baseApi("/api/sysDept/getList"), params);
};

export const getDeptInfo = (params?: object) => {
  return http.GET<CommonResult>(baseApi("/api/sysDept/getInfo"), params);
};

export const addDept = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysDept/add"), data);
};

export const editDept = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysDept/edit"), data);
};

export const delDept = (data?: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysDept/del"), data);
};
