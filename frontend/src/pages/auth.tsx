import React, { useState } from 'react';
import axios from 'axios';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', { username, password });
      setMessage('用户注册成功');
    } catch {
      setMessage('用户注册失败，请重试。');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      setMessage('登录成功');
    } catch {
      setMessage('登录失败，请重试。');
    }
  };

  return (
    <div>
      <h1>用户权限管理</h1>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">注册</button>
      </form>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">登录</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Auth; 