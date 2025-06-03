import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface DocPageProps {
  content: string;
}

interface ComponentProps {
  children?: ReactNode;
  inline?: boolean;
}

const DocPage: React.FC<DocPageProps> = ({ content }) => {
  return (
    <div style={{
      backgroundColor: '#282828',
      color: '#ebdbb2',
      padding: '20px',
      height: '100%',
      overflowY: 'auto',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      lineHeight: 1.6
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }: ComponentProps) => (
            <h1 style={{ color: '#b8bb26', borderBottom: '1px solid #504945', paddingBottom: '8px' }}>
              {children}
            </h1>
          ),
          h2: ({ children }: ComponentProps) => (
            <h2 style={{ color: '#98971a', marginTop: '24px' }}>
              {children}
            </h2>
          ),
          h3: ({ children }: ComponentProps) => (
            <h3 style={{ color: '#689d6a' }}>
              {children}
            </h3>
          ),
          code: ({ inline, children }: ComponentProps) => (
            <code style={{
              backgroundColor: '#3c3836',
              padding: inline ? '2px 4px' : '16px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              display: inline ? 'inline' : 'block',
              whiteSpace: 'pre-wrap'
            }}>
              {children}
            </code>
          ),
          blockquote: ({ children }: ComponentProps) => (
            <blockquote style={{
              borderLeft: '4px solid #504945',
              paddingLeft: '16px',
              margin: '16px 0',
              color: '#d5c4a1'
            }}>
              {children}
            </blockquote>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default DocPage;
