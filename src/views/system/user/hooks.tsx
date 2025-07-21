import type { PaginationProps } from "@pureadmin/table";
import { h, onMounted, reactive, ref } from "vue";
import { usePublicHooks } from "../hooks";
import {
  addUser,
  delUser,
  editUser,
  getUserInfo,
  getUserList,
  resetUserPassword,
  setUserStatus
} from "@/api/user";
import { ElMessage, ElMessageBox } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import { cloneDeep, deviceDetection, handleTree } from "@pureadmin/utils";
import userForm from "./userForm.vue";
import { getDeptList } from "@/api/dept";
import { getRoleList } from "@/api/role";
import type { SearchColumn } from "@/components/SearchBar";

export function useUser() {
  const { switchStyle } = usePublicHooks();
  const switchLoadMap = ref({});

  const loading = ref(true);
  const searchColumns: SearchColumn[] = [
    { label: "用户名", prop: "username" },
    { label: "昵称", prop: "nickname" },
    {
      label: "性别",
      prop: "gender",
      valueType: "select",
      options: [
        { label: "未知", value: 0 },
        { label: "男", value: 1 },
        { label: "女", value: 2 }
      ]
    },
    {
      label: "角色",
      prop: "roleId"
    },
    { label: "联系方式", prop: "mobile" },
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
  const queryParams: any = ref({});
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 15,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "头像",
      prop: "avatar",
      width: 80,
      cellRenderer: ({ row, props }) => (
        <el-avatar size={props.size} src={row.avatar ? row.avatar : ""}>
          {row.avatar ? "" : row.nickname ? row.nickname[0] : "user"}
        </el-avatar>
      )
    },
    { label: "用户名", prop: "username", minWidth: 120 },
    { label: "昵称", prop: "nickname", minWidth: 120 },
    {
      label: "性别",
      prop: "gender",
      minWidth: 80,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={
            row.gender === 0 ? "info" : row.gender === 1 ? "primary" : "danger"
          }
          effect="plain"
        >
          {row.gender === 0 ? "未知" : row.gender === 1 ? "男" : "女"}
        </el-tag>
      )
    },
    { label: "所属部门", prop: "deptName", minWidth: 100 },
    { label: "角色", prop: "roleName", minWidth: 100 },
    { label: "联系方式", prop: "mobile", minWidth: 120 },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="正常"
          inactive-text="冻结"
          inline-prompt
          style={switchStyle.value}
          onChange={() => switchStatus(scope as any)}
        />
      )
    },
    { label: "操作", fixed: "right", width: 180, slot: "operation" }
  ];
  const dataList = ref([]);
  const userFormRef = ref();
  const higherRoleOptions = ref([]);
  const higherDeptOptions = ref([]);
  const treeData = ref([]);
  const treeLoading = ref(true);

  const getDataList = async () => {
    loading.value = true;
    const params: any = { ...queryParams.value };
    params.pageNo = pagination.currentPage;
    params.pageSize = pagination.pageSize;
    const res = await getUserList(params);
    if (res.success) {
      dataList.value = res.data.list || [];
      pagination.total = res.data.total;
      setTimeout(() => {
        loading.value = false;
      }, 100);
    } else {
      ElMessage.error(res.msg);
    }
  };

  const getHigherRoleOptions = async () => {
    const res = await getRoleList({ pageNo: -1 });
    if (res.success) {
      higherRoleOptions.value = res.data.list || [];
    }
  };

  function handleSearch(params: any) {
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

  function onTreeSelect({ id, selected }) {
    if (selected) {
      queryParams.value.deptId = id;
    } else {
      delete queryParams.value.deptId;
    }
    getDataList();
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function formatHigherRoleOptions(roleList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段
    if (!roleList || !roleList.length) return;
    const newRoleList = [];
    for (let i = 0; i < roleList.length; i++) {
      const oneRole = {
        label: roleList[i].roleName,
        value: roleList[i].id,
        disabled: roleList[i].status === 0 ? true : false
      };
      newRoleList.push(oneRole);
    }
    return newRoleList;
  }

  function switchStatus({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${row.status === 1 ? "激活" : "冻结"}</strong><strong style='color:var(--el-color-primary)'>${row.username}</strong>吗?`,
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
        const res = await setUserStatus({
          id: row.id,
          status: row.status
        });
        if (res.success) {
          ElMessage.success(
            `已${row.status === 1 ? "激活" : "冻结"}${row.username}`
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
      title: `${title}用户`,
      props: {
        info,
        higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
        higherRoleOptions: formatHigherRoleOptions(higherRoleOptions.value)
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(userForm, { ref: userFormRef }),
      beforeSure: done => {
        const UserFormRef = userFormRef.value.getRef();
        const data = cloneDeep(userFormRef.value.getState());
        UserFormRef.formInstance.validate(async (isValid: boolean) => {
          if (isValid) {
            const res = data.id ? await editUser(data) : await addUser(data);
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
    const res = await getUserInfo({ id });
    if (res.success) {
      openDialog("修改", res.data);
    } else {
      ElMessage.error(res.msg);
    }
  }

  async function handleDel(row: any) {
    const { id } = row;
    const res = await delUser({ id });
    if (res.success) {
      getDataList();
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  }

  function resetPassword(row: any) {
    const { id } = row;
    ElMessageBox.confirm(
      `确认要<strong>${"重置"}</strong><strong style='color:var(--el-color-primary)'>${row.username}</strong>的密码吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    ).then(async () => {
      const res = await resetUserPassword({ id });
      if (res.success) {
        getDataList();
        ElMessage.success(res.msg);
      } else {
        ElMessage.error(res.msg);
      }
    });
  }

  onMounted(async () => {
    treeLoading.value = true;
    getDataList();
    getHigherRoleOptions();

    const res = await getDeptList({ pageNo: -1 });
    if (res.success) {
      higherDeptOptions.value = handleTree(res.data.list, "id", "parentId");
      treeData.value = handleTree(res.data.list, "id", "parentId");
      treeLoading.value = false;
    } else {
      ElMessage.error(res.msg);
    }
  });

  return {
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
    getHigherRoleOptions,
    handleSearch,
    handleReset,
    pageSizeChange,
    currentPageChange,
    onTreeSelect,
    handleAdd,
    handleEdit,
    handleDel,
    resetPassword
  };
}
