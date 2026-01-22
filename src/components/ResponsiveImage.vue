<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue';

  interface Props {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    lazy?: boolean;
    priority?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    width: 0,
    height: 0,
    className: '',
    lazy: true,
    priority: false,
  });

  // 检测设备类型
  const isMobile = ref(window.innerWidth <= 1000);
  const isTablet = ref(window.innerWidth > 1000 && window.innerWidth <= 1200);
  const isDesktop = ref(window.innerWidth > 1200);

  // 监听窗口大小变化
  const handleResize = () => {
    isMobile.value = window.innerWidth <= 1000;
    isTablet.value = window.innerWidth > 1000 && window.innerWidth <= 1200;
    isDesktop.value = window.innerWidth > 1200;
  };

  // 计算图片尺寸
  const imageWidth = computed(() => {
    if (!props.width) return 'auto';

    if (isMobile.value) {
      return Math.floor(props.width * 0.7);
    } else if (isTablet.value) {
      return Math.floor(props.width * 0.85);
    }
    return props.width;
  });

  const imageHeight = computed(() => {
    if (!props.height) return 'auto';

    if (isMobile.value) {
      return Math.floor(props.height * 0.7);
    } else if (isTablet.value) {
      return Math.floor(props.height * 0.85);
    }
    return props.height;
  });

  // 计算图片源
  const imageSrc = computed(() => {
    // 这里可以根据设备类型返回不同尺寸的图片
    // 目前返回原始图片，后续可以扩展为根据设备类型返回不同尺寸
    return props.src;
  });

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  // 暴露计算属性给父组件
  defineExpose({
    isMobile,
    isTablet,
    isDesktop,
    imageWidth,
    imageHeight,
  });
</script>

<template>
  <img
    :src="imageSrc"
    :alt="alt"
    :width="imageWidth"
    :height="imageHeight"
    :class="className"
    :loading="lazy ? 'lazy' : 'eager'"
    :decoding="priority ? 'sync' : 'async'"
    :fetchpriority="priority ? 'high' : 'auto'"
  />
</template>

<style scoped>
  img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }
</style>
