import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileCard } from '@instinct/files';

type Cam = { title: string; img?: string; page: string };
type Kind = 'village' | 'lift' | 'pass';
type Place = {
    id: string;
    name: string;
    valley: string;
    kind: Kind;
    elevation: number;
    lat: number;
    lon: number;
    cams: Cam[];
};

const FER = 'https://wtvpict.feratel.com/picture';
const PX = (id: number) => `pano:${id}`;
const VG = 'https://www.valgardena.it/en/webcams';
const AB = 'https://www.altabadia.org/en/alta-badia-webcam';
const ARABBA = 'https://www.arabba.it/it/webcam-arabba-fodom/43-0.html';

const PLACES: Place[] = [
    // Val Gardena
    {
        id: 'ortisei', name: 'Ortisei', valley: 'Val Gardena', kind: 'village', elevation: 1236, lat: 46.5763, lon: 11.6715,
        cams: [
            { title: 'Seceda live', img: `${FER}/37/6344.jpeg`, page: `${VG}/seceda-live/` },
            { title: 'Resciesa live', img: `${FER}/37/6343.jpeg`, page: `${VG}/resciesa-live/` },
            { title: 'Ortisei, Solaria (360)', img: 'https://st-ulrich.it-wms.com/panorama1.jpg', page: `${VG}/ortisei-solaria-panocam/` },
            { title: 'Ortisei, S. Giacomo (360)', img: 'https://jakoberhof.it-wms.com/panorama1.jpg', page: `${VG}/ortisei-s-giacomo-panocam/` },
        ],
    },
    {
        id: 'resciesa', name: 'Resciesa', valley: 'Val Gardena', kind: 'lift', elevation: 2132, lat: 46.5880, lon: 11.6740,
        cams: [
            { title: 'Resciesa live', img: `${FER}/37/6343.jpeg`, page: `${VG}/resciesa-live/` },
        ],
    },
    {
        id: 'cristina', name: 'Santa Cristina', valley: 'Val Gardena', kind: 'village', elevation: 1428, lat: 46.5597, lon: 11.7177,
        cams: [
            { title: 'Santa Cristina (360)', img: 'https://s-cristina.it-wms.com/panorama1.jpg', page: `${VG}/s-cristina-panocam/` },
            { title: 'Santa Cristina webcam', page: `${VG}/s-cristina-webcam/` },
            { title: 'Santa Cristina, Saslong night cam', page: `${VG}/s-cristina-saslong-nightcam/` },
        ],
    },
    {
        id: 'colraiser', name: 'Col Raiser', valley: 'Val Gardena', kind: 'lift', elevation: 2106, lat: 46.5740, lon: 11.7050,
        cams: [
            { title: 'Col Raiser live', img: `${FER}/37/6345.jpeg`, page: `${VG}/col-raiser-live/` },
            { title: 'Col Raiser (360)', img: PX(1226), page: `${VG}/col-raiser-panocam/` },
            { title: 'Col Raiser, valley (360)', page: `${VG}/col-raiser-valley-panocam/` },
        ],
    },
    {
        id: 'montepana', name: 'Monte Pana', valley: 'Val Gardena', kind: 'village', elevation: 1600, lat: 46.5445, lon: 11.7320,
        cams: [
            { title: 'Monte Pana live', img: `${FER}/37/6347.jpeg`, page: `${VG}/monte-pana-live/` },
            { title: 'Santa Cristina, Monte Pana (360)', img: 'https://monte-pana.panocloud.webcam/panorama1.jpg', page: `${VG}/s-cristina-monte-pana-panocam/` },
        ],
    },
    {
        id: 'selva', name: 'Selva', valley: 'Val Gardena', kind: 'village', elevation: 1563, lat: 46.5574, lon: 11.7605,
        cams: [
            { title: 'Selva, Tubla (360)', img: 'https://wolkenstein.it-wms.com/panorama1.jpg', page: `${VG}/selva-tubla-panocam/` },
            { title: 'Selva video HD', page: `${VG}/selva-video-hd/` },
        ],
    },
    {
        id: 'plandegralba', name: 'Plan de Gralba', valley: 'Val Gardena', kind: 'lift', elevation: 2095, lat: 46.5254, lon: 11.7714,
        cams: [
            { title: 'Plan de Gralba (360)', img: PX(12122), page: `${VG}/plan-de-gralba-panocam/` },
            { title: 'Plan de Gralba webcam', page: `${VG}/plan-de-gralba-webcam/` },
        ],
    },
    {
        id: 'dantercepies', name: 'Dantercepies', valley: 'Val Gardena', kind: 'lift', elevation: 2298, lat: 46.5522, lon: 11.8139,
        cams: [
            { title: 'Dantercepies live', img: `${FER}/37/6340.jpeg`, page: `${VG}/dantercepies-live/` },
            { title: 'Dantercepies (360)', img: PX(1186), page: `${VG}/dantercepies-panocam/` },
        ],
    },
    {
        id: 'saslong', name: 'Ciampinoi', valley: 'Val Gardena', kind: 'lift', elevation: 2249, lat: 46.5472, lon: 11.7640,
        cams: [
            { title: 'Ciampinoi live', img: `${FER}/37/6341.jpeg`, page: `${VG}/ciampinoi-live/` },
            { title: 'Ciampinoi (360)', img: PX(1219), page: `${VG}/ciampinoi-panocam/` },
        ],
    },
    {
        id: 'pizsella', name: 'Piz Sella', valley: 'Val Gardena', kind: 'lift', elevation: 2284, lat: 46.5261, lon: 11.7689,
        cams: [
            { title: 'Piz Sella live', img: `${FER}/37/6342.jpeg`, page: `${VG}/piz-sella-live/` },
            { title: 'Piz Sella (360, livestream)', img: PX(12030), page: `${VG}/piz-sella-panocam/` },
        ],
    },
    // Seceda and Alpe di Siusi
    {
        id: 'seceda', name: 'Seceda', valley: 'Seceda and Alpe di Siusi', kind: 'lift', elevation: 2518, lat: 46.6012, lon: 11.7228,
        cams: [
            { title: 'Seceda live', img: `${FER}/37/6344.jpeg`, page: `${VG}/seceda-live/` },
            { title: 'Seceda (360)', img: PX(1044), page: `${VG}/seceda-panocam/` },
        ],
    },
    {
        id: 'alpedisiusi', name: 'Alpe di Siusi', valley: 'Seceda and Alpe di Siusi', kind: 'village', elevation: 1844, lat: 46.5440, lon: 11.6330,
        cams: [
            { title: 'Alpe di Siusi (Compatsch) live', page: 'https://seiseralm.panomax.com/' },
            { title: 'Alpe di Siusi (360)', img: 'https://stulrich-seiseralm.it-wms.com/panorama1.jpg', page: `${VG}/seiser-alm-panocam/` },
            { title: 'Alpe di Siusi, Bullaccia (360)', img: PX(7296), page: `${VG}/seiser-alm-bullaccia-panocam/` },
        ],
    },
    // Dolomite passes
    {
        id: 'passosella', name: 'Passo Sella', valley: 'Dolomite Passes', kind: 'pass', elevation: 2218, lat: 46.5094, lon: 11.7708,
        cams: [
            { title: 'Passo Sella', img: 'https://api.scenaridigitali.com/media/sassolungo/image.jpg', page: `${VG}/passo-sella-webcam/` },
        ],
    },
    {
        id: 'passogardena', name: 'Passo Gardena', valley: 'Dolomite Passes', kind: 'pass', elevation: 2121, lat: 46.5508, lon: 11.8083,
        cams: [
            { title: 'Passo Gardena', page: 'https://www.ras.bz.it/it/webcam/detail/passo-gardena/' },
        ],
    },
    // Val di Fassa
    {
        id: 'campitello', name: 'Campitello di Fassa', valley: 'Val di Fassa', kind: 'village', elevation: 1448, lat: 46.4766, lon: 11.7407,
        cams: [
            { title: 'Col Rodella', page: 'https://colrodella.panomax.com' },
        ],
    },
    {
        id: 'canazei', name: 'Canazei', valley: 'Val di Fassa', kind: 'village', elevation: 1460, lat: 46.4758, lon: 11.8200,
        cams: [
            { title: 'Val di Fassa webcams', page: 'https://www.fassa.com/en/webcam' },
        ],
    },
    {
        id: 'pordoi', name: 'Passo Pordoi', valley: 'Val di Fassa', kind: 'pass', elevation: 2239, lat: 46.4878, lon: 11.8140,
        cams: [
            { title: 'Passo Pordoi', img: `${FER}/35/6416.jpeg`, page: 'https://www.fassa.com/en/webcam' },
        ],
    },
    // Alta Badia
    {
        id: 'corvara', name: 'Corvara', valley: 'Alta Badia', kind: 'village', elevation: 1568, lat: 46.5503, lon: 11.8734,
        cams: [
            { title: 'Piz Arlara', img: `${FER}/37/6320.jpeg`, page: AB },
        ],
    },
    {
        id: 'colfosco', name: 'Colfosco', valley: 'Alta Badia', kind: 'village', elevation: 1645, lat: 46.5520, lon: 11.8480,
        cams: [
            { title: 'Gardena Pass', img: `${FER}/35/6322.jpeg`, page: AB },
            { title: 'Janin', img: `${FER}/35/6329.jpeg`, page: AB },
        ],
    },
    {
        id: 'lavilla', name: 'La Villa', valley: 'Alta Badia', kind: 'village', elevation: 1433, lat: 46.5838, lon: 11.8994,
        cams: [
            { title: 'Piz La Ila', img: `${FER}/35/6323.jpeg`, page: AB },
        ],
    },
    {
        id: 'sancassiano', name: 'San Cassiano', valley: 'Alta Badia', kind: 'village', elevation: 1537, lat: 46.5701, lon: 11.9361,
        cams: [
            { title: 'Piz Sorega', img: `${FER}/35/6324.jpeg`, page: AB },
        ],
    },
    {
        id: 'badia', name: 'Badia', valley: 'Alta Badia', kind: 'village', elevation: 1324, lat: 46.6158, lon: 11.8937,
        cams: [
            { title: 'La Crusc', img: `${FER}/35/6326.jpeg`, page: AB },
        ],
    },
    {
        id: 'boe', name: 'Boè', valley: 'Alta Badia', kind: 'lift', elevation: 2224, lat: 46.5353, lon: 11.8467,
        cams: [
            { title: 'Boè top station', img: `${FER}/35/6321.jpeg`, page: AB },
        ],
    },
    // Arabba
    {
        id: 'arabba', name: 'Arabba', valley: 'Arabba–Marmolada', kind: 'village', elevation: 1602, lat: 46.4989, lon: 11.8748,
        cams: [
            { title: 'Bec de Roces', img: `${FER}/35/6371.jpeg`, page: ARABBA },
            { title: 'Monte Burz', img: `${FER}/35/6372.jpeg`, page: ARABBA },
            { title: 'Passo Padon', img: `${FER}/35/6374.jpeg`, page: ARABBA },
            { title: 'Porta Vescovo', page: 'https://portavescovo.panomax.com' },
        ],
    },
];

