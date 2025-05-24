import React, { useState } from 'react';
import axios from 'axios';

const Download = () => {
  const [resourceId, setResourceId] = useState('');
  const [message, setMessage] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:5001/api/download/${resourceId}`);
      window.location.href = response.request.responseURL;
    } catch {
      setMessage('下载失败，请重试。');
    }
  };

  return (
    <div>
      <h1>下载资源</h1>
      <form onSubmit={handleDownload}>
        <input type="text" placeholder="资源ID" value={resourceId} onChange={(e) => setResourceId(e.target.value)} required />
        <button type="submit">下载</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Download; 