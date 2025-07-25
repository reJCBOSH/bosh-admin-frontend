<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useDept } from "./hooks";
import { SearchBar } from "@/components/SearchBar";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Plus from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import { hasAuth } from "@/router/utils";

defineOptions({
  name: "SystemDept"
});
const tableRef = ref();
const {
  loading,
  searchColumns,
  queryParams,
  columns,
  dataList,
  getDataList,
  handleSearch,
  handleReset,
  handleAdd,
  handleEdit,
  handleDel
} = useDept();

onMounted(() => {
  getDataList();
});
</script>

<template>
  <div>
    <SearchBar
      class="mb-4"
      :model-value="queryParams"
      :columns="searchColumns"
      @search="handleSearch"
      @reset="handleReset"
    />

    <PureTableBar
      title="部门管理"
      :columns="columns"
      :table-ref="tableRef?.getTableRef()"
      @refresh="getDataList"
    >
      <template #buttons>
        <el-button
          v-auth="'sysDept:add'"
          type="primary"
          :icon="useRenderIcon(Plus)"
          @click="handleAdd"
        >
          新增部门
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <PureTable
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 40 }"
          align-whole="center"
          row-key="id"
          table-layout="auto"
          default-expand-all
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
        >
          <template #operation="{ row }">
            <el-button
              v-if="row.deptCode !== 'SystemAdmin' && hasAuth('sysDept:edit')"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="handleEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-auth="'sysDept:add'"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(Plus)"
              @click="handleAdd(row)"
            >
              新增
            </el-button>
            <el-popconfirm
              :title="`是否确认删除这条数据`"
              @confirm="handleDel(row)"
            >
              <template #reference>
                <el-button
                  v-if="
                    row.deptCode !== 'SystemAdmin' && hasAuth('sysDept:del')
                  "
                  class="reset-margin"
                  link
                  type="danger"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </PureTable>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped></style>
