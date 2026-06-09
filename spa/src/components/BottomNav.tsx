/**
 * 底部导航组件
 * 四栏导航：列表、排序、导入、更多
 */

import { ListOrdered, ArrowUpDown, Upload, MoreHorizontal } from 'lucide-react';
import { useStore } from '../store';
import type { ViewType } from '../types';

interface NavItem {
  key: ViewType;
  label: string;
  icon: typeof ListOrdered;
}

const navItems: NavItem[] = [
  { key: 'list', label: '列表', icon: ListOrdered },
  { key: 'sort', label: '排序', icon: ArrowUpDown },
  { key: 'import', label: '导入', icon: Upload },
  { key: 'more', label: '更多', icon: MoreHorizontal },
];

export default function BottomNav() {
  const currentView = useStore((state) => state.currentView);
  const setCurrentView = useStore((state) => state.setCurrentView);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-t border-[var(--border)] max-w-[480px] mx-auto">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