const VALLEYS = ['Val Gardena', 'Seceda and Alpe di Siusi', 'Dolomite Passes', 'Val di Fassa', 'Alta Badia', 'Arabba–Marmolada'];

type DayFc = { date: string; dayLabel: string; letter: string; snow: number; tmax: number; tmin: number };
type SeriesDay = { date: string; label: string; past: boolean; today: boolean; depth: number | null; snow: number };
type Wx = {
    temp: number;
    feels: number;
    code: number;
    hum: number;
    depthCm: number | null;
    lastSnow: string;
    nextSnow: string;
    past: number[];
    past7: number;
    fc: DayFc[];
    expectedCm: number;
    series: SeriesDay[];
    est: { day: string; label: string; cm: number } | null;
};
type CamState = 'loading' | 'error' | string;

const KIND_LABEL: Record<Kind, string> = { village: '', lift: 'Lift station', pass: 'Pass' };

const WMO_EN: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Rime fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Heavy freezing drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Heavy freezing rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
    85: 'Snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
};

type Group = 'clear' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm';
const groupOf = (c: number): Group => {
    if (c <= 1) return 'clear';
    if (c <= 3) return 'cloud';
    if (c === 45 || c === 48) return 'fog';
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'snow';
    if (c >= 95) return 'storm';
    return 'rain';
};
const GROUP_LABEL: Record<Group, string> = { snow: 'Snowing', clear: 'Clear', cloud: 'Cloudy', fog: 'Fog', rain: 'Rain', storm: 'Storm' };
const SKY_WORD: Record<Group, string> = { snow: 'Snowing', clear: 'Clear sky', cloud: 'Cloudy', fog: 'Fog', rain: 'Rain', storm: 'Storms' };
const GROUP_ORDER: Group[] = ['snow', 'clear', 'cloud', 'fog', 'rain', 'storm'];

