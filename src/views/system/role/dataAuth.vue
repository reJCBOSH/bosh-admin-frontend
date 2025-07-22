<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { useRole } from "./hooks";
import { ElMessage } from "element-plus";
import { cloneDeep, getKeyList, handleTree } from "@pureadmin/utils";
import { getDeptList } from "@/api/dept";
import { getRoleDeptIds, setRoleDataAuth } from "@/api/role";

import Close from "~icons/ep/close";
import Check from "~icons/ep/check";

const props = defineProps({
  row: {
    type: Object,
    default: null
  },
  treeHeight: {
    type: Number,
    default: undefined
  }
});

const { iconClass, dataAuthOptions } = useRole();
const curRow = ref();
const dataAuth = ref();
const treeRef = ref();
const treeSearchValue = ref();
const treeIds = ref([]);
const treeData = ref([]);
const treeProps = {
  value: "id",
  label: "deptName",
  children: "children"
};

watch(
  props,
  () => {
    if (props.row.id) {
      if (!curRow.value || (curRow.value && curRow.value.id !== props.row.id)) {
        curRow.value = cloneDeep(props.row);
        dataAuth.value =
          curRow.value.dataAuth === 0 ? undefined : curRow.value.dataAuth;
        treeSearchValue.value = undefined;
        const { id } = curRow.value;
        const res = Promise.all([
          getDeptList({ pageNo: -1 }),
          getRoleDeptIds({ id })
        ]);
        res.then(async arr => {
          if (arr[0].success && arr[1].success) {
            treeIds.value = getKeyList(arr[0].data.list, "id");
            treeData.value = handleTree(arr[0].data.list, "id", "parentId");
            if (arr[1].data.length > 0) {
              await nextTick(() => {
                treeRef.value.setCheckedKeys(arr[1].data);
              });
            }
          } else {
            ElMessage.error("网络繁忙，请稍后重试");
          }
        });
      }
    }
  },
  { immediate: true }
);

async function handleDataSave() {
  let deptIds = [];
  if (dataAuth.value === 5) {
    deptIds = treeRef.value.getCheckedKeys();
    if (deptIds.length === 0) {
      ElMessage.info("请选择部门");
      return;
    }
  }
  const res = await setRoleDataAuth({
    roleId: curRow.value.id,
    dataAuth: dataAuth.value,
    deptIds: deptIds
  });
  if (res.success) {
    ElMessage.success(`设置${curRow.value.roleName}数据权限成功`);
    emit("ok");
    emit("close");
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
              content: '保存数据权限'
            }"
            class="dark:text-white"
            width="18px"
            height="18px"
            :icon="Check"
            @click="handleDataSave"
          />
        </span>
      </div>
      <p class="font-bold truncate">
        数据权限
        {{ `${curRow?.roleName ? `（${curRow.roleName}）` : ""}` }}
      </p>
    </div>
    <el-select v-model="dataAuth" placeholder="请选择数据权限">
      <el-option
        v-for="(item, index) in dataAuthOptions"
        :key="index"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-tree-v2
      v-if="dataAuth === 5"
      ref="treeRef"
      class="mt-2"
      show-checkbox
      :data="treeData"
      :props="treeProps"
      :height="treeHeight"
      :default-expanded-keys="treeIds"
      :check-strictly="true"
    >
      <template #default="{ node }">
        <span>{{ node.label }}</span>
      </template>
    </el-tree-v2>
  </div>
</template>

<style lang="scss" scoped></style>
