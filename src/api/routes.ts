import { http } from "@/utils/http";
import type { CommonResult } from "@/utils/http/types";
import { baseApi } from "./utils";

export const getAsyncRoutes = () => {
  return http.request<CommonResult>(
    "post",
    baseApi("/api/sysMenu/getAsyncRoutes")
  );
};
