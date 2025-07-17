<script setup lang="ts">
import { ref } from "vue";
import { useLoginRecord } from "./hooks";
import SearchBar from "@/components/SearchBar";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "~icons/ep/delete";

defineOptions({
  name: "LoginRecord"
});

const tableRef = ref();

const {
  loading,
  searchColumns,
  pagination,
  columns,
  dataList,
  selectedNum,

  getDataList,
  handleSearch,
  handleReset,
  pageSizeChange,
  currentPageChange,
  handleSelectionChange,
  cancelSelection,
  handleDel,
  handleBatchDel
} = useLoginRecord(tableRef);
</script>

<template>
  <div>
    <SearchBar
      class="mb-4"
      :search-columns="searchColumns"
      @search="handleSearch"
      @reset="handleReset"
    />

    <PureTableBar title="登录日志" :columns="columns" @refresh="getDataList">
      <template v-slot="{ size, dynamicColumns }">
        <div
          v-if="selectedNum > 0"
          v-motion-fade
          class="bg-[var(--el-fill-color-light)] w-full h-[46px] mb-2 pl-4 flex items-center"
        >
          <div class="flex-auto">
            <span
              style="font-size: var(--el-font-size-base)"
              class="text-[rgba(42,46,54,0.5)] dark:text-[rgba(220,220,242,0.5)]"
            >
              已选 {{ selectedNum }} 项
            </span>
            <el-button type="primary" text @click="cancelSelection">
              取消选择
            </el-button>
          </div>
          <el-popconfirm title="是否确认删除?" @confirm="handleBatchDel">
            <template #reference>
              <el-button type="danger" text class="mr-1">批量删除</el-button>
            </template>
          </el-popconfirm>
        </div>

        <PureTable
          ref="tableRef"
          row-key="id"
          align-whole="center"
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
          @page-size-change="pageSizeChange"
          @page-current-change="currentPageChange"
        >
          <template #operation="{ row }">
            <el-popconfirm
              :title="`是否确认删除这条数据`"
              @confirm="handleDel(row)"
            >
              <template #reference>
                <el-button
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

<style lang="scss" scoped>
:deep(.el-table__inner-wrapper::before) {
  margin: 0;
}

.main-content {
  margin: 24px 24px 0 !important;
}
</style>
