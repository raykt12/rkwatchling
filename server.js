const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));
app.use(fileUpload());

// Handle video uploads
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const videoFile = req.files.video;
    const uploadPath = path.join(__dirname, 'public', videoFile.name);

    videoFile.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        const videoUrl = `/${videoFile.name}`; // URL to access the video
        res.json({ videoUrl });
    });
});

// Socket.io handling
io.on('connection', (socket) => {
    socket.on('videoUploaded', (url) => {
        socket.broadcast.emit('videoUploaded', url);
    });

    socket.on('play', (time) => {
        socket.broadcast.emit('play', time);
    });

    socket.on('pause', (time) => {
        socket.broadcast.emit('pause', time);
    });

    socket.on('seek', (time) => {
        socket.broadcast.emit('seek', time);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
