import { h, onMounted, ref } from "vue";
import {
  addMenu,
  editMenu,
  delMenu,
  getMenuList,
  getMenuInfo
} from "@/api/menu";
import { addDialog } from "@/components/ReDialog";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import type { SearchColumn } from "@/components/SearchBar";
import {
  cloneDeep,
  deviceDetection,
  handleTree,
  isAllEmpty
} from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import menuForm from "./menuForm.vue";

export function useMenu() {
  const loading = ref(true);
  const searchColumns: SearchColumn[] = [
    { label: "菜单名称", prop: "title" },
    {
      label: "菜单类型",
      prop: "menuType",
      valueType: "select",
      options: [
        { label: "菜单", value: 0 },
        { label: "iframe", value: 1 },
        { label: "外链", value: 2 },
        { label: "按钮", value: 3 }
      ]
    }
  ];
  const queryParams: any = ref({});
  const getMenuType = (type, text = false) => {
    switch (type) {
      case 0:
        return text ? "菜单" : "primary";
      case 1:
        return text ? "iframe" : "warning";
      case 2:
        return text ? "外链" : "danger";
      case 3:
        return text ? "按钮" : "info";
    }
  };
  const columns: TableColumnList = [
    {
      label: "菜单名称",
      prop: "title",
      width: 200,
      align: "left",
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(useRenderIcon(row.icon), {
              style: { paddingTop: "1px" }
            })}
          </span>
          <span>{row.title}</span>
        </>
      )
    },
    {
      label: "菜单类型",
      prop: "menuType",
      width: 80,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={getMenuType(row.menuType)}
          effect="plain"
        >
          {getMenuType(row.menuType, true)}
        </el-tag>
      )
    },
    {
      label: "路由路径",
      prop: "path",
      width: 160,
      showOverflowTooltip: true
    },
    {
      label: "组件路径",
      prop: "component",
      width: 160,
      showOverflowTooltip: true,
      formatter: ({ path, component }) =>
        isAllEmpty(component) ? path : component
    },
    {
      label: "权限标识",
      prop: "authCode",
      minWidth: 140
    },
    {
      label: "显示顺序",
      prop: "displayOrder",
      width: 80
    },
    {
      label: "隐藏",
      prop: "showLink",
      formatter: ({ showLink }) => (showLink ? "否" : "是"),
      width: 80
    },
    {
      label: "操作",
      fixed: "right",
      width: 250,
      slot: "operation"
    }
  ];
  const treeList = ref([]);
  const dataList = ref([]);
  const menuFormRef = ref();

  const getDataList = async () => {
    loading.value = true;
    const res = await getMenuList({ pageNo: -1 });
    if (res.success) {
      let newData = res.data.list || [];
      treeList.value = handleTree(cloneDeep(newData), "id", "parentId");
      if (!isAllEmpty(queryParams.value.title)) {
        newData = newData.filter(item =>
          item.title.includes(queryParams.value.title)
        );
      }
      dataList.value = handleTree(newData, "id", "parentId");
      setTimeout(() => {
        loading.value = false;
      }, 100);
    } else {
      ElMessage.error(res.msg);
    }
  };

  function handleSearch(params) {
    queryParams.value = params;
    getDataList();
  }

  function handleReset() {
    queryParams.value = {};
    getDataList();
  }

  function openDialog(title = "新增", info?: any) {
    addDialog({
      title: `${title}菜单`,
      props: {
        info,
        higherMenuOptions: cloneDeep(treeList)
      },
      width: 800,
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(menuForm, { ref: menuFormRef }),
      beforeSure(done) {
        const MenuFormRef = menuFormRef.value.getRef();
        const data = cloneDeep(menuFormRef.value.getState());
        MenuFormRef.formInstance.validate(async (isValid: boolean) => {
          if (isValid) {
            const res = data.id ? await editMenu(data) : await addMenu(data);
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
    let info = undefined;
    if (row) {
      info = {
        menuType: 0,
        parentId: row.id,
        displayOrder: 99,
        frameLoading: true,
        keepAlive: false,
        hiddenTag: false,
        fixedTag: false,
        showLink: true,
        showParent: false
      };
    }
    openDialog("新增", info);
  }

  async function handleEdit(row?: any) {
    const { id } = row;
    const res = await getMenuInfo({ id });
    if (res.success) {
      openDialog("修改", res.data);
    } else {
      ElMessage.error(res.msg);
    }
  }

  function handleDel(row?: any) {
    const { id } = row;
    ElMessageBox.confirm(
      `确认要<strong>${"删除"}</strong>菜单<strong style='color:var(--el-color-primary)'>${row.title}</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    ).then(async () => {
      const res = await delMenu({ id });
      if (res.success) {
        getDataList();
        ElMessage.success(res.msg);
      } else {
        ElMessage.error(res.msg);
      }
    });
  }

  onMounted(() => {
    getDataList();
  });

  return {
    loading,
    searchColumns,
    queryParams,
    columns,
    dataList,

    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleDel
  };
}
