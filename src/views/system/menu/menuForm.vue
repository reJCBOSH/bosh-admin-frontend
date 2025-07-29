<script setup lang="ts">
import { computed, ref } from "vue";
import "plus-pro-components/es/components/form/style/css";
import { PlusForm, PlusColumn } from "plus-pro-components";
import { OptionsType, ReSegmented } from "@/components/ReSegmented";
import { IconSelect } from "@/components/ReIcon";

const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        menuType: 0,
        parentId: 0,
        title: "",
        name: "",
        path: "",
        component: "",
        displayOrder: 99,
        redirect: "",
        icon: "",
        extraIcon: "",
        activePath: "",
        authCode: "",
        frameSrc: "",
        frameLoading: false,
        keepAlive: false,
        hiddenTag: false,
        fixedTag: false,
        showLink: false,
        showParent: false
      };
    }
  },
  higherMenuOptions: {
    type: Array<any>,
    default: () => []
  }
});

const rules = {
  title: [{ required: true, message: "请输入菜单名称" }],
  name: [{ required: true, message: "请输入路由名称" }],
  path: [{ required: true, message: "请输入路由路径" }]
};

const columns: PlusColumn[] = [
  { label: "菜单类型", prop: "menuType" },
  { label: "上级菜单", prop: "parentId" },
  { label: "菜单名称", prop: "title", colProps: { span: 12 } },
  {
    label: "路由名称",
    prop: "name",
    hideInForm: computed(() => state.value.menuType === 3),
    tooltip: "必须保持唯一",
    colProps: { span: 12 }
  },
  {
    label: "路由路径",
    prop: "path",
    hideInForm: computed(() => state.value.menuType === 3),
    tooltip: "前面必须有个 /",
    colProps: { span: 12 }
  },
  {
    label: "组件路径",
    prop: "component",
    hideInForm: computed(() => state.value.menuType != 0),
    tooltip: "按需加载的页面路径，前面不需要加 /",
    colProps: { span: 12 }
  },
  {
    label: "显示顺序",
    prop: "displayOrder",
    valueType: "input-number",
    fieldProps: { min: 0, max: 9999, precision: 0 },
    tooltip: "值越高显示顺序越靠前",
    colProps: { span: 12 }
  },
  {
    label: "路由重定向",
    prop: "redirect",
    hideInForm: computed(() => state.value.menuType !== 0),
    tooltip: "默认跳转地址",
    colProps: { span: 12 }
  },
  {
    label: "菜单图标",
    prop: "icon",
    hideInForm: computed(() => state.value.menuType === 3),
    colProps: { span: 12 }
  },
  {
    label: "右侧图标",
    prop: "extraIcon",
    fieldProps: { placeholder: "菜单名称右侧的额外图标" },
    hideInForm: computed(() => state.value.menuType === 3),
    colProps: { span: 12 }
  },
  {
    label: "菜单激活",
    prop: "activePath",
    hideInForm: computed(() => state.value.menuType !== 0),
    colProps: { span: 12 }
  },
  {
    label: "权限标识",
    prop: "authCode",
    hideInForm: computed(() => state.value.menuType !== 3),
    colProps: { span: 12 }
  },
  {
    label: "链接地址",
    prop: "frameSrc",
    fieldProps: { placeholder: "请输入 iframe 链接地址" },
    hideInForm: computed(() => state.value.menuType !== 1),
    colProps: { span: 12 }
  },
  {
    label: "加载动画",
    prop: "frameLoading",
    hideInForm: computed(() => state.value.menuType !== 1),
    tooltip: "开启/关闭首次加载动画",
    colProps: { span: 12 }
  },
  {
    label: "菜单",
    prop: "showLink",
    hideInForm: computed(() => state.value.menuType === 3),
    tooltip: "是否会在菜单中显示",
    colProps: { span: 12 }
  },
  {
    label: "父级菜单",
    prop: "showParent",
    hideInForm: computed(() => state.value.menuType === 3),
    tooltip: "显示/隐藏父级菜单",
    colProps: { span: 12 }
  },
  {
    label: "缓存页面",
    prop: "keepAlive",
    hideInForm: computed(() => state.value.menuType > 1),
    tooltip: "是否保存该页面的整体状态",
    colProps: { span: 12 }
  },
  {
    label: "标签页",
    prop: "hiddenTag",
    hideInForm: computed(() => state.value.menuType > 1),
    tooltip: "允许/禁止当前菜单名称或自定义信息添加到标签页",
    colProps: { span: 12 }
  },
  {
    label: "固定标签页",
    prop: "fixedTag",
    hideInForm: computed(() => state.value.menuType > 1),
    tooltip: "是否固定当前菜单名称显示在标签页且不可关闭",
    colProps: { span: 12 }
  }
];

