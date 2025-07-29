import { http } from "@/utils/http";
import { baseApi } from "./utils";
import type { CommonResult } from "@/utils/http/types";

export type CaptchaResult = {
  success: boolean;
  data: {
    picPath: string;
    captchaId: string;
    captchaLength: number;
  };
  msg: string;
};

// 获取验证码
export const captchaApi = () => {
  return http.GET<CaptchaResult>(baseApi("/api/basic/captcha"));
};

// 上传
export const uploadApi = (formData: FormData) => {
  return http.UPLOAD<CommonResult>(baseApi("/api/basic/upload"), formData);
};
