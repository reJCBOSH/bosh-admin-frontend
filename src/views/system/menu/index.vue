<script setup lang="ts">
import { ref } from "vue";
import { useMenu } from "./hooks";
import { SearchBar } from "@/components/SearchBar";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Plus from "~icons/ep/plus";

defineOptions({
  name: "SystemMenu"
});

const tableRef = ref();
const {
  loading,
  searchColumns,
  queryParams,
  columns,
  dataList,

  handleSearch,
  handleReset,
  handleAdd,
  handleEdit,
  handleDel
} = useMenu();
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
      title="菜单管理"
      :columns="columns"
      :isExpandAll="false"
      :tableRef="tableRef?.getTableRef()"
      @refresh="handleSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(Plus)"
          @click="handleAdd"
        >
          新增菜单
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
              v-show="row.menuType !== 3"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(Plus)"
              @click="handleAdd(row)"
            >
              新增
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="danger"
              :size="size"
              :icon="useRenderIcon(Delete)"
              @click="handleDel(row)"
            >
              删除
            </el-button>
          </template>
        </PureTable>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
}
</style>
