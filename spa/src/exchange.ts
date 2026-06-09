/**
 * 导入导出模块
 * 负责 JSON 文件的导入导出，支持插件版格式兼容
 */

import type { Prompt, ExportData } from './types';
import { getCurrentTime } from './utils';

/**
 * 导出提示词为 JSON 文件
 */
export function exportToFile(prompts: Prompt[]): void {
  const exportData: ExportData = {
    format: 'PromptExchange',
    version: '1.0',
    metadata: {
      exportTime: getCurrentTime(),
      source: 'local',
      totalCount: prompts.length,
      description: `导出${prompts.length}个本地提示词`,
    },
    prompts: prompts.map((p) => ({
      id: p.id,
      name: p.name,
      content: p.content,
      category: p.category,
      modelName: p.modelName,
      metadata: {
        source: p.source,
        createTime: p.createTime,
        updateTime: p.updateTime,
      },
    })),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  const filename = `prompts-local-${date}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 从文件导入提示词
 */
export function importFromFile(file: File): Promise<{
  success: boolean;
  prompts: Prompt[];
  error?: string;
  stats?: {
    totalCount: number;
    categories: Record<string, number>;
  };
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        const validation = validateImportData(data);
        if (!validation.valid) {
          resolve({
            success: false,
            prompts: [],
            error: validation.error,
          });
          return;
        }

        const prompts = convertToPrompts(data);
        const categories: Record<string, number> = {};
        prompts.forEach((p) => {
          const cat = p.category || '未分类';
          categories[cat] = (categories[cat] || 0) + 1;
        });

        resolve({
          success: true,
          prompts,
          stats: {
            totalCount: prompts.length,
            categories,
          },
        });
      } catch {
        resolve({
          success: false,
          prompts: [],
          error: 'JSON 解析失败，请检查文件格式',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        prompts: [],
        error: '文件读取失败',
      });
    };

    reader.readAsText(file);
  });
}

/**
 * 验证导入数据格式
 */
export function validateImportData(data: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: '数据格式错误' };
  }

  const obj = data as Record<string, unknown>;

  // 检查是否是标准格式
  if (obj.format === 'PromptExchange' && Array.isArray(obj.prompts)) {
    if (obj.prompts.length === 0) {
      return { valid: false, error: '提示词列表为空' };
    }
    return { valid: true };
  }

  // 检查是否是简单数组格式
  if (Array.isArray(obj) && obj.length > 0) {
    return { valid: true };
  }

  // 检查是否有 prompts 字段
  if (Array.isArray(obj.prompts) && obj.prompts.length > 0) {
    return { valid: true };
  }

  return { valid: false, error: '无法识别的文件格式' };
}

/**
 * 将导入数据转换为 Prompt 数组
 */
function convertToPrompts(data: Record<string, unknown> | unknown[]): Prompt[] {
  let rawPrompts: unknown[] = [];

  if (Array.isArray(data)) {
    rawPrompts = data;
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.prompts)) {
      rawPrompts = obj.prompts;
    }
  }

  return rawPrompts
    .map((item: unknown) => {
      if (!item || typeof item !== 'object') return null;

      const p = item as Record<string, unknown>;
      const now = getCurrentTime();

      // 处理 metadata 嵌套格式
      let createTime = now;
      let updateTime = now;
      let source = 'local';

      if (p.metadata && typeof p.metadata === 'object') {
        const meta = p.metadata as Record<string, unknown>;
        if (typeof meta.createTime === 'string') createTime = meta.createTime;
        if (typeof meta.updateTime === 'string') updateTime = meta.updateTime;
        if (typeof meta.source === 'string') source = meta.source;
      }

      return {
        id:
          typeof p.id === 'string'
            ? p.id
            : `imported_${Math.random().toString(36).substr(2, 9)}`,
        name: typeof p.name === 'string' ? p.name : '未命名提示词',
        content: typeof p.content === 'string' ? p.content : '',
        category: typeof p.category === 'string' ? p.category : '',
        modelName: typeof p.modelName === 'string' ? p.modelName : '',
        source,
        createTime,
        updateTime,
        sortOrder: 0,
        isReadOnly: false,
      };
    })
    .filter((p): p is Prompt => p !== null);
}
