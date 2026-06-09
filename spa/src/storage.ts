/**
 * 存储模块
 * 封装 localStorage 操作，提供数据读写功能
 */

import type { StorageData } from './types';
import {
  loadFromIndexedDB,
  saveToIndexedDB,
  clearIndexedDB,
  isIndexedDBAvailable,
} from './indexed-db';

const STORAGE_KEY = 'prompt_manager_data';
const DATA_VERSION = '3.0.0';
// 当 localStorage 数据超过 4MB 时，自动降级到 IndexedDB
const LOCALSTORAGE_THRESHOLD = 4 * 1024 * 1024;
// 标记是否使用 IndexedDB
let useIndexedDB = false;

/**
 * 获取默认数据结构
 */
function getDefaultData(): StorageData {
  return {
    version: DATA_VERSION,
    prompts: [],
    categories: [],
    meta: {
      totalCount: 0,
      lastBackup: null,
      lastExport: null,
    },
  };
}

/**
 * 从存储读取数据（自动选择 localStorage 或 IndexedDB）
 */
export async function loadStorageAsync(): Promise<StorageData> {
  // 先检查 IndexedDB 是否有数据（降级场景）
  if (isIndexedDBAvailable()) {
    try {
      const dbData = await loadFromIndexedDB();
      if (dbData) {
        useIndexedDB = true;
        return dbData;
      }
    } catch {
      // 忽略 IndexedDB 错误
    }
  }

  // 回退到 localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultData();
    }
    const parsed = JSON.parse(raw) as StorageData;
    if (!parsed.version) {
      parsed.version = DATA_VERSION;
    }
    if (!parsed.meta) {
      parsed.meta = getDefaultData().meta;
    }
    return parsed;
  } catch (error) {
    console.error('读取存储数据失败:', error);
    return getDefaultData();
  }
}

/**
 * 保存数据（自动降级到 IndexedDB 当 localStorage 空间不足时）
 */
export async function saveStorageAsync(data: StorageData): Promise<boolean> {
  // 如果已经在使用 IndexedDB，继续用 IndexedDB
  if (useIndexedDB && isIndexedDBAvailable()) {
    return await saveToIndexedDB(data);
  }

  try {
    const serialized = JSON.stringify(data);
    // 如果数据超过阈值，切换到 IndexedDB
    if (serialized.length > LOCALSTORAGE_THRESHOLD && isIndexedDBAvailable()) {
      useIndexedDB = true;
      // 清除 localStorage 中的数据，避免两份数据
      localStorage.removeItem(STORAGE_KEY);
      return await saveToIndexedDB(data);
    }
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('保存存储数据失败:', error);
    // 存储空间不足，尝试降级到 IndexedDB
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      if (isIndexedDBAvailable()) {
        useIndexedDB = true;
        localStorage.removeItem(STORAGE_KEY);
        const result = await saveToIndexedDB(data);
        if (result) {
          return true;
        }
      }
      alert('存储空间不足，请导出数据后清理部分提示词');
    }
    return false;
  }
}

/**
 * 检查存储空间使用情况
 */
export function checkQuota(): { used: number; total: number; percentage: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const used = new Blob([raw]).size;
    // localStorage 通常限制 5MB
    const total = 5 * 1024 * 1024;
    return {
      used,
      total,
      percentage: Math.round((used / total) * 100),
    };
  } catch {
    return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
  }
}

/**
 * 清除所有数据（包括 localStorage 和 IndexedDB）
 */
export async function clearStorageAsync(): Promise<boolean> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (isIndexedDBAvailable()) {
      await clearIndexedDB();
    }
    useIndexedDB = false;
    return true;
  } catch (error) {
    console.error('清除存储数据失败:', error);
    return false;
  }
}


