<script setup lang="ts">
import { editSelfPassword } from "@/api/user";
import { DataInfo, userKey } from "@/utils/auth";
import { deviceDetection, storageLocal } from "@pureadmin/utils";
import { ElMessage, type FormInstance } from "element-plus";
import { reactive, ref } from "vue";

defineOptions({
  name: "AccountSetting"
});

const updatePwdVisible = ref(false);
const changePasswordFormRef = ref<FormInstance>();
let changePasswordForm = reactive({
  oldPassword: "",
  newPassword: "",
  rePassword: ""
});
const REGEXP_PWD =
  /^.*(?=.{8,16})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*?\.]).*$/;

const rules = reactive({
  oldPassword: [{ required: true, message: "请输入旧密码" }],
  newPassword: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          return callback(new Error("请输入新密码"));
        } else {
          if (value === changePasswordForm.oldPassword) {
            return callback(new Error("新密码不能与旧密码一致"));
          }
          if (!REGEXP_PWD.test(value)) {
            return callback(new Error("密码格式不正确"));
          }
        }
        callback();
      },
      trigger: "blur"
    }
  ],
  rePassword: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          return callback(new Error("请重复输入新密码"));
        } else {
          if (value !== changePasswordForm.newPassword) {
            return callback(new Error("新密码不一致"));
          }
          if (!REGEXP_PWD.test(value)) {
            return callback(new Error("密码格式不正确"));
          }
        }
        callback();
      },
      trigger: "blur"
    }
  ]
});

function showUpdatePwd() {
  updatePwdVisible.value = true;
}

function hideUpdatePwd() {
  updatePwdVisible.value = false;
  changePasswordFormRef.value.resetFields();
}

const updatePwd = async (formEl: FormInstance) => {
  await formEl.validate(valid => {
    console.log(valid);
    if (valid) {
      editSelfPassword(changePasswordForm).then(res => {
        if (res.success) {
          ElMessage.success("修改密码成功");
          updatePwdVisible.value = false;
          formEl.resetFields();
          const storageUserInfo =
            storageLocal().getItem<DataInfo<number>>(userKey);
          storageLocal().setItem(userKey, storageUserInfo);
        } else {
          ElMessage.error(res.msg);
        }
      });
    }
  });
};
</script>

<template>
  <div
    :class="[
      'min-w-[180px]',
      deviceDetection() ? 'max-w-[100%]' : 'max-w-[60%]'
    ]"
  >
    <h3 class="my-8!">账号管理</h3>
    <div class="flex items-center">
      <div class="flex-1">
        <p>修改密码</p>
      </div>
      <el-button type="primary" text @click="showUpdatePwd">修改</el-button>
    </div>
    <el-divider />

    <el-dialog
      v-model="updatePwdVisible"
      title="修改密码"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      width="40%"
    >
      <el-alert
        title="密码格式：8-16位大写字母、小写字母、数字、特殊字符!@#$%^&*?.的组合"
        type="info"
        :closable="false"
      />
      <el-form
        ref="changePasswordFormRef"
        :model="changePasswordForm"
        label-width="auto"
        :rules="rules"
        class="mt-4 px-4"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="changePasswordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword" required>
          <el-input
            v-model="changePasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="重复新密码" prop="rePassword" required>
          <el-input
            v-model="changePasswordForm.rePassword"
            type="password"
            placeholder="请重复输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="hideUpdatePwd">取消</el-button>
          <el-button type="primary" @click="updatePwd(changePasswordFormRef)">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.el-divider--horizontal {
  border-top: 0.1px var(--el-border-color) var(--el-border-style);
}
</style>
