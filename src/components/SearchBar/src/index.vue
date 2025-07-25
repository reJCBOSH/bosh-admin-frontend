<script setup lang="ts">
import { PlusSearch, PlusColumn } from "plus-pro-components";
import { computed, useSlots } from "vue";
import "plus-pro-components/es/components/search/style/css";

defineOptions({
  name: "SearchBar"
});

export interface SearchColumn extends PlusColumn {}

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  columns: {
    type: Array as () => SearchColumn[],
    default: () => []
  },
  showNumber: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(["update:modelValue", "change", "search", "reset"]);

// 使用计算属性实现双向绑定
const localState = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  }
});

const slots = useSlots();

// 处理columns，将prop映射为正确的插槽名
const searchColumns = computed(() => {
  return props.columns.map(column => {
    const newColumn = { ...column };

    // 如果用户使用了prop字段名作为插槽
    if (slots[column.prop]) {
      newColumn.slots = {
        ...(column.slots || {}),
        default: `plus-field-${column.prop}`
      };
    }

    return newColumn;
  });
});

function handleChange(values: any) {
  emit("update:modelValue", values);
  emit("change", values);
}

function handleSearch(values: any) {
  emit("search", values);
}

function handleReset() {
  emit("reset");
}
</script>

<template>
  <div
    class="p-4 bg-bg_color rounded-lg border border-[var(--pure-border-color)]"
  >
    <PlusSearch
      v-model="localState"
      :columns="searchColumns"
      :show-number="showNumber"
      v-bind="$attrs"
      class="mr-[-10px] mb-0!"
      @change="handleChange"
      @search="handleSearch"
      @reset="handleReset"
    >
      <!-- 动态处理所有插槽 -->
      <template v-for="(_, slotName) in $slots" #[slotName]="scope">
        <template v-if="String(slotName).startsWith('plus-field-')">
          <slot :name="slotName" v-bind="scope" />
        </template>
        <template v-else>
          <!-- 自动将prop名转换为plus-field-前缀 -->
          <slot :name="`plus-field-${slotName}`" v-bind="scope" />
        </template>
      </template>
    </PlusSearch>
  </div>
</template>

<style lang="scss" scoped>
:deep(.plus-form-item .plus-form-item__label) {
  color: var(--el-text-color-primary);
}

:deep(.el-link__inner) {
  color: var(--el-color-primary);
}

:deep(.plus-search .plus-search__button__wrapper .el-form-item) {
  margin-right: 0;
}
</style>
