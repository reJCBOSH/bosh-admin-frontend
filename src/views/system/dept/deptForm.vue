<script setup lang="ts">
import { computed, ref } from "vue";
import "plus-pro-components/es/components/form/style/css";
import { PlusColumn, PlusForm } from "plus-pro-components";
import { usePublicHooks } from "../hooks";

const props = withDefaults(
  defineProps<{ info?: any; higherDeptOptions?: any }>(),
  {
    info: {
      parentId: 0,
      deptName: "",
      deptCode: "",
      status: 1,
      displayOrder: 0,
      remark: ""
    },
    higherDeptOptions: []
  }
);

const { switchStyle } = usePublicHooks();

const state = ref(props.info);

const rules = {
  deptName: [{ required: true, message: "请输入部门名称" }],
  deptCode: [{ required: true, message: "请输入部门标识" }]
};

const columns: PlusColumn[] = [
  {
    label: "上级部门",
    prop: "parentId"
  },
  {
    label: "部门名称",
    prop: "deptName",
    colProps: { span: 12 }
  },
  {
    label: "部门标识",
    prop: "deptCode",
    tooltip: "只支持英文字母",
    fieldProps: computed(() => ({ disabled: Number(state.value.id) > 0 })),
    colProps: { span: 12 }
  },
  {
    label: "状态",
    prop: "status",
    colProps: { span: 12 }
  },
  {
    label: "显示顺序",
    prop: "displayOrder",
    valueType: "input-number",
    tooltip: "数值越大，显示顺序优先",
    fieldProps: {
      min: 0,
      max: 9999,
      precision: 0
    },
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
    label-position="right"
    :has-footer="false"
  >
    <template #plus-field-parentId>
      <el-cascader
        v-model="state.parentId"
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
    <template #plus-field-status>
      <el-switch
        v-model="state.status"
        inline-prompt
        :active-value="1"
        :inactive-value="0"
        active-text="启用"
        inactive-text="停用"
        :style="switchStyle"
      />
    </template>
  </PlusForm>
</template>

<style lang="scss" scoped></style>