const menuTypeOptions: Array<OptionsType> = [
  { label: "菜单", value: 0 },
  { label: "iframe", value: 1 },
  { label: "外链", value: 2 },
  { label: "按钮", value: 3 }
];

const showLinkOptions: Array<OptionsType> = [
  { label: "显示", value: true },
  { label: "隐藏", value: false }
];

const fixedTagOptions: Array<OptionsType> = [
  { label: "固定", value: true },
  { label: "不固定", value: false }
];

const keepAliveOptions: Array<OptionsType> = [
  { label: "缓存", value: true },
  { label: "不缓存", value: false }
];

const hiddenTagOptions: Array<OptionsType> = [
  { label: "允许", value: false },
  { label: "禁止", value: true }
];

const showParentOptions: Array<OptionsType> = [
  { label: "显示", value: true },
  { label: "隐藏", value: false }
];

const frameLoadingOptions: Array<OptionsType> = [
  { label: "开启", value: true },
  { label: "关闭", value: false }
];

const state = ref(props.info);

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
    <template #plus-field-menuType>
      <ReSegmented
        v-model="state.menuType"
        :options="menuTypeOptions"
        :disabled="state.id && state.id > 0"
      />
    </template>
    <template #plus-field-parentId>
      <el-cascader
        v-model="state.parentId"
        class="w-full"
        :options="higherMenuOptions"
        :props="{
          value: 'id',
          label: 'title',
          emitPath: false,
          checkStrictly: true
        }"
        clearable
        filterable
        placeholder="请选择上级菜单"
      >
        <template #default="{ node, data }">
          <span>{{ data.title }}</span>
          <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
        </template>
      </el-cascader>
    </template>
    <template #plus-field-icon>
      <IconSelect v-model="state.icon" class="w-full" />
    </template>
    <template #plus-field-frameLoading>
      <ReSegmented
        :modelValue="state.frameLoading ? 0 : 1"
        :options="frameLoadingOptions"
        @change="
          ({ option: { value } }) => {
            state.frameLoading = value;
          }
        "
      />
    </template>
    <template #plus-field-showLink>
      <ReSegmented
        :modelValue="state.showLink ? 0 : 1"
        :options="showLinkOptions"
        @change="
          ({ option: { value } }) => {
            state.showLink = value;
          }
        "
      />
    </template>
    <template #plus-field-showParent>
      <ReSegmented
        :modelValue="state.showParent ? 0 : 1"
        :options="showParentOptions"
        @change="
          ({ option: { value } }) => {
            state.showParent = value;
          }
        "
      />
    </template>
    <template #plus-field-keepAlive>
      <ReSegmented
        :modelValue="state.keepAlive ? 0 : 1"
        :options="keepAliveOptions"
        @change="
          ({ option: { value } }) => {
            state.keepAlive = value;
          }
        "
      />
    </template>
    <template #plus-field-hiddenTag>
      <ReSegmented
        :modelValue="state.hiddenTag ? 1 : 0"
        :options="hiddenTagOptions"
        @change="
          ({ option: { value } }) => {
            state.hiddenTag = value;
          }
        "
      />
    </template>
    <template #plus-field-fixedTag>
      <ReSegmented
        :modelValue="state.fixedTag ? 0 : 1"
        :options="fixedTagOptions"
        @change="
          ({ option: { value } }) => {
            state.fixedTag = value;
          }
        "
      />
    </template>
  </PlusForm>
</template>

<style lang="scss" scoped></style>
