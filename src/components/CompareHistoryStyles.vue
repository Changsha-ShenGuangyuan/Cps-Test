<script setup lang="ts">
  import { t } from '../i18n'; // 导入翻译函数
</script>

<template>
  <div class="compare-container">
    <h1>{{ t('historyStylesComparison') }}</h1>
    <div class="compare-wrapper">
      <div class="compare-item">
        <h2>ColorReactionTest.vue</h2>
        <div class="history-sidebar">
          <div class="history-header">
            <h3><span class="history-icon">📋</span> {{ t('history') }}</h3>
          </div>
          <div class="history-list">
            <div class="history-item">
              <div class="history-item-content">
                <div class="history-date">2025/12/11 15:30:20</div>
                <div class="history-stats">
                  <div class="stat-item">
                    <span class="stat-label">{{ t('best') }}:</span>
                    <span class="stat-value best-time">444.00 ms</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ t('average') }}:</span>
                    <span class="stat-value avg-time">531.00 ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="compare-item">
        <h2>ReactionTimeTest.vue</h2>
        <div class="history-sidebar">
          <div class="history-header">
            <h3><span class="history-icon">📋</span> {{ t('history') }}</h3>
          </div>
          <div class="history-list">
            <div class="history-item">
              <div class="history-item-content">
                <div class="history-date">2025/12/11 15:30:20</div>
                <div class="history-stats">
                  <div class="stat-item">
                    <span class="stat-label">{{ t('best') }}:</span>
                    <span class="stat-value best-time">444.00 ms</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ t('average') }}:</span>
                    <span class="stat-value avg-time">531.00 ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .compare-container {
    max-width: 1400px;
    margin: 0 auto;
    text-align: center;
    padding: 20px;
    background-color: #242424;
    color: white;
    position: relative;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  }

  .compare-wrapper {
    display: flex;
    gap: 40px;
    justify-content: center;
    margin-top: 20px;
  }

  .compare-item {
    flex: 1;
    max-width: 500px;
    background-color: #333333;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }
</style>
.compare-container { max-width: 1400px; margin: 0 auto; text-align: center; padding: 20px;
background-color: #242424; color: white; position: relative; box-sizing: border-box; border-radius:
10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); } .compare-wrapper { display: flex; gap: 40px;
justify-content: center; margin-top: 20px; } .compare-item { flex: 1; max-width: 500px;
background-color: #333333; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0,
0.5); }
