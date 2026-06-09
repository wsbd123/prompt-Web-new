/**
 * 返回键处理 Hook
 * 监听系统返回键/浏览器后退，用于关闭弹窗或返回上一视图
 */

import { useEffect } from 'react';

interface UseBackButtonOptions {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 处理返回键
 * 当弹窗打开时，按返回键关闭弹窗而不是退出页面
 */
export function useBackButton({ isOpen, onClose }: UseBackButtonOptions) {
  useEffect(() => {
    if (!isOpen) return;

    // 添加历史记录，使返回键可以捕获
    window.history.pushState({ modal: true }, '');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.modal) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);
}

/**
 * 处理 ESC 键关闭弹窗（桌面端兼容）
 */
export function useEscKey({ isOpen, onClose }: UseBackButtonOptions) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
