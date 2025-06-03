import express from 'express';
import cors from 'cors';
import shaderRoutes from './routes/shaders.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/shader', shaderRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
