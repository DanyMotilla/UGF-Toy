import { useState, useEffect } from 'react';
import Scene from '@/features/shader-editor/components/Scene';
import UGFlogo from '@/assets/UGFToy.svg';
import './App.css';

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFadingOut(true);

            const removeTimer = setTimeout(() => {
                setIsLoading(false);
            }, 500); // Match the CSS transition time

            return () => clearTimeout(removeTimer);
        }, 3000); // Increased to 3 seconds

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
                <img
                    src={UGFlogo}
                    alt="UGF Logo"
                    className="splash-logo"
                />
            </div>
        );
    }

    return <Scene />;
};

export default App;