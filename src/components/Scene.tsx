import { Leva } from 'leva';
import { Canvas } from '@react-three/fiber';
import SDFRenderer from './SDFRenderer';
import ShaderEditor from './ShaderEditor';
import { gruvboxTheme } from './theme';

const getLevaScale = () => {
    if (typeof window === 'undefined') return 1;
    // Reduced scaling for 4K
    if (window.innerWidth >= 3840) return 2.5;
    if (window.innerWidth >= 2560) return 1.75;
    return 1;
};

export const Scene = () => {
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <ShaderEditor />
            <div style={{ position: 'absolute', right: 0, top: 0, zIndex: 2 }}>
                <Leva 
                    oneLineLabels
                    theme={{
                        ...gruvboxTheme,
                        sizes: {
                            ...gruvboxTheme.sizes,
                            rootWidth: `${400 * getLevaScale()}px`,
                            controlWidth: `${200 * getLevaScale()}px`,
                            rowHeight: `${32 * getLevaScale()}px`,
                            numberInputMinWidth: `${80 * getLevaScale()}px`,
                            scrubberWidth: `${8 * getLevaScale()}px`,
                            scrubberHeight: `${20 * getLevaScale()}px`,
                            titleBarHeight: `${48 * getLevaScale()}px`,
                            folderTitleHeight: `${40 * getLevaScale()}px`
                        },
                        fontSizes: {
                            ...gruvboxTheme.fontSizes,
                            root: `${16 * getLevaScale()}px`,
                            toolTip: `${16 * getLevaScale()}px`
                        },
                        space: {
                            ...gruvboxTheme.space,
                            xs: `${6 * getLevaScale()}px`,
                            sm: `${10 * getLevaScale()}px`,
                            md: `${14 * getLevaScale()}px`,
                            rowGap: `${10 * getLevaScale()}px`,
                            colGap: `${10 * getLevaScale()}px`
                        }
                    }}
                    titleBar={{
                        title: "Controls",
                        filter: true,
                        drag: true
                    }}
                />
            </div>
            <Canvas
                gl={{ 
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: true
                }}
                dpr={window.devicePixelRatio}
                style={{
                    background: '#282828', 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <SDFRenderer />
            </Canvas>
        </div>
    );
};

export default Scene;