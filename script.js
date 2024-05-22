document.getElementById('add-content').addEventListener('click', () => {
    const videoInput = document.getElementById('video-input').files[0];
    const logoInput = document.getElementById('logo-input').files[0];
    const newsInput = document.getElementById('news-input').value;

    if (videoInput) {
        const video = document.getElementById('video');
        video.src = URL.createObjectURL(videoInput);
        video.play();
    }

    if (logoInput) {
        const logo = document.getElementById('logo');
        logo.src = URL.createObjectURL(logoInput);
        logo.style.display = 'block';
    }

    if (newsInput) {
        const newsTicker = document.getElementById('news-ticker');
        newsTicker.textContent = newsInput;
        newsTicker.style.display = 'block';
    }
});

document.getElementById('start-stream').addEventListener('click', () => {
    const videoInput = document.getElementById('video-input').files[0];
    if (videoInput) {
        const videoUrl = URL.createObjectURL(videoInput);
        startStreaming(videoUrl);
    } else {
        alert('Please select a video file to start streaming.');
    }
});

document.getElementById('stop-stream').addEventListener('click', () => {
    stopStreaming();
});

let ffmpegProcess;

function startStreaming(videoUrl) {
    const serverUrl = 'rtmp://a.rtmp.youtube.com/live2';
    const streamKey = 'w00q-h65u-kc4k-ca8t-7zy8';
    
    if (!videoUrl) {
        alert('No video file selected.');
        return;
    }

    ffmpegProcess = new Worker('ffmpeg-worker-mp4.js');
    ffmpegProcess.onmessage = function(e) {
        const msg = e.data;
        switch (msg.type) {
            case 'ready':
                ffmpegProcess.postMessage({
                    type: 'run',
                    MEMFS: [{ name: 'input.mp4', data: videoUrl }],
                    arguments: [
                        '-re',
                        '-i', 'input.mp4',
                        '-c:v', 'libx264',
                        '-preset', 'fast',
                        '-b:v', '3000k',
                        '-maxrate', '3000k',
                        '-bufsize', '6000k',
                        '-pix_fmt', 'yuv420p',
                        '-g', '50',
                        '-c:a', 'aac',
                        '-b:a', '160k',
                        '-ar', '44100',
                        '-f', 'flv',
                        `${serverUrl}/${streamKey}`
                    ]
                });
                break;
        }
    };
}

function stopStreaming() {
    if (ffmpegProcess) {
        ffmpegProcess.terminate();
        ffmpegProcess = null;
        alert('Streaming stopped.');
    }
}
