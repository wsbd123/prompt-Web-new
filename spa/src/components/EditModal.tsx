/**
 * 编辑/查看弹窗组件
 * 支持查看模式、编辑模式、删除操作
 */

import { useState, useEffect } from 'react';
import { X, Copy, Edit2, Trash2, Check } from 'lucide-react';
import { useStore } from '../store';
import { updatePrompt, deletePrompt } from '../data-manager';
import { validateName, validateContent, validateCategory, validateModelName } from '../utils';
import { useBackButton, useEscKey } from '../hooks/useBackButton';
import type { Prompt } from '../types';

export default function EditModal() {
  const { modal, closeModal, showToast } = useStore();
  const { data, mode } = modal;
  const prompt = data as Prompt;

  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [name, setName] = useState(prompt?.name || '');
  const [content, setContent] = useState(prompt?.content || '');
  const [category, setCategory] = useState(prompt?.category || '');
  const [modelName, setModelName] = useState(prompt?.modelName || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 重置表单数据
  useEffect(() => {
    if (prompt) {
      setName(prompt.name);
      setContent(prompt.content);
      setCategory(prompt.category);
      setModelName(prompt.modelName);
      setIsEditing(mode === 'edit');
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [prompt, mode]);

  // 返回键和 ESC 键关闭弹窗
  useBackButton({ isOpen: !!prompt, onClose: closeModal });
  useEscKey({ isOpen: !!prompt, onClose: closeModal });

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
    if (!validateForm() || !prompt) return;

    setIsSaving(true);
    try {
      const result = await updatePrompt(prompt.id, {
        name,
        content,
        category,
        modelName,
      });

      if (result) {
        showToast('保存成功', 'success');
        closeModal();
        window.dispatchEvent(new Event('prompts-updated'));
      } else {
        showToast('保存失败', 'error');
      }
    } catch (error) {
      console.error('更新提示词失败:', error);
      showToast('保存失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 删除
  const handleDelete = async () => {
    if (!prompt) return;

    setIsDeleting(true);
    try {
      const result = await deletePrompt(prompt.id);
      if (result) {
        showToast('删除成功', 'success');
        closeModal();
        window.dispatchEvent(new Event('prompts-updated'));
      } else {
        showToast('删除失败', 'error');
      }
    } catch (error) {
      console.error('删除提示词失败:', error);
      showToast('删除失败，请重试', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // 复制
  const handleCopy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.content);
      showToast('已复制到剪贴板', 'success');
    } catch {
      showToast('复制失败', 'error');
    }
  };

  // 切换到编辑模式
  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!prompt) return null;

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
            {isEditing ? '编辑提示词' : '查看提示词'}
          </h2>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                  title="复制"
                >
                  <Copy size={18} className="text-[var(--text-secondary)]" />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                  title="编辑"
                >
                  <Edit2 size={18} className="text-[var(--text-secondary)]" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                  title="删除"
                >
                  <Trash2 size={18} className="text-[var(--error)]" />
                </button>
              </>
            )}
            <button
              onClick={closeModal}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X size={20} className="text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* 删除确认 */}
        {showDeleteConfirm && (
          <div className="mx-4 mt-4 p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
            <p className="text-sm text-[var(--text-primary)] mb-3">
              确定要删除「{prompt.name}」吗？此操作不可撤销。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-lg bg-[var(--error)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? '删除中...' : '确认删除'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--border)] transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 内容 */}
        <div className="p-4 space-y-4">
          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              名称 {isEditing && <span className="text-[var(--error)]">*</span>}
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full h-11 px-3 rounded-lg border bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors ${
                    errors.name ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-[var(--error)]">{errors.name}</p>
                )}
              </>
            ) : (
              <p className="text-[var(--text-primary)] text-sm">{prompt.name}</p>
            )}
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              内容 {isEditing && <span className="text-[var(--error)]">*</span>}
            </label>
            {isEditing ? (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className={`w-full px-3 py-2 rounded-lg border bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors resize-none ${
                    errors.content ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                />
                {errors.content && (
                  <p className="mt-1 text-xs text-[var(--error)]">{errors.content}</p>
                )}
              </>
            ) : (
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-normal">
                  {prompt.content}
                </pre>
              </div>
            )}
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              分类
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full h-11 px-3 rounded-lg border bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors ${
                    errors.category ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                />
                {errors.category && (
                  <p className="mt-1 text-xs text-[var(--error)]">{errors.category}</p>
                )}
              </>
            ) : (
              <p className="text-[var(--text-secondary)] text-sm">
                {prompt.category || '未分类'}
              </p>
            )}
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              备注
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className={`w-full h-11 px-3 rounded-lg border bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors ${
                    errors.modelName ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                />
                {errors.modelName && (
                  <p className="mt-1 text-xs text-[var(--error)]">{errors.modelName}</p>
                )}
              </>
            ) : (
              <p className="text-[var(--text-secondary)] text-sm">
                {prompt.modelName || '无'}
              </p>
            )}
          </div>

          {/* 元信息 */}
          {!isEditing && (
            <div className="pt-2 border-t border-[var(--border-light)]">
              <p className="text-xs text-[var(--text-tertiary)]">
                创建时间: {new Date(prompt.createTime).toLocaleString('zh-CN')}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                更新时间: {new Date(prompt.updateTime).toLocaleString('zh-CN')}
              </p>
            </div>
          )}
        </div>

        {/* 底部按钮 - 编辑模式 */}
        {isEditing && (
          <div className="sticky bottom-0 bg-[var(--bg-primary)] px-4 py-3 border-t border-[var(--border)]">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-12 rounded-lg bg-[var(--primary)] text-white font-medium text-base hover:bg-[var(--primary-dark)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={18} />
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