const BLUE = '#3d4f63';
const CORAL = '#8a7f72';
const fmtElev = (m: number): string => `${m.toLocaleString('en-US')} m`;

const fmtT = (t: number): string => `${t < 0 ? '−' : ''}${Math.abs(t)}°`;

const roundCm = (cm: number): number => (cm < 10 ? Math.round(cm * 10) / 10 : Math.round(cm));

const fmtCm = (m: number | null | undefined): string => {
    if (m === null || m === undefined) return 'n/a';
    return `${roundCm(m * 100)} cm`;
};

const dayLabelFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'numeric', timeZone: 'Europe/Rome' });
const dayLetterFmt = new Intl.DateTimeFormat('en-US', { weekday: 'narrow', timeZone: 'Europe/Rome' });
const dayShortFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Europe/Rome' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Jerusalem' });

const wxUrl = (): string => {
    const lats = PLACES.map((p) => p.lat).join(',');
    const lons = PLACES.map((p) => p.lon).join(',');
    return `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,snow_depth&hourly=snowfall,snow_depth,precipitation&daily=temperature_2m_max,temperature_2m_min&past_days=14&forecast_days=10&timezone=Europe%2FRome`;
};

const NO_SNOW_14 = 'None in 14+ days';
const NO_SNOW_FC = 'None in 10 days';
const num = (v: unknown, d = 0): number => (typeof v === 'number' && isFinite(v) ? v : d);

