declare module '*.glsl' {
  const content: string;
  export default content;
}

declare module '@react-three/fiber' {
  import { Object3D, Camera, Scene, Clock, ShaderMaterial, Side } from 'three';
  
  export interface ThreeElements {
    sdfMaterial: JSX.IntrinsicElements['meshStandardMaterial'] & {
      uniforms?: { [key: string]: { value: any } };
      transparent?: boolean;
      depthWrite?: boolean;
      depthTest?: boolean;
      side?: Side;
    };
  }

  export function extend(objects: { [key: string]: any }): void;
  export function useFrame(callback: (state: { clock: Clock } & RootState, delta: number) => void): void;
  export function useThree(): {
    gl: THREE.WebGLRenderer;
    scene: Scene;
    camera: Camera;
    size: { width: number; height: number };
  };

  export interface RootState {
    gl: THREE.WebGLRenderer;
    scene: Scene;
    camera: Camera;
    size: { width: number; height: number };
    clock: Clock;
  }

  export interface ThreeEvent<E> {
    object: Object3D;
    eventObject: Object3D;
    point: THREE.Vector3;
    distance: number;
    intersections: THREE.Intersection[];
    target: EventTarget;
    clientX: number;
    clientY: number;
    pointerId: number;
    setPointerCapture: (pointerId: number) => void;
  }
}

declare module '@react-three/drei' {
  import { ShaderMaterial, PerspectiveCamera as ThreePerspectiveCamera } from 'three';
  
  export function shaderMaterial(
    uniforms: { [key: string]: { value: any } },
    vertexShader: string,
    fragmentShader: string
  ): typeof ShaderMaterial;

  export const useGLTF: (path: string) => any;
  export const Html: React.FC<{
    children: React.ReactNode;
    position?: [number, number, number];
    className?: string;
    style?: React.CSSProperties;
    prepend?: boolean;
    fullscreen?: boolean;
  }>;
  export const OrbitControls: React.FC<{
    enableZoom?: boolean;
    enablePan?: boolean;
    enableRotate?: boolean;
    target?: [number, number, number];
    makeDefault?: boolean;
  }>;
  export const PerspectiveCamera: React.FC<{
    makeDefault?: boolean;
    position?: [number, number, number];
    fov?: number;
    near?: number;
    far?: number;
    ref?: React.RefObject<THREE.PerspectiveCamera>;
  }>;
}

declare module '@react-three/fiber/dist/declarations' {
  import { Object3D, Camera, Scene, Clock } from 'three';
  import { ReactThreeFiber } from '@react-three/fiber';

  export function extend(objects: { [key: string]: any }): void;
  export function useFrame(callback: (state: { clock: Clock } & RootState, delta: number) => void): void;
  export function useThree(): {
    gl: THREE.WebGLRenderer;
    scene: Scene;
    camera: Camera;
    size: { width: number; height: number };
  };

  export interface RootState {
    gl: THREE.WebGLRenderer;
    scene: Scene;
    camera: Camera;
    size: { width: number; height: number };
    clock: Clock;
  }

  export interface ThreeElements {
    sdfMaterial: ReactThreeFiber.Object3DNode<any, any> & {
      uniforms?: {
        [key: string]: { value: any };
      };
    };
  }
}
