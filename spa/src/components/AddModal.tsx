/**
 * 新增提示词弹窗
 * 从底部滑入的表单弹窗
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store';
import { createPrompt } from '../data-manager';
import { validateName, validateContent, validateCategory, validateModelName } from '../utils';
import { useBackButton, useEscKey } from '../hooks/useBackButton';

export default function AddModal() {
  const closeModal = useStore((state) => state.closeModal);
  const showToast = useStore((state) => state.showToast);

  // 返回键和 ESC 键关闭弹窗
  useBackButton({ isOpen: true, onClose: closeModal });
  useEscKey({ isOpen: true, onClose: closeModal });

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [modelName, setModelName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;

    const contentError = validateContent(content);
    if (contentError) newErrors.content = contentError;

    const categoryError = validateCategory(category);
    if (categoryError) newErrors.category = categoryError;

    const modelNameError = validateModelName(modelName);
    if (modelNameError) newErrors.modelName = modelNameError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const result = await createPrompt({
        name,
        content,
        category,
        modelName,
      });

      if (result) {
        showToast('保存成功', 'success');
        closeModal();
        // 刷新列表
        window.dispatchEvent(new Event('prompts-updated'));
      } else {
        showToast('保存失败', 'error');
      }
    } catch (error) {
      console.error('保存提示词失败:', error);
      showToast('保存失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 overlay-enter"
        onClick={closeModal}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-[var(--bg-primary)] rounded-t-2xl max-h-[85vh] overflow-y-auto modal-enter">
        {/* 头部 */}
        <div className="sticky top-0 bg-[var(--bg-primary)] px-4 py-3 border-b border-[var(--border)] flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            新增提示词
          </h2>
          <button
            onClick={closeModal}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <X size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* 表单 */}
        <div className="p-4 space-y-4">
          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              名称 <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入提示词名称"
              className={`w-full h-11 px-3 rounded-lg border bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors ${
                errors.name ? 'border-[var(--error)]' : 'border-[var(--border)]'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.name}</p>
            )}
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              内容 <span className="text-[var(--error)]">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入提示词内容"
              rows={6}
              className={`w-full px-3 py-2 rounded-lg border bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors resize-none ${
                errors.content ? 'border-[var(--error)]' : 'border-[var(--border)]'
              }`}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.content}</p>
            )}
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              分类
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="输入分类（可选）"
              className={`w-full h-11 px-3 rounded-lg border bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors ${
                errors.category ? 'border-[var(--error)]' : 'border-[var(--border)]'
              }`}
            />
            {errors.category && (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.category}</p>
            )}
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              备注
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="输入备注（可选）"
              className={`w-full h-11 px-3 rounded-lg border bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors ${
                errors.modelName ? 'border-[var(--error)]' : 'border-[var(--border)]'
              }`}
            />
            {errors.modelName && (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.modelName}</p>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-[var(--bg-primary)] px-4 py-3 border-t border-[var(--border)]">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 rounded-lg bg-[var(--primary)] text-white font-medium text-base hover:bg-[var(--primary-dark)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
