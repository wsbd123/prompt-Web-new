/**
 * 提示词卡片组件
 * 展示单个提示词的名称、分类和复制按钮
 */

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Prompt } from '../types';
import { useStore } from '../store';
import { playClickSound } from '../sound';
import { copyToClipboard } from '../utils';

interface PromptCardProps {
  prompt: Prompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const openModal = useStore((state) => state.openModal);
  const showToast = useStore((state) => state.showToast);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 复制提示词内容
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // 先立即变绿，再异步执行复制，避免动画延迟
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 1000);
    const success = await copyToClipboard(prompt.content);
    if (!success) {
      setCopiedId(null);
      showToast('复制失败', 'error');
    }
  };

  // 点击卡片打开查看弹窗
  const handleClick = () => {
    openModal('edit', 'view', prompt);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[var(--bg-primary)] rounded-xl p-3 shadow-sm border border-[var(--border)] cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[var(--text-primary)] font-medium text-sm truncate">
            {prompt.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {prompt.category && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                {prompt.category}
              </span>
            )}
            {prompt.modelName && (
              <span className="text-[10px] text-[var(--text-tertiary)] truncate">
                {prompt.modelName}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleCopy}
          onTouchStart={(e) => { e.stopPropagation(); playClickSound(); }}
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
            copiedId === prompt.id
              ? 'bg-green-500'
              : 'hover:bg-[var(--bg-tertiary)]'
          }`}
          title="复制"
        >
          {copiedId === prompt.id ? (
            <Check size={20} className="text-white" />
          ) : (
            <Copy size={20} className="text-[var(--text-secondary)]" />
          )}
        </button>
      </div>
    </div>
  );
}
