<script setup lang="ts">
import { cloneDeep, createFormData, deviceDetection } from "@pureadmin/utils";
import { ref, reactive, onMounted } from "vue";
import dayjs from "dayjs";
import { getSelfInfo, editSelfInfo } from "@/api/user";
import {
  ElMessage,
  FormInstance,
  UploadFile,
  UploadRawFile
} from "element-plus";
import ReCropperPreview from "@/components/ReCropperPreview";
import { uploadApi } from "@/api/basic";

import UploadLine from "~icons/ri/upload-2-line";

defineOptions({
  name: "SelfInfo"
});

const imgSrc = ref("");
const fileName = ref("");
const cropperBlob = ref();
const cropRef = ref();
const uploadRef = ref();
const isShow = ref(false);
const selfInfoFormRef = ref<FormInstance>();

const selfInfo = reactive({
  avatar: "",
  nickname: "",
  gender: 0,
  birthday: "",
  email: "",
  mobile: "",
  introduce: ""
});

const rules = {
  nickname: [{ required: true, message: "昵称必填" }],
  email: [
    {
      pattern: /^[A-Za-z0-9]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
      message: "邮箱格式不正确"
    }
  ],
  mobile: [
    {
      pattern:
        /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
      message: "联系方式格式不正确"
    }
  ]
};

const emit = defineEmits(["updateUserInfo"]);

function disabledDate(data: Date) {
  const dataFormat = dayjs(data).format("YYYY-MM-DD");
  return (
    dataFormat > dayjs().format("YYYY-MM-DD") ||
    dataFormat < dayjs().subtract(60, "year").format("YYYY-MM-DD")
  );
}

function queryEmail(queryString, callback) {
  const emailList = [
    { value: "@qq.com" },
    { value: "@126.com" },
    { value: "@163.com" },
    { value: "@gmail.com" }
  ];
  let results = [];
  let queryList = [];
  emailList.map(item =>
    queryList.push({ value: queryString.split("@")[0] + item.value })
  );
  results = queryString
    ? queryList.filter(
        item =>
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      )
    : queryList;
  callback(results);
}

function beforeAvatarUpload(rawFile: UploadRawFile) {
  if (rawFile.type != "image/*") {
    ElMessage.error("请上传图片格式文件");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("头像文件大小不能超过2MB");
    return false;
  }
  return true;
}

function onChange(uploadFile: UploadFile) {
  const reader = new FileReader();
  reader.onload = e => {
    imgSrc.value = e.target.result as string;
    isShow.value = true;
  };
  fileName.value = uploadFile.name;
  reader.readAsDataURL(uploadFile.raw);
}

function handleClose() {
  cropRef.value.hidePopover();
  uploadRef.value.clearFiles();
  isShow.value = false;
}

const onCropper = ({ blob }) => (cropperBlob.value = blob);

async function handleSubmitImage() {
  console.log(uploadRef.value);
  const formData = createFormData({
    file: new File([cropperBlob.value], fileName.value),
    where: "avatar",
    tag: "image"
  });
  const res = await uploadApi(formData);
  if (res.success) {
    ElMessage.success("更新头像成功");
    selfInfo.avatar = res.data.url;
    handleClose();
  } else {
    ElMessage.error(res.msg);
  }
}

function handleSubmit(formEl: FormInstance) {
  formEl.validate(async valid => {
    if (valid) {
      const data = cloneDeep(selfInfo);
      if (data.birthday) {
        data.birthday = dayjs(data.birthday).format("YYYY-MM-DD");
      }
      const res = await editSelfInfo(data);
      if (res.success) {
        ElMessage.success("更新个人信息成功");
        emit("updateUserInfo", data);
        initSelfInfo();
      } else {
        ElMessage.error(res.msg);
      }
    } else {
      ElMessage.error("请完善表单");
    }
  });
}

async function initSelfInfo() {
  const res = await getSelfInfo();
  if (res.success) {
    Object.assign(selfInfo, res.data);
  } else {
    ElMessage.error(res.msg);
  }
}

onMounted(() => {
  initSelfInfo();
});
</script>

<template>
  <div
    :class="[
      'min-w-[180px]',
      deviceDetection() ? 'max-w-[100%]' : 'max-w-[60%]'
    ]"
  >
    <h3 class="my-8!">个人信息</h3>
    <el-form
      ref="selfInfoFormRef"
      label-position="top"
      :rules="rules"
      :model="selfInfo"
    >
      <el-form-item label="头像">
        <el-avatar :src="selfInfo.avatar" :size="80" class="!text-3xl">
          {{
            selfInfo.avatar ? "" : selfInfo.nickname ? selfInfo.nickname[0] : ""
          }}
        </el-avatar>
        <el-upload
          ref="uploadRef"
          accept="image/*"
          action="#"
          :limit="1"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="onChange"
          :before-upload="beforeAvatarUpload"
        >
          <el-button plain class="ml-4!">
            <IconifyIconOffline :icon="UploadLine" />
            <span class="ml-2">更新头像</span>
          </el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="selfInfo.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="selfInfo.gender">
          <el-radio :value="0">未知</el-radio>
          <el-radio :value="1">男</el-radio>
          <el-radio :value="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="出生日期" prop="birthday">
        <el-date-picker
          v-model="selfInfo.birthday"
          type="date"
          :disabled-date="disabledDate"
          style="width: 100%"
          placeholder="请选择出生日期"
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-autocomplete
          v-model="selfInfo.email"
          :fetch-suggestions="queryEmail"
          :trigger-on-focus="false"
          placeholder="请输入邮箱"
          clearable
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="联系方式" prop="mobile">
        <el-input v-model="selfInfo.mobile" placeholder="请输入联系方式" />
      </el-form-item>
      <el-form-item label="个人简介" prop="introduce">
        <el-input
          v-model="selfInfo.introduce"
          type="textarea"
          :maxlength="200"
          :show-word-limit="true"
          placeholder="请输入个人简介"
          clearable
          :autosize="{ minRows: 2 }"
        />
      </el-form-item>
      <el-button type="primary" @click="handleSubmit(selfInfoFormRef)">
        更新信息
      </el-button>
    </el-form>
    <el-dialog
      v-model="isShow"
      width="40%"
      title="编辑头像"
      destroy-on-close
      :closeOnClickModal="false"
      :before-close="handleClose"
      :fullscreen="deviceDetection()"
    >
      <ReCropperPreview ref="cropRef" :imgSrc="imgSrc" @cropper="onCropper" />
      <template #footer>
        <div class="dialog-footer">
          <el-button bg text @click="handleClose">取消</el-button>
          <el-button bg text type="primary" @click="handleSubmitImage">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
