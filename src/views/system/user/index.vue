<script setup lang="ts">
import { ref } from "vue";
import { deviceDetection } from "@pureadmin/utils";
import { useUser } from "./hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import deptTree from "./deptTree.vue";
import { SearchBar } from "@/components/SearchBar";
import { hasAuth } from "@/router/utils";
import { usePublicHooks } from "../hooks";

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
  switchLoadMap,

  getDataList,
  handleSearch,
  handleReset,
  pageSizeChange,
  currentPageChange,
  onTreeSelect,
  handleAdd,
  handleEdit,
  handleDel,
  resetPassword,
  switchStatus
} = useUser();

const { switchStyle } = usePublicHooks();
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
        :model-value="queryParams"
        :columns="searchColumns"
        :show-number="6"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #plus-field-roleId>
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
            v-auth="'sysUser:add'"
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
            <template #status="{ row, index }">
              <el-switch
                v-if="hasAuth('sysUser:status')"
                v-model="row.status"
                :size="size === 'small' ? 'small' : 'default'"
                :loading="switchLoadMap[index]?.loading"
                :disabled="row.roleCode === 'SuperAdmin'"
                :active-value="1"
                :inactive-value="0"
                active-text="正常"
                inactive-text="冻结"
                inline-prompt
                :style="switchStyle"
                @change="() => switchStatus({ row, index })"
              />
              <span v-else>
                <el-tag v-if="row.status === 1" type="success" effect="dark">
                  正常
                </el-tag>
                <el-tag v-else type="danger" effect="dark">冻结</el-tag>
              </span>
            </template>
            <template #operation="{ row }">
              <div v-if="row.roleCode !== 'SuperAdmin'">
                <el-button
                  v-auth="'sysUser:edit'"
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
                      v-auth="'sysUser:del'"
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
                    v-auth="'sysUser:resetPassword'"
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
              </div>
              <div v-else class="cursor-not-allowed">超级管理员</div>
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
