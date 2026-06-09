import { useEffect, useCallback, useState } from 'react';
import { useStore } from './store';
import { getPrompts, getCategories, initDefaultData } from './data-manager';
import { defaultPrompts } from './default-data';
import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import PromptList from './components/PromptList';
import BottomNav from './components/BottomNav';
import FloatingButton from './components/FloatingButton';
import Toast from './components/Toast';
import AddModal from './components/AddModal';
import EditModal from './components/EditModal';
import SortView from './components/SortView';
import ImportView from './components/ImportView';
import MoreView from './components/MoreView';
import WelcomeGuide from './components/WelcomeGuide';

const WELCOME_KEY = 'prompt_manager_welcome_shown';

export default function App() {
  const {
    currentView,
    searchTerm,
    selectedCategory,
    categories,
    modal,
    setPrompts,
    setCategories,
    setCurrentView,
    setSearchTerm,
    setSelectedCategory,
  } = useStore();

  const [showWelcome, setShowWelcome] = useState(false);

  // 刷新数据
  const refreshData = useCallback(async () => {
    try {
      const prompts = await getPrompts({ searchTerm, category: selectedCategory });
      const categories = await getCategories();
      setPrompts(prompts);
      setCategories(categories);
    } catch (error) {
      console.error('刷新数据失败:', error);
    }
  }, [searchTerm, selectedCategory, setPrompts, setCategories]);

  // 初始化
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isFirstVisit = !localStorage.getItem(WELCOME_KEY);
        await initDefaultData(defaultPrompts);
        await refreshData();
        if (isFirstVisit) {
          setShowWelcome(true);
        }
      } catch (error) {
        console.error('初始化应用失败:', error);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 关闭引导
  const handleCloseWelcome = () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    setShowWelcome(false);
  };

  // 搜索和分类变化时刷新
  useEffect(() => {
    refreshData();
  }, [searchTerm, selectedCategory, refreshData]);

  // 监听数据更新事件
  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('prompts-updated', handleUpdate);
    return () => window.removeEventListener('prompts-updated', handleUpdate);
  }, [refreshData]);

  return (
    <div className="h-full bg-[var(--bg-secondary)] max-w-[480px] mx-auto flex flex-col overflow-hidden">
      {/* 顶部区域 - 仅在列表视图显示 */}
      {currentView === 'list' && (
        <div className="flex-shrink-0 z-10 bg-[var(--bg-secondary)]">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
          />
          <CategoryTabs
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      )}

      {/* 内容区域 - 独立滚动 */}
      <main className="flex-1 overflow-y-auto pb-16">
        {currentView === 'list' && <PromptList />}
        {currentView === 'sort' && <SortView onBack={() => setCurrentView('list')} />}
        {currentView === 'import' && <ImportView onBack={() => setCurrentView('list')} />}
        {currentView === 'more' && <MoreView />}
      </main>

      {/* 悬浮按钮 - 仅在列表视图显示 */}
      {currentView === 'list' && <FloatingButton />}

      {/* 底部导航 */}
      <BottomNav />

      {/* Toast */}
      <Toast />

      {/* 弹窗 */}
      {modal.type === 'add' && <AddModal />}
      {modal.type === 'edit' && <EditModal />}

      {/* 首次使用引导 */}
      {showWelcome && <WelcomeGuide onClose={handleCloseWelcome} />}
    </div>
  );
}
