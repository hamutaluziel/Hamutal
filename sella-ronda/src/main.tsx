import React from 'react';
import { createRoot } from 'react-dom/client';
import { FileRouter } from '@instinct/files';
import { App } from './App';
import './style.css';
// @ts-ignore
import serifI from './fonts/is-i.woff2';
// @ts-ignore
import serifR from './fonts/is-r.woff2';
// @ts-ignore
import inter300 from './fonts/inter-300.woff2';
// @ts-ignore
import inter400 from './fonts/inter-400.woff2';
// @ts-ignore
import inter500 from './fonts/inter-500.woff2';
// @ts-ignore
import inter600 from './fonts/inter-600.woff2';

// The viewer sandbox blocks URL-based font loading, so fetch the woff2
// bytes and register FontFace from an ArrayBuffer instead.
const FACES: [string, string, string, string][] = [
    ['Inter', inter300 as string, '300', 'normal'],
    ['Inter', inter400 as string, '400', 'normal'],
    ['Inter', inter500 as string, '500', 'normal'],
    ['Inter', inter600 as string, '600', 'normal'],
    ['Instrument Serif', serifR as string, '400', 'normal'],
    ['Instrument Serif', serifI as string, '400', 'italic'],
];
async function loadFonts(): Promise<void> {
    await Promise.all(FACES.map(async ([family, url, weight, style]) => {
        try {
            const res = await fetch(url);
            const buf = await res.arrayBuffer();
            const face = new FontFace(family, buf, { style, weight });
            await face.load();
            document.fonts.add(face);
        } catch {
            // falls back to the system stack
        }
    }));
}
loadFonts();

createRoot(document.getElementById('root')!).render(<FileRouter><App /></FileRouter>);
