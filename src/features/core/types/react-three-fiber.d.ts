declare module '@react-three/fiber' {
  import { ReactThreeFiber } from '@react-three/fiber';
  import { Object3D, Camera, Scene } from 'three';

  export const Canvas: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
    camera?: Partial<Camera>;
    gl?: any;
    onCreated?: (state: RootState) => void;
    [key: string]: any;
  }>;

  export function extend(objects: { [key: string]: any }): void;
  export function useFrame(callback: (state: RootState, delta: number) => void): void;
  export function useThree(): {
    gl: THREE.WebGLRenderer;
    scene: Scene;
    camera: Camera;
    size: { width: number; height: number };
  };

  export type ThreeEvent<E> = {
    [K in keyof E]: E[K];
  } & {
    object: Object3D;
    eventObject: Object3D;
    point: THREE.Vector3;
    distance: number;
    intersections: THREE.Intersection[];
  };

  export interface RootState {
    gl: THREE.WebGLRenderer;
    scene: Scene;
    camera: Camera;
    size: { width: number; height: number };
    clock: THREE.Clock;
    [key: string]: any;
  }

  export interface ThreeElements {
    sdfMaterial: ReactThreeFiber.Object3DNode<any, any> & {
      uniforms?: {
        [key: string]: {
          value: any;
        };
      };
    };
  }
}
