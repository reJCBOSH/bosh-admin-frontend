<script setup lang="ts">
import { computed, ref } from "vue";
import "plus-pro-components/es/components/form/style/css";
import { PlusColumn, PlusForm } from "plus-pro-components";
import { usePublicHooks } from "../hooks";

const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        username: "",
        password: "",
        nickname: "",
        gender: 0,
        deptId: undefined,
        roleId: undefined,
        mobile: "",
        status: 1,
        remark: ""
      };
    }
  },
  higherDeptOptions: {
    type: Array<any>,
    default: () => []
  },
  higherRoleOptions: {
    type: Array<any>,
    default: () => []
  }
});

const { switchStyle } = usePublicHooks();

const state = ref(props.info);

const rules = {
  username: [{ required: true, message: "请输入用户名" }],
  password: [
    { required: true, message: "请输入密码" },
    {
      trigger: "blur",
      pattern:
        /^.*(?=.{8,16})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*?\.]).*$/,
      message:
        "密码格式应为8-16位大写字母、小写字母、数字、特殊字符!@#$%^&*?.的组合"
    }
  ],
  deptId: [{ required: true, message: "请选择所属部门" }],
  roleId: [{ required: true, message: "请选择角色" }]
};

const columns: PlusColumn[] = [
  {
    label: "用户名",
    prop: "username",
    colProps: { span: 12 }
  },
  {
    label: "密码",
    prop: "password",
    tooltip:
      "密码格式应为8-16位大写字母、小写字母、数字、特殊字符!@#$%^&*?.的组合",
    fieldProps: {
      type: "password",
      showPassword: true
    },
    hideInForm: computed(() => state.value.id && state.value.id > 0),
    colProps: { span: 12 }
  },
  {
    label: "昵称",
    prop: "nickname",
    colProps: { span: 12 }
  },
  {
    label: "性别",
    prop: "gender",
    valueType: "radio",
    options: [
      { label: "未知", value: 0 },
      { label: "男", value: 1 },
      { label: "女", value: 2 }
    ],
    colProps: { span: 12 }
  },
  {
    label: "所属部门",
    prop: "deptId",
    colProps: { span: 12 }
  },
  {
    label: "角色",
    prop: "roleId",
    colProps: { span: 12 }
  },
  {
    label: "联系方式",
    prop: "mobile",
    colProps: { span: 12 }
  },
  {
    label: "状态",
    prop: "status",
    hideInForm: computed(() => state.value.id && state.value.id > 0),
    colProps: { span: 12 }
  },
  {
    label: "备注",
    prop: "remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 200,
      showWordLimit: true,
      autosize: { minRows: 2 }
    }
  }
];

const formRef = ref();

function getRef() {
  return formRef.value;
}

function getState() {
  return state.value;
}

defineExpose({ getRef, getState });
</script>

<template>
  <PlusForm
    ref="formRef"
    v-model="state"
    class="mx-4"
    :columns="columns"
    :rules="rules"
    :row-props="{ gutter: 16 }"
    label-width="auto"
    :has-footer="false"
  >
    <template #plus-field-deptId>
      <el-cascader
        v-model="state.deptId"
        class="w-full"
        :options="higherDeptOptions"
        :props="{
          value: 'id',
          label: 'deptName',
          emitPath: false,
          checkStrictly: true
        }"
        clearable
        filterable
        placeholder="请选择上级部门"
      >
        <template #default="{ node, data }">
          <span>{{ data.deptName }}</span>
          <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
        </template>
      </el-cascader>
    </template>
    <template #plus-field-roleId>
      <el-select v-model="state.roleId">
        <el-option
          v-for="item in higherRoleOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="item.disabled"
        />
      </el-select>
    </template>
    <template #plus-field-status>
      <el-switch
        v-model="state.status"
        inline-prompt
        :active-value="1"
        :inactive-value="0"
        active-text="正常"
        inactive-text="冻结"
        :style="switchStyle"
      />
    </template>
  </PlusForm>
</template>

<style lang="scss" scoped></style>
