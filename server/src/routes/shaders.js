import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();
const PROJECT_ROOT = '/home/dany/Desktop/YARN/yarn-app';

// Validate shader path to ensure it's within the project's shader directory
const validateShaderPath = (shaderPath) => {
  const fullPath = path.join(PROJECT_ROOT, shaderPath);
  const normalizedPath = path.normalize(fullPath);
  
  // Ensure path is within the shaders or shaders_modified directory
  const validPrefixes = [
    path.join(PROJECT_ROOT, 'src/features/shader-editor/shaders_modified')
  ];
  
  if (!validPrefixes.some(prefix => normalizedPath.startsWith(prefix))) {
    throw new Error('Invalid shader path');
  }
  
  // Ensure file has .glsl extension
  if (!normalizedPath.endsWith('.glsl')) {
    throw new Error('Invalid file type');
  }
  
  return normalizedPath;
};

// Get shader content
router.get('/', async (req, res) => {
  try {
    const shaderPath = validateShaderPath(req.query.path);
    const content = await fs.readFile(shaderPath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Save shader content
router.post('/', async (req, res) => {
  try {
    const { path: shaderPath, content } = req.body;
    const validatedPath = validateShaderPath(shaderPath);
    
    // Ensure directory exists
    const dir = path.dirname(validatedPath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(validatedPath, content);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
