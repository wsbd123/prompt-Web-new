/**
 * 分类标签组件
 * 横向滚动，支持点击筛选
 */

interface CategoryTabsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({
  categories,
  selected,
  onSelect,
}: CategoryTabsProps) {
  const allCategories = ['全部', ...categories];

  return (
    <div className="px-4 pb-2 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 whitespace-nowrap">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors btn-active ${
              selected === category
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
