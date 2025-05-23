'use client';

import React, { useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeTestPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">主题测试页面</h1>
        <p className="text-muted-foreground">这个页面用于测试亮色/暗黑模式的切换效果</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 卡片样式 */}
        <div className="bg-card text-card-foreground rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">卡片样式</h2>
          <p className="mb-4">这是一个卡片组件，使用了 card 相关的变量。</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">次要文本</span>
            <span className="text-primary">主要颜色</span>
          </div>
        </div>

        {/* 按钮样式 */}
        <div className="bg-card text-card-foreground rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">按钮样式</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                主要按钮
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md">
                次要按钮
              </button>
              <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md">
                强调按钮
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
                边框按钮
              </button>
              <button className="px-4 py-2 text-primary underline">
                链接按钮
              </button>
            </div>
          </div>
        </div>

        {/* 表单元素 */}
        <div className="bg-card text-card-foreground rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">表单元素</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">输入框</label>
              <input
                type="text"
                placeholder="请输入内容"
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">选择框</label>
              <select className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                <option>选项 1</option>
                <option>选项 2</option>
                <option>选项 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* 交互元素 */}
        <div className="bg-card text-card-foreground rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">交互元素</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>计数器: {count}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCount(count - 1)}
                  className="p-2 bg-secondary text-secondary-foreground rounded-md"
                >
                  -
                </button>
                <button
                  onClick={() => setCount(count + 1)}
                  className="p-2 bg-primary text-primary-foreground rounded-md"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="check" className="rounded border-input" />
              <label htmlFor="check">复选框</label>
            </div>
          </div>
        </div>
      </div>

      {/* 主题图标示例 */}
      <div className="bg-card text-card-foreground rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">主题图标</h2>
        <div className="flex justify-center gap-8">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-background border border-border rounded-full">
              <SunIcon className="h-8 w-8 text-foreground" />
            </div>
            <span className="mt-2">亮色模式</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-4 bg-accent border border-border rounded-full">
              <MoonIcon className="h-8 w-8 text-foreground" />
            </div>
            <span className="mt-2">暗黑模式</span>
          </div>
        </div>
      </div>
    </div>
  );
} 