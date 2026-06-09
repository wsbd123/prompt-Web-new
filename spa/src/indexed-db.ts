/**
 * IndexedDB 备选存储模块
 * 当 localStorage 空间不足时自动降级使用
 */

import type { StorageData } from './types';

const DB_NAME = 'PromptManagerDB';
const DB_VERSION = 1;
const STORE_NAME = 'data';

/**
 * 打开数据库
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * 从 IndexedDB 读取数据
 */
export async function loadFromIndexedDB(): Promise<StorageData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('storage');

      request.onsuccess = () => {
        const result = request.result;
        db.close();
        resolve(result || null);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB 读取失败:', error);
    return null;
  }
}

/**
 * 保存数据到 IndexedDB
 */
export async function saveToIndexedDB(data: StorageData): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, 'storage');

      request.onsuccess = () => {
        db.close();
        resolve(true);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB 保存失败:', error);
    return false;
  }
}

/**
 * 清除 IndexedDB 数据
 */
export async function clearIndexedDB(): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete('storage');

      request.onsuccess = () => {
        db.close();
        resolve(true);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB 清除失败:', error);
    return false;
  }
}

/**
 * 检查 IndexedDB 是否可用
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}
