import {
  batchDelLoginRecord,
  delLoginRecord,
  getLoginRecordList
} from "@/api/monitor";
import type { SearchColumn } from "@/components/SearchBar";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList } from "@pureadmin/utils";
import { dayjs, ElMessage } from "element-plus";
import { type Ref, onMounted, reactive, ref } from "vue";

export function useLoginRecord(tableRef: Ref) {
  const loading = ref(true);
  const searchColumns: SearchColumn[] = [
    { label: "用户名", prop: "username" },
    {
      label: "登录时间",
      prop: "loginTime",
      valueType: "date-picker",
      fieldProps: {
        type: "datetimerange"
      }
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
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    { label: "用户名", prop: "username" },
    { label: "登录IP", prop: "loginIP" },
    { label: "登录地点", prop: "loginRegion" },
    { label: "操作系统", prop: "loginOS" },
    { label: "浏览器", prop: "loginBrowser" },
    {
      label: "登录状态",
      prop: "loginStatus",
      minWidth: 80,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.loginStatus === 1 ? "success" : "danger"}
          effect="plain"
        >
          {row.loginStatus === 1 ? "成功" : "失败"}
        </el-tag>
      )
    },
    { label: "登录时间", prop: "loginTime", width: 160 },
    // { label: "登出时间", prop: "logout_at", width: 160 }
    { label: "操作", fixed: "right", width: 180, slot: "operation" }
  ];
  const dataList = ref([]);
  const selectedNum = ref(0);

  const getDataList = async () => {
    loading.value = true;
    const params = { ...queryParams.value };
    if (params.loginTime) {
      params.startTime = dayjs(params.loginTime[0]).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      params.endTime = dayjs(params.loginTime[1]).format("YYYY-MM-DD HH:mm:ss");
      delete params.loginTime;
    }
    params.pageNo = pagination.currentPage;
    params.pageSize = pagination.pageSize;
    const res = await getLoginRecordList(params);
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

  async function handleDel(row: any) {
    const { id } = row;
    const res = await delLoginRecord({ id });
    if (res.success) {
      getDataList();
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function cancelSelection() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  async function handleBatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    // 接下来根据实际业务，通过选中行的某项数据，比如下面的id，调用接口进行批量删除
    console.log(getKeyList(curSelected, "id"));
    const res = await batchDelLoginRecord({
      ids: getKeyList(curSelected, "id")
    });
    if (res.success) {
      ElMessage.success(res.msg);
      tableRef.value.getTableRef().clearSelection();
      getDataList();
    } else {
      ElMessage.error(res.msg);
    }
  }

  onMounted(() => {
    getDataList();
  });

  return {
    loading,
    searchColumns,
    queryParams,
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
  };
}
