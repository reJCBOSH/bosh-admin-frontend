import { computed, h, reactive, ref } from "vue";
import { usePublicHooks } from "../hooks";
import type { SearchColumn } from "@/components/SearchBar";
import type { PaginationProps } from "@pureadmin/table";
import {
  addRole,
  delRole,
  editRole,
  getRoleInfo,
  getRoleList,
  setRoleStatus
} from "@/api/role";
import { ElMessage, ElMessageBox } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import { cloneDeep, deviceDetection } from "@pureadmin/utils";
import roleForm from "./roleForm.vue";

export function useRole() {
  const { switchStyle } = usePublicHooks();

  const loading = ref(true);
  const searchColumns: SearchColumn[] = [
    { label: "角色名称", prop: "roleName" },
    { label: "角色标识", prop: "roleCode" },
    {
      label: "状态",
      prop: "status",
      valueType: "select",
      options: [
        { label: "启用", value: 1 },
        { label: "停用", value: 0 }
      ]
    }
  ];
  const queryParams = ref<any>({});
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 15,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "角色名称",
      prop: "roleName"
    },
    {
      label: "角色标识",
      prop: "roleCode"
    },
    {
      label: "状态",
      minWidth: 100,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          disabled={scope.row.roleCode === "SuperAdmin"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="启用"
          inactive-text="停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => switchStatus(scope as any)}
        />
      )
    },
    { label: "备注", prop: "remark", width: 200 },
    { label: "创建时间", prop: "createdAt", width: 180 },
    { label: "操作", fixed: "right", width: 200, slot: "operation" }
  ];
  const dataList = ref([]);
  const roleFormRef = ref();

  const switchLoadMap = ref({});

  const iconClass = computed(() => {
    return [
      "w-[22px]",
      "h-[22px]",
      "flex",
      "justify-center",
      "items-center",
      "outline-none",
      "rounded-[4px]",
      "cursor-pointer",
      "transition-colors",
      "hover:bg-[#0000000f]",
      "dark:hover:bg-[#ffffff1f]",
      "dark:hover:text-[#ffffffd9]"
    ];
  });

  const curRow = ref();
  const menuAuthVisible = ref(false);
  const dataAuthVisible = ref(false);
  const dataAuthOptions = [
    { value: 1, label: "全部数据" },
    { value: 2, label: "本部门数据" },
    { value: 3, label: "本部门及以下数据" },
    { value: 4, label: "本人数据" },
    { value: 5, label: "自定义数据" }
  ];

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  const getDataList = async () => {
    loading.value = true;
    const params: any = { ...queryParams.value };
    params.pageNo = pagination.currentPage;
    params.pageSize = pagination.pageSize;
    const res = await getRoleList(params);
    if (res.success) {
      dataList.value = res.data?.list || [];
      pagination.total = res.data.total;
      setTimeout(() => {
        loading.value = false;
      }, 100);
    } else {
      ElMessage.error(res.msg);
    }
  };

  function handleSearch(params) {
    queryParams.value = params;
    pagination.currentPage = 1;
    getDataList();
  }

  function handleReset() {
    queryParams.value = {};
    pagination.currentPage = 1;
    getDataList();
  }

  function pageSizeChange(val: number) {
    pagination.pageSize = val;
    getDataList();
  }

  function currentPageChange(val: number) {
    pagination.currentPage = val;
    getDataList();
  }

  function switchStatus({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${row.status === 1 ? "启用" : "停用"}</strong><strong style='color:var(--el-color-primary)'>${row.roleName}</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        const res = await setRoleStatus({
          roleId: row.id,
          status: row.status
        });
        if (res.success) {
          ElMessage.success(
            `已${row.status === 1 ? "启用" : "停用"}${row.roleName}`
          );
        } else {
          ElMessage.error(res.msg);
          row.status === 1 ? (row.status = 0) : (row.status = 1);
        }
        setTimeout(() => {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
        }, 100);
      })
      .catch(() => {
        row.status === 1 ? (row.status = 0) : (row.status = 1);
      });
  }

  function openDialog(title = "新增", info?: any) {
    addDialog({
      title: `${title}角色`,
      props: {
        info
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm, { ref: roleFormRef }),
      beforeSure: done => {
        const RoleFormRef = roleFormRef.value.getRef();
        const data = cloneDeep(roleFormRef.value.getState());
        RoleFormRef.formInstance.validate(async (isValid: boolean) => {
          if (isValid) {
            const res = data.id ? await editRole(data) : await addRole(data);
            if (res.success) {
              ElMessage.success(res.msg);
              done();
              getDataList();
            } else {
              ElMessage.error(res.msg);
            }
          } else {
            ElMessage.info("请完善表单");
          }
        });
      }
    });
  }

  function handleAdd() {
    openDialog();
  }

  async function handleEdit(row: any) {
    const { id } = row;
    const res = await getRoleInfo({ id });
    if (res.success) {
      openDialog("修改", res.data);
    } else {
      ElMessage.error(res.msg);
    }
  }

  async function handleDel(row: any) {
    const { id } = row;
    const res = await delRole({ id });
    if (res.success) {
      getDataList();
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  }

  function showMenuAuth(row: any) {
    if (dataAuthVisible.value) {
      dataAuthVisible.value = false;
    }
    curRow.value = cloneDeep(row);
    menuAuthVisible.value = true;
  }

  function closeMenuAuth() {
    curRow.value = null;
    menuAuthVisible.value = false;
  }

  function showDataAuth(row: any) {
    if (menuAuthVisible.value) {
      menuAuthVisible.value = false;
    }
    curRow.value = cloneDeep(row);
    dataAuthVisible.value = true;
  }

  function closeDataAuth() {
    curRow.value = null;
    dataAuthVisible.value = false;
  }

  return {
    loading,
    searchColumns,
    queryParams,
    pagination,
    columns,
    dataList,
    iconClass,
    curRow,
    menuAuthVisible,
    dataAuthVisible,
    dataAuthOptions,

    rowStyle,
    getDataList,
    handleSearch,
    handleReset,
    pageSizeChange,
    currentPageChange,
    handleAdd,
    handleEdit,
    handleDel,
    showMenuAuth,
    closeMenuAuth,
    showDataAuth,
    closeDataAuth
  };
}
