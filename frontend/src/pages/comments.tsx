import React, { useState } from 'react';
import axios from 'axios';

const Comments = () => {
  const [resourceId, setResourceId] = useState('');
  const [userId, setUserId] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/comments', { resource: resourceId, user: userId, content, rating });
      setMessage('评论添加成功');
      fetchComments();
    } catch {
      setMessage('评论添加失败，请重试。');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/comments/${resourceId}`);
      setComments(response.data);
    } catch {
      setMessage('获取评论失败，请重试。');
    }
  };

  return (
    <div>
      <h1>评论和评分</h1>
      <form onSubmit={handleAddComment}>
        <input type="text" placeholder="资源ID" value={resourceId} onChange={(e) => setResourceId(e.target.value)} required />
        <input type="text" placeholder="用户ID" value={userId} onChange={(e) => setUserId(e.target.value)} required />
        <textarea placeholder="评论内容" value={content} onChange={(e) => setContent(e.target.value)} required />
        <input type="number" placeholder="评分" value={rating} onChange={(e) => setRating(Number(e.target.value))} required />
        <button type="submit">添加评论</button>
      </form>
      <ul>
        {comments.map((comment: any) => (
          <li key={comment._id}>
            <p>{comment.content}</p>
            <p>评分: {comment.rating}</p>
          </li>
        ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Comments; 