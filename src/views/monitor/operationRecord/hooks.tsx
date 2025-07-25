import {
  batchDelOperationRecord,
  delOperationRecord,
  getOperationRecordInfo,
  getOperationRecordList
} from "@/api/monitor";
import type { SearchColumn } from "@/components/SearchBar";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList } from "@pureadmin/utils";
import { dayjs, ElMessage } from "element-plus";
import { reactive, ref } from "vue";

export function useOperationRecord() {
  const tableRef = ref();
  const loading = ref(true);
  const searchColumns: SearchColumn[] = [
    { label: "用户名", prop: "username" },
    {
      label: "请求方式",
      prop: "method",
      valueType: "select",
      options: [
        {
          label: "POST",
          value: "POST"
        },
        {
          label: "GET",
          value: "GET"
        }
      ]
    },
    { label: "请求路径", prop: "path" },
    {
      label: "请求时间",
      prop: "requestTime",
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
    {
      label: "请求方式",
      prop: "method",
      width: "100px",
      cellRenderer: ({ row }) => (
        <>
          <el-tag>{row.method}</el-tag>
        </>
      )
    },
    {
      label: "请求路径",
      prop: "path",
      minWidth: "100px",
      showOverflowTooltip: true
    },
    {
      label: "请求状态",
      prop: "status",
      width: "100px",
      cellRenderer: ({ row }) => (
        <>
          <el-tag type={row.status === 200 ? "success" : "danger"}>
            {row.status}
          </el-tag>
        </>
      )
    },
    {
      label: "请求延迟",
      prop: "latency",
      width: "100px",
      cellRenderer: ({ row }) => <>{row.latency + "ms"}</>
    },
    { label: "请求IP", prop: "requestIP", minWidth: "100px" },
    { label: "请求地点", prop: "requestRegion", minWidth: "100px" },
    { label: "操作系统", prop: "requestOS", minWidth: "100px" },
    { label: "浏览器", prop: "requestBrowser", minWidth: "100px" },
    { label: "请求时间", prop: "createdAt", width: "160px" },
    { label: "操作", fixed: "right", width: "180px", slot: "operation" }
  ];
  const dataList = ref([]);
  const selectedNum = ref(0);
  const drawerVisible = ref(false);
  const info = ref<any>({});
  const descriptionColumns = [
    { label: "用户名", prop: "username", width: 240, minWidth: 240 },
    {
      label: "请求方法",
      prop: "method",
      width: 120,
      cellRenderer: ({ value }) => (
        <el-tag
          type={
            value === "GET"
              ? "success"
              : value === "POST"
                ? "primary"
                : value === "PUT"
                  ? "warning"
                  : "danger"
          }
        >
          {value}
        </el-tag>
      )
    },
    { label: "请求路径", prop: "path", width: 120, span: 2 },
    {
      label: "请求状态",
      prop: "status",
      width: 120,
      cellRenderer: ({ value }) => (
        <el-tag type={value === 200 ? "success" : "danger"}>{value}</el-tag>
      )
    },
    {
      label: "请求延迟",
      prop: "latency",
      width: 120,
      cellRenderer: ({ value }) => value + "ms"
    },
    { label: "请求IP", prop: "requestIP", width: 120, minWidth: 240 },
    { label: "请求地点", prop: "requestRegion" },
    { label: "操作系统", prop: "requestOS" },
    { label: "浏览器", prop: "requestBrowser" },
    { label: "代理", prop: "userAgent", width: 120, span: 2 },
    { label: "请求时间", prop: "createdAt", width: 120 }
  ];

  const getDataList = async () => {
    loading.value = true;
    const params = { ...queryParams.value };
    if (params.requestTime) {
      params.startTime = dayjs(params.requestTime[0]).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      params.endTime = dayjs(params.requestTime[1]).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      delete params.requestTime;
    }
    params.pageNo = pagination.currentPage;
    params.pageSize = pagination.pageSize;
    const res = await getOperationRecordList(params);
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
    const res = await delOperationRecord({ id });
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
    const res = await batchDelOperationRecord({
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

  async function handleShowDrawer(row: any) {
    const data = { id: row.id };
    const res = await getOperationRecordInfo(data);
    if (res.success) {
      res.data.requestHeader = res.data.requestHeader
        ? JSON.parse(res.data.requestHeader)
        : "";
      res.data.requestBody = res.data.requestBody
        ? JSON.parse(res.data.requestBody)
        : "";
      res.data.responseHeader = res.data.responseHeader
        ? JSON.parse(res.data.responseHeader)
        : "";
      res.data.responseBody = res.data.responseBody
        ? JSON.parse(res.data.responseBody)
        : "";
      info.value = [res.data];
      drawerVisible.value = true;
    } else {
      ElMessage.error(res.msg);
    }
  }

  return {
    tableRef,
    loading,
    searchColumns,
    queryParams,
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
  };
}
