<template>
  <div class="privacy-policy-container">
    <div class="privacy-content" @click="handleLinkClick">
      <section class="privacy-section">
        <h2>{{ t('privacyIntroductionTitle') }}</h2>
        <p v-html="t('privacyIntroduction')"></p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyConsentTitle') }}</h2>
        <p>{{ t('privacyConsentContent') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyDataSharingTitle') }}</h2>
        <p>{{ t('privacyDataSharing') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyDataCollectionTitle') }}</h2>
        <p>{{ t('privacyDataCollection') }}</p>
        <ul>
          <li>{{ t('privacyDataCollection1') }}</li>
          <li>{{ t('privacyDataCollection2') }}</li>
          <li>{{ t('privacyDataCollection3') }}</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyDataUseTitle') }}</h2>
        <p>{{ t('privacyDataUse') }}</p>
        <ul>
          <li>{{ t('privacyDataUse1') }}</li>
          <li>{{ t('privacyDataUse2') }}</li>
          <li>{{ t('privacyDataUse3') }}</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyPolicyChangesTitle') }}</h2>
        <p>{{ t('privacyPolicyChanges') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyDataStorageTitle') }}</h2>
        <p>{{ t('privacyDataStorage') }}</p>
        <ul>
          <li>{{ t('privacyDataStorage1') }}</li>
          <li>{{ t('privacyDataStorage2') }}</li>
          <li>{{ t('privacyDataStorage3') }}</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyUserRightsTitle') }}</h2>
        <p>{{ t('privacyUserRights') }}</p>
        <ul>
          <li>{{ t('privacyUserRights1') }}</li>
          <li>{{ t('privacyUserRights2') }}</li>
          <li>{{ t('privacyUserRights3') }}</li>
          <li>{{ t('privacyUserRights4') }}</li>
          <li>{{ t('privacyUserRights5') }}</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyCookiePolicyTitle') }}</h2>
        <p>{{ t('privacyCookiePolicy') }}</p>
        <ul>
          <li>{{ t('privacyCookiePolicy1') }}</li>
          <li>{{ t('privacyCookiePolicy2') }}</li>
          <li>{{ t('privacyCookiePolicy3') }}</li>
          <li>{{ t('privacyCookiePolicy4') }}</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyThirdPartyServicesTitle') }}</h2>
        <p>{{ t('privacyThirdPartyServices') }}</p>
        <ul>
          <li>{{ t('privacyThirdPartyServices1') }}</li>
          <li>{{ t('privacyThirdPartyServices2') }}</li>
          <li>{{ t('privacyThirdPartyServices3') }}</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyChildrenPrivacyTitle') }}</h2>
        <p>{{ t('privacyChildrenPrivacy') }}</p>
      </section>

      <section class="privacy-section">
        <h2>{{ t('privacyDataRetentionTitle') }}</h2>
        <p>{{ t('privacyDataRetention') }}</p>
        <ul>
          <li>{{ t('privacyDataRetention1') }}</li>
          <li>{{ t('privacyDataRetention2') }}</li>
          <li>{{ t('privacyDataRetention3') }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { t } from '../i18n/index';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  // 处理链接点击事件，确保跳转到正确的首页
  const handleLinkClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A' && (target as HTMLAnchorElement).href) {
      event.preventDefault();
      // 使用Vue Router导航到首页，自动处理语言前缀
      router.push('/');
    }
  };
</script>

<style scoped>
  .privacy-policy-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    color: var(--primary-text, #ffffff);
    line-height: 1.6;
    background-color: var(--primary-bg, #1a1a1a);
    min-height: calc(100vh - 140px);
    padding-top: 80px;
    padding-bottom: 60px;
  }

  .privacy-content {
    background-color: var(--secondary-bg, #2a2a2a);
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px var(--shadow-color, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--border-color, #333);
  }

  .privacy-section {
    margin-bottom: 30px;
  }

  .privacy-section h2 {
    color: var(--accent-color, #4caf50);
    font-size: 24px;
    margin-bottom: 15px;
    border-bottom: 2px solid var(--accent-color, #4caf50);
    padding-bottom: 10px;
    font-weight: 600;
  }

  .privacy-section p {
    margin-bottom: 15px;
    font-size: 16px;
    color: var(--secondary-text, #cccccc);
    line-height: 1.8;
  }

  .privacy-section ul {
    margin-left: 20px;
    margin-bottom: 15px;
  }

  .privacy-section li {
    margin-bottom: 8px;
    font-size: 16px;
    color: var(--secondary-text, #cccccc);
    line-height: 1.8;
  }

  /* 全局链接样式重置 */
  .privacy-content a {
    color: var(--accent-color, #4caf50) !important;
    font-weight: bold !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
  }

  /* 悬停效果 */
  .privacy-content a:hover {
    color: #388e3c !important;
    text-decoration: underline !important;
    opacity: 0.9 !important;
  }

  /* 确保green-url类样式优先 */
  .privacy-content .green-url {
    color: var(--accent-color, #4caf50) !important;
    font-weight: bold !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
  }

  .privacy-content .green-url:hover {
    color: #388e3c !important;
    text-decoration: underline !important;
    opacity: 0.9 !important;
  }

  /* 直接针对隐私政策中的链接设置样式，确保URL显示为绿色 */
  .privacy-content p a {
    color: var(--accent-color, #4caf50) !important;
    font-weight: bold !important;
    text-decoration: none !important;
  }

  .privacy-content p a:hover {
    color: #388e3c !important;
    text-decoration: underline !important;
  }

  @media (max-width: 768px) {
    .privacy-policy-container {
      padding: 10px;
      padding-top: 70px;
      padding-bottom: 50px;
    }

    .privacy-content {
      padding: 20px;
      border-radius: 8px;
    }

    .privacy-section h2 {
      font-size: 20px;
    }

    .privacy-section p,
    .privacy-section li {
      font-size: 14px;
    }
  }
</style>
