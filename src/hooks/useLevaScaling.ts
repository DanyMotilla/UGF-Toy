import { useEffect, useState } from 'react';

export const useLevaScaling = () => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            // Base scale on screen width, using 1920 as reference
            const baseWidth = 1920;
            const currentWidth = window.innerWidth;
            const screenScale = Math.max(currentWidth / baseWidth, 1);
            
            // For 4K (3840px), this will give us 2x scaling
            // Clamp between 1 and 2.5 for reasonable sizes
            const newScale = Math.min(Math.max(screenScale, 1), 2.5);
            setScale(newScale);
        };

        // Initial calculation
        updateScale();

        // Update on resize
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    return {
        theme: {
            sizes: {
                rootWidth: '320px', // Base width
                controlWidth: '160px', // Base control width
            },
            scales: {
                // Apply scaling to all elements
                root: scale,
            }
        }
    };
};
