<script setup lang="ts">
import { deviceDetection, storageLocal, useGlobal } from "@pureadmin/utils";
import { onBeforeMount, onMounted, ref } from "vue";
import { ReText } from "@/components/ReText";
import { useRouter } from "vue-router";
import SelfInfo from "./selfInfo.vue";
import AccountSetting from "./accountSetting.vue";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import LaySidebarTopCollapse from "@/layout/components/lay-sidebar/components/SidebarTopCollapse.vue";
import { DataInfo, userKey } from "@/utils/auth";
import { useNav } from "@/layout/hooks/useNav";

import ArrowGoBackLine from "~icons/ri/arrow-go-back-line";
import SelfInfoIcon from "~icons/ri/user-3-line";
import AccountSettingIcon from "~icons/ri/profile-line";
import LogoutCircleRLine from "~icons/ri/logout-circle-r-line";

defineOptions({
  name: "UserSetting"
});
const { logout } = useNav();
const router = useRouter();
const isOpen = ref(deviceDetection() ? false : true);
const { $storage } = useGlobal<GlobalPropertiesApi>();

onBeforeMount(() => {
  useDataThemeChange().dataThemeChange($storage.layout?.overallStyle);
});

const userInfo = ref({
  avatar: "",
  username: "",
  nickname: ""
});

const panes = [
  {
    key: "selfInfo",
    label: "个人信息",
    icon: SelfInfoIcon,
    component: SelfInfo
  },
  {
    key: "accountManagement",
    label: "账号管理",
    icon: AccountSettingIcon,
    component: AccountSetting
  }
];
const witchPane = ref("selfInfo");

function updateUserInfo(data: any) {
  const { avatar, nickname } = data;
  userInfo.value.avatar = avatar;
  userInfo.value.nickname = nickname;
  const storageUserInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  storageUserInfo.avatar = avatar;
  storageUserInfo.nickname = nickname;
  storageLocal().setItem(userKey, storageUserInfo);
}

function goBack() {
  router.go(-1);
}

onMounted(() => {
  const storageUserInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  if (!storageUserInfo) {
    router.push("/login");
    return;
  }
  userInfo.value.avatar = storageUserInfo.avatar;
  userInfo.value.username = storageUserInfo.username;
  userInfo.value.nickname = storageUserInfo.nickname;
});
</script>

<template>
  <el-container class="h-full">
    <el-aside
      v-if="isOpen"
      class="pure-account-settings overflow-hidden px-2 dark:!bg-[var(--el-bg-color)] border-r-[1px] border-[var(--pure-border-color)]"
      :width="deviceDetection() ? '180px' : '240px'"
    >
      <el-menu :default-active="witchPane" class="pure-account-settings-menu">
        <el-menu-item
          class="hover:!transition-all hover:!duration-200 hover:!text-base !h-[50px]"
          @click="goBack"
        >
          <div class="flex items-center">
            <IconifyIconOffline :icon="ArrowGoBackLine" />
            <span class="ml-2">返回</span>
          </div>
        </el-menu-item>
        <div class="flex items-center ml-8 mt-4 mb-4">
          <el-avatar :size="48" :src="userInfo.avatar" />
          <div class="ml-4 flex flex-col max-w-[130px]">
            <ReText class="font-bold !self-baseline">
              {{ userInfo.nickname }}
            </ReText>
            <ReText class="!self-baseline" type="info">
              {{ userInfo.username }}
            </ReText>
          </div>
        </div>
        <el-menu-item
          v-for="item in panes"
          :key="item.key"
          :index="item.key"
          @click="
            () => {
              witchPane = item.key;
              if (deviceDetection()) {
                isOpen = !isOpen;
              }
            }
          "
        >
          <div class="flex items-center z-10">
            <el-icon><IconifyIconOffline :icon="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </div>
        </el-menu-item>
        <el-menu-item>
          <div class="flex items-center z-10" @click="logout">
            <el-icon><IconifyIconOffline :icon="LogoutCircleRLine" /></el-icon>
            <span>退出系统</span>
          </div>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <LaySidebarTopCollapse
        v-if="deviceDetection()"
        class="px-0"
        :is-active="isOpen"
        @toggleClick="isOpen = !isOpen"
      />
      <component
        :is="panes.find(item => item.key === witchPane).component"
        :class="[!deviceDetection() && 'ml-[120px]']"
        @update-user-info="updateUserInfo"
      />
    </el-main>
  </el-container>
</template>

<style lang="scss">
.pure-account-settings {
  background: var(--pure-theme-menu-bg) !important;
}

.pure-account-settings-menu {
  background-color: transparent;
  border: none;

  .el-menu-item {
    height: 48px !important;
    color: var(--pure-theme-menu-text);
    background-color: transparent !important;
    transition: color 0.2s;

    &:hover {
      color: var(--pure-theme-menu-title-hover) !important;
    }

    &.is-active {
      color: #fff !important;

      &:hover {
        color: #fff !important;
      }

      &::before {
        position: absolute;
        inset: 0 8px;
        clear: both;
        margin: 4px 0;
        content: "";
        background: var(--el-color-primary);
        border-radius: 3px;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
body[layout] {
  .el-menu--vertical .is-active {
    color: #fff !important;
    transition: color 0.2s;

    &:hover {
      color: #fff !important;
    }
  }
}
</style>
