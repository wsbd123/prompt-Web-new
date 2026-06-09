/**
 * Toast 提示组件
 * 显示轻量提示消息，自动消失
 */

import { useStore } from '../store';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const toast = useStore((state) => state.toast);

  const iconMap = {
    success: <CheckCircle size={18} className="text-[var(--success)]" />,
    error: <AlertCircle size={18} className="text-[var(--error)]" />,
    info: <Info size={18} className="text-[var(--primary)]" />,
  };

  if (!toast.visible) return null;

  return (
    <div className="fixed top-4 left-1/2 z-[60] toast-enter">
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--bg-primary)] shadow-lg border border-[var(--border)] min-w-[200px]">
        {iconMap[toast.type]}
        <span className="text-sm text-[var(--text-primary)]">{toast.message}</span>
      </div>
    </div>
  );
}
