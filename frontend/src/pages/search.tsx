import React, { useState } from 'react';
import axios from 'axios';

interface Resource {
  _id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  tags: string[];
}

const Search = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'}/search`, { params: { query, type, category, tags } });
      setResources(response.data);
    } catch {
      setMessage('搜索失败，请重试。');
    }
  };

  return (
    <div>
      <h1>搜索资源</h1>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="搜索关键词" value={query} onChange={(e) => setQuery(e.target.value)} />
        <input type="text" placeholder="类型" value={type} onChange={(e) => setType(e.target.value)} />
        <input type="text" placeholder="分类" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="text" placeholder="标签" value={tags} onChange={(e) => setTags(e.target.value)} />
        <button type="submit">搜索</button>
      </form>
      <ul>
        {resources.map((resource) => (
          <li key={resource._id}>
            <h3>{resource.title}</h3>
            <p>{resource.description}</p>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">查看资源</a>
          </li>
        ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Search;