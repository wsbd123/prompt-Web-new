/**
 * 存储降级测试脚本
 * 模拟超过 4MB 数据量的场景，测试 IndexedDB 降级逻辑
 * 在浏览器控制台中运行
 */

import { loadStorageAsync, saveStorageAsync } from '../src/storage';
import { createPrompt, getPromptCount } from '../src/data-manager';
import { isIndexedDBAvailable, loadFromIndexedDB, clearIndexedDB } from '../src/indexed-db';

/**
 * 生成指定大小的测试数据
 */
function generatePrompts(targetSizeMB: number) {
  const targetBytes = targetSizeMB * 1024 * 1024;
  const prompts = [];
  let currentSize = 0;
  let counter = 1;

  const basePrompt = {
    id: 'uuid-test-12345',
    name: '测试提示词',
    content: '',
    category: '测试分类',
    modelName: '测试模型',
    source: 'local',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    sortOrder: 0,
    isReadOnly: false,
  };

  const contentSize = 5000; // 每个提示词内容约 5KB

  console.log(`[测试] 开始生成目标 ${targetSizeMB}MB 的数据...`);

  while (currentSize < targetBytes) {
    const content = 'A'.repeat(contentSize) + ` [条目${counter}]`;
    const prompt = {
      ...basePrompt,
      id: `test-${counter}-${Date.now()}`,
      name: `测试提示词 ${counter}`,
      content: content,
      sortOrder: counter - 1,
    };
    prompts.push(prompt);
    currentSize += JSON.stringify(prompt).length;
    counter++;

    if (counter % 100 === 0) {
      console.log(`[测试] 已生成 ${counter} 条，约 ${(currentSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  console.log(`[测试] 生成完成: ${prompts.length} 条提示词，约 ${(currentSize / 1024 / 1024).toFixed(2)}MB`);
  return prompts;
}

/**
 * 测试 1: 生成小数据 (~1MB)
 */
export async function testSmallData() {
  console.log('=== 测试 1: 生成小数据 (~1MB) ===');
  const prompts = generatePrompts(1);

  const data = {
    version: '3.0.0',
    prompts: prompts,
    categories: ['测试分类'],
    meta: {
      totalCount: prompts.length,
      lastBackup: null,
      lastExport: null,
    },
  };

  const result = await saveStorageAsync(data);
  console.log(`[测试] 小数据保存${result ? '成功' : '失败'}`);

  // 检查存储位置
  const raw = localStorage.getItem('prompt_manager_data');
  const idbData = await loadFromIndexedDB();

  console.log(`[测试] localStorage 有数据: ${raw !== null}`);
  console.log(`[测试] IndexedDB 有数据: ${idbData !== null}`);
  console.log(`[测试] 预期: localStorage 有数据, IndexedDB 无数据`);

  return result;
}

/**
 * 测试 2: 生成阈值数据 (~4MB)
 */
export async function testThresholdData() {
  console.log('=== 测试 2: 生成阈值数据 (~4MB) ===');
  const prompts = generatePrompts(4);

  const data = {
    version: '3.0.0',
    prompts: prompts,
    categories: ['测试分类'],
    meta: {
      totalCount: prompts.length,
      lastBackup: null,
      lastExport: null,
    },
  };

  const result = await saveStorageAsync(data);
  console.log(`[测试] 阈值数据保存${result ? '成功' : '失败'}`);

  // 检查存储位置
  const raw = localStorage.getItem('prompt_manager_data');
  const idbData = await loadFromIndexedDB();

  console.log(`[测试] localStorage 有数据: ${raw !== null}`);
  console.log(`[测试] IndexedDB 有数据: ${idbData !== null}`);
  console.log(`[测试] 预期: 可能已降级到 IndexedDB`);

  return result;
}

/**
 * 测试 3: 生成大数据 (~6MB) - 应该触发降级
 */
export async function testLargeData() {
  console.log('=== 测试 3: 生成大数据 (~6MB) - 应该触发降级 ===');
  const prompts = generatePrompts(6);

  const data = {
    version: '3.0.0',
    prompts: prompts,
    categories: ['测试分类'],
    meta: {
      totalCount: prompts.length,
      lastBackup: null,
      lastExport: null,
    },
  };

  const result = await saveStorageAsync(data);
  console.log(`[测试] 大数据保存${result ? '成功' : '失败'}`);

  // 检查存储位置
  const raw = localStorage.getItem('prompt_manager_data');
  const idbData = await loadFromIndexedDB();

  console.log(`[测试] localStorage 有数据: ${raw !== null}`);
  console.log(`[测试] IndexedDB 有数据: ${idbData !== null}`);
  console.log(`[测试] 预期: localStorage 无数据, IndexedDB 有数据 (已降级)`);

  return { result, hasLocalStorage: raw !== null, hasIndexedDB: idbData !== null };
}

/**
 * 测试 4: 在降级后创建新提示词
 */
export async function testCreateAfterFallback() {
  console.log('=== 测试 4: 在降级后创建新提示词 ===');

  const beforeCount = await getPromptCount();
  console.log(`[测试] 创建前数据条数: ${beforeCount}`);

  const result = await createPrompt({
    name: `降级后测试 ${Date.now()}`,
    content: '这是降级后创建的提示词内容',
    category: '测试',
    modelName: '测试模型',
  });

  const afterCount = await getPromptCount();
  console.log(`[测试] 创建后数据条数: ${afterCount}`);
  console.log(`[测试] 创建${result ? '成功' : '失败'}: ${result?.name || '无'}`);

  // 验证数据是否保存到 IndexedDB
  const idbData = await loadFromIndexedDB();
  console.log(`[测试] IndexedDB 中数据条数: ${idbData?.prompts?.length || 0}`);
  console.log(`[测试] 预期: 数据应保存到 IndexedDB，条数增加 1`);

  return result;
}

/**
 * 测试 5: 读取降级后的数据
 */
export async function testReadAfterFallback() {
  console.log('=== 测试 5: 读取降级后的数据 ===');

  const data = await loadStorageAsync();
  console.log(`[测试] 读取到 ${data.prompts.length} 条提示词`);

  if (data.prompts.length > 0) {
    const first = data.prompts[0];
    const last = data.prompts[data.prompts.length - 1];
    console.log(`[测试] 第一条: ${first.name}`);
    console.log(`[测试] 最后一条: ${last.name}`);
    console.log(`[测试] 数据完整性: ${first.content.length > 0 ? '正常' : '异常'}`);
  }

  return data;
}

/**
 * 清除所有测试数据
 */
export async function clearTestData() {
  console.log('=== 清除所有测试数据 ===');
  localStorage.removeItem('prompt_manager_data');

  if (isIndexedDBAvailable()) {
    await clearIndexedDB();
    console.log('[测试] IndexedDB 已清除');
  }

  console.log('[测试] 所有测试数据已清除');
}

/**
 * 运行完整测试套件
 */
export async function runFullTest() {
  console.log('========================================');
  console.log('开始存储降级测试');
  console.log('IndexedDB 可用:', isIndexedDBAvailable());
  console.log('========================================');

  try {
    // 先清除数据
    await clearTestData();

    // 测试 1: 小数据
    await testSmallData();
    await clearTestData();

    // 测试 2: 阈值数据
    await testThresholdData();
    await clearTestData();

    // 测试 3: 大数据（触发降级）
    const largeResult = await testLargeData();

    if (largeResult.result && !largeResult.hasLocalStorage && largeResult.hasIndexedDB) {
      console.log('[测试] 降级成功！');

      // 测试 4: 降级后创建
      await testCreateAfterFallback();

      // 测试 5: 降级后读取
      await testReadAfterFallback();
    } else {
      console.log('[测试] 降级可能未按预期工作，请检查日志');
    }

    console.log('========================================');
    console.log('测试完成');
    console.log('========================================');

  } catch (error) {
    console.error('[测试] 测试失败:', error);
  }
}

// 导出便捷函数到全局（用于浏览器控制台）
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).StorageTest = {
    testSmallData,
    testThresholdData,
    testLargeData,
    testCreateAfterFallback,
    testReadAfterFallback,
    clearTestData,
    runFullTest,
  };
  console.log('[测试] 测试工具已加载到 window.StorageTest');
}
