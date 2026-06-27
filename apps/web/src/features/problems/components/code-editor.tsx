'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@codentra/ui';

const Monaco = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-[320px] w-full" />,
});

const MONACO_LANGUAGE: Record<string, string> = {
  PYTHON: 'python',
  CPP: 'cpp',
  JAVA: 'java',
  JAVASCRIPT: 'javascript',
};

export function CodeEditor({
  language,
  value,
  onChange,
  height = '100%',
  readOnly = false,
}: {
  language: string;
  value: string;
  onChange?: (value: string) => void;
  height?: string | number;
  readOnly?: boolean;
}) {
  return (
    <div className="h-full min-h-[200px] overflow-hidden rounded-none border-0 border-zinc-800">
      <Monaco
        height={height}
        language={MONACO_LANGUAGE[language] ?? 'plaintext'}
        value={value}
        onChange={(v) => onChange?.(v ?? '')}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
