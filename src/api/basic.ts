import { http } from "@/utils/http";
import { baseApi } from "./utils";

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
