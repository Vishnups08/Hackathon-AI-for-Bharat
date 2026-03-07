import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

// Load images using Vite's glob import synchronously
const imageModules = import.meta.glob('../assets/ezgif-81bf22989d3c5432-jpg/*.jpg', { as: 'url', eager: true });
const imageUrls = Object.values(imageModules).sort();
const frameCount = imageUrls.length;

export default function ScrollAnimationSection() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    // Create a scroll sequence over a specific height
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, Math.max(0, frameCount - 1)]);

    const [images, setImages] = useState([]);

    useEffect(() => {
        const preloadImages = () => {
            const loadedImages = [];
            for (const url of imageUrls) {
                const img = new Image();
                img.src = url;
                loadedImages.push(img);
            }
            setImages(loadedImages);
        };

        preloadImages();
    }, []);

    useEffect(() => {
        if (images.length > 0 && canvasRef.current) {
            const img = images[0];
            const drawImage = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                // Set canvas internal resolution to match image
                canvas.width = img.width || 1920;
                canvas.height = img.height || 1080;

                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };

            if (img.complete) {
                drawImage();
            } else {
                img.onload = drawImage;
            }
        }
    }, [images]);

    useMotionValueEvent(frameIndex, "change", (latest) => {
        if (images.length === 0) return;
        const index = Math.min(Math.max(Math.round(latest), 0), images.length - 1);
        const canvas = canvasRef.current;
        const img = images[index];

        if (canvas && img && img.complete) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    });

    return (
        <div ref={containerRef} className="relative h-[400vh] bg-white w-full">
            <div className="sticky top-16 h-[calc(100vh-4rem)] w-full flex justify-center items-center bg-white p-4 sm:p-8">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full max-w-6xl mx-auto object-contain"
                />
            </div>
        </div>
    );
}
