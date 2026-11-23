import React from 'react';

/**
 * Local-dev stand-ins for the '@instinct/files' runtime module.
 * In the hosted Instinct viewer, FileRouter supplies routing context and
 * FileCard renders the padded card chrome around the app (the app's
 * `.sr-root { margin: -24px }` counteracts that padding). These shims
 * reproduce just enough of the shell for `vite dev` / `vite build`.
 */
export function FileRouter({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function FileCard({ children, lang, dir }: { children: React.ReactNode; lang?: string; dir?: 'ltr' | 'rtl' }) {
    return (
        <div lang={lang} dir={dir} style={{ minHeight: '100vh', background: '#ffffff' }}>
            {children}
        </div>
    );
}
