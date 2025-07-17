<script setup lang="ts">
import { ref } from "vue";
import SearchBar from "@/components/SearchBar";
import { deviceDetection } from "@pureadmin/utils";
import { useUser } from "./hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import deptTree from "./deptTree.vue";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Plus from "~icons/ep/plus";
import Password from "~icons/ri/lock-password-line";
import More from "~icons/ep/more-filled";

defineOptions({
  name: "SystemUser"
});

const treeRef = ref();
const tableRef = ref();

const {
  loading,
  searchColumns,
  queryParams,
  pagination,
  columns,
  dataList,
  higherRoleOptions,
  treeData,
  treeLoading,

  getDataList,
  handleSearch,
  handleReset,
  pageSizeChange,
  currentPageChange,
  onTreeSelect,
  handleAdd,
  handleEdit,
  handleDel,
  resetPassword
} = useUser();
</script>

<template>
  <div :class="['flex', 'justify-between', deviceDetection() && 'flex-wrap']">
    <dept-tree
      ref="treeRef"
      :class="['mr-4', deviceDetection() ? 'w-full' : 'min-w-[300px]']"
      :treeData="treeData"
      :treeLoading="treeLoading"
      @tree-select="onTreeSelect"
    />
    <div
      :class="[
        deviceDetection() ? ['w-full', 'mt-2'] : 'w-[calc(100%-300px-0.5rem)]'
      ]"
    >
      <SearchBar
        class="mb-4"
        :search-columns="searchColumns"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #roleId>
          <el-select
            v-model="queryParams.roleId"
            placeholder="请选择角色"
            clearable
          >
            <el-option
              v-for="item in higherRoleOptions"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            />
          </el-select>
        </template>
      </SearchBar>
      <PureTableBar title="用户管理" :columns="columns" @refresh="getDataList">
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(Plus)"
            @click="handleAdd()"
          >
            新增用户
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <PureTable
            ref="tableRef"
            row-key="id"
            adaptive
            :adaptiveConfig="{ offsetBottom: 108 }"
            align-whole="center"
            table-layout="auto"
            :loading="loading"
            :size="size"
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="pagination"
            :paginationSmall="size === 'small' ? true : false"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
            @page-size-change="pageSizeChange"
            @page-current-change="currentPageChange"
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
              <el-popconfirm
                :title="`是否确认删除${row.username}?`"
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
              <el-dropdown class="ml-3">
                <el-button
                  class="mt-[2px]"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(More)"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button
                        class="reset-margin more-btn"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Password)"
                        @click="resetPassword(row)"
                      >
                        重置密码
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </PureTable>
        </template>
      </PureTableBar>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

:deep(.el-button:focus-visible) {
  outline: none;
}
</style>
