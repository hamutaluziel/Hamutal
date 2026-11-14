import { type ComponentType, type Ref, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView as RNWebView, type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';
import type { LatLng } from './geo';

// The library types WebView as a function component without a ref prop; add it back.
type WebViewHandle = { injectJavaScript: (js: string) => void };
const WebView = RNWebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

type Props = {
  path?: LatLng[];
  start?: LatLng;
  end?: LatLng;
  user?: LatLng | null;
  /** The part of the route already walked, drawn in grey. */
  progressPath?: LatLng[];
  /** Keep the map centered on the user while walking. */
  followUser?: boolean;
};

// Leaflet + OpenStreetMap-based tiles (CARTO): works on Android and iPhone without any API key.
const HTML = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;height:100%;background:#e8eef0}
.pin{width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)}
.me{width:16px;height:16px;border-radius:50%;background:#1a73e8;border:3px solid #fff;box-shadow:0 0 0 6px rgba(26,115,232,.25)}
</style></head><body><div id="map"></div><script>
var map=L.map('map',{zoomControl:false,attributionControl:true}).setView([31.77,35.21],13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:20,subdomains:'abcd',attribution:'© OpenStreetMap © CARTO'}).addTo(map);
var routeLine=null,doneLine=null,startM=null,endM=null,meM=null,fitted='';
function pin(c){return L.divIcon({className:'',html:'<div class="pin" style="background:'+c+'"></div>',iconSize:[24,24],iconAnchor:[12,12]});}
function ll(p){return [p.lat,p.lon];}
window.setRoute=function(d){
  [routeLine,doneLine,startM,endM].forEach(function(x){if(x)map.removeLayer(x);});
  routeLine=doneLine=startM=endM=null;
  if(d.path&&d.path.length){
    routeLine=L.polyline(d.path.map(ll),{color:'#e8590c',weight:6,opacity:.9}).addTo(map);
    var key=d.path.length+':'+d.path[0].lat;
    if(key!==fitted){map.fitBounds(routeLine.getBounds(),{padding:[30,30]});fitted=key;}
  }
  if(d.start)startM=L.marker(ll(d.start),{icon:pin('#2f9e44')}).addTo(map);
  if(d.end&&!(d.start&&d.end.lat===d.start.lat&&d.end.lon===d.start.lon))endM=L.marker(ll(d.end),{icon:pin('#c92a2a')}).addTo(map);
  if(!d.path&&d.start)map.setView(ll(d.start),15);
};
window.setProgress=function(pts){
  if(doneLine)map.removeLayer(doneLine);
  doneLine=pts&&pts.length>1?L.polyline(pts.map(ll),{color:'#868e96',weight:6,opacity:.9}).addTo(map):null;
};
window.setUser=function(p,follow){
  if(!p){if(meM){map.removeLayer(meM);meM=null;}return;}
  if(!meM)meM=L.marker(ll(p),{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[22,22],iconAnchor:[11,11]}),zIndexOffset:1000}).addTo(map);
  else meM.setLatLng(ll(p));
  if(follow)map.panTo(ll(p));
};
window.ReactNativeWebView.postMessage('ready');
</script></body></html>`;

export default function RouteMap({ path, start, end, user, progressPath, followUser }: Props) {
  const ref = useRef<WebViewHandle>(null);
  const [ready, setReady] = useState(false);

  const run = (js: string) => ref.current?.injectJavaScript(`try{${js}}catch(e){};true;`);

  useEffect(() => {
    if (ready) run(`setRoute(${JSON.stringify({ path, start, end })})`);
  }, [ready, path, start, end]);

  useEffect(() => {
    if (ready) run(`setProgress(${JSON.stringify(progressPath ?? null)})`);
  }, [ready, progressPath]);

  useEffect(() => {
    if (ready) run(`setUser(${JSON.stringify(user ?? null)}, ${followUser ? 'true' : 'false'})`);
  }, [ready, user, followUser]);

  return (
    <WebView
      ref={ref}
      style={styles.map}
      originWhitelist={['*']}
      source={{ html: HTML, baseUrl: 'https://localhost/' }}
      onMessage={(e: WebViewMessageEvent) => e.nativeEvent.data === 'ready' && setReady(true)}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
    />
  );
}

const styles = StyleSheet.create({ map: { flex: 1, backgroundColor: '#e8eef0' } });
