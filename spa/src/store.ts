/**
 * 全局状态管理
 * 使用 Zustand 实现，管理应用的所有状态
 */

import { create } from 'zustand';
import type { Prompt, ViewType, ModalType, ModalMode, ToastType } from './types';

interface AppState {
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

  // Actions
  setPrompts: (prompts: Prompt[]) => void;
  setCategories: (categories: string[]) => void;
  setCurrentView: (view: ViewType) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  openModal: (type: ModalType, mode: ModalMode, data?: Prompt | null) => void;
  closeModal: () => void;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  refreshData: () => void;
}

export const useStore = create<AppState>((set) => ({
  // 初始状态
  prompts: [],
  categories: [],
  currentView: 'list',
  searchTerm: '',
  selectedCategory: '全部',
  modal: {
    type: null,
    mode: null,
    data: null,
  },
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },

  // 设置提示词列表
  setPrompts: (prompts) => set({ prompts }),

  // 设置分类列表
  setCategories: (categories) => set({ categories }),

  // 设置当前视图
  setCurrentView: (currentView) => set({ currentView }),

  // 设置搜索词
  setSearchTerm: (searchTerm) => set({ searchTerm }),

  // 设置选中分类
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  // 打开弹窗
  openModal: (type, mode, data = null) =>
    set({
      modal: { type, mode, data },
    }),

  // 关闭弹窗
  closeModal: () =>
    set({
      modal: { type: null, mode: null, data: null },
    }),

  // 显示 Toast
  showToast: (message, type = 'info') => {
    set({ toast: { visible: true, message, type } });
    // 3秒后自动隐藏
    setTimeout(() => {
      set({ toast: { visible: false, message: '', type: 'info' } });
    }, 3000);
  },

  // 隐藏 Toast
  hideToast: () =>
    set({ toast: { visible: false, message: '', type: 'info' } }),

  // 刷新数据（从 storage 重新加载）
  refreshData: () => {
    // 这个函数会在 app 初始化时注入具体实现
    // 这里只是一个占位，实际逻辑在 App 组件中处理
  },
}));
