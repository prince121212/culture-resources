import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 将标签字符串转换为数组
      const tagsArray = tags.split(/[,\s]+/).map(tag => tag.trim()).filter(tag => tag);
      const response = await axios.post('http://localhost:5001/api/resources/upload', {
        title,
        description,
        url,
        type,
        category,
        tags: tagsArray
      });
      setMessage(response.data.message);
    } catch {
      setMessage('上传失败，请重试。');
    }
  };

  return (
    <div>
      <h1>上传资源</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="描述" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="url" placeholder="资源链接" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <input type="text" placeholder="类型" value={type} onChange={(e) => setType(e.target.value)} required />
        <input type="text" placeholder="分类" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <input type="text" placeholder="标签 (用空格或逗号分隔)" value={tags} onChange={(e) => setTags(e.target.value)} required />
        <button type="submit">上传</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Upload;