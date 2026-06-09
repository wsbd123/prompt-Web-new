/**
 * 提示词列表组件
 * 展示筛选后的提示词卡片列表
 */

import { useStore } from '../store';
import PromptCard from './PromptCard';

export default function PromptList() {
  const prompts = useStore((state) => state.prompts);

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">没有找到提示词</p>
        <p className="text-[var(--text-tertiary)] text-xs mt-1">
          点击右下角 + 按钮添加新提示词
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
