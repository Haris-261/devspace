import {writeFileSync} from 'node:fs';
const endpoint = 'http://127.0.0.1:9223';
const tabs = await (await fetch(`${endpoint}/json`)).json();
const tab = tabs.find((x) => x.type === 'page');
if (!tab) throw new Error('No Chrome page target');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
ws.onmessage = (event) => { const data = JSON.parse(event.data); if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); } };
const send = (method, params = {}) => new Promise((resolve) => { const callId = ++id; pending.set(callId, resolve); ws.send(JSON.stringify({id: callId, method, params})); });
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {width: 1365, height: 900, deviceScaleFactor: 1, mobile:false});
await send('Page.navigate', {url: 'http://localhost:3100/'});
await new Promise((resolve) => setTimeout(resolve, 5000));
const metrics = await send('Runtime.evaluate', {expression: `(() => { document.body.classList.remove('is-loading'); document.querySelectorAll('.reveal-item').forEach(el=>el.classList.add('revealed')); document.querySelectorAll('.section-motion').forEach(el=>el.classList.add('section-in-view')); return {width: innerWidth, height: innerHeight, scrollHeight: document.documentElement.scrollHeight, sections: [...document.querySelectorAll('section')].map(s=>({id:s.id,top:s.offsetTop,height:s.offsetHeight,right:s.getBoundingClientRect().right,left:s.getBoundingClientRect().left}))}; })()`, returnByValue:true});
for (const section of metrics.result.result.value.sections) {
  await send('Runtime.evaluate', {expression:`document.getElementById(${JSON.stringify(section.id)})?.scrollIntoView({block:'start'})`});
  await new Promise((resolve) => setTimeout(resolve, 1100));
  const shot = await send('Page.captureScreenshot', {format:'png', fromSurface:true});
  writeFileSync(`C:/Users/Muhammad Haris/Desktop/MyPortfolio/.runlogs/section-${section.id}.png`, Buffer.from(shot.result.data, 'base64'));
}
await send('Runtime.evaluate', {expression:`document.querySelectorAll('.experience-card')[1]?.scrollIntoView({block:'center'})`});
await new Promise((resolve) => setTimeout(resolve, 1100));
const secondExperience = await send('Page.captureScreenshot', {format:'png', fromSurface:true});
writeFileSync('C:/Users/Muhammad Haris/Desktop/MyPortfolio/.runlogs/experience-second.png', Buffer.from(secondExperience.result.data, 'base64'));
process.stdout.write(JSON.stringify(metrics.result.result.value));
ws.close();
