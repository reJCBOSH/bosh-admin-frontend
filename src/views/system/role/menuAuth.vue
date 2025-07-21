<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { useRole } from "./hooks";
import { getRoleMenu, getRoleMenuIds, setRoleMenuAuth } from "@/api/role";
import { cloneDeep, getKeyList, handleTree } from "@pureadmin/utils";
import { ElMessage } from "element-plus";

import Close from "~icons/ep/close";
import Check from "~icons/ep/check";

const props = withDefaults(defineProps<{ row?: any; treeHeight?: any }>(), {
  row: null,
  treeHeight: undefined
});

const { iconClass } = useRole();
const curRow = ref();
const treeRef = ref();
const treeProps = {
  value: "id",
  label: "title",
  children: "children"
};
const treeIds = ref([]);
const treeData = ref([]);
const treeSearchValue = ref();
const isLinkage = ref(true);
const isExpandAll = ref(false);
const isSelectAll = ref(false);

watch(
  props,
  () => {
    if (props.row.id) {
      if (!curRow.value || (curRow.value && curRow.value.id !== props.row.id)) {
        curRow.value = cloneDeep(props.row);
        treeSearchValue.value = undefined;
        const { id } = curRow.value;
        const res = Promise.all([getRoleMenu({ id }), getRoleMenuIds({ id })]);
        res.then(async arr => {
          if (arr[0].success && arr[1].success) {
            treeIds.value = getKeyList(arr[0].data, "id");
            treeData.value = handleTree(arr[0].data);
            await nextTick(() => {
              treeRef.value.setExpandedKeys(treeIds.value);
              treeRef.value.setCheckedKeys(arr[1].data);
            });
            isExpandAll.value = true;
            isSelectAll.value = false;
          } else {
            ElMessage.error("网络繁忙，请稍后重试");
          }
        });
      }
    }
  },
  { immediate: true }
);

const onQueryChanged = (query: string) => {
  treeRef.value!.filter(query);
};

const filterMethod = (query: string, node) => {
  return node.title!.includes(query);
};

function menuExpandAllChange(val: boolean) {
  val
    ? treeRef.value.setExpandedKeys(treeIds.value)
    : treeRef.value.setExpandedKeys([]);
}

function menuSelectAllChange(val: boolean) {
  val
    ? treeRef.value.setCheckedKeys(treeIds.value)
    : treeRef.value.setCheckedKeys([]);
}

async function handleMenuSave() {
  const menuIds = treeRef.value.getCheckedKeys();
  if (menuIds.length === 0) {
    ElMessage.info("请选择菜单权限");
    return;
  }
  const res = await setRoleMenuAuth({
    roleId: curRow.value.id,
    menuIds: menuIds
  });
  if (res.success) {
    ElMessage.success(`设置${curRow.value.roleName}菜单权限成功`);
    if (res.data) {
      location.reload();
    } else {
      emit("ok");
      emit("close");
    }
  } else {
    ElMessage.error(res.msg);
  }
}

const emit = defineEmits(["close", "ok"]);
</script>

<template>
  <div>
    <div class="flex justify-between w-full pt-5 pb-4">
      <div class="flex">
        <span :class="iconClass">
          <IconifyIconOffline
            v-tippy="{
              content: '关闭'
            }"
            class="dark:text-white"
            width="18px"
            height="18px"
            :icon="Close"
            @click="emit('close')"
          />
        </span>
        <span :class="[iconClass, 'ml-2']">
          <IconifyIconOffline
            v-tippy="{
              content: '保存菜单权限'
            }"
            class="dark:text-white"
            width="18px"
            height="18px"
            :icon="Check"
            @click="handleMenuSave"
          />
        </span>
      </div>
      <p class="font-bold truncate">
        菜单权限
        {{ `${curRow?.roleName ? `（${curRow.roleName}）` : ""}` }}
      </p>
    </div>
    <el-input
      v-model="treeSearchValue"
      placeholder="请输入菜单进行搜索"
      class="mb-1"
      clearable
      @input="onQueryChanged"
    />
    <div class="flex flex-wrap">
      <el-checkbox
        v-model="isExpandAll"
        label="展开/折叠"
        @change="menuExpandAllChange"
      />
      <el-checkbox
        v-model="isSelectAll"
        label="全选/全不选"
        @change="menuSelectAllChange"
      />
    </div>
    <el-tree-v2
      ref="treeRef"
      show-checkbox
      :data="treeData"
      :props="treeProps"
      :height="treeHeight"
      :check-strictly="!isLinkage"
      :filter-method="filterMethod"
    >
      <template #default="{ node }">
        <span>{{ node.label }}</span>
      </template>
    </el-tree-v2>
  </div>
</template>

<style lang="scss" scoped></style>
