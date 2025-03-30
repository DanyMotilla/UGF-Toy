export const sdfSphere = (p: number[], r: number) => {
    return Math.sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2]) - r;
};

export const sdfBox = (p: number[], b: number[]) => {
    const q = p.map((val, i) => Math.abs(val) - b[i]);
    const maxQ = Math.max(q[0], Math.max(q[1], q[2]));
    return Math.sqrt(Math.max(q[0], 0)**2 + Math.max(q[1], 0)**2 + Math.max(q[2], 0)**2) + Math.min(maxQ, 0);
};

export const sdfTorus = (p: number[], t: number[]) => {
    const q = [Math.sqrt(p[0]*p[0] + p[2]*p[2]) - t[0], p[1]];
    return Math.sqrt(q[0]*q[0] + q[1]*q[1]) - t[1];
};

export const sdfGyroid = (p: number[], scale: number, thickness: number) => {
    const scaledP = p.map(val => val * scale);
    return Math.abs(
        Math.sin(scaledP[0])*Math.cos(scaledP[1]) +
        Math.sin(scaledP[1])*Math.cos(scaledP[2]) +
        Math.sin(scaledP[2])*Math.cos(scaledP[0])
    ) - thickness;
};

export const sdfWaves = (p: number[], scale: number) => {
    const scaledP = p.map(val => val * scale);
    return 0.5 * (
        Math.sin(scaledP[0]) * Math.sin(scaledP[2]) * 0.5 +
        Math.sin(scaledP[0] * 0.4 + scaledP[2] * 0.5) * 0.7 +
        Math.sin(Math.sqrt(scaledP[0]*scaledP[0] + scaledP[2]*scaledP[2]) * 0.5) * 0.2
    );
};