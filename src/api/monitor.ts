import { http } from "@/utils/http";
import type { CommonResult, ListResult } from "@/utils/http/types";
import { baseApi } from "./utils";

export const getLoginRecordList = (params: any) => {
  return http.GET<ListResult>(baseApi("/api/sysLoginRecord/getList"), params);
};

export const delLoginRecord = (data: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysLoginRecord/del"), data);
};

export const batchDelLoginRecord = (data: object) => {
  return http.POST<CommonResult>(baseApi("/api/sysLoginRecord/batchDel"), data);
};
