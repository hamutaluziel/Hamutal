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
        id: 'passosella', name: 'Passo Sella', valley: 'Dolomite Passes', kind: 'pass', elevation: 2218, lat: 46.5086, lon: 11.7628,
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
            { title: 'Campitello and Col Rodella', page: 'https://www.fassa.com/en/webcam/canazei-belvedere-col-rodella-passo-pordoi/webcam-campitello-col-rodella' },
        ],
    },
    {
        id: 'colrodella', name: 'Col Rodella', valley: 'Val di Fassa', kind: 'lift', elevation: 2395, lat: 46.4956, lon: 11.7481,
        cams: [
            { title: 'Col Rodella (360)', page: 'https://colrodella.panomax.com' },
        ],
    },
    {
        id: 'canazei', name: 'Canazei', valley: 'Val di Fassa', kind: 'village', elevation: 1460, lat: 46.4769, lon: 11.7709,
        cams: [
            { title: 'Val di Fassa webcams', page: 'https://www.fassa.com/en/webcam' },
        ],
    },
    {
        id: 'belvedere', name: 'Belvedere · Col dei Rossi', valley: 'Val di Fassa', kind: 'lift', elevation: 2382, lat: 46.4810, lon: 11.7930,
        cams: [
            { title: 'Belvedere, Col dei Rossi', page: 'https://www.fassa.com/en/webcam/canazei-belvedere-col-rodella-passo-pordoi/webcam-canazei-belvedere-col-dei-rossi' },
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
        ],
    },
    {
        id: 'portavescovo', name: 'Porta Vescovo', valley: 'Arabba–Marmolada', kind: 'lift', elevation: 2478, lat: 46.4732, lon: 11.8675,
        cams: [
            { title: 'Porta Vescovo (360)', page: 'https://portavescovo.panomax.com' },
        ],
    },
    {
        id: 'campolongo', name: 'Passo Campolongo', valley: 'Dolomite Passes', kind: 'pass', elevation: 1875, lat: 46.5200, lon: 11.8742,
        cams: [
            { title: 'Arabba and Campolongo webcams', page: ARABBA },
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
    const elev = PLACES.map((p) => p.elevation).join(',');
    return `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&elevation=${elev}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,snow_depth&hourly=snowfall,snow_depth,precipitation&daily=temperature_2m_max,temperature_2m_min&past_days=14&forecast_days=10&timezone=Europe%2FRome`;
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


// ===================== Glance design =====================
// One look tells you what is happening: a sentence, four numbers, ten days of snow.
// Valleys summarise "mountain" (2,000 m and up) and "village" (below). Tap for every place.

const UP = 2000;
const LONG_DAY: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const depthOf = (w?: Wx): number | null => (w && w.depthCm !== null && w.depthCm !== undefined ? roundCm(w.depthCm * 100) : null);
const tRound = (t: number): string => fmtT(Math.round(t) === 0 ? 0 : Math.round(t));
const range = (vals: number[], unit = ''): string => {
    if (!vals.length) return '–';
    const lo = Math.round(Math.min(...vals));
    const hi = Math.round(Math.max(...vals));
    return lo === hi ? `${lo}${unit}` : `${lo}–${hi}${unit}`;
};
const tRange = (vals: number[]): string => {
    if (!vals.length) return '–';
    const lo = Math.round(Math.min(...vals));
    const hi = Math.round(Math.max(...vals));
    return lo === hi ? tRound(lo) : `${tRound(lo).replace('°', '')} to ${tRound(hi)}`;
};
const plusCm = (cm: number): string => (cm >= 0.5 ? `+${Math.round(cm) || cm} cm` : '0 cm');
const dayParts = (label: string): { wd: string; d: string; dm: string } => {
    const [wd, dm = ''] = label.split(' ');
    return { wd, d: dm.split('/')[0], dm };
};
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/Rome' });

const LINE1: Record<Group, string> = {
    snow: 'Snowing on the lifts.', clear: 'Sunny on the lifts.', cloud: 'Cloudy on the lifts.',
    fog: 'Fog on the lifts.', rain: 'Rain on the lifts.', storm: 'Storms on the lifts.',
};

// Square-ended snowflake: straight strokes only.
function Flake({ size }: { size: number }) {
    return (
        <svg className="sr-flake" width={size} height={size} viewBox="-7 -7 14 14" aria-hidden="true">
            <path d="M0-6V6M-5.2-3L5.2 3M-5.2 3L5.2-3" stroke="currentColor" strokeWidth={14 / size + 0.5} fill="none" />
        </svg>
    );
}

type StripDay = { key: string; label: string; snow: number };
// Ten days in a row, like a weather app: day, a flake sized by the amount, the number. The biggest day is inverted.
function SnowStrip({ days }: { days: StripDay[] }) {
    const big = days.reduce((b, d, i) => (d.snow > days[b].snow ? i : b), 0);
    return (
        <div className="sr-strip" role="table" aria-label="New snow per day, in cm">
            {days.map((d, i) => {
                const p = dayParts(d.label);
                const has = d.snow >= 0.5;
                return (
                    <div key={d.key} role="row" className={`sr-strip-day${has && i === big ? ' big' : ''}${has ? '' : ' dry'}`}>
                        <span className="sr-strip-wd">{i === 0 ? 'Today' : p.wd.slice(0, 2)}</span>
                        <span className="sr-strip-d">{p.d}</span>
                        <span className="sr-strip-ic">{has ? <Flake size={d.snow >= 8 ? 22 : d.snow >= 3 ? 17 : 12} /> : null}</span>
                        <b>{has ? `+${Math.round(d.snow) || d.snow}` : '–'}</b>
                    </div>
                );
            })}
        </div>
    );
}

function TempStrip({ fc }: { fc: DayFc[] }) {
    return (
        <div className="sr-tstrip" role="table" aria-label="High and low temperature per day">
            {fc.map((d) => (
                <div key={d.date} role="row"><b>{tRound(d.tmax)}</b><span>{tRound(d.tmin)}</span></div>
            ))}
        </div>
    );
}

function CamTile({ cam, state, onOpen, caption }: { cam: Cam; state?: CamState; onOpen?: () => void; caption: React.ReactNode }) {
    if (!cam.img || state === 'error') {
        return (
            <a className="sr-camlink" href={cam.page} target="_blank" rel="noreferrer">
                <span>{cam.title}</span><small>{cam.img ? 'Cam offline · open the source ↗' : 'Open the live cam ↗'}</small>
            </a>
        );
    }
    return (
        <figure className="sr-cam">
            <button type="button" className="sr-cam-img" onClick={onOpen} disabled={!onOpen}>
                {state && state !== 'loading' ? <img src={state} alt={`Live webcam: ${cam.title}`} /> : <span className="sr-cam-wait">Loading cam…</span>}
            </button>
            <figcaption>{caption}<a href={cam.page} target="_blank" rel="noreferrer">source ↗</a></figcaption>
        </figure>
    );
}


// ---------- The Sellaronda on a map ----------
// Stops at their real coordinates, joined by straight lines. Orange = clockwise signs, green = anticlockwise.
const LOOP = ['selva', 'passogardena', 'colfosco', 'corvara', 'campolongo', 'arabba', 'pordoi', 'canazei', 'campitello', 'passosella', 'plandegralba'];
type LabelPos = 'n' | 'nw' | 'ne' | 'e' | 'se' | 'sw' | 's' | 'w';
const LABELLED: Record<string, LabelPos> = { selva: 'nw', passogardena: 'n', corvara: 'ne', campolongo: 'e', arabba: 'se', pordoi: 's', canazei: 'sw', passosella: 'w' };
const SELLA_OUTLINE: [number, number][] = [[46.543, 11.795], [46.546, 11.815], [46.541, 11.836], [46.537, 11.851], [46.525, 11.859], [46.511, 11.857], [46.501, 11.848], [46.495, 11.829], [46.494, 11.811], [46.499, 11.791], [46.508, 11.776], [46.521, 11.772], [46.533, 11.779]];

function LoopMap({ wx }: { wx: Record<string, Wx> }) {
    const W = 390, H = 312, K = 2150, CX = 190, CY = 156, LAT0 = 46.5156, LON0 = 11.808;
    const F = K * Math.cos((LAT0 * Math.PI) / 180);
    const P = (lat: number, lon: number): [number, number] => [CX + (lon - LON0) * F, CY - (lat - LAT0) * K];
    const stops = LOOP.map((id) => PLACES.find((p) => p.id === id)).filter((p): p is Place => !!p);
    const pts = stops.map((p) => P(p.lat, p.lon));
    const norm = (v: [number, number]): [number, number] => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
    const offset = (d: number) => pts.map((c, i) => {
        const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length];
        const n1 = norm([c[1] - a[1], a[0] - c[0]]), n2 = norm([b[1] - c[1], c[0] - b[0]]);
        const m = norm([n1[0] + n2[0], n1[1] + n2[1]]);
        const l = d / Math.max(0.45, m[0] * n1[0] + m[1] * n1[1]);
        return [c[0] + m[0] * l, c[1] + m[1] * l] as [number, number];
    });
    const poly = (q: [number, number][]) => q.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const mass = SELLA_OUTLINE.map(([a, o]) => P(a, o));
    const [sx, sy] = P(46.522, 11.81);
    const bands = Array.from({ length: 30 }, (_, i) => 40 + i * 9);
    return (
        <svg className="sr-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Map of the Sellaronda with snow at each stop">
            <defs><clipPath id="sr-mass"><polygon points={poly(mass)} /></clipPath></defs>
            <polygon points={poly(mass)} fill="#141414" />
            <g clipPath="url(#sr-mass)">{bands.map((y) => <rect key={y} x="0" y={y} width={W} height={y % 27 === 4 ? 3 : 1} fill="#fff" opacity=".14" />)}</g>
            <text x={sx} y={sy} className="sr-map-sella" textAnchor="middle">Sella group</text>
            <polygon points={poly(offset(4.5))} fill="none" stroke="#ff7a1a" strokeWidth="3" strokeLinejoin="miter" />
            <polygon points={poly(offset(-4.5))} fill="none" stroke="#1aa957" strokeWidth="3" strokeLinejoin="miter" />
            {stops.map((p, i) => {
                const [x, y] = pts[i];
                const pos = LABELLED[p.id];
                const w = wx[p.id];
                const mark = p.kind === 'pass'
                    ? <path d={`M${x} ${y - 9} L${x + 9} ${y + 7} L${x - 9} ${y + 7}Z`} fill="#000" stroke="#fff" strokeWidth="2" />
                    : <rect x={x - 5} y={y - 5} width="10" height="10" fill="#fff" stroke="#000" strokeWidth="2" />;
                if (!pos) return <a key={p.id} href={`#${p.id}`}><rect x={x - 3} y={y - 3} width="6" height="6" fill="#8c8c8c" /></a>;
                const L: Record<LabelPos, ['start' | 'middle' | 'end', number, number]> = {
                    n: ['middle', x, y - 36], nw: ['end', x - 10, y - 34], ne: ['middle', x, y - 36], e: ['start', x + 14, y - 32],
                    se: ['start', x + 14, y + 8], s: ['start', x + 12, y + 22], sw: ['middle', x, y + 24], w: ['end', x - 14, y - 4],
                };
                const [anchor, lx, ly] = L[pos];
                return (
                    <a key={p.id} href={`#${p.id}`} className="sr-map-stop">
                        {mark}
                        <text x={lx} y={ly} textAnchor={anchor} className="sr-map-name">{p.id === 'campolongo' ? 'Campolongo' : p.name}</text>
                        <text x={lx} y={ly + 19} textAnchor={anchor} className="sr-map-num">
                            <tspan>{w ? fmtCm(w.depthCm) : '…'}</tspan>
                            {w && <tspan className="sr-map-new" dx="5">{plusCm(w.expectedCm).replace(' cm', '')}</tspan>}
                        </text>
                    </a>
                );
            })}
        </svg>
    );
}

export function App() {
    const [wx, setWx] = useState<Record<string, Wx>>({});
    const [wxError, setWxError] = useState(false);
    const [cams, setCams] = useState<Record<string, CamState>>({});
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
    const objectUrls = useRef<string[]>([]);
    const [placeId, setPlaceId] = useState<string>(() => window.location.hash.slice(1));

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
            entries.forEach(([key]) => { if (!next[key]) next[key] = 'loading'; });
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

    // A place page lives at #<place-id>, so the phone's back button works.
    useEffect(() => {
        const onHash = () => { setPlaceId(window.location.hash.slice(1)); window.scrollTo(0, 0); };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);
    const openPlace = (id: string) => { window.location.hash = id; };
    const goHome = () => { if (window.history.length > 1 && window.location.hash) window.history.back(); else window.location.hash = ''; };

    const live = PLACES.filter((p) => wx[p.id]);
    const haveWx = live.length > 0;
    const up = live.filter((p) => p.elevation >= UP);
    const down = live.filter((p) => p.elevation < UP);
    const depths = (list: Place[]) => list.map((p) => depthOf(wx[p.id])).filter((v): v is number => v !== null);
    const updated = updatedAt ? `Updated ${timeFmt.format(updatedAt)}` : 'Loading live data…';

    const header = (
        <div className="sr-nav">
            {placeId && PLACES.some((p) => p.id === placeId)
                ? <button type="button" className="sr-back" onClick={goHome}>← Sella Ronda</button>
                : <span className="sr-brand">Sella Ronda</span>}
            <span className="sr-upd">{updated}<button type="button" className="sr-refresh" onClick={loadAll}>Refresh</button></span>
        </div>
    );
    const error = wxError ? <p className="sr-err">Weather data did not load. Check the connection and press Refresh.</p> : null;
    const footer = (
        <footer className="sr-foot">
            <p>
                Weather and snow from Open-Meteo for each place. Snow on the ground is a model estimate, not a resort measurement;
                lift stations read deeper because they sit higher. “Mountain” means 2,000 m and above. Refreshes every 10 minutes.
            </p>
            <p>Webcams: Feratel, Panomax and the Val Gardena, Val di Fassa, Alta Badia and Arabba tourism boards. Some cams stop after dark.</p>
        </footer>
    );

    // ---------------- Place page ----------------
    const place = PLACES.find((p) => p.id === placeId);
    if (place) {
        const w = wx[place.id];
        const big = w ? w.fc.reduce((b, d, i) => (d.snow > w.fc[b].snow ? i : b), 0) : 0;
        const bigDay = w ? w.fc[big] : null;
        const bigName = bigDay ? (big === 0 ? 'today' : big === 1 ? 'tomorrow' : `on ${LONG_DAY[dayParts(bigDay.dayLabel).wd] ?? dayParts(bigDay.dayLabel).wd}`) : '';
        return <FileCard lang="en" dir="ltr">
            <div className="sr-root">
                <section className="sr-ice"><div className="sr-wrap">
                    {header}
                    <h1 className="sr-pname">{place.name}</h1>
                    <p className="sr-pmeta">{fmtElev(place.elevation)} · {place.kind === 'village' ? 'Village' : KIND_LABEL[place.kind]} · {place.valley}</p>
                    {error}
                    {!w && !wxError && <p className="sr-wait">Loading…</p>}
                    {w && (
                        <>
                            <p className="sr-say">
                                {WMO_EN[w.code] ?? 'Now'}, {tRound(w.temp)}.{' '}
                                {bigDay && bigDay.snow >= 0.5 ? <>Most snow {bigName}: <b>{plusCm(bigDay.snow)}</b>.</> : <>No new snow in the next 10 days.</>}
                            </p>
                            <dl className="sr-stats">
                                <div><dt>Snow on the ground</dt><dd>{fmtCm(w.depthCm)}</dd><span>Model estimate</span></div>
                                <div><dt>New snow, next 10 days</dt><dd>{plusCm(w.expectedCm)}</dd><span>Next: {w.nextSnow}</span></div>
                                <div><dt>Temperature now</dt><dd>{tRound(w.temp)}</dd><span>Feels like {tRound(w.feels)} · humidity {w.hum}%</span></div>
                                <div><dt>New snow, last 7 days</dt><dd>{plusCm(w.past7)}</dd><span>Last: {w.lastSnow}</span></div>
                            </dl>
                            <div className="sr-lab"><span>New snow, next 10 days</span><span>cm</span></div>
                            <SnowStrip days={w.fc.map((d) => ({ key: d.date, label: d.dayLabel, snow: d.snow }))} />
                            <div className="sr-lab"><span>Temperature, high and low</span><span>°C</span></div>
                            <TempStrip fc={w.fc} />
                        </>
                    )}
                </div></section>
                <section className="sr-blk"><div className="sr-wrap">
                    <div className="sr-h2"><b>Webcams</b><span>{place.cams.length} for {place.name}</span></div>
                    <div className="sr-cams">
                        {place.cams.map((c) => (
                            <CamTile key={c.title} cam={c} state={c.img ? cams[c.img] : undefined} caption={<b>{c.title}</b>} />
                        ))}
                    </div>
                    {footer}
                </div></section>
            </div>
        </FileCard>;
    }

    // ---------------- Home ----------------
    const fc0 = live.length ? wx[live[0].id].fc : [];
    const mountainDays: StripDay[] = fc0.map((d, j) => ({
        key: d.date, label: d.dayLabel,
        snow: up.length ? roundCm(up.reduce((a, p) => a + wx[p.id].fc[j].snow, 0) / up.length) : 0,
    }));
    const bj = mountainDays.reduce((b, d, i) => (d.snow > mountainDays[b].snow ? i : b), 0);
    const bd = mountainDays[bj];
    const groupCount = new Map<Group, number>();
    up.forEach((p) => { const g = groupOf(wx[p.id].code); groupCount.set(g, (groupCount.get(g) ?? 0) + 1); });
    const mainGroup = [...groupCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'cloud';
    const bdName = bd ? (bj === 0 ? 'today' : bj === 1 ? 'tomorrow' : `on ${LONG_DAY[dayParts(bd.label).wd] ?? dayParts(bd.label).wd}`) : '';
    const line2 = !bd || bd.snow < 0.5 ? 'No new snow for 10 days.' : `${bd.snow >= 8 ? 'Big snow' : bd.snow >= 3 ? 'Fresh snow' : 'A little snow'} ${bdName}.`;
    const wettest = live.reduce<Place | null>((a, p) => (!a || wx[p.id].expectedCm > wx[a.id].expectedCm ? p : a), null);
    const lastDay = fc0.length ? shortDate.format(new Date(`${fc0[fc0.length - 1].date}T12:00:00Z`)) : '';

    const FEATURED = ['seceda', 'pordoi', 'pizsella', 'corvara', 'colraiser', 'boe'];
    const featured = FEATURED.map((id) => PLACES.find((p) => p.id === id)).filter((p): p is Place => !!p)
        .map((p) => ({ p, cam: p.cams.find((c) => c.img) ?? p.cams[0] }));

    return <FileCard lang="en" dir="ltr">
        <div className="sr-root">
            <section className="sr-ice"><div className="sr-wrap">
                {header}
                {error}
                {!haveWx && !wxError && <p className="sr-wait">Loading live snow data…</p>}
                {haveWx && (
                    <>
                        <h1 className="sr-h1">{LINE1[mainGroup]}<br />{line2}</h1>
                        <dl className="sr-stats">
                            <div><dt>Snow on the mountain</dt><dd>{range(depths(up), ' cm')}</dd><span>2,000 m and above</span></div>
                            <div><dt>Snow in the villages</dt><dd>{range(depths(down), ' cm')}</dd><span>Below 2,000 m</span></div>
                            <div><dt>Most new snow by {lastDay}</dt><dd>{wettest && wx[wettest.id].expectedCm >= 0.5 ? plusCm(wx[wettest.id].expectedCm) : 'None'}</dd><span>{wettest && wx[wettest.id].expectedCm >= 0.5 ? `at ${wettest.name}` : 'Dry for 10 days'}</span></div>
                            <div><dt>Temperature now</dt><dd>{tRange(live.map((p) => wx[p.id].temp))}</dd><span>Lifts to villages</span></div>
                        </dl>
                        <div className="sr-lab"><span>New snow, next 10 days</span><span>on the mountain, cm</span></div>
                        <SnowStrip days={mountainDays} />
                    </>
                )}
            </div></section>

            <section className="sr-blk"><div className="sr-wrap">
                <div className="sr-h2"><b>Every place</b><span>{PLACES.length} places · deepest snow first</span></div>
                <div className="sr-pl">
                    <div className="sr-pl-h"><span /><span>On the ground</span><span>Next 10 days</span><span>Now</span></div>
                    {[...PLACES].sort((a, b) => (depthOf(wx[b.id]) ?? -1) - (depthOf(wx[a.id]) ?? -1)).map((p) => {
                        const w = wx[p.id];
                        return (
                            <button type="button" className="sr-pl-row" key={p.id} onClick={() => openPlace(p.id)}>
                                <span className="sr-pl-n"><b>{p.name}</b><small>{fmtElev(p.elevation)} · {p.kind === 'village' ? 'Village' : KIND_LABEL[p.kind]}</small></span>
                                <span>{w ? fmtCm(w.depthCm) : '…'}</span>
                                <span className="b">{w ? plusCm(w.expectedCm) : ''}</span>
                                <span>{w ? tRound(w.temp) : ''}<em>›</em></span>
                            </button>
                        );
                    })}
                </div>

                <div className="sr-h2"><b>The Sellaronda</b><span>Tap a stop to open it</span></div>
                <div className="sr-mapbox"><LoopMap wx={wx} /></div>
                <div className="sr-mapkey">
                    <span><i className="or" />Clockwise · orange signs</span>
                    <span><i className="gr" />Anticlockwise · green signs</span>
                    <span><i className="pass" />Mountain pass</span>
                    <span><i className="vil" />Village</span>
                </div>
                <p className="sr-mapnote">At each stop: <b>snow on the ground now</b>, then in blue <b className="b">the new snow expected in the next 10 days</b>, in cm. Places are at their real positions; the line between them is simplified.</p>

                <div className="sr-h2"><b>Webcams</b><span>Tap for the place</span></div>
                <div className="sr-cams">
                    {featured.map(({ p, cam }) => {
                        const w = wx[p.id];
                        return (
                            <CamTile key={p.id} cam={cam} state={cam.img ? cams[cam.img] : undefined} onOpen={() => openPlace(p.id)}
                                caption={<><b>{p.name}</b>{w && <small>{fmtCm(w.depthCm)} · <em>{plusCm(w.expectedCm)}</em> · {tRound(w.temp)}</small>}</>} />
                        );
                    })}
                </div>
                {footer}
            </div></section>
        </div>
    </FileCard>;
}
