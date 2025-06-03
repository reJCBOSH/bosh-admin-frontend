<script setup lang="ts">
import { PlusSearch, PlusColumn, FieldValues } from "plus-pro-components";
import { PropType } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ButtonProps } from "element-plus";
import "plus-pro-components/es/components/search/style/css";

import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import ArrowUp from "~icons/ep/arrow-up";
import ArrowDown from "~icons/ep/arrow-down";

defineOptions({
  name: "SearchBar"
});

export interface SearchColumn extends PlusColumn {
  slot?: string;
}
export interface ExtraButton extends Partial<ButtonProps> {
  key: string;
  label?: string;
}

const state = defineModel<FieldValues>();

const props = defineProps({
  searchColumns: {
    type: Array<SearchColumn>,
    default: () => []
  },
  labelWidth: {
    type: [Number, String],
    default: "auto"
  },
  labelPosition: {
    type: String as PropType<"left" | "right" | "top">,
    default: "left"
  },
  showNumber: {
    type: Number,
    default: 3
  },
  defaultParams: {
    type: Object,
    default: () => ({})
  },
  hasUnfold: {
    type: Boolean,
    default: false
  },
  unfoldType: {
    type: String as PropType<"button" | "link">,
    default: "link"
  },
  extraButtons: {
    type: Array<ExtraButton>,
    default: () => []
  }
});

const emit = defineEmits(["search", "buttonClick"]);

const handleReset = () => {
  state.value = props.defaultParams;
  emit("search");
};
</script>

<template>
  <div class="p-4 bg-bg_color rounded-lg">
    <PlusSearch
      v-model="state"
      class="mr-[-10px]"
      :columns="searchColumns"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :show-number="showNumber"
      :default-values="defaultParams"
      :has-unfold="hasUnfold"
    >
      <template
        v-for="col in searchColumns"
        #[`plus-field-${col.slot}`]="scope"
      >
        <slot :name="col.slot" v-bind="scope" />
      </template>
      <template #footer="{ handleUnfold, isShowUnfold }">
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          @click="$emit('search')"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="handleReset">
          重置
        </el-button>
        <el-button
          v-if="hasUnfold"
          :type="unfoldType != 'button' ? 'primary' : ''"
          :link="unfoldType != 'button'"
          :icon="isShowUnfold ? ArrowUp : ArrowDown"
          @click="handleUnfold"
        >
          {{ isShowUnfold ? "收起" : "展开" }}
        </el-button>
        <slot name="extra-buttons">
          <el-button
            v-for="(item, index) in extraButtons"
            :key="index"
            :size="item.size ? item.size : ''"
            :type="item.type ? item.type : ''"
            :plain="item?.plain ?? false"
            :text="item?.text ?? false"
            :bg="item?.bg ?? false"
            :link="item?.link ?? false"
            :round="item?.round ?? false"
            :circle="item?.circle ?? false"
            :loading="item?.loading ?? false"
            :disabled="item?.disabled ?? false"
            :icon="item.icon ? useRenderIcon(item.icon) : null"
            :autofocus="item?.autofocus ?? false"
            :native-type="item?.nativeType ?? 'button'"
            :auto-insert-space="item?.autoInsertSpace ?? false"
            :color="item?.color ?? ''"
            :dark="item?.dark ?? false"
            :tag="item?.tag ?? 'button'"
            @click="$emit('buttonClick', item.key)"
          >
            {{ item.label }}
          </el-button>
        </slot>
      </template>
    </PlusSearch>
  </div>
</template>

<style lang="scss" scoped>
:deep(.plus-form-item .plus-form-item__label) {
  color: var(--el-text-color-primary);
}

:deep(.plus-search .plus-search__button__wrapper .el-form-item) {
  margin-right: 0;
}
</style>
