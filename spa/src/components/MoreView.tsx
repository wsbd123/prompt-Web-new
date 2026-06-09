/**
 * 更多视图组件
 * 包含导出、版本信息、关于等功能
 */

import { Download, Info, Trash2, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { exportToFile } from '../exchange';
import { getPrompts } from '../data-manager';
import { clearStorageAsync } from '../storage';
import { useState } from 'react';

const VERSION = '3.0.0';

export default function MoreView() {
  const showToast = useStore((state) => state.showToast);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // 导出
  const handleExport = async () => {
    const prompts = await getPrompts();
    if (prompts.length === 0) {
      showToast('没有可导出的提示词', 'info');
      return;
    }
    exportToFile(prompts);
    showToast('导出成功', 'success');
  };

  // 清除数据
  const handleClear = async () => {
    setIsClearing(true);
    try {
      const result = await clearStorageAsync();
      if (result) {
        showToast('数据已清除', 'success');
        setShowClearConfirm(false);
        window.dispatchEvent(new Event('prompts-updated'));
      } else {
        showToast('清除失败', 'error');
      }
    } catch (error) {
      console.error('清除数据失败:', error);
      showToast('清除失败，请重试', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  const menuItems = [
    {
      icon: Download,
      label: '导出提示词',
      description: '导出为 JSON 文件',
      onClick: handleExport,
      color: 'text-[var(--primary)]',
    },
    {
      icon: Trash2,
      label: '清除数据',
      description: '删除所有提示词',
      onClick: () => setShowClearConfirm(true),
      color: 'text-[var(--error)]',
    },
  ];

  return (
    <div className="min-h-full bg-[var(--bg-secondary)] p-4 space-y-4">
      {/* 菜单列表 */}
      <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-secondary)] transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-[var(--border-light)]' : ''
              }`}
            >
              <Icon size={20} className={item.color} />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {item.label}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {item.description}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-[var(--text-tertiary)]"
              />
            </button>
          );
        })}
      </div>

      {/* 清除确认 */}
      {showClearConfirm && (
        <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--error)]/20">
          <p className="text-sm text-[var(--text-primary)] mb-3">
            确定要清除所有数据吗？此操作不可撤销。
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              disabled={isClearing}
              className="flex-1 h-10 rounded-lg bg-[var(--error)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearing ? '清除中...' : '确认清除'}
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="flex-1 h-10 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--border)] transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 版本信息 */}
      <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-3">
          <Info size={18} className="text-[var(--primary)]" />
          <h3 className="font-medium text-[var(--text-primary)]">关于</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">版本</span>
            <span className="text-[var(--text-primary)]">{VERSION}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">数据存储</span>
            <span className="text-[var(--text-primary)]">本地浏览器</span>
          </div>
          <div className="pt-2 border-t border-[var(--border-light)]">
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              提示词管理助手是一款帮助您管理和使用 AI 提示词的工具。
              所有数据存储在本地浏览器中，不会上传到任何服务器。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
