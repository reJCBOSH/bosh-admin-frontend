<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { useRole } from "./hooks";
import {
  delay,
  subBefore,
  useResizeObserver,
  deviceDetection
} from "@pureadmin/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { SearchBar } from "@/components/SearchBar";
import { PureTableBar } from "@/components/RePureTableBar";
import MenuAuth from "./menuAuth.vue";
import DataAuth from "./dataAuth.vue";
import { hasAuth } from "@/router/utils";

import Plus from "~icons/ep/plus";
import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Menu from "~icons/ep/menu";
import More from "~icons/ep/more";
import Database from "~icons/ri/database-2-fill";
import { usePublicHooks } from "../hooks";

defineOptions({
  name: "SystemRole"
});

const tableRef = ref();
const contentRef = ref();
const treeHeight = ref();

const {
  loading,
  searchColumns,
  queryParams,
  pagination,
  columns,
  dataList,
  switchLoadMap,
  curRow,
  menuAuthVisible,
  dataAuthVisible,

  rowStyle,
  getDataList,
  handleSearch,
  handleReset,
  pageSizeChange,
  currentPageChange,
  switchStatus,
  handleAdd,
  handleEdit,
  handleDel,
  showMenuAuth,
  closeMenuAuth,
  showDataAuth,
  closeDataAuth
} = useRole();

const { switchStyle } = usePublicHooks();

onMounted(() => {
  getDataList();
  useResizeObserver(contentRef, async () => {
    await nextTick();
    delay(60).then(() => {
      treeHeight.value = parseFloat(
        subBefore(tableRef.value.getTableDoms().tableWrapper.style.height, "px")
      );
    });
  });
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

    <div
      ref="contentRef"
      :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
    >
      <PureTableBar
        :class="[
          (menuAuthVisible || dataAuthVisible) && !deviceDetection()
            ? '!w-[60vw]'
            : 'w-full'
        ]"
        style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
        title="角色管理"
        :columns="columns"
        @refresh="getDataList"
      >
        <template #buttons>
          <el-button
            v-auth="'sysRole:add'"
            type="primary"
            :icon="useRenderIcon(Plus)"
            @click="handleAdd"
          >
            新增角色
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <PureTable
            ref="tableRef"
            align-whole="center"
            table-layout="auto"
            row-key="id"
            :loading="loading"
            :size="size"
            adaptive
            :row-style="rowStyle"
            :adaptiveConfig="{ offsetBottom: 108 }"
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
                v-if="hasAuth('sysRole:status')"
                v-model="row.status"
                :size="size === 'small' ? 'small' : 'default'"
                :disabled="row.roleCode === 'SuperAdmin'"
                :loading="switchLoadMap[index]?.loading"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="停用"
                inline-prompt
                :style="switchStyle"
                @change="() => switchStatus({ row, index })"
              />
              <span v-else>
                <el-tag v-if="row.status === 1" type="success" effect="dark">
                  启用
                </el-tag>
                <el-tag v-else type="danger" effect="dark">停用</el-tag>
              </span>
            </template>
            <template #operation="{ row }">
              <div v-if="row.roleCode !== 'SuperAdmin'">
                <el-button
                  v-auth="'sysRole:edit'"
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
                  :title="`是否确认删除这条数据?`"
                  @confirm="handleDel(row)"
                >
                  <template #reference>
                    <el-button
                      v-auth="'sysRole:del'"
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
                    v-if="
                      hasAuth('sysRole:menuAuth') || hasAuth('sysRole:dataAuth')
                    "
                    class="mt-[2px]"
                    link
                    type="primary"
                    :size="size"
                    :icon="useRenderIcon(More)"
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="hasAuth('sysRole:menuAuth')">
                        <el-button
                          class="reset-margin"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon(Menu)"
                          @click="showMenuAuth(row)"
                        >
                          菜单权限
                        </el-button>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="hasAuth('sysRole:dataAuth')">
                        <el-button
                          class="reset-margin"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon(Database)"
                          @click="showDataAuth(row)"
                        >
                          数据权限
                        </el-button>
                      </el-dropdown-item>
                      <!-- <el-dropdown-item>
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Cloud)"
                      >
                        资源权限
                      </el-button>
                    </el-dropdown-item> -->
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div v-else class="cursor-not-allowed">超级管理员</div>
            </template>
          </PureTable>
        </template>
      </PureTableBar>

      <div
        v-if="menuAuthVisible"
        class="!min-w-[calc(100vw-60vw-268px)] px-4 pb-4 bg-bg_color ml-4 overflow-auto rounded-lg"
      >
        <MenuAuth
          :row="curRow"
          :tree-height="treeHeight"
          @ok="getDataList"
          @close="closeMenuAuth"
        />
      </div>

      <div
        v-if="dataAuthVisible"
        class="!min-w-[calc(100vw-60vw-268px)] px-4 pb-4 bg-bg_color ml-4 overflow-auto rounded-lg"
      >
        <DataAuth
          :row="curRow"
          :tree-height="treeHeight"
          @ok="getDataList"
          @close="closeDataAuth"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
