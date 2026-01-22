import { ref } from 'vue';

// 历史记录类型定义
export interface HistoryRecord {
  id: number;
  testTime: number;
  clicks: number;
  cps: number;
  date: string;
}

/**
 * 点击测试历史记录管理composable
 * @param testType 测试类型，用于localStorage的key前缀
 */
export function useClickTestHistory(testType: string = 'clickTest') {
  // 历史记录相关
  const historyRecords = ref<HistoryRecord[]>([]); // 历史记录数组

  // 从localStorage加载历史记录
  const loadHistory = () => {
    const saved = localStorage.getItem(`${testType}History`);
    if (saved) {
      const loaded = JSON.parse(saved);
      // 移除可能存在的description字段，确保数据结构一致
      historyRecords.value = loaded.map((record: any) => {
        return {
          ...record,
          // 只保留需要的字段
          cps: record.cps,
          clicks: record.clicks,
          testTime: record.testTime,
          date: record.date,
        };
      });
    }
  };

  // 保存历史记录到localStorage
  const saveHistory = () => {
    localStorage.setItem(`${testType}History`, JSON.stringify(historyRecords.value));
  };

  // 添加新的历史记录
  const addHistoryRecord = (testTime: number, clicks: number, cps: number) => {
    // 创建历史记录
    const newRecord: HistoryRecord = {
      id: Date.now(),
      testTime,
      clicks,
      cps,
      date: new Date().toLocaleString(),
    };

    // 添加到历史记录数组
    historyRecords.value.unshift(newRecord);

    // 限制历史记录数量（最多保存10条）
    if (historyRecords.value.length > 10) {
      historyRecords.value = historyRecords.value.slice(0, 10);
    }

    // 保存到localStorage
    saveHistory();

    return newRecord;
  };

  // 根据测试时长筛选历史记录
  const filteredHistory = (testTime: number) => {
    return historyRecords.value.filter((record) => record.testTime === testTime);
  };

  // 清空历史记录
  const clearHistory = () => {
    historyRecords.value = [];
    saveHistory();
  };

  // 初始化加载历史记录
  loadHistory();

  return {
    historyRecords,
    loadHistory,
    saveHistory,
    addHistoryRecord,
    filteredHistory,
    clearHistory,
  };
}
