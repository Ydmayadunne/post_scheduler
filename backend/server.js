const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

let scheduledPosts = [];

app.post('/api/schedule', upload.single('image'), (req, res) => {
    const { caption, dateTime, socialMedia } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = {
        id: Date.now(),
        caption,
        image,
        dateTime,
        socialMedia: Array.isArray(socialMedia) ? socialMedia : [socialMedia],
        scheduledAt: new Date().toISOString(),
    };

    scheduledPosts.push(newPost);
    console.log('Scheduled Post:', newPost);

    res.status(201).json({ message: 'Post scheduled successfully!', post: newPost });
});

app.get('/api/scheduled-posts', (req, res) => {
    res.json(scheduledPosts);
});

// API endpoint to delete a scheduled post by ID
app.delete('/api/scheduled-posts/:id', (req, res) => {
    const postIdToDelete = parseInt(req.params.id);
    scheduledPosts = scheduledPosts.filter(post => post.id !== postIdToDelete);
    console.log('Deleted Post ID:', postIdToDelete);
    res.json({ message: 'Post deleted successfully!', id: postIdToDelete });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});