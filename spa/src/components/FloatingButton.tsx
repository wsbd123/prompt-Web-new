/**
 * 悬浮按钮组件
 * 点击打开新增提示词弹窗
 */

import { Plus } from 'lucide-react';
import { useStore } from '../store';

export default function FloatingButton() {
  const openModal = useStore((state) => state.openModal);

  return (
    <button
      onClick={() => openModal('add', 'edit')}
      className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--primary-dark)] active:scale-90 transition-all"
      aria-label="新增提示词"
    >
      <Plus size={28} strokeWidth={2.5} />
    </button>
  );
}
