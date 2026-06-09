/**
 * 数据管理模块
 * 负责提示词的 CRUD、搜索、筛选、排序等核心数据操作
 */

import type { Prompt, StorageData } from './types';
import { loadStorageAsync, saveStorageAsync } from './storage';
import { generateUUID, getCurrentTime } from './utils';

/**
 * 获取所有提示词（支持搜索和分类筛选）
 */
export async function getPrompts(options?: {
  searchTerm?: string;
  category?: string;
}): Promise<Prompt[]> {
  const data = await loadStorageAsync();
  let prompts = [...data.prompts];

  // 按分类筛选
  if (options?.category && options.category !== '全部') {
    prompts = prompts.filter((p) => p.category === options.category);
  }

  // 按搜索词筛选
  if (options?.searchTerm && options.searchTerm.trim()) {
    const term = options.searchTerm.trim().toLowerCase();
    prompts = prompts.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term)
    );
  }

  // 按 sortOrder 排序
  prompts.sort((a, b) => a.sortOrder - b.sortOrder);

  return prompts;
}

/**
 * 获取单个提示词
 */
export async function getPrompt(id: string): Promise<Prompt | null> {
  const data = await loadStorageAsync();
  return data.prompts.find((p) => p.id === id) || null;
}

/**
 * 创建提示词
 */
export async function createPrompt(params: {
  name: string;
  content: string;
  category?: string;
  modelName?: string;
}): Promise<Prompt | null> {
  const data = await loadStorageAsync();
  const now = getCurrentTime();

  const newPrompt: Prompt = {
    id: generateUUID(),
    name: params.name.trim(),
    content: params.content.trim(),
    category: params.category?.trim() || '',
    modelName: params.modelName?.trim() || '',
    source: 'local',
    createTime: now,
    updateTime: now,
    sortOrder: data.prompts.length,
    isReadOnly: false,
  };

  data.prompts.push(newPrompt);
  data.meta.totalCount = data.prompts.length;

  // 更新分类列表
  updateCategories(data);

  if (await saveStorageAsync(data)) {
    return newPrompt;
  }
  return null;
}

/**
 * 更新提示词
 */
export async function updatePrompt(
  id: string,
  params: {
    name?: string;
    content?: string;
    category?: string;
    modelName?: string;
  }
): Promise<Prompt | null> {
  const data = await loadStorageAsync();
  const prompt = data.prompts.find((p) => p.id === id);
  if (!prompt) return null;

  if (params.name !== undefined) prompt.name = params.name.trim();
  if (params.content !== undefined) prompt.content = params.content.trim();
  if (params.category !== undefined) prompt.category = params.category.trim();
  if (params.modelName !== undefined)
    prompt.modelName = params.modelName.trim();
  prompt.updateTime = getCurrentTime();

  // 更新分类列表
  updateCategories(data);

  if (await saveStorageAsync(data)) {
    return prompt;
  }
  return null;
}

/**
 * 删除提示词
 */
export async function deletePrompt(id: string): Promise<boolean> {
  const data = await loadStorageAsync();
  const index = data.prompts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  data.prompts.splice(index, 1);
  data.meta.totalCount = data.prompts.length;

  // 重新计算 sortOrder
  data.prompts.forEach((p, i) => {
    p.sortOrder = i;
  });

  // 更新分类列表
  updateCategories(data);

  return saveStorageAsync(data);
}

/**
 * 更新排序
 */
export async function updateSortOrder(orderedIds: string[]): Promise<boolean> {
  const data = await loadStorageAsync();

  orderedIds.forEach((id, index) => {
    const prompt = data.prompts.find((p) => p.id === id);
    if (prompt) {
      prompt.sortOrder = index;
    }
  });

  return saveStorageAsync(data);
}

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<string[]> {
  const data = await loadStorageAsync();
  return data.categories;
}

/**
 * 更新分类列表（从提示词中提取）
 */
function updateCategories(data: StorageData): void {
  const categorySet = new Set<string>();
  data.prompts.forEach((p) => {
    if (p.category && p.category.trim()) {
      categorySet.add(p.category.trim());
    }
  });
  data.categories = Array.from(categorySet).sort();
}

/**
 * 初始化默认数据
 */
export async function initDefaultData(
  defaultPrompts: Prompt[]
): Promise<boolean> {
  const data = await loadStorageAsync();
  if (data.prompts.length > 0) {
    return false; // 已有数据，不覆盖
  }

  data.prompts = defaultPrompts.map((p, index) => ({
    ...p,
    sortOrder: index,
  }));
  data.meta.totalCount = data.prompts.length;
  updateCategories(data);

  return saveStorageAsync(data);
}

/**
 * 获取提示词总数
 */
export async function getPromptCount(): Promise<number> {
  const data = await loadStorageAsync();
  return data.prompts.length;
}

/**
 * 替换所有提示词（覆盖导入）
 */
export async function replaceAllPrompts(
  prompts: Prompt[]
): Promise<boolean> {
  const data = await loadStorageAsync();
  data.prompts = prompts.map((p, index) => ({
    ...p,
    sortOrder: index,
  }));
  data.meta.totalCount = data.prompts.length;
  updateCategories(data);
  return saveStorageAsync(data);
}

/**
 * 合并提示词（追加导入）
 */
export async function mergePrompts(newPrompts: Prompt[]): Promise<number> {
  const data = await loadStorageAsync();
  const existingIds = new Set(data.prompts.map((p) => p.id));
  let addedCount = 0;

  newPrompts.forEach((p) => {
    if (!existingIds.has(p.id)) {
      data.prompts.push({
        ...p,
        sortOrder: data.prompts.length,
      });
      addedCount++;
    }
  });

  if (addedCount > 0) {
    data.meta.totalCount = data.prompts.length;
    updateCategories(data);
    await saveStorageAsync(data);
  }

  return addedCount;
}
