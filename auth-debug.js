// 用于浏览器控制台调试
// 步骤 1: 查看当前存储的认证信息
function checkAuthData() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('authUser');
  
  console.log('目前存储的认证令牌:', token);
  console.log('目前存储的用户信息:', user ? JSON.parse(user) : null);
  
  return { token, user: user ? JSON.parse(user) : null };
}

// 步骤 2: 清除现有的认证信息
function clearAuthData() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  console.log('认证数据已清除');
}

// 步骤 3: 手动设置正确的认证信息
function setAuthData(token, userData) {
  if (!token || !userData) {
    console.error('需要提供令牌和用户数据');
    return;
  }
  
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify(userData));
  console.log('认证数据已设置:', userData);
}

// 使用示例:
// 1. 检查现有数据: checkAuthData()
// 2. 清除数据: clearAuthData()
// 3. 设置正确数据: setAuthData('你的令牌', { _id: '用户ID', username: '用户名', email: 'email', role: 'admin', ...其他字段 }) 