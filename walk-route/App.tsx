import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RouteMap from './src/RouteMap';
import { formatDuration, formatPace } from './src/geo';
import {
  Place,
  Route,
  buildAtoB,
  buildLoop,
  currentPosition,
  geocode,
  googleMapsUrl,
  reverseGeocode,
} from './src/routing';
import { useWalkTracker } from './src/useWalkTracker';

type Mode = 'loop' | 'ab';
type Target = 'km' | 'min';

const SETTINGS_KEY = 'walk-settings-v1';

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

function Main() {
  const [mode, setMode] = useState<Mode>('loop');
  const [targetType, setTargetType] = useState<Target>('km');
  const [startText, setStartText] = useState('');
  const [endText, setEndText] = useState('');
  const [kmText, setKmText] = useState('5');
  const [minText, setMinText] = useState('45');
  const [speedText, setSpeedText] = useState('6');
  const [startPlace, setStartPlace] = useState<Place | null>(null); // from GPS
  const [route, setRoute] = useState<Route | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'plan' | 'walk'>('plan');

  const speed = parseNum(speedText);
  const targetKm = targetType === 'km' ? parseNum(kmText) : (speed * parseNum(minText)) / 60;
  const { stats, start, togglePause, stop, reset } = useWalkTracker(route, speed);

  // Remember the user's preferences between visits.
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (!raw) return;
        const v = JSON.parse(raw);
        if (v.speedText) setSpeedText(v.speedText);
        if (v.kmText) setKmText(v.kmText);
        if (v.minText) setMinText(v.minText);
        if (v.mode) setMode(v.mode);
        if (v.targetType) setTargetType(v.targetType);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ speedText, kmText, minText, mode, targetType })).catch(
      () => {},
    );
  }, [speedText, kmText, minText, mode, targetType]);

  const locateMe = async () => {
    setError(null);
    setBusy('מאתר מיקום…');
    try {
      const p = await currentPosition();
      const label = await reverseGeocode(p);
      setStartPlace({ ...p, label });
      setStartText(label);
    } catch (e) {
      setError(msg(e));
    } finally {
      setBusy(null);
    }
  };

  const build = async () => {
    setError(null);
    if (!(speed > 1 && speed < 15)) return setError('נא להזין מהירות ממוצעת בין 1 ל-15 קמ"ש');
    if (!(targetKm >= 0.5 && targetKm <= 50)) return setError('אורך המסלול צריך להיות בין 0.5 ל-50 ק"מ');
    if (mode === 'ab' && !endText.trim()) return setError('נא להזין כתובת סיום');
    setBusy('בונה מסלול…');
    try {
      const a =
        startPlace && startPlace.label === startText ? startPlace : await geocode(startText);
      const r =
        mode === 'loop'
          ? await buildLoop(a, targetKm * 1000)
          : await buildAtoB(a, await geocode(endText), targetKm * 1000);
      reset();
      setRoute(r);
    } catch (e) {
      setError(msg(e));
    } finally {
      setBusy(null);
    }
  };

  const openGoogle = () => route && Linking.openURL(googleMapsUrl(route));

  const startWalk = async () => {
    try {
      await start();
      setTab('walk');
    } catch (e) {
      Alert.alert('שגיאה', msg(e));
    }
  };

  const finishWalk = () =>
    Alert.alert('לסיים את ההליכה?', '', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'סיום', style: 'destructive', onPress: stop },
    ]);

  // Part of the route already walked, for the grey overlay on the map.
  const donePath = useMemo(() => {
    if (!route || stats.alongM <= 0) return undefined;
    const i = route.cum.findIndex((c) => c > stats.alongM);
    return route.path.slice(0, i < 0 ? route.path.length : i);
  }, [route, Math.round(stats.alongM / 10)]);

  const estSec = route ? (route.lengthM / 1000 / speed) * 3600 : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.mapWrap}>
        <RouteMap
          path={route?.path}
          start={route?.start ?? startPlace ?? undefined}
          end={route?.end}
          user={stats.user}
          progressPath={donePath}
          followUser={stats.running && tab === 'walk'}
        />
        {busy && (
          <View style={styles.busy}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.busyText}>{busy}</Text>
          </View>
        )}
      </View>

      <View style={styles.tabs}>
        <Tab label="תכנון מסלול" active={tab === 'plan'} onPress={() => setTab('plan')} />
        <Tab label="הליכה" active={tab === 'walk'} onPress={() => setTab('walk')} disabled={!route} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.panel} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {tab === 'plan' ? (
            <>
              <Segmented
                options={[
                  ['loop', 'מסלול מעגלי'],
                  ['ab', 'מכתובת לכתובת'],
                ]}
                value={mode}
                onChange={(v) => setMode(v as Mode)}
              />

              <Label>{mode === 'loop' ? 'נקודת התחלה וסיום' : 'כתובת התחלה'}</Label>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={startText}
                  onChangeText={setStartText}
                  placeholder="רחוב, מספר, עיר"
                  textAlign="right"
                />
                <Pressable style={styles.gpsBtn} onPress={locateMe}>
                  <Text style={styles.gpsText}>📍 המיקום שלי</Text>
                </Pressable>
              </View>

              {mode === 'ab' && (
                <>
                  <Label>כתובת סיום</Label>
                  <TextInput
                    style={styles.input}
                    value={endText}
                    onChangeText={setEndText}
                    placeholder="רחוב, מספר, עיר"
                    textAlign="right"
                  />
                </>
              )}

              <Label>אורך ההליכה</Label>
              <Segmented
                options={[
                  ['km', 'לפי ק"מ'],
                  ['min', 'לפי זמן'],
                ]}
                value={targetType}
                onChange={(v) => setTargetType(v as Target)}
              />
              <View style={styles.row}>
                {targetType === 'km' ? (
                  <NumField label='ק"מ' value={kmText} onChange={setKmText} />
                ) : (
                  <NumField label="דקות" value={minText} onChange={setMinText} />
                )}
                <NumField label='מהירות ממוצעת (קמ"ש)' value={speedText} onChange={setSpeedText} />
              </View>
              <Text style={styles.hint}>
                {targetType === 'km'
                  ? `זמן משוער: ${speed > 0 ? formatDuration((targetKm / speed) * 3600) : '—'} · קצב ${formatPace(speed)} דק׳/ק"מ`
                  : `אורך משוער: ${isFinite(targetKm) ? targetKm.toFixed(1) : '—'} ק"מ · קצב ${formatPace(speed)} דק׳/ק"מ`}
              </Text>

              {error && <Text style={styles.error}>{error}</Text>}

              <Button label={route ? 'בניית מסלול חדש' : 'בניית מסלול'} onPress={build} disabled={!!busy} />

              {route && (
                <View style={styles.card}>
                  <View style={styles.statsRow}>
                    <Stat label='מרחק' value={`${(route.lengthM / 1000).toFixed(2)} ק"מ`} />
                    <Stat label="זמן משוער" value={formatDuration(estSec)} />
                    <Stat label="קצב" value={`${formatPace(speed)}`} sub='דק׳/ק"מ' />
                  </View>
                  {route.note && <Text style={styles.note}>{route.note}</Text>}
                  <View style={styles.row}>
                    <Button small label="🔀 מסלול אחר" onPress={build} disabled={!!busy} kind="secondary" />
                    <Button small label="🗺️ גוגל מפות" onPress={openGoogle} kind="secondary" />
                  </View>
                  <Button label="▶ התחלת הליכה" onPress={startWalk} kind="go" />
                </View>
              )}
            </>
          ) : (
            route && (
              <WalkPanel
                route={route}
                speed={speed}
                stats={stats}
                onStart={startWalk}
                onPause={togglePause}
                onStop={finishWalk}
                onGoogle={openGoogle}
              />
            )
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function WalkPanel({
  route,
  speed,
  stats,
  onStart,
  onPause,
  onStop,
  onGoogle,
}: {
  route: Route;
  speed: number;
  stats: ReturnType<typeof useWalkTracker>['stats'];
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onGoogle: () => void;
}) {
  const remainingM = Math.max(0, route.lengthM - stats.alongM);
  const pct = Math.min(100, (stats.alongM / route.lengthM) * 100);
  const aheadSec = (stats.aheadM / 1000 / speed) * 3600;
  const onPace = Math.abs(stats.aheadM) < 30;
  const etaSec = (remainingM / 1000 / speed) * 3600;

  return (
    <View>
      <View style={styles.bigRow}>
        <Big label="זמן" value={formatDuration(stats.elapsedSec)} />
        <Big label='ק"מ' value={(stats.walkedM / 1000).toFixed(2)} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.hint}>
        {stats.finished
          ? '🎉 הגעת ליעד!'
          : `נותרו ${(remainingM / 1000).toFixed(2)} ק"מ · כ-${formatDuration(etaSec)} בקצב היעד`}
      </Text>

      {stats.running && stats.elapsedSec > 20 && !stats.finished && (
        <View style={[styles.paceBox, onPace ? styles.paceOk : stats.aheadM > 0 ? styles.paceAhead : styles.paceBehind]}>
          <Text style={styles.paceText}>
            {onPace
              ? '✅ בדיוק בקצב'
              : stats.aheadM > 0
                ? `⚡ לפני הקצב ב-${Math.round(stats.aheadM)} מ׳ (${formatDuration(aheadSec)})`
                : `🐢 מאחורי הקצב ב-${Math.round(-stats.aheadM)} מ׳ (${formatDuration(-aheadSec)}) – להגביר!`}
          </Text>
        </View>
      )}

      {stats.running && stats.offRouteM > 40 && (
        <Text style={styles.error}>⚠️ סטייה מהמסלול ({Math.round(stats.offRouteM)} מ׳)</Text>
      )}

      <View style={styles.statsRow}>
        <Stat label="מהירות עכשיו" value={stats.currentKmh ? stats.currentKmh.toFixed(1) : '—'} sub='קמ"ש' />
        <Stat label="מהירות ממוצעת" value={stats.avgKmh ? stats.avgKmh.toFixed(1) : '—'} sub='קמ"ש' />
        <Stat label="יעד" value={speed.toFixed(1)} sub='קמ"ש' />
      </View>
      <View style={styles.statsRow}>
        <Stat label="קצב נוכחי" value={formatPace(stats.currentKmh)} sub='דק׳/ק"מ' />
        <Stat label="קצב ממוצע" value={formatPace(stats.avgKmh)} sub='דק׳/ק"מ' />
        <Stat label="קצב יעד" value={formatPace(speed)} sub='דק׳/ק"מ' />
      </View>

      {!stats.running ? (
        <Button label={stats.elapsedSec > 0 ? '▶ הליכה חדשה' : '▶ התחלת הליכה'} onPress={onStart} kind="go" />
      ) : (
        <View style={styles.row}>
          <Button small label={stats.paused ? '▶ המשך' : '⏸ השהיה'} onPress={onPause} kind="secondary" />
          <Button small label="⏹ סיום" onPress={onStop} kind="danger" />
        </View>
      )}
      <Button label="🗺️ ניווט בגוגל מפות" onPress={onGoogle} kind="secondary" />
      <Text style={styles.hint}>המסך יישאר דלוק בזמן ההליכה כדי שהמעקב ימשיך לעבוד.</Text>
    </View>
  );
}

// ---------- Small UI pieces ----------

function Tab({ label, active, onPress, disabled }: { label: string; active: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.tabText, active && styles.tabTextActive, disabled && { opacity: 0.4 }]}>{label}</Text>
    </Pressable>
  );
}

