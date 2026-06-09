/**
 * 排序视图组件
 * 支持拖拽调整提示词顺序
 */

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, GripVertical } from 'lucide-react';
import { useStore } from '../store';
import { getPrompts, updateSortOrder } from '../data-manager';
import type { Prompt } from '../types';

interface SortViewProps {
  onBack: () => void;
}

export default function SortView({ onBack }: SortViewProps) {
  const showToast = useStore((state) => state.showToast);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemRef = useRef<number | null>(null);

  // 加载数据
  useEffect(() => {
    const loadPrompts = async () => {
      const allPrompts = await getPrompts();
      setPrompts(allPrompts);
    };
    loadPrompts();
  }, []);

  // 拖拽开始
  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
    const prompt = prompts[index];
    setDraggingId(prompt.id);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    dragItemRef.current = null;
    setDraggingId(null);
    setDragOverId(null);
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const prompt = prompts[index];
    setDragOverId(prompt.id);
  };

  // 放置
  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = dragItemRef.current;
    if (dragIndex === null || dragIndex === dropIndex) return;

    const newPrompts = [...prompts];
    const [draggedItem] = newPrompts.splice(dragIndex, 1);
    newPrompts.splice(dropIndex, 0, draggedItem);

    setPrompts(newPrompts);
    setDragOverId(null);

    // 保存新顺序
    const orderedIds = newPrompts.map((p) => p.id);
    try {
      const result = await updateSortOrder(orderedIds);
      if (result) {
        showToast('排序已保存', 'success');
      } else {
        showToast('排序保存失败', 'error');
      }
    } catch (error) {
      console.error('保存排序失败:', error);
      showToast('排序保存失败', 'error');
    }
  };

  // 触摸排序支持
  const touchStartRef = useRef<number | null>(null);

  const handleTouchStart = (index: number) => {
    touchStartRef.current = index;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = async (endIndex: number) => {
    const startIndex = touchStartRef.current;
    if (startIndex === null || startIndex === endIndex) return;

    const newPrompts = [...prompts];
    const [draggedItem] = newPrompts.splice(startIndex, 1);
    newPrompts.splice(endIndex, 0, draggedItem);

    setPrompts(newPrompts);
    touchStartRef.current = null;

    const orderedIds = newPrompts.map((p) => p.id);
    try {
      const result = await updateSortOrder(orderedIds);
      if (result) {
        showToast('排序已保存', 'success');
      } else {
        showToast('排序保存失败', 'error');
      }
    } catch (error) {
      console.error('保存排序失败:', error);
      showToast('排序保存失败', 'error');
    }
  };

  return (
    <div className="min-h-full bg-[var(--bg-secondary)]">
      {/* 头部 */}
      <div className="flex-shrink-0 bg-[var(--bg-primary)] px-4 py-3 border-b border-[var(--border)] flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
        </button>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          调整顺序
        </h2>
      </div>

      {/* 提示 */}
      <div className="px-4 py-2">
        <p className="text-xs text-[var(--text-tertiary)]">
          长按并拖动调整提示词顺序
        </p>
      </div>

      {/* 排序列表 */}
      <div className="px-4 pb-4 space-y-2">
        {prompts.map((prompt, index) => (
          <div
            key={prompt.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onTouchStart={() => handleTouchStart(index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(index)}
            className={`sortable-item flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] cursor-move ${
              draggingId === prompt.id ? 'dragging' : ''
            } ${dragOverId === prompt.id && draggingId !== prompt.id ? 'border-[var(--primary)] border-dashed' : ''}`}
          >
            <GripVertical
              size={18}
              className="text-[var(--text-tertiary)] flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {prompt.name}
              </p>
              {prompt.category && (
                <span className="text-xs text-[var(--text-secondary)]">
                  {prompt.category}
                </span>
              )}
            </div>
            <span className="text-xs text-[var(--text-tertiary)] w-6 text-right">
              {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
