<script setup lang="ts">
import { computed, ref } from "vue";
import "plus-pro-components/es/components/form/style/css";
import { type PlusColumn, PlusForm } from "plus-pro-components";

const props = withDefaults(defineProps<{ info?: any }>(), {
  info: {
    roleName: "",
    roleCode: "",
    remark: ""
  }
});

const state = ref(props.info);

const rules = {
  roleName: [{ required: true, message: "请输入角色名称" }],
  roleCode: [{ required: true, message: "请输入角色标识" }]
};

const columns: PlusColumn[] = [
  {
    label: "角色名称",
    prop: "roleName",
    colProps: {
      span: 12
    }
  },
  {
    label: "角色标识",
    prop: "roleCode",
    tooltip: "只支持英文字母",
    fieldProps: computed(() => ({ disabled: Number(state.value.id) > 0 })),
    colProps: {
      span: 12
    }
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
  />
</template>

<style lang="scss" scoped></style>
