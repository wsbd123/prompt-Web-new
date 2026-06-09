/**
 * 首次使用引导组件
 * 新用户首次打开时显示功能介绍
 */

import { useState } from 'react';
import { X, Search, FolderOpen, ArrowUpDown, Upload, Download } from 'lucide-react';

interface WelcomeGuideProps {
  onClose: () => void;
}

const steps = [
  {
    icon: Search,
    title: '搜索与筛选',
    description: '使用顶部搜索框快速查找提示词，或按分类筛选',
  },
  {
    icon: FolderOpen,
    title: '管理提示词',
    description: '点击卡片查看详情，支持编辑、复制和删除',
  },
  {
    icon: ArrowUpDown,
    title: '拖拽排序',
    description: '在排序视图中拖拽调整提示词的显示顺序',
  },
  {
    icon: Upload,
    title: '导入数据',
    description: '支持 JSON 文件导入，可从插件版迁移数据',
  },
  {
    icon: Download,
    title: '导出备份',
    description: '随时导出数据为 JSON 文件，安全备份',
  },
];

export default function WelcomeGuide({ onClose }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
      <div className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-sm p-6 shadow-xl">
        {/* 关闭按钮 */}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleSkip}
            className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <X size={18} className="text-[var(--text-tertiary)]" />
          </button>
        </div>

        {/* 图标 */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
            <Icon size={32} className="text-[var(--primary)]" />
          </div>
        </div>

        {/* 内容 */}
        <h3 className="text-lg font-semibold text-[var(--text-primary)] text-center mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
          {step.description}
        </p>

        {/* 进度指示器 */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-[var(--primary)]'
                  : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 h-11 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--bg-secondary)] transition-colors"
          >
            跳过
          </button>
          <button
            onClick={handleNext}
            className="flex-1 h-11 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] active:scale-[0.98] transition-all"
          >
            {currentStep < steps.length - 1 ? '下一步' : '开始使用'}
          </button>
        </div>
      </div>
    </div>
  );
}
