import { useRef, useState } from "react";

const CameraCapture = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [image, setImage] = useState<string | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error(err);
            alert("Camera open nahi ho rahi");
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL("image/png");
        setImage(imageData);
    };

    return (
        <div >
            <h2>Seed Analyzer</h2>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    width: "100%",
                    maxWidth: "320px",
                    border: "2px solid #ccc",
                    borderRadius: "12px"
                }}
            />


            <br />

            <button onClick={startCamera}>Open Camera</button>
            <button onClick={capturePhoto}>Capture</button>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {image && (
                <>
                    <h3>Captured Image</h3>
                    <img src={image} width={300} />
                </>
            )}
        </div>
    );
};

export default CameraCapture;
