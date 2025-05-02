import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';
import YarnLogo from './assets/UGFToy.svg'; // Adjust path to your Yarn/logo SVG
import './App.css';

const App: React.FC = () => {
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
                    src={YarnLogo}
                    alt="Yarn Logo"
                    className="splash-logo"
                />
            </div>
        );
    }

    return <Scene />;
};

export default App;