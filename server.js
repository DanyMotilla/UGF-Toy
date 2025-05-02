import express from 'express';
import { promises as fs } from 'fs';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/shader', async (req, res) => {
  try {
    const { path } = req.query;
    const content = await fs.readFile(path, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/shader', async (req, res) => {
  try {
    const { path, content } = req.body;
    await fs.writeFile(path, content);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
