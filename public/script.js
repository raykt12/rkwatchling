const videoUpload = document.getElementById('videoUpload');
const uploadButton = document.getElementById('uploadButton');
const videoPlayer = document.getElementById('videoPlayer');

const socket = io();
let isSyncing = false; // Flag to prevent feedback loops

uploadButton.onclick = async () => {
    const file = videoUpload.files[0];
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        const data = await response.json();
        socket.emit('videoUploaded', data.videoUrl);
    } else {
        console.error('Upload failed');
    }
};

socket.on('videoUploaded', (url) => {
    videoPlayer.src = url; // Set the video source
    videoPlayer.play(); // Automatically play for all users
});

// Play event listener
videoPlayer.addEventListener('play', () => {
    if (!isSyncing) {
        socket.emit('play', videoPlayer.currentTime);
    }
});

// Pause event listener
videoPlayer.addEventListener('pause', () => {
    if (!isSyncing) {
        socket.emit('pause', videoPlayer.currentTime);
    }
});

// Seek event listener
videoPlayer.addEventListener('seeked', () => {
    if (!isSyncing) {
        socket.emit('seek', videoPlayer.currentTime);
    }
});

// Listen for play command
socket.on('play', (time) => {
    if (videoPlayer.paused && !isSyncing) {
        isSyncing = true;
        videoPlayer.currentTime = time; // Set the current time to sync
        videoPlayer.play(); // Play the video
        isSyncing = false;
    }
});

// Listen for pause command
socket.on('pause', (time) => {
    if (!videoPlayer.paused && !isSyncing) {
        isSyncing = true;
        videoPlayer.currentTime = time; // Set the current time to sync
        videoPlayer.pause(); // Pause the video
        isSyncing = false;
    }
});

// Listen for seek command
socket.on('seek', (time) => {
    if (Math.abs(videoPlayer.currentTime - time) > 0.1 && !isSyncing) {
        isSyncing = true;
        videoPlayer.currentTime = time; // Sync the time
        isSyncing = false;
    }
});
