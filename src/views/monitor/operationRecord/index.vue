<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useOperationRecord } from "./hooks";
import SearchBar from "@/components/SearchBar";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import "vue-json-pretty/lib/styles.css";
import VueJsonPretty from "vue-json-pretty";

import Delete from "~icons/ep/delete";
import View from "~icons/ep/View";

defineOptions({
  name: "OperationRecord"
});

const {
  tableRef,
  loading,
  searchColumns,
  pagination,
  columns,
  dataList,
  selectedNum,
  drawerVisible,
  info,
  descriptionColumns,

  getDataList,
  handleSearch,
  handleReset,
  pageSizeChange,
  currentPageChange,
  handleSelectionChange,
  cancelSelection,
  handleDel,
  handleBatchDel,
  handleShowDrawer
} = useOperationRecord();

onMounted(() => {
  getDataList();
});
</script>

<template>
  <div>
    <SearchBar
      class="mb-4"
      :searchColumns="searchColumns"
      @search="handleSearch"
      @reset="handleReset"
    />

    <PureTableBar title="操作日志" :columns="columns" @refresh="getDataList">
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
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(View)"
              @click="handleShowDrawer(row)"
            >
              详情
            </el-button>
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

    <el-drawer
      v-model="drawerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      direction="btt"
      size="80%"
      title="操作日志详情"
    >
      <PureDescriptions
        :border="true"
        :data="info"
        :columns="descriptionColumns"
        :column="4"
      />
      <el-row class="mt-4" :gutter="16">
        <el-col :span="12">
          <el-tabs type="border-card">
            <el-tab-pane label="请求头">
              <el-scrollbar max-height="calc(50vh - 30px)">
                <VueJsonPretty v-model:data="info[0].requestHeader" />
              </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane label="请求体">
              <el-scrollbar max-height="calc(50vh - 30px)">
                <VueJsonPretty v-model:data="info[0].requestBody" />
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="12">
          <el-tabs type="border-card">
            <el-tab-pane label="响应头">
              <el-scrollbar max-height="calc(50vh - 30px)">
                <VueJsonPretty v-model:data="info[0].responseHeader" />
              </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane label="响应体">
              <VueJsonPretty v-model:data="info[0].responseBody" />
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped></style>
