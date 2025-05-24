import React, { useState } from 'react';
import axios from 'axios';

interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

const Roles = () => {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [message, setMessage] = useState('');

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/roles', { name, permissions: permissions.split(',') });
      setMessage('角色添加成功');
      fetchRoles();
    } catch {
      setMessage('角色添加失败，请重试。');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/roles');
      setRoles(response.data);
    } catch {
      setMessage('获取角色失败，请重试。');
    }
  };

  return (
    <div>
      <h1>用户角色管理</h1>
      <form onSubmit={handleAddRole}>
        <input type="text" placeholder="角色名称" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="权限（用逗号分隔）" value={permissions} onChange={(e) => setPermissions(e.target.value)} required />
        <button type="submit">添加角色</button>
      </form>
      <ul>
        {roles.map((role) => (
          <li key={role._id}>
            <p>角色名称: {role.name}</p>
            <p>权限: {role.permissions.join(', ')}</p>
          </li>
        ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Roles; 