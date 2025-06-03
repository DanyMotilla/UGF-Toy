import React, { useState, useEffect, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import NavBar from '@/features/core/components/NavBar';
import DocPage from './DocPage';
import type { EditorMode } from '@/features/core/components/NavBar';
import { shaderDocs } from '../content/shaderDocs';

// Import shader files
import fragmentShader from '@/features/shader-editor/shaders/fragment.glsl?raw';
import vertexShader from '@/features/shader-editor/shaders/vertex.glsl?raw';
import drawingShader from '@/features/shader-editor/shaders/drawing/drawing.glsl?raw';
import colorImplicitShader from '@/features/shader-editor/shaders/implicits/colorImplicit.glsl?raw';
import implicitShader from '@/features/shader-editor/shaders/implicits/implicit.glsl?raw';
import constantsShader from '@/features/shader-editor/shaders/utils/constants.glsl?raw';

// Configure Monaco editor for GLSL
loader.init().then((monaco) => {
  monaco.languages.register({ id: 'glsl' });
  
  monaco.languages.setMonarchTokensProvider('glsl', {
    keywords: [
      'attribute', 'const', 'uniform', 'varying', 'break', 'continue', 'do', 'for',
      'while', 'if', 'else', 'in', 'out', 'inout', 'float', 'int', 'void', 'bool',
      'true', 'false', 'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'bvec2',
      'bvec3', 'bvec4', 'mat2', 'mat3', 'mat4', 'sampler2D', 'samplerCube', 'struct',
      'return', 'discard'
    ],
    
    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||', '++', '--',
      '+', '-', '*', '/', '&', '|', '^', '%', '<<',
      '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
      '^=', '%=', '<<=', '>>=', '>>>='
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
      root: [
        // Identifiers and keywords
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],
        
        // Whitespace
        { include: '@whitespace' },

        // Numbers
        [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+/, 'number'],

        // Operators
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }],

        // Preprocessor directives
        [/#\s*[a-zA-Z_]\w*/, 'keyword.directive'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'],
        ["\\*/", 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
      ],
    }
  });

  // Define Gruvbox dark theme
  monaco.editor.defineTheme('gruvbox-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '928374', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'fb4934' },
      { token: 'number', foreground: 'd3869b' },
      { token: 'string', foreground: 'b8bb26' },
      { token: 'identifier', foreground: 'ebdbb2' },
      { token: 'type', foreground: '8ec07c' },
      { token: 'keyword.directive', foreground: 'fe8019' },
      { token: 'operator', foreground: 'ebdbb2' }
    ],
    colors: {
      'editor.background': '#282828',
      'editor.foreground': '#ebdbb2',
      'editor.lineHighlightBackground': '#3c3836',
      'editor.selectionBackground': '#504945',
      'editorCursor.foreground': '#ebdbb2',
      'editor.findMatchBackground': '#83a598',
      'editor.findMatchHighlightBackground': '#83a59880',
      'editorLineNumber.foreground': '#928374',
      'editorLineNumber.activeForeground': '#ebdbb2',
      'editorIndentGuide.background': '#3c3836',
      'editorIndentGuide.activeBackground': '#504945',
      'editorBracketMatch.background': '#504945',
      'editorBracketMatch.border': '#928374'
    }
  });
});

interface ShaderEditorProps {
  initialFilePath?: string;
}

interface ShaderFile {
  path: string;
  name: string;
  content: string;
}

const SHADER_FILES: ShaderFile[] = [
  { path: 'fragment.glsl', name: 'fragment.glsl', content: fragmentShader },
  { path: 'vertex.glsl', name: 'vertex.glsl', content: vertexShader },
  { path: 'drawing/drawing.glsl', name: 'drawing.glsl', content: drawingShader },
  { path: 'implicits/colorImplicit.glsl', name: 'colorImplicit.glsl', content: colorImplicitShader },
  { path: 'implicits/implicit.glsl', name: 'implicit.glsl', content: implicitShader },
  { path: 'utils/constants.glsl', name: 'constants.glsl', content: constantsShader },
];

const ShaderEditor: React.FC<ShaderEditorProps> = ({ initialFilePath }) => {
  const [files, setFiles] = useState<ShaderFile[]>(SHADER_FILES);
  const [currentFile, setCurrentFile] = useState<string>(initialFilePath || SHADER_FILES[0].path);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [width, setWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<EditorMode>('shader');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = shaderDocs.length;

  // Handle file selection
  const handleFileChange = (filePath: string) => {
    setCurrentFile(filePath);
    const file = files.find(f => f.path === filePath);
    if (file) {
      setCurrentContent(file.content);
    }
  };

  // Handle editor content change
  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setCurrentContent(value);
    setFiles(prevFiles => 
      prevFiles.map(f => 
        f.path === currentFile ? { ...f, content: value } : f
      )
    );
  };

  // Save current file
  const saveCurrentFile = useCallback(async (content: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/shader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `src/features/shader-editor/shaders/${currentFile}`,
          content: content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save file');
      }
      
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [currentFile]);

  // Initialize current content
  useEffect(() => {
    const file = files.find(f => f.path === currentFile);
    if (file) {
      setCurrentContent(file.content);
    }
  }, []);

  // Resize handler
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      setWidth(Math.max(20, Math.min(80, newWidth)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div style={{ 
      position: 'absolute',
      left: 0,
      top: 0,
      width: `${width}%`,
      height: '100vh',
      zIndex: 1,
      backgroundColor: '#282828',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <NavBar
        currentMode={mode}
        onModeChange={setMode}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <div style={{ 
        padding: '8px', 
        backgroundColor: '#3c3836',
        display: mode === 'shader' ? 'flex' : 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px'
      }}>
        <select
          value={currentFile}
          onChange={(e) => handleFileChange(e.target.value)}
          style={{
            backgroundColor: '#504945',
            color: '#ebdbb2',
            border: '1px solid #665c54',
            padding: '4px 8px',
            borderRadius: '4px',
            flexGrow: 1,
            fontSize: '14px'
          }}
        >
          {SHADER_FILES.map((file) => (
            <option key={file.path} value={file.path}>
              {file.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => saveCurrentFile(currentContent)}
          style={{
            backgroundColor: '#98971a',
            color: '#ebdbb2',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#b8bb26';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#98971a';
          }}
        >
          Save
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        {mode === 'shader' ? (
          <Editor
            height="100%"
            defaultLanguage="glsl"
            value={currentContent}
            onChange={handleEditorChange}
            theme="gruvbox-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on'
            }}
          />
        ) : (
          <DocPage content={shaderDocs[currentPage - 1]} />
        )}
      </div>
      {mode === 'shader' && (
        <div
          style={{
            position: 'absolute',
            right: -4,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: 'ew-resize',
          }}
          onMouseDown={() => setIsDragging(true)}
        />
      )}
    </div>
  );
};

export default ShaderEditor;
