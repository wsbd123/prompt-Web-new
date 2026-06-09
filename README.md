# 提示词管理助手

一款简洁高效的手机端提示词管理网页应用，帮助您随时随地管理、搜索、复制AI提示词。

## 功能特性

### 📋 核心功能
- **列表视图**：实时搜索 + 分类筛选 + 提示词卡片列表
- **排序视图**：拖拽调整提示词顺序
- **导入视图**：JSON文件导入（覆盖/追加模式）
- **更多视图**：JSON导出、版本信息、关于

### ✨ 交互体验
- 支持深色模式自动切换
- 响应式设计，适配移动端和平板
- 流畅的动画效果
- 数据完全本地存储，隐私安全

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **状态管理**：Zustand
- **样式方案**：TailwindCSS 3
- **路由**：React Router DOM
- **图标**：Lucide React

## 快速开始

### 安装依赖

```bash
cd spa
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 数据存储

应用采用双层存储方案：
- **主存储**：localStorage（数据量 < 4MB）
- **备选存储**：IndexedDB（数据量 >= 4MB 自动降级）

## 导入/导出格式

```json
{
  "format": "PromptExchange",
  "version": "1.0",
  "metadata": {
    "exportTime": "2025-06-05T10:00:00.000Z",
    "source": "local",
    "totalCount": 156,
    "description": "导出156个本地提示词"
  },
  "prompts": [
    {
      "id": "prompt-001",
      "name": "提示词名称",
      "content": "提示词内容",
      "category": "分类",
      "modelName": "备注",
      "metadata": {
        "source": "local",
        "createTime": "2025-01-14T10:00:00.000Z",
        "updateTime": "2025-01-14T10:30:00.000Z"
      }
    }
  ]
}
```

## 项目结构

```
spa/
├── index.html              # 入口HTML
├── src/
│   ├── pages/              # 页面组件
│   ├── components/         # UI组件
│   ├── hooks/              # 自定义Hooks
│   ├── store.ts            # 状态管理
│   ├── storage.ts          # 存储封装
│   ├── data-manager.ts     # 数据操作
│   └── exchange.ts         # 导入导出
├── public/                 # 静态资源
└── tests/                  # 测试文件
```

## 兼容性

- **iOS Safari**：14+
- **Android Chrome**：90+
- **微信内置浏览器**：最新版本

## License

MIT