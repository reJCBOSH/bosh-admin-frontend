import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 密码正则（密码格式应为8-16位大写字母、小写字母、数字、特殊字符!@#$%^&*?.的组合） */
export const REGEXP_PWD =
  /^.*(?=.{8,16})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*?\.]).*$/;

/** 登录校验 */
const loginRules = reactive<FormRules>({
  username: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请输入用户名"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  password: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请输入密码"));
        } else if (!REGEXP_PWD.test(value)) {
          callback(
            new Error(
              "密码格式应为8-16位大写字母、小写字母、数字、特殊字符!@#$%^&*?.的组合"
            )
          );
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  captcha: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请输入验证码"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

export { loginRules };
