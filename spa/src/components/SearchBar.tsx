/**
 * 搜索框组件
 * 支持输入搜索和清除按钮
 */

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="px-4 py-3">
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-3 text-[var(--text-tertiary)]"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜索提示词..."
          className="w-full h-10 pl-10 pr-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 p-1 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <X size={16} className="text-[var(--text-tertiary)]" />
          </button>
        )}
      </div>
    </div>
  );
}
