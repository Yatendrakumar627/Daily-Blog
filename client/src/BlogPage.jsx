import React, { useState, useEffect, useRef } from 'react';

function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetch('https://your-backend-url.onrender.com/api/blogs', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setBlogs(data))
      .catch(error => setError(error.message));
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    fetch('https://your-backend-url.onrender.com/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ title, content, date }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setBlogs([...blogs, data]))
      .catch(error => setError(error.message));
  };

  const handleEdit = (id) => {
    const blog = blogs.find(blog => blog._id === id);
    setTitle(blog.title);
    setContent(blog.content);
    setDate(new Date(blog.date).toISOString().split('T')[0]);
    setEditId(id);
    setEditMode(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    fetch(`https://your-backend-url.onrender.com/api/blogs/${editId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ title, content, date }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(updatedBlog => {
        setBlogs(blogs.map(blog => (blog._id === editId ? updatedBlog : blog)));
        setTitle('');
        setContent('');
        setDate('');
        setEditId(null);
        setEditMode(false);
      })
      .catch(error => setError(error.message));
  };

  const handleDelete = (id) => {
    fetch(`https://your-backend-url.onrender.com/api/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        setBlogs(blogs.filter(blog => blog._id !== id));
      })
      .catch(error => setError(error.message));
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const adjustTextareaHeight = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (contentRef.current) {
      adjustTextareaHeight(contentRef.current);
    }
  }, [content]);

  return (
    <div>
      {error && <p>Error: {error}</p>}
      <form onSubmit={editMode ? handleUpdate : handleCreate}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          ref={contentRef}
          placeholder="Content"
          value={content}
          onChange={handleContentChange}
          style={{ width: '100%', textAlign: 'justify' }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit">{editMode ? 'Update Blog' : 'Create Blog'}</button>
      </form>
      {blogs.map(blog => (
        <div key={blog._id} className="blog">
          <h2>{blog.title}</h2>
          {editMode && editId === blog._id ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                ref={contentRef}
                value={content}
                onChange={handleContentChange}
                style={{ width: '100%', textAlign: 'justify' }}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </>
          ) : (
            <>
              <p>{blog.content}</p>
              <p><small>{new Date(blog.date).toLocaleDateString()}</small></p>
            </>
          )}
          {blog.userId === localStorage.getItem('userId') && (
            <>
              {editMode && editId === blog._id ? (
                <>
                  <button onClick={handleUpdate}>Save</button>
                  <button onClick={() => setEditMode(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEdit(blog._id)}>Edit</button>
                  <button onClick={() => handleDelete(blog._id)}>Delete</button>
                </>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default BlogPage;
