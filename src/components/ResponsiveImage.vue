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
    skipDeviceSuffix?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    width: 0,
    height: 0,
    className: '',
    lazy: true,
    priority: false,
    skipDeviceSuffix: false,
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
    return props.width;
  });

  const imageHeight = computed(() => {
    if (!props.height) return 'auto';
    return props.height;
  });

  // 检测浏览器是否支持WebP
  const supportsWebP = ref(false);

  // 检测WebP支持
  const checkWebPSupport = () => {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      // 尝试创建一个WebP图像
      supportsWebP.value = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
  };

  // 计算图片源
  const imageSrc = computed(() => {
    // 检查是否是图标文件（来自assets/icons目录）
    const isIcon = props.src.includes('assets/icons');

    // 如果是图标文件或设置了skipDeviceSuffix，直接返回原始路径，不进行设备后缀和WebP转换
    if (isIcon || props.skipDeviceSuffix) {
      return props.src;
    }

    // 检查是否是logo文件
    const isLogo = props.src.includes('logo.png');

    // 根据设备类型返回不同尺寸的图片
    let src = props.src;

    // 为移动端提供更小尺寸的图片（仅对非logo文件）
    if (isMobile.value && !isLogo) {
      // 替换图片路径，添加mobile后缀
      src = src.replace(/(\.\w+)$/, '-mobile$1');
    }

    // 为平板提供中等尺寸的图片（仅对非logo文件）
    else if (isTablet.value && !isLogo) {
      // 替换图片路径，添加tablet后缀
      src = src.replace(/(\.\w+)$/, '-tablet$1');
    }

    // 检查是否支持WebP（仅对非logo文件）
    if (supportsWebP.value && !isLogo) {
      // 替换为WebP格式
      src = src.replace(/(\.\w+)$/, '.webp');
    }

    return src;
  });

  // 图片加载失败处理
  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    // 回退到原始图片
    img.src = props.src;
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
    // 检查WebP支持
    checkWebPSupport();
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
    @error="handleImageError"
  />
</template>

<style scoped>
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
</style>
