import React, { useState } from 'react';
import CopyIcon from './icons/CopyIcon';

const renderParagraphContent = (text: string) => {
  // Simple inline formatting for `code` and **bold**
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-slate-700 text-rose-400 rounded px-1.5 py-1 text-sm font-semibold">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};


// FIX: Explicitly type NonCodeRenderer as a React.FC to allow React-specific props like `key`.
const NonCodeRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content.trim()) return null;

  const paragraphs = content.split(/\n\s*\n/); // Split by one or more empty lines
  
  return (
    <>
      {paragraphs.map((para, i) => {
        const trimmedPara = para.trim();
        if (!trimmedPara) return null;
        
        // Headings
        if (trimmedPara.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-6 mb-3 text-slate-100 border-b border-slate-700 pb-2">{renderParagraphContent(trimmedPara.substring(2))}</h1>;
        if (trimmedPara.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-5 mb-2 text-slate-100 border-b border-slate-700 pb-1">{renderParagraphContent(trimmedPara.substring(3))}</h2>;
        if (trimmedPara.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-slate-200">{renderParagraphContent(trimmedPara.substring(4))}</h3>;

        // Lists (each line is a list item)
        if (trimmedPara.startsWith('* ') || trimmedPara.startsWith('- ')) {
          const items = trimmedPara.split('\n').map(item => item.substring(item.search(/\S/) + 2));
          return (
            <ul key={i} className="list-disc list-outside space-y-2 my-4 pl-6">
              {items.map((item, j) => <li key={j}>{renderParagraphContent(item)}</li>)}
            </ul>
          );
        }
        
         if (/^\d+\.\s/.test(trimmedPara)) {
          const items = trimmedPara.split('\n').map(item => item.replace(/^\d+\.\s/, ''));
          return (
            <ol key={i} className="list-decimal list-outside space-y-2 my-4 pl-6">
              {items.map((item, j) => <li key={j}>{renderParagraphContent(item)}</li>)}
            </ol>
          );
        }

        // Default to paragraph
        return <p key={i} className="my-4 leading-relaxed">{renderParagraphContent(trimmedPara)}</p>;

      })}
    </>
  );
};


const CodeBlock: React.FC<{ code: string; language: string | null }> = ({ code, language }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-slate-950 rounded-md my-4 ring-1 ring-slate-700 relative group">
      <div className="flex justify-between items-center px-4 py-1 bg-slate-800/50 rounded-t-md text-xs font-sans">
        <span className="text-slate-400 capitalize">{language || 'Code'}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 p-1 -mr-1"
          aria-label="Copy code to clipboard"
        >
          {isCopied ? (
            <span className="text-green-400">Copied!</span>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};


const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Split content by code blocks, keeping the delimiters.
  const parts = content.split(/(```(?:[\s\S]*?)```)/g);

  return (
    <div className="text-slate-300">
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('```') && part.endsWith('```')) {
          const codeMatch = part.match(/```(\w*)\n?([\s\S]*?)```/);
          if (codeMatch) {
              const language = codeMatch[1] || null;
              const code = codeMatch[2] || '';
              return <CodeBlock key={index} code={code.trim()} language={language} />;
          }
           const code = part.slice(3, -3);
           return <CodeBlock key={index} code={code.trim()} language={null} />;
        } else {
          return <NonCodeRenderer key={index} content={part} />;
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;