import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [dateTime, setDateTime] = useState('');
    const [socialMedia, setSocialMedia] = useState([]);
    const [scheduledPosts, setScheduledPosts] = useState([]);
    const [submissionMessage, setSubmissionMessage] = useState('');

    useEffect(() => {
        fetchScheduledPosts();
    }, []);

    const fetchScheduledPosts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/scheduled-posts');
            setScheduledPosts(response.data);
        } catch (error) {
            console.error('Error fetching scheduled posts:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setSocialMedia(prev =>
                checked ? [...prev, value] : prev.filter(item => item !== value)
            );
        } else if (type === 'file') {
            setImage(e.target.files[0]);
        } else {
            switch (name) {
                case 'caption':
                    setCaption(value);
                    break;
                case 'dateTime':
                    setDateTime(value);
                    break;
                default:
                    break;
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('dateTime', dateTime);
        socialMedia.forEach(medium => formData.append('socialMedia', medium));
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await axios.post('http://localhost:5000/api/schedule', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSubmissionMessage(response.data.message);
            setCaption('');
            setImage(null);
            setDateTime('');
            setSocialMedia([]);
            fetchScheduledPosts(); 
            setTimeout(() => setSubmissionMessage(''), 3000);
        } catch (error) {
            console.error('Error scheduling post:', error);
            setSubmissionMessage('Failed to schedule post.');
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`http://localhost:5000/api/scheduled-posts/${postId}`);
            fetchScheduledPosts(); 
            console.log(`Post with ID ${postId} deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting post with ID ${postId}:`, error);
            alert('Failed to delete post.'); 
        }
    };

    return (
        <div className="container">
            <h1>Schedule Your Post</h1>
            {submissionMessage && <div className="message">{submissionMessage}</div>}
            <form onSubmit={handleSubmit}>
              
                <div className="form-group">
                    <label htmlFor="caption">Caption:</label>
                    <textarea
                        id="caption"
                        name="caption"
                        value={caption}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="image">Image:</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dateTime">Date and Time:</label>
                    <input
                        type="datetime-local"
                        id="dateTime"
                        name="dateTime"
                        value={dateTime}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Social Media:</label>
                    <div>
                        <input
                            type="checkbox"
                            id="facebook"
                            name="socialMedia"
                            value="facebook"
                            checked={socialMedia.includes('facebook')}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="facebook">Facebook</label>
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            id="instagram"
                            name="socialMedia"
                            value="instagram"
                            checked={socialMedia.includes('instagram')}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="instagram">Instagram</label>
                    </div>
                </div>
                    
                <button type="submit" className="schedule-button">Schedule</button>
            </form>

            <h2>Scheduled Posts</h2>
            {scheduledPosts.length === 0 ? (
                <p>No posts scheduled yet.</p>
            ) : (
                <ul className="scheduled-posts-list">
                    {scheduledPosts.map(post => (
                        <li key={post.id} className="scheduled-post-item">
                            <p><strong>Caption:</strong> {post.caption}</p>
                            {post.image && <img src={`http://localhost:5000${post.image}`} alt="Scheduled Post Image" style={{ maxWidth: '200px' }} />}
                            <p><strong>Date & Time:</strong> {new Date(post.dateTime).toLocaleString()}</p>
                            <p><strong>Social Media:</strong> {post.socialMedia.join(', ')}</p>
                            <p><strong>Scheduled At:</strong> {new Date(post.scheduledAt).toLocaleString()}</p>
                            <button onClick={() => handleDeletePost(post.id)} className="delete-button">Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;