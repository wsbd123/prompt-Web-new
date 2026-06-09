/**
 * 工具函数
 * 提供 UUID 生成、日期格式化、防抖等通用功能
 */

/**
 * 生成 UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 获取当前 ISO 时间字符串
 */
export function getCurrentTime(): string {
  return new Date().toISOString();
}

/**
 * 获取当前时间戳（毫秒）
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * 格式化日期为本地字符串
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 验证提示词名称
 */
export function validateName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return '名称不能为空';
  }
  if (name.trim().length > 100) {
    return '名称不能超过100个字符';
  }
  return null;
}

/**
 * 验证提示词内容
 */
export function validateContent(content: string): string | null {
  if (!content || content.trim().length === 0) {
    return '内容不能为空';
  }
  if (content.trim().length > 10000) {
    return '内容不能超过10000个字符';
  }
  return null;
}

/**
 * 验证分类名称
 */
export function validateCategory(category: string): string | null {
  if (category && category.length > 50) {
    return '分类不能超过50个字符';
  }
  return null;
}

/**
 * 验证备注信息
 */
export function validateModelName(modelName: string): string | null {
  if (modelName && modelName.length > 100) {
    return '备注不能超过100个字符';
  }
  return null;
}
