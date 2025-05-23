'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  getSettings, 
  updateSettings, 
  initializeSettings,
  GroupedSettings,
  Setting,
  SettingGroup,
  SettingType
} from '@/services/setting.service';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<string>(SettingGroup.GENERAL);

  // 获取设置
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings(token || undefined);
      setSettings(data);
      
      // 初始化表单值
      const initialValues: Record<string, any> = {};
      Object.values(data).forEach(group => {
        group.forEach(setting => {
          initialValues[setting.key] = setting.value;
        });
      });
      setFormValues(initialValues);
    } catch (error) {
      console.error('获取设置失败:', error);
      toast.error('获取设置失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 初始化默认设置
  const handleInitializeSettings = async () => {
    try {
      if (!token) return;
      
      setInitializing(true);
      await initializeSettings(token);
      toast.success('默认设置初始化成功');
      
      // 重新获取设置
      await fetchSettings();
    } catch (error) {
      console.error('初始化设置失败:', error);
      toast.error('初始化设置失败，请稍后再试');
    } finally {
      setInitializing(false);
    }
  };

  // 保存设置
  const handleSaveSettings = async () => {
    try {
      if (!token) return;
      
      setSaving(true);
      
      // 准备要更新的设置
      const settingsToUpdate: { key: string; value: any }[] = [];
      
      // 遍历所有设置组
      Object.values(settings).forEach(group => {
        group.forEach(setting => {
          // 如果设置值已更改，则添加到更新列表
          if (formValues[setting.key] !== undefined && 
              JSON.stringify(formValues[setting.key]) !== JSON.stringify(setting.value)) {
            settingsToUpdate.push({
              key: setting.key,
              value: formValues[setting.key]
            });
          }
        });
      });
      
      if (settingsToUpdate.length === 0) {
        toast.success('没有设置需要更新');
        setSaving(false);
        return;
      }
      
      await updateSettings(settingsToUpdate, token);
      toast.success('设置保存成功');
      
      // 重新获取设置
      await fetchSettings();
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存设置失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  };

  // 处理表单值变化
  const handleInputChange = (key: string, value: any, type: SettingType) => {
    // 根据设置类型处理值
    let processedValue = value;
    
    switch (type) {
      case SettingType.NUMBER:
        processedValue = value === '' ? 0 : Number(value);
        break;
      case SettingType.BOOLEAN:
        processedValue = value === 'true' || value === true;
        break;
      case SettingType.ARRAY:
        if (typeof value === 'string') {
          processedValue = value.split(',').map(item => item.trim());
        }
        break;
      case SettingType.JSON:
        if (typeof value === 'string') {
          try {
            processedValue = JSON.parse(value);
          } catch (error) {
            // 如果JSON解析失败，保持原始字符串
            processedValue = value;
          }
        }
        break;
    }
    
    setFormValues(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  // 渲染设置输入控件
  const renderSettingInput = (setting: Setting) => {
    const { key, type, options } = setting;
    const value = formValues[key] !== undefined ? formValues[key] : setting.value;
    
    switch (type) {
      case SettingType.BOOLEAN:
        return (
          <select
            id={key}
            value={value.toString()}
            onChange={(e) => handleInputChange(key, e.target.value, type)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        );
      
      case SettingType.NUMBER:
        return (
          <input
            type="number"
            id={key}
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, type)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        );
      
      case SettingType.ARRAY:
        return (
          <input
            type="text"
            id={key}
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => handleInputChange(key, e.target.value, type)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="用逗号分隔多个值"
          />
        );
      
      case SettingType.JSON:
        return (
          <textarea
            id={key}
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => handleInputChange(key, e.target.value, type)}
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        );
      
      default: // STRING
        if (options && options.length > 0) {
          return (
            <select
              id={key}
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value, type)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }
        
        return (
          <input
            type="text"
            id={key}
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, type)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        );
    }
  };

  // 获取分组名称
  const getGroupName = (group: string) => {
    switch (group) {
      case SettingGroup.GENERAL:
        return '基本设置';
      case SettingGroup.CONTENT:
        return '内容设置';
      case SettingGroup.USER:
        return '用户设置';
      case SettingGroup.NOTIFICATION:
        return '通知设置';
      case SettingGroup.SECURITY:
        return '安全设置';
      case SettingGroup.ADVANCED:
        return '高级设置';
      default:
        return group;
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      router.push('/');
      toast.error('只有管理员可以访问设置页面');
      return;
    }
    
    fetchSettings();
  }, [token, user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">网站设置</h1>
        <div className="space-x-4">
          <button
            onClick={handleInitializeSettings}
            disabled={initializing}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            {initializing ? '初始化中...' : '初始化默认设置'}
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex border-b">
          {Object.keys(settings).map((group) => (
            <button
              key={group}
              onClick={() => setActiveTab(group)}
              className={`px-4 py-3 font-medium ${
                activeTab === group
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {getGroupName(group)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {settings[activeTab]?.map((setting) => (
            <div key={setting.key} className="mb-6">
              <label htmlFor={setting.key} className="block text-sm font-medium text-gray-700">
                {setting.label}
                {setting.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderSettingInput(setting)}
              {setting.description && (
                <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
              )}
            </div>
          ))}

          {(!settings[activeTab] || settings[activeTab].length === 0) && (
            <p className="text-gray-500">该分组下暂无设置项</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
