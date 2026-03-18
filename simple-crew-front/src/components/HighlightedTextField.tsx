import React, { useRef, useEffect, useState } from 'react';

interface HighlightedTextFieldProps {
  type: 'input' | 'textarea';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | any>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement | any>) => void;
  placeholder?: string;
  className?: string;
  highlightClassName?: string;
  rows?: number;
}

export const HighlightedTextField: React.FC<HighlightedTextFieldProps> = ({
  type,
  value,
  onChange,
  onKeyDown,
  placeholder,
  className = '',
  highlightClassName = 'text-blue-500',
  rows = 3
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Sincroniza o scroll entre o textarea e o div de fundo
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  const renderHighlightedText = (text: string) => {
    if (!text) return <span className="text-brand-muted opacity-50">{placeholder}</span>;
    
    // Regex para encontrar variáveis no formato {variavel}
    const parts = text.split(/(\{[^}]+\})/g);
    return parts.map((part, i) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        return (
          <span key={i} className={highlightClassName}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const commonStyles: React.CSSProperties = {
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontSize: '14px',
    lineHeight: '20px',
    padding: '8px 12px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    boxSizing: 'border-box',
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Camada de Fundo (Highlight) */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words text-brand-text"
        style={{
          ...commonStyles,
          border: '1px solid transparent',
          zIndex: 0,
        }}
      >
        <div className="w-full">
          {renderHighlightedText(value)}
          {/* Adiciona um caractere extra para lidar com quebras de linha no final no textarea */}
          {type === 'textarea' && value.endsWith('\n') && '\n'}
        </div>
      </div>

      {/* Camada de Frente (Input Real) */}
      {type === 'textarea' ? (
        <textarea
          ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          rows={rows}
          className="relative z-10 w-full h-full bg-transparent text-brand-text focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-brand-border rounded-lg text-sm transition-all resize-none block caret-brand-text"
          style={{
            ...commonStyles,
            color: 'transparent',
            caretColor: 'var(--text-main)',
          }}
        />
      ) : (
        <input
          ref={textareaRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="relative z-10 w-full bg-transparent text-brand-text focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-brand-border rounded-lg text-sm transition-all block caret-brand-text"
          style={{
            ...commonStyles,
            color: 'transparent',
            caretColor: 'var(--text-main)',
          }}
        />
      )}
    </div>
  );
};