function Segmented({ options, value, onChange }: { options: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.segment}>
      {options.map(([v, label]) => (
        <Pressable key={v} style={[styles.segBtn, value === v && styles.segBtnActive]} onPress={() => onChange(v)}>
          <Text style={[styles.segText, value === v && styles.segTextActive]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.smallLabel}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" textAlign="center" />
    </View>
  );
}

function Button({
  label,
  onPress,
  disabled,
  kind = 'primary',
  small,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  kind?: 'primary' | 'secondary' | 'go' | 'danger';
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        styles[`btn_${kind}`],
        small && { flex: 1 },
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.btnText, kind === 'secondary' && { color: '#1f2933' }]}>{label}</Text>
    </Pressable>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function Big({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.big}>
      <Text style={styles.bigValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const parseNum = (t: string) => parseFloat(t.replace(',', '.'));
const msg = (e: unknown) => (e instanceof Error ? e.message : 'משהו השתבש, נסו שוב');

const ORANGE = '#e8590c';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f7f9' },
  mapWrap: { height: '40%', borderBottomWidth: 1, borderColor: '#dde1e6' },
  busy: {
    position: 'absolute', top: 12, alignSelf: 'center', flexDirection: 'row', gap: 8,
    backgroundColor: 'rgba(31,41,51,.85)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  busyText: { color: '#fff', fontWeight: '600' },
  tabs: { flexDirection: 'row-reverse', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#dde1e6' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderColor: 'transparent' },
  tabActive: { borderColor: ORANGE },
  tabText: { fontSize: 16, color: '#52606d', fontWeight: '600' },
  tabTextActive: { color: ORANGE },
  panel: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  row: { flexDirection: 'row-reverse', gap: 10, alignItems: 'flex-end', marginBottom: 4 },
  label: { fontSize: 15, fontWeight: '700', color: '#1f2933', textAlign: 'right', marginTop: 14, marginBottom: 6 },
  smallLabel: { fontSize: 13, color: '#52606d', textAlign: 'right', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd2d9', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, writingDirection: 'rtl',
  },
  gpsBtn: { backgroundColor: '#e7f0fd', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 12 },
  gpsText: { color: '#1a73e8', fontWeight: '600' },
  segment: { flexDirection: 'row-reverse', backgroundColor: '#e4e7eb', borderRadius: 10, padding: 3, marginBottom: 4 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  segBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  segText: { color: '#52606d', fontWeight: '600' },
  segTextActive: { color: '#1f2933' },
  hint: { color: '#616e7c', textAlign: 'right', marginTop: 8, fontSize: 13 },
  error: { color: '#c92a2a', textAlign: 'right', marginTop: 10, fontWeight: '600' },
  note: { color: '#a85d00', textAlign: 'right', marginBottom: 8, fontSize: 13 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  btn_primary: { backgroundColor: ORANGE },
  btn_secondary: { backgroundColor: '#e4e7eb' },
  btn_go: { backgroundColor: '#2f9e44' },
  btn_danger: { backgroundColor: '#c92a2a' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#e4e7eb' },
  statsRow: { flexDirection: 'row-reverse', gap: 8, marginVertical: 8 },
  stat: { flex: 1, backgroundColor: '#f6f7f9', borderRadius: 10, padding: 8, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#616e7c' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1f2933', marginTop: 2, fontVariant: ['tabular-nums'] },
  statSub: { fontSize: 11, color: '#9aa5b1' },
  bigRow: { flexDirection: 'row-reverse', gap: 10 },
  big: { flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e4e7eb' },
  bigValue: { fontSize: 38, fontWeight: '800', color: '#1f2933', fontVariant: ['tabular-nums'] },
  progressBar: { height: 10, backgroundColor: '#e4e7eb', borderRadius: 5, marginTop: 14, overflow: 'hidden', transform: [{ scaleX: -1 }] },
  progressFill: { height: '100%', backgroundColor: ORANGE },
  paceBox: { borderRadius: 12, padding: 12, marginTop: 12 },
  paceOk: { backgroundColor: '#d3f9d8' },
  paceAhead: { backgroundColor: '#d0ebff' },
  paceBehind: { backgroundColor: '#ffe3e3' },
  paceText: { textAlign: 'right', fontSize: 15, fontWeight: '700', color: '#1f2933' },
});
