<template>
  <div class="breadcrumb">
    <span v-for="(item, index) in breadcrumbs" :key="index">
      <router-link v-if="item.path" :to="item.path" class="breadcrumb-link">
        {{ item.name }}
      </router-link>
      <span v-else class="breadcrumb-text">
        {{ item.name }}
      </span>
      <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator"> &gt; </span>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { t } from '../i18n';

  // 获取当前路由
  const route = useRoute();

  // 计算面包屑数据
  const breadcrumbs = computed(() => {
    const path = route.path;
    const breadcrumbItems = [{ name: t('home'), path: '/' }];

    // 处理点击测试路由
    if (path.startsWith('/click-test/')) {
      breadcrumbItems.push({
        name: t('clickTest'),
        path: '/click-test/5', // 默认显示5秒测试
      });
      const time = path.split('/')[2];
      breadcrumbItems.push({
        name: `${time}${t('sec')} ${t('clickTest')}`,
        path: path,
      });
    }
    // 处理空格点击测试路由
    else if (path.startsWith('/space-click-test/')) {
      breadcrumbItems.push({
        name: t('spaceClickTest'),
        path: '/space-click-test/5', // 默认显示5秒测试
      });
      const time = path.split('/')[2];
      breadcrumbItems.push({
        name: `${time}${t('sec')} ${t('spaceClickTest')}`,
        path: path,
      });
    }
    // 处理Kohi点击测试路由
    else if (path === '/kohi-click-test') {
      breadcrumbItems.push({
        name: t('kohiClickTest'),
        path: path,
      });
    }
    // 处理反应时间测试路由
    else if (path === '/reaction-time-test') {
      breadcrumbItems.push({
        name: t('reactionTest'),
        path: path,
      });
    }
    // 处理颜色反应测试路由
    else if (path === '/color-reaction-test') {
      breadcrumbItems.push({
        name: t('colorReactionTest'),
        path: path,
      });
    }
    // 处理按键反应测试路由
    else if (path === '/key-reaction-test') {
      breadcrumbItems.push({
        name: t('keyReactionTest'),
        path: path,
      });
    }
    // 处理目标消除游戏路由
    else if (path === '/target-elimination-game') {
      breadcrumbItems.push({
        name: t('targetEliminationGame'),
        path: path,
      });
    }
    // 处理鼠标滚动测试路由
    else if (path === '/mouse-scroll-test') {
      breadcrumbItems.push({
        name: t('mouseScrollTest'),
        path: path,
      });
    }
    // 处理打字测试路由
    else if (path.startsWith('/typing-test/')) {
      breadcrumbItems.push({
        name: t('typingTest'),
        path: '/typing-test/1', // 默认显示1分钟测试
      });
      const time = path.split('/')[2];
      breadcrumbItems.push({
        name: `${time}${t('minTypingTest')}`,
        path: path,
      });
    }
    // 处理连点测试路由
    else if (path.startsWith('/multi-click-test/')) {
      breadcrumbItems.push({
        name: t('clickSeriesTest'),
        path: '/multi-click-test/double', // 默认显示双击测试
      });
      const segments = path.split('/');
      if (segments.length >= 3) {
        const type = segments[2];
        if (type === 'double') {
          breadcrumbItems.push({
            name: t('doubleClickTest'),
            path: path,
          });
        } else if (type === 'triple') {
          breadcrumbItems.push({
            name: t('tripleClickTest'),
            path: path,
          });
        }
      }
    }

    // 处理鼠标拖动测试路由
    else if (path === '/mouse-drag-test') {
      breadcrumbItems.push({
        name: t('mouseDragTest'),
        path: path,
      });
    }
    // 处理键盘测试路由
    else if (path === '/keyboard-test') {
      breadcrumbItems.push({
        name: t('keyboardTest'),
        path: path,
      });
    }

    return breadcrumbItems;
  });
</script>

<style scoped>
  .breadcrumb {
    margin: 10px 0 20px 0;
    padding: 12px 15px;
    font-size: 14px;
    color: #ccc;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    background-color: rgba(30, 30, 30, 0.5);
    border-radius: 6px;
    border-left: 3px solid #4caf50;
  }

  .breadcrumb-link {
    color: #4caf50;
    text-decoration: none;
    transition: all 0.2s ease;
    padding: 3px 5px;
    border-radius: 3px;
  }

  .breadcrumb-link:hover {
    color: #ffffff;
    background-color: rgba(76, 175, 80, 0.2);
    text-decoration: none;
  }

  .breadcrumb-text {
    color: #ffffff;
    font-weight: 500;
  }

  .breadcrumb-separator {
    color: #666;
    margin: 0 4px;
    font-size: 12px;
  }
</style>
