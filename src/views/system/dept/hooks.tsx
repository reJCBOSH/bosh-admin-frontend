import { h, ref } from "vue";
import { usePublicHooks } from "../hooks";
import type { SearchColumn } from "@/components/SearchBar";
import { ElMessage } from "element-plus";
import {
  addDept,
  delDept,
  editDept,
  getDeptInfo,
  getDeptList
} from "@/api/dept";
import {
  cloneDeep,
  deviceDetection,
  handleTree,
  isAllEmpty
} from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog";
import deptForm from "./deptForm.vue";

export function useDept() {
  const { tagStyle } = usePublicHooks();

  const loading = ref(false);
  const queryParams = ref<any>({});
  const searchColumns: SearchColumn[] = [
    { label: "部门名称", prop: "deptName" },
    { label: "部门编码", prop: "deptCode" },
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
  const columns: TableColumnList = [
    { label: "部门名称", prop: "deptName", align: "left", minWidth: 150 },
    { label: "部门编码", prop: "deptCode" },
    {
      label: "状态",
      prop: "status",
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    { label: "显示顺序", prop: "displayOrder" },
    { label: "备注", prop: "remark" },
    { label: "创建时间", prop: "createdAt", width: 160 },
    { label: "操作", width: 220, fixed: "right", slot: "operation" }
  ];
  const treeList = ref([]);
  const dataList = ref([]);
  const deptFormRef = ref();

  async function getDataList() {
    loading.value = true;
    const res = await getDeptList({ pageNo: -1 });
    if (res.success) {
      let newData = res.data.list || [];
      treeList.value = handleTree(cloneDeep(newData), "id", "parentId");
      if (!isAllEmpty(queryParams.value.deptName)) {
        newData = newData.filter(item =>
          item.deptName.includes(queryParams.value.deptName)
        );
      }
      if (!isAllEmpty(queryParams.value.deptCode)) {
        newData = newData.filter(item =>
          item.deptCode.includes(queryParams.value.deptCode)
        );
      }
      if (!isAllEmpty(queryParams.value.status)) {
        newData = newData.filter(
          item => item.status === queryParams.value.status
        );
      }
      dataList.value = handleTree(newData, "id", "parentId");
      setTimeout(() => {
        loading.value = false;
      }, 100);
    } else {
      ElMessage.error(res.msg);
    }
  }

  function handleSearch(params) {
    queryParams.value = params;
    getDataList();
  }

  function handleReset() {
    queryParams.value = {};
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

  function openDialog(title = "新增", info?: any) {
    addDialog({
      title: `${title}部门`,
      props: {
        info,
        higherDeptOptions: formatHigherDeptOptions(cloneDeep(treeList.value))
      },
      width: 800,
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(deptForm, { ref: deptFormRef }),
      beforeSure: done => {
        const DeptFormRef = deptFormRef.value.getRef();
        const data = cloneDeep(deptFormRef.value.getState());
        DeptFormRef.formInstance.validate(async (isValid: boolean) => {
          if (isValid) {
            const res = data.id ? await editDept(data) : await addDept(data);
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

  function handleAdd(row?: any) {
    let info: any;
    if (row) {
      info = {
        parentId: row.id,
        status: 1
      };
    }
    openDialog("新增", info);
  }

  async function handleEdit(row: any) {
    const { id } = row;
    const res = await getDeptInfo({ id });
    if (res.success) {
      openDialog("修改", res.data);
    } else {
      ElMessage.error(res.msg);
    }
  }

  async function handleDel(row: any) {
    const { id } = row;
    const res = await delDept({ id });
    if (res.success) {
      ElMessage.success(res.msg);
      getDataList();
    } else {
      ElMessage.error(res.msg);
    }
  }

  return {
    loading,
    queryParams,
    searchColumns,
    columns,
    treeList,
    dataList,
    deptFormRef,

    getDataList,
    handleSearch,
    handleReset,
    formatHigherDeptOptions,
    handleAdd,
    handleEdit,
    handleDel
  };
}
