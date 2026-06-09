/**
 * 导入视图组件
 * 支持 JSON 文件导入，覆盖/追加模式
 */

import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Upload, FileJson, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { importFromFile } from '../exchange';
import { replaceAllPrompts, mergePrompts } from '../data-manager';
import type { Prompt } from '../types';

interface ImportViewProps {
  onBack: () => void;
}

export default function ImportView({ onBack }: ImportViewProps) {
  const showToast = useStore((state) => state.showToast);
  const [isDragging, setIsDragging] = useState(false);
  const [importedPrompts, setImportedPrompts] = useState<Prompt[] | null>(null);
  const [importStats, setImportStats] = useState<{
    totalCount: number;
    categories: Record<string, number>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setImportedPrompts(null);
      setImportStats(null);

      if (!file.name.endsWith('.json')) {
        setError('请选择 JSON 文件');
        return;
      }

      const result = await importFromFile(file);

      if (!result.success) {
        setError(result.error || '导入失败');
        return;
      }

      setImportedPrompts(result.prompts);
      setImportStats(result.stats || null);
    },
    []
  );

  // 文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // 拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // 确认导入
  const handleImport = async () => {
    if (!importedPrompts || importedPrompts.length === 0) return;

    setIsImporting(true);
    try {
      if (importMode === 'replace') {
        const result = await replaceAllPrompts(importedPrompts);
        if (result) {
          showToast(`导入成功，共 ${importedPrompts.length} 条`, 'success');
          onBack();
        } else {
          showToast('导入失败', 'error');
        }
      } else {
        const addedCount = await mergePrompts(importedPrompts);
        showToast(`追加成功，新增 ${addedCount} 条`, 'success');
        onBack();
      }
    } catch (error) {
      console.error('导入失败:', error);
      showToast('导入失败，请重试', 'error');
    } finally {
      setIsImporting(false);
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
          导入提示词
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* 文件上传区域 */}
        {!importedPrompts && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              isDragging
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-[var(--border)] hover:border-[var(--primary-light)]'
            }`}
          >
            <Upload
              size={40}
              className={`${isDragging ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`}
            />
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                点击或拖拽上传 JSON 文件
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                支持插件版导出的 JSON 格式
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer file-input-visible"
            />
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
            <AlertCircle size={18} className="text-[var(--error)] flex-shrink-0" />
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        )}

        {/* 导入预览 */}
        {importedPrompts && importStats && (
          <div className="space-y-4">
            {/* 统计信息 */}
            <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <FileJson size={20} className="text-[var(--primary)]" />
                <h3 className="font-medium text-[var(--text-primary)]">
                  导入预览
                </h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                共 <span className="font-semibold text-[var(--primary)]">{importStats.totalCount}</span> 条提示词
              </p>
              <div className="space-y-1">
                {Object.entries(importStats.categories).map(([cat, count]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[var(--text-secondary)]">{cat}</span>
                    <span className="text-[var(--text-tertiary)]">{count} 条</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 导入模式选择 */}
            <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border)]">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">
                导入方式
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="w-4 h-4 accent-[var(--primary)]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      追加导入
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      保留现有数据，跳过重复的提示词
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="w-4 h-4 accent-[var(--primary)]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      覆盖导入
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      删除所有现有数据，用导入数据替换
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImportedPrompts(null);
                  setImportStats(null);
                  setError(null);
                }}
                className="flex-1 h-12 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                重新选择
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="flex-1 h-12 rounded-lg bg-[var(--primary)] text-white font-medium text-sm hover:bg-[var(--primary-dark)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? '导入中...' : '确认导入'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
