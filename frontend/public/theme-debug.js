// 主题调试工具
// 在浏览器控制台中使用

// 检查当前主题
function checkTheme() {
  const theme = localStorage.getItem('theme');
  const isDarkClass = document.documentElement.classList.contains('dark');
  
  console.log('当前主题设置:', theme);
  console.log('HTML根元素是否有dark类:', isDarkClass);
  
  return { theme, isDarkClass };
}

// 手动切换主题
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    console.log('已切换到亮色主题');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    console.log('已切换到暗色主题');
  }
}

// 强制设置主题
function setTheme(theme) {
  if (theme !== 'dark' && theme !== 'light') {
    console.error('主题必须是 "dark" 或 "light"');
    return;
  }
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  localStorage.setItem('theme', theme);
  console.log(`已设置主题为: ${theme}`);
}

// 清除主题设置
function clearTheme() {
  localStorage.removeItem('theme');
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  console.log('已清除主题设置，使用系统偏好');
}

console.log('主题调试工具已加载');
console.log('可用命令: checkTheme(), toggleTheme(), setTheme("dark"|"light"), clearTheme()'); 