function summarize(loc: any): Pick<Wx, 'lastSnow' | 'nextSnow' | 'past' | 'past7' | 'fc' | 'expectedCm' | 'est' | 'series'> {
    const hours: string[] = loc.hourly?.time ?? [];
    const snowfall: (number | null)[] = loc.hourly?.snowfall ?? [];
    const nowIso: string = loc.current.time;
    const byDay = new Map<string, number>();
    for (let i = 0; i < hours.length; i++) {
        const v = snowfall[i];
        if (v && v > 0) {
            const day = hours[i].slice(0, 10);
            byDay.set(day, (byDay.get(day) ?? 0) + v);
        }
    }
    // Open-Meteo's snowfall field can miss light snow near freezing. When a day had precipitation
    // and the modelled snow depth rose, use the depth rise (cm) if it is larger than the snowfall total.
    const depthH: (number | null)[] = loc.hourly?.snow_depth ?? [];
    const precipH: (number | null)[] = loc.hourly?.precipitation ?? [];
    const todayIso = nowIso.slice(0, 10);
    const rise = new Map<string, number>();
    const wet = new Map<string, number>();
    for (let i = 1; i < hours.length; i++) {
        const day = hours[i].slice(0, 10);
        wet.set(day, (wet.get(day) ?? 0) + num(precipH[i]));
        const inc = num(depthH[i]) - num(depthH[i - 1]);
        if (inc > 0) rise.set(day, (rise.get(day) ?? 0) + inc * 100);
    }
    // Discrepancy flag only: depth rose with precipitation while the snowfall field read ~0. Never used as fallen snow.
    let est: { day: string; label: string; cm: number } | null = null;
    rise.forEach((cm, day) => {
        if (day <= todayIso && (wet.get(day) ?? 0) > 0.3 && cm >= 1 && (byDay.get(day) ?? 0) < 0.5 && (est === null || day > est.day)) {
            est = { day, label: dayLabelFmt.format(new Date(`${day}T12:00:00`)), cm: Math.round(cm) };
        }
    });
    const today = nowIso.slice(0, 10);
    let lastDay = '';
    let nextDay = '';
    byDay.forEach((_v, day) => {
        if (day <= today && day > lastDay) lastDay = day;
        if (day > today && (nextDay === '' || day < nextDay)) nextDay = day;
    });
    const noon = (day: string) => new Date(`${day}T12:00:00`);
    const lastSnow = lastDay === '' ? NO_SNOW_14 : `${dayLabelFmt.format(noon(lastDay))} · ${roundCm(byDay.get(lastDay) ?? 0)} cm`;
    const nextSnow = nextDay === '' ? NO_SNOW_FC : `~${roundCm(byDay.get(nextDay) ?? 0)} cm on ${dayLabelFmt.format(noon(nextDay))}`;

    const [ty, tm, td] = today.split('-').map(Number);
    const dayIso = (offset: number): string => new Date(Date.UTC(ty, tm - 1, td + offset, 12)).toISOString().slice(0, 10);
    const past: number[] = [];
    for (let i = 14; i >= 1; i--) past.push(roundCm(byDay.get(dayIso(-i)) ?? 0));
    const past7 = roundCm(past.slice(7).reduce((a, b) => a + b, 0) + (byDay.get(today) ?? 0));

    const dTime: string[] = loc.daily?.time ?? [];
    const fc: DayFc[] = [];
    let expected = 0;
    for (let i = 0; i < 10; i++) {
        const iso = dayIso(i);
        const di = dTime.indexOf(iso);
        const snow = roundCm(byDay.get(iso) ?? 0);
        expected += snow;
        const d = new Date(Date.UTC(ty, tm - 1, td + i, 12));
        fc.push({
            date: iso,
            dayLabel: dayLabelFmt.format(d),
            letter: dayLetterFmt.format(d),
            snow,
            tmax: Math.round(num(loc.daily?.temperature_2m_max?.[di])),
            tmin: Math.round(num(loc.daily?.temperature_2m_min?.[di])),
        });
    }
    const shortFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/Rome' });
    const depthAt = (iso: string): number | null => {
        if (iso === today && typeof loc.current?.snow_depth === 'number') return roundCm(loc.current.snow_depth * 100);
        const k = hours.indexOf(`${iso}T12:00`);
        return k >= 0 && typeof depthH[k] === 'number' ? roundCm((depthH[k] as number) * 100) : null;
    };
    const series: SeriesDay[] = [];
    for (let i = -14; i <= 9; i++) {
        const iso = dayIso(i);
        series.push({ date: iso, label: shortFmt.format(new Date(Date.UTC(ty, tm - 1, td + i, 12))), past: i < 0, today: i === 0, depth: depthAt(iso), snow: roundCm(byDay.get(iso) ?? 0) });
    }
    return { lastSnow, nextSnow, past, past7, fc, expectedCm: roundCm(expected), est, series };
}

function Glyph({ group }: { group: Group }) {
    const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    const cloud = <path {...p} d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 9.5 4.3 4.3 0 0 0 7 18z" />;
    return (
        <svg className="sr-glyph" viewBox="0 0 24 24" aria-hidden="true">
            {group === 'clear' && <g {...p}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></g>}
            {group === 'cloud' && cloud}
            {group === 'fog' && <g {...p}><path d="M7 13h10a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 7.5 6 3.6 3.6 0 0 0 7 13z" /><path d="M4 17h16M7 21h10" /></g>}
            {group === 'rain' && <g>{cloud}<path {...p} d="M9 20l1-2M13 20l1-2M17 20l1-2" /></g>}
            {group === 'snow' && <g {...p}><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /><path d="M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2" /></g>}
            {group === 'storm' && <g>{cloud}<path {...p} d="M12 14l-2 3h3l-2 3" /></g>}
        </svg>
    );
}


function Icon({ kind }: { kind: 'ground' | 'flake' | 'thermo' | 'calendar' | 'sun' | 'new' }) {
    const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    return (
        <svg className="sr-icon" viewBox="0 0 24 24" aria-hidden="true">
            {kind === 'ground' && <g {...p}><path d="M3 20h18" /><path d="M6 20v-5M10 20v-9M14 20v-6M18 20v-10" /></g>}
            {kind === 'flake' && <g {...p}><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /><path d="M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2" /></g>}
            {kind === 'new' && <g {...p}><path d="M12 3v7M9 5l3 2.5L15 5" /><path d="M5 21h14" /><path d="M7 21c0-4 2-6 5-6s5 2 5 6" /></g>}
            {kind === 'thermo' && <g {...p}><path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z" /><path d="M12 9v8" /></g>}
            {kind === 'calendar' && <g {...p}><path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" /></g>}
            {kind === 'sun' && <g {...p}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></g>}
        </svg>
    );
}

// ---------- Shared formatting: every number carries its unit and, for new snow, a plus sign ----------
const fmtNum = (v: number): string => `${v < 0 ? '−' : ''}${Math.abs(v)}`;
const fmtNew = (cm: number): string => (cm >= 0.5 ? `+${cm} cm` : '0 cm');
const heat = (cm: number): number => (cm < 0.5 ? 0 : cm < 2 ? 1 : cm < 5 ? 2 : cm < 10 ? 3 : cm < 20 ? 4 : 5);

type Metric = 'depth' | 'past7' | 'next10' | 'temp';
const METRICS: { id: Metric; tab: string; head: string; note: string }[] = [
    { id: 'depth', tab: 'On the ground now', head: 'Snow on the ground now', note: 'How deep the snow is at each place today. Model estimate, in cm.' },
    { id: 'past7', tab: 'Fell, last 7 days', head: 'New snow that fell in the last 7 days', note: 'Total snowfall over the past week at each place, in cm.' },
    { id: 'next10', tab: 'Expected, next 10 days', head: 'New snow expected in the next 10 days', note: 'Total forecast snowfall from today to day 10, in cm.' },
    { id: 'temp', tab: 'Temperature now', head: 'Air temperature right now', note: 'Current temperature at each place, in °C.' },
];
const metricValue = (m: Metric, d: Wx): number | null =>
    m === 'depth' ? (d.depthCm === null || d.depthCm === undefined ? null : roundCm(d.depthCm * 100))
        : m === 'past7' ? d.past7 : m === 'next10' ? d.expectedCm : Math.round(d.temp);
const fmtMetric = (m: Metric, v: number): string => (m === 'temp' ? fmtT(v) : m === 'depth' ? `${v} cm` : fmtNew(v));

// Every place ranked on one scale. Grey = snow on the ground, blue = new snow, ink = temperature.
function RankBars({ metric, wx }: { metric: Metric; wx: Record<string, Wx> }) {
    const rows = PLACES.filter((p) => wx[p.id]).map((p) => ({ p, v: metricValue(metric, wx[p.id]) }))
        .sort((a, b) => (b.v ?? -999) - (a.v ?? -999));
    const vals = rows.filter((r) => r.v !== null).map((r) => r.v as number);
    const lo = Math.min(0, ...vals);
    const hi = Math.max(1, ...vals);
    const pct = (v: number) => ((v - lo) / (hi - lo)) * 100;
    const zero = pct(0);
    return (
        <ol className={`sr-bars m-${metric}`}>
            {rows.map(({ p, v }, i) => (
                <li className="sr-bar" key={p.id}>
                    <span className="sr-bar-n">{i + 1}</span>
                    <span className="sr-bar-name">{p.name}<em>{p.valley}</em></span>
                    <span className="sr-bar-track">
                        {v !== null && <i style={{ left: `${Math.min(zero, pct(v))}%`, width: `${Math.max(0.6, Math.abs(pct(v) - zero))}%` }} />}
                        {lo < 0 && <b style={{ left: `${zero}%` }} />}
                    </span>
                    <span className="sr-bar-v">{v === null ? 'n/a' : fmtMetric(metric, v)}</span>
                </li>
            ))}
        </ol>
    );
}

// Where and when: places down the side, the next 10 days across, cells shaded by expected new snow.
function SnowMatrix({ wx }: { wx: Record<string, Wx> }) {
    const first = PLACES.find((p) => wx[p.id]);
    if (!first) return null;
    const days = wx[first.id].fc;
    return (
        <div className="sr-mx" role="table" aria-label="New snow expected per place and day, in cm">
            <div className="sr-mx-row sr-mx-head" role="row">
                <span className="sr-mx-name" />
                {days.map((d, i) => (
                    <span key={d.date} className={i === 0 ? 'today' : ''}>{d.dayLabel.slice(0, 2)}<b>{d.dayLabel.split(' ')[1]?.split('/')[0]}</b></span>
                ))}
            </div>
            {VALLEYS.map((v) => {
                const list = PLACES.filter((p) => p.valley === v && wx[p.id]);
                if (!list.length) return null;
                return (
                    <React.Fragment key={v}>
                        <div className="sr-mx-valley">{v}</div>
                        {list.map((p) => (
                            <div className="sr-mx-row" role="row" key={p.id}>
                                <span className="sr-mx-name">{p.name}</span>
                                {wx[p.id].fc.map((d, i) => (
                                    <span key={d.date} className={`sr-mx-c h${heat(d.snow)}${i === 0 ? ' today' : ''}`}>{d.snow >= 0.5 ? d.snow : ''}</span>
                                ))}
                            </div>
                        ))}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// One place, 24 days: grey area = snow depth on the ground, bars = new snow per day
// (light blue = already fell, blue = expected). Same cm scale for both, so the bars read as additions.
function PlaceChart({ d }: { d: Wx }) {
    const s = d.series;
    const n = s.length;
    const ti = s.findIndex((x) => x.today);
    const maxV = Math.max(10, ...s.map((x) => x.depth ?? 0), ...s.map((x) => x.snow));
    const step = maxV > 100 ? 40 : maxV > 40 ? 20 : 10;
    const top = Math.ceil((maxV * 1.05) / step) * step;
    const ticks: number[] = [];
    for (let t = 0; t <= top; t += step) ticks.push(t);
    const yy = (v: number) => 100 - (v / top) * 100;
    const pts = s.map((x, i) => (x.depth === null ? null : `${i + 0.5},${yy(x.depth)}`)).filter((x): x is string => x !== null);
    const firstX = pts.length ? pts[0].split(',')[0] : '0';
    const lastX = pts.length ? pts[pts.length - 1].split(',')[0] : '0';
    const area = pts.length ? `M${firstX},100 L${pts.join(' L')} L${lastX},100 Z` : '';
    let big = -1;
    s.forEach((x, i) => { if (!x.past && x.snow >= 1 && (big < 0 || x.snow > s[big].snow)) big = i; });
    const depthNow = ti >= 0 ? s[ti].depth : null;
    const xl = (i: number) => `${((i + 0.5) / n) * 100}%`;
    const xLabels = [0, 7, ti, Math.min(n - 1, ti + 5), n - 1].filter((v, i, a) => v >= 0 && a.indexOf(v) === i);
    return (
        <figure className="sr-pc">
            <figcaption className="sr-pc-key">
                <span><i className="k-ground" />Snow on the ground</span>
                <span><i className="k-fell" />Snow that fell</span>
                <span><i className="k-new" />Snow expected</span>
            </figcaption>
            <div className="sr-pc-zones" style={{ gridTemplateColumns: `${ti}fr ${n - ti}fr` }}>
                <span>Past 14 days</span><span>Next 10 days</span>
            </div>
            <div className="sr-pc-plot">
                {ticks.map((t) => <span className="sr-pc-grid" key={t} style={{ bottom: `${(t / top) * 100}%` }}><em>{t}</em></span>)}
                <span className="sr-pc-unit">cm</span>
                <svg className="sr-pc-area" viewBox={`0 0 ${n} 100`} preserveAspectRatio="none" aria-hidden="true">
                    <path d={area} />
                    <polyline points={pts.join(' ')} vectorEffect="non-scaling-stroke" />
                </svg>
                <div className="sr-pc-cols" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                    {s.map((x, i) => (
                        <span key={x.date} className={`sr-pc-col${x.past ? ' past' : ''}${x.today ? ' today' : ''}`}>
                            {x.snow > 0 && <i style={{ height: `${(x.snow / top) * 100}%` }} />}
                            {i === big && <b style={{ bottom: `${(x.snow / top) * 100}%` }}>+{x.snow} cm</b>}
                        </span>
                    ))}
                </div>
                {depthNow !== null && (
                    <span className="sr-pc-now" style={{ left: `${(ti / n) * 100}%`, bottom: `${(depthNow / top) * 100}%` }}><b>{depthNow} cm</b></span>
                )}
            </div>
            <div className="sr-pc-x">
                {xLabels.map((i, k) => (
                    <span key={i} className={`${i === ti ? 'today' : ''}${k === 0 ? ' first' : ''}${i === n - 1 ? ' last' : ''}`} style={{ left: i === ti ? `${(ti / n) * 100}%` : xl(i) }}>{i === ti ? 'Today' : s[i].label}</span>
                ))}
            </div>
        </figure>
    );
}

// The next 10 days as a labelled table: no number without its row name.
function NextTable({ fc }: { fc: DayFc[] }) {
    return (
        <div className="sr-nt" role="table" aria-label="Next 10 days">
            <div className="sr-nt-row sr-nt-h" role="row"><span>Day</span>{fc.map((d, i) => <span key={d.date} className={i === 0 ? 'today' : ''}>{d.dayLabel.slice(0, 2)}<b>{d.dayLabel.split(' ')[1]?.split('/')[0]}</b></span>)}</div>
            <div className="sr-nt-row sr-nt-snow" role="row"><span>New snow, cm</span>{fc.map((d) => <span key={d.date} className={d.snow >= 0.5 ? `on h${heat(d.snow)}` : ''}>{d.snow >= 0.5 ? d.snow : '–'}</span>)}</div>
            <div className="sr-nt-row" role="row"><span>High, °C</span>{fc.map((d) => <span key={d.date}>{fmtNum(d.tmax)}</span>)}</div>
            <div className="sr-nt-row sr-nt-lo" role="row"><span>Low, °C</span>{fc.map((d) => <span key={d.date}>{fmtNum(d.tmin)}</span>)}</div>
        </div>
    );
}

function SectionHead({ no, title, note }: { no: string; title: string; note: string }) {
    return (
        <div className="sr-sh">
            <span className="sr-sh-no">{no}</span>
            <h2 className="sr-sh-title">{title}</h2>
            <p className="sr-sh-note">{note}</p>
        </div>
    );
}

type Stat = { value: string; label: string; where: string };

export function App() {
    const [wx, setWx] = useState<Record<string, Wx>>({});
    const [wxError, setWxError] = useState(false);
    const [cams, setCams] = useState<Record<string, CamState>>({});
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
    const objectUrls = useRef<string[]>([]);
    const [metric, setMetric] = useState<Metric>('depth');

    const loadAll = useCallback(async () => {
        try {
            const res = await fetch(wxUrl(), { cache: 'no-store' });
            if (!res.ok) throw new Error(String(res.status));
            const data = await res.json();
            const arr = Array.isArray(data) ? data : [data];
            const next: Record<string, Wx> = {};
            arr.forEach((loc: any, i: number) => {
                const place = PLACES[i];
                if (!place || !loc?.current) return;
                const c = loc.current;
                next[place.id] = {
                    temp: Math.round(c.temperature_2m * 10) / 10,
                    feels: Math.round(num(c.apparent_temperature, c.temperature_2m) * 10) / 10,
                    code: c.weather_code,
                    hum: Math.round(num(c.relative_humidity_2m)),
                    depthCm: c.snow_depth,
                    ...summarize(loc),
                };
            });
            setWx(next);
            setWxError(false);
        } catch {
            setWxError(true);
        }
        const stamp = Date.now();
        const entries: [string, string][] = [];
        PLACES.forEach((p) => p.cams.forEach((c) => { if (c.img) entries.push([c.img, c.img.startsWith('pano:') ? c.img : `${c.img}?t=${stamp}`]); }));
        setCams((prev) => {
            const next = { ...prev };
            entries.forEach(([key]) => { next[key] = 'loading'; });
            return next;
        });
        await Promise.all(entries.map(async ([key, url]) => {
            try {
                let target = url;
                if (url.startsWith('pano:')) {
                    const id = url.slice(5);
                    const seq = await (await fetch(`https://api.panomax.com/1.0/cams/${id}/images/sequence`, { cache: 'no-store' })).json();
                    const days = seq.days || [];
                    const candidates: string[] = [];
                    for (let d = days.length - 1; d >= 0 && candidates.length < 4; d -= 1) {
                        const imgs = (days[d].images || []).filter((i: { available: boolean }) => i.available).reverse();
                        imgs.slice(0, 4 - candidates.length).forEach((last: { time: string }) => {
                            candidates.push(`https://panodata${days[d].storage}.panomax.com/cams/${id}/${String(days[d].date).replace(/-/g, '/')}/${String(last.time).replace(/:/g, '-')}_optimized.jpg`);
                        });
                    }
                    if (!candidates.length) throw new Error('no frame');
                    let okUrl = '';
                    for (const c of candidates) {
                        try {
                            const probe = await fetch(c, { cache: 'no-store' });
                            if (probe.ok) { okUrl = c; break; }
                        } catch { /* try the previous frame */ }
                    }
                    if (!okUrl) throw new Error('no frame');
                    target = okUrl;
                }
                const res = await fetch(target, { cache: 'no-store' });
                if (!res.ok) throw new Error(String(res.status));
                const blob = await res.blob();
                if (!blob.type.startsWith('image/')) throw new Error(blob.type);
                const obj = URL.createObjectURL(blob);
                objectUrls.current.push(obj);
                setCams((prev) => ({ ...prev, [key]: obj }));
            } catch {
                setCams((prev) => ({ ...prev, [key]: 'error' }));
            }
        }));
        setUpdatedAt(new Date());
    }, []);

    useEffect(() => {
        loadAll();
        const id = window.setInterval(loadAll, 10 * 60 * 1000);
        const urls = objectUrls.current;
        return () => { window.clearInterval(id); urls.forEach((u) => URL.revokeObjectURL(u)); };
    }, [loadAll]);

    const haveWx = Object.keys(wx).length > 0;
    const live = PLACES.filter((p) => wx[p.id]);
    const best = (f: (p: Place) => number | null, dir: 1 | -1): Place | null => {
        let b: Place | null = null;
        let bv = 0;
        live.forEach((p) => { const v = f(p); if (v !== null && (b === null || dir * v > dir * bv)) { b = p; bv = v; } });
        return b;
    };
    const stats: Stat[] = [];
    if (haveWx) {
        const deep = best((p) => wx[p.id].depthCm, 1);
        if (deep) stats.push({ value: fmtCm(wx[deep.id].depthCm), label: 'Deepest snow on the ground', where: `${deep.name} · ${fmtElev(deep.elevation)}` });
        const wet = best((p) => wx[p.id].expectedCm, 1);
        if (wet) stats.push(wx[wet.id].expectedCm >= 0.5
            ? { value: fmtNew(wx[wet.id].expectedCm), label: 'Most new snow expected, next 10 days', where: wet.name }
            : { value: '0 cm', label: 'New snow expected, next 10 days', where: 'Dry everywhere' });
        let bd: { p: Place; i: number; cm: number } | null = null;
        live.forEach((p) => wx[p.id].fc.forEach((day, i) => { if (day.snow >= 0.5 && (bd === null || day.snow > bd.cm)) bd = { p, i, cm: day.snow }; }));
        const bdx = bd as { p: Place; i: number; cm: number } | null;
        stats.push(bdx
            ? { value: bdx.i === 0 ? 'Today' : wx[bdx.p.id].fc[bdx.i].dayLabel.replace(/\/\d+$/, ''), label: 'Biggest snow day ahead', where: `Up to +${bdx.cm} cm at ${bdx.p.name}` }
            : { value: 'None', label: 'Biggest snow day ahead', where: 'No new snow in the forecast' });
        const cold = best((p) => wx[p.id].temp, -1);
        if (cold) stats.push({ value: fmtT(Math.round(wx[cold.id].temp)), label: 'Coldest right now', where: cold.name });
    }
    const M = METRICS.find((m) => m.id === metric) ?? METRICS[0];

    return <FileCard lang="en" dir="ltr">
        <div className="sr-root">
        <header className="sr-top">
            <span className="sr-top-l">Snow report</span>
            <span className="sr-top-r"><span className="sr-top-t">{updatedAt ? `Updated ${timeFmt.format(updatedAt)}` : 'Loading…'}</span><button type="button" className="sr-refresh" onClick={loadAll}>Refresh</button></span>
        </header>

        <section className="sr-hero">
            <h1 className="sr-title">Sella<br />Ronda</h1>
            <p className="sr-lede">Snow on the ground, new snow and temperature at 24 places around the Sella, from Open-Meteo. Updates every 10 minutes.</p>
            {wxError && <div className="sr-error">Weather data failed to load. Check your connection and press Refresh.</div>}
            {stats.length > 0 && (
                <dl className="sr-stats">
                    {stats.map((st) => (
                        <div className="sr-stat" key={st.label}>
                            <dt>{st.label}</dt>
                            <dd>{st.value}</dd>
                            <span>{st.where}</span>
                        </div>
                    ))}
                </dl>
            )}
        </section>

        <main className="sr-body">
        {haveWx && (
            <section className="sr-section">
                <SectionHead no="01" title="Compare all places" note="Pick a measure. Every place is ranked on the same scale." />
                <div className="sr-seg" role="tablist">
                    {METRICS.map((m) => (
                        <button type="button" role="tab" aria-selected={metric === m.id} className={metric === m.id ? 'on' : ''} key={m.id} onClick={() => setMetric(m.id)}>{m.tab}</button>
                    ))}
                </div>
                <h3 className="sr-chart-title">{M.head}</h3>
                <p className="sr-chart-note">{M.note}</p>
                <RankBars metric={metric} wx={wx} />
            </section>
        )}

        {haveWx && (
            <section className="sr-section">
                <SectionHead no="02" title="Where and when it will snow" note="New snow expected per day, in cm. Empty cells mean no snow. Today is the first column." />
                <SnowMatrix wx={wx} />
                <div className="sr-legend">
                    <span><i className="h1" />under 2</span><span><i className="h2" />2–5</span><span><i className="h3" />5–10</span><span><i className="h4" />10–20</span><span><i className="h5" />20+ cm</span>
                </div>
            </section>
        )}

        {VALLEYS.map((valley, vi) => (
            <section key={valley} className="sr-valley">
                <div className="sr-valley-head">
                    <span className="sr-sh-no">0{vi + 3}</span>
                    <h2 className="sr-valley-name">{valley}</h2>
                    <span className="sr-valley-count">{PLACES.filter((p) => p.valley === valley).length} places</span>
                </div>
                <div className="sr-places">
                {PLACES.filter((p) => p.valley === valley).map((p) => {
                    const d = wx[p.id];
                    const g = d ? groupOf(d.code) : 'cloud';
                    return (
                        <article key={p.id} className="sr-place">
                            <header className="sr-place-head">
                                <div>
                                    <h3 className="sr-place-name">{p.name}</h3>
                                    <span className="sr-place-meta">{fmtElev(p.elevation)}{KIND_LABEL[p.kind] !== '' ? ` · ${KIND_LABEL[p.kind]}` : ''} · {valley}</span>
                                </div>
                                {d && <Glyph group={g} />}
                            </header>
                            {!d && !wxError && <p className="sr-loading">Loading…</p>}
                            {d && (
                                <>
                                    <dl className="sr-kv">
                                        <div><dt>Temperature now</dt><dd>{fmtT(Math.round(d.temp))}</dd><span>{WMO_EN[d.code] ?? ''} · feels like {fmtT(Math.round(d.feels))}</span></div>
                                        <div><dt>Snow on the ground</dt><dd>{fmtCm(d.depthCm)}</dd><span>Model estimate</span></div>
                                        <div><dt>New snow, last 7 days</dt><dd>{fmtNew(d.past7)}</dd><span>Last snowfall: {d.lastSnow}</span></div>
                                        <div><dt>New snow, next 10 days</dt><dd className={d.expectedCm >= 0.5 ? 'blue' : ''}>{fmtNew(d.expectedCm)}</dd><span>Next snowfall: {d.nextSnow}</span></div>
                                    </dl>
                                    <PlaceChart d={d} />
                                    <NextTable fc={d.fc} />
                                </>
                            )}
                            <div className="sr-cams">
                                {p.cams.map((cam) => {
                                    if (!cam.img) {
                                        return <a key={cam.title} className="sr-cam-link" href={cam.page} target="_blank" rel="noreferrer">Live cam · {cam.title} ↗</a>;
                                    }
                                    const state = cams[cam.img];
                                    if (state === 'error') {
                                        return <a key={cam.title} className="sr-cam-link" href={cam.page} target="_blank" rel="noreferrer">{cam.title} · cam offline, open source ↗</a>;
                                    }
                                    return (
                                        <figure key={cam.title} className="sr-cam">
                                            {state && state !== 'loading'
                                                ? <img src={state} alt={`Live webcam: ${cam.title}, ${p.name}`} />
                                                : <div className="sr-cam-skeleton">Loading cam…</div>}
                                            <figcaption>{cam.title} · <a href={cam.page} target="_blank" rel="noreferrer">source</a></figcaption>
                                        </figure>
                                    );
                                })}
                            </div>
                        </article>
                    );
                })}
                </div>
            </section>
        ))}

        <footer className="sr-sources">
            <p>
                Weather and snow: Open-Meteo at each place. Snow on the ground is a model estimate, not an official resort measurement;
                lift stations read deeper because the model sits higher on the mountain. Past snowfall is modelled, not measured.
                Webcams: Feratel, courtesy of the Val Gardena, Val di Fassa, Alta Badia and Arabba tourism boards.
                Some cams stop updating after dark; the timestamp printed on each image is its capture time, Italy time.
            </p>
        </footer>
        </main>
        </div>
    </FileCard>;
}
