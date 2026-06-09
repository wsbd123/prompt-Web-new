/**
 * 类型定义文件
 * 定义提示词数据结构、应用状态、视图类型等
 */

// 提示词数据结构
export interface Prompt {
  id: string;
  name: string;
  content: string;
  category: string;
  modelName: string;
  source: string;
  createTime: string;
  updateTime: string;
  sortOrder: number;
  isReadOnly: boolean;
}

// 存储数据结构
export interface StorageData {
  version: string;
  prompts: Prompt[];
  categories: string[];
  meta: {
    totalCount: number;
    lastBackup: string | null;
    lastExport: string | null;
  };
}

// 导出格式
export interface ExportData {
  format: string;
  version: string;
  metadata: {
    exportTime: string;
    source: string;
    totalCount: number;
    description: string;
  };
  prompts: Array<{
    id: string;
    name: string;
    content: string;
    category: string;
    modelName: string;
    metadata: {
      source: string;
      createTime: string;
      updateTime: string;
    };
  }>;
}

// 视图类型
export type ViewType = 'list' | 'sort' | 'import' | 'more';

// 弹窗类型
export type ModalType = 'add' | 'edit' | null;

// 弹窗模式
export type ModalMode = 'view' | 'edit' | null;

// Toast 类型
export type ToastType = 'info' | 'success' | 'error';

// 应用状态
export interface AppState {
  // 数据层
  prompts: Prompt[];
  categories: string[];

  // UI 层
  currentView: ViewType;
  searchTerm: string;
  selectedCategory: string;

  // 弹窗层
  modal: {
    type: ModalType;
    mode: ModalMode;
    data: Prompt | null;
  };

  // 反馈层
  toast: {
    visible: boolean;
    message: string;
    type: ToastType;
  };
}
