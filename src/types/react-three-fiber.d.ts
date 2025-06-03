declare module '@react-three/fiber' {
    import { ReactThreeFiber } from '@react-three/fiber'
    import { WebGLRenderer, WebGLRendererParameters } from 'three'
    
    export interface Props extends Omit<React.HTMLAttributes<HTMLCanvasElement>, 'ref'> {
        children: React.ReactNode
        gl?: Partial<WebGLRendererParameters>
        camera?: any
        raycaster?: any
        frameloop?: 'always' | 'demand' | 'never'
        resize?: any
        orthographic?: boolean
        dpr?: number | [number, number]
        legacy?: boolean
        linear?: boolean
        flat?: boolean
        events?: any
    }
    
    export const Canvas: React.FC<Props>
}
