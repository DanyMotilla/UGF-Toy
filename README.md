# UGF Toy

A real-time shader editor for exploring Unit Gradient Fields (UGFs) with the latest version of UGF Library 

by Blake Courter and Dany Motilla.

## Features

- Real-time GLSL shader editing
- Live preview of shader changes
- Syntax highlighting and code completion
- Documentation viewer
- Customizable shader parameters

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository


2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Start the code editor server
```bash
cd server && npm run start
```

The application will be available at `http://localhost:3333`
The code editor server will be running at `http://localhost:3001`

## Built With

- [React](https://reactjs.org/) - UI Framework
- [Three.js](https://threejs.org/) - 3D Graphics
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code Editor
- [Vite](https://vitejs.dev/) - Build Tool

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
