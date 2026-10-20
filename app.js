// LOFI NIGHT - FINAL CONNECTED v2 - ANTI DUMMY POPUP
const $ = s => document.querySelector(s);
const quotes = [
  {jp:"焦らず、でも諦めずに。", en:"Don't rush, but never give up."},
  {jp:"自分を信じて", en:"Believe in yourself"},
  {jp:"一歩ずつ前へ", en:"Step by step forward"}
];
let mood = localStorage.getItem('lofi-mood') || 'night';
let isPlaying = false, progressInt, focusInt, focusLeft = 25*60;
let selectedDate = new Date().toISOString().split('T')[0];

function init(){
  tickClock(); setInterval(tickClock, 1000);
  loadTasks(); renderCalendar(new Date()); loadNote();
  fetchWeather(); setInterval(fetchWeather, 10*60*1000);
  applyMood(mood);
  // music
  $('#playBtn')?.addEventListener('click', togglePlay);
  $('#prevTrack')?.addEventListener('click', ()=>changeTrack(-1));
  $('#nextTrack')?.addEventListener('click', ()=>changeTrack(1));
  $('#trackProgress')?.addEventListener('input', e=>{ 
    $('#elapsed').textContent = fmt(e.target.value);
  });
  // shortcuts REAL
  document.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const act = btn.dataset.action;
      if(act==='notes'){ $('#dailyNote')?.scrollIntoView({behavior:'smooth'}); setTimeout(()=>$('#dailyNote')?.focus(),400); return; }
      if(act==='focus'){ startFocus(); return; }
      if(act==='music'){ togglePlay(); return; }
      if(act==='gallery' || act==='wallpaper'){ cycleMood(); return; }
      if(act==='messages'){ randomQuote(); return; }
      if(act==='settings'){ 
        const newTitle = prompt('Edit gentle reminder title:', $('#eventTitle')?.textContent || '');
        if(newTitle) { $('#eventTitle').textContent = newTitle; localStorage.setItem('lofi-eventTitle', newTitle); }
        return;
      }
    });
  });
  $('#wallpaperToggle')?.addEventListener('click', cycleMood);
  $('#refreshWeather')?.addEventListener('click', fetchWeather);
  $('#dailyNote')?.addEventListener('input', saveNote);
  $('#prevMonth')?.addEventListener('click', ()=>{ curMonth.setMonth(curMonth.getMonth()-1); renderCalendar(curMonth); });
  $('#nextMonth')?.addEventListener('click', ()=>{ curMonth.setMonth(curMonth.getMonth()+1); renderCalendar(curMonth); });
  $('#dialogOk')?.addEventListener('click', ()=>$('#actionDialog')?.close());
  // tasks
  document.querySelectorAll('.task-item input').forEach((cb,i)=>{
    cb.addEventListener('change', updateTasks);
  });
}
function tickClock(){
  const now = new Date();
  $('#clock').textContent = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit', hour12:false});
  $('#ampm').textContent = now.getHours()>=12?'PM':'AM';
  $('#dateLine').textContent = now.toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric', year:'numeric'});
}
function togglePlay(){
  isPlaying = !isPlaying;
  $('#playGlyph').textContent = isPlaying ? '❚❚' : '▶';
  $('#playerNote').textContent = isPlaying ? 'Ambient Lofi Stream active' : 'Paused - take a breath';
  if(isPlaying){
    progressInt = setInterval(()=>{
      const p = $('#trackProgress'); if(!p) return;
      let v = parseInt(p.value)+1; if(v>178) v=0;
      p.value=v; $('#elapsed').textContent = fmt(v);
    },1000);
  } else clearInterval(progressInt);
}
function fmt(s){ const m=Math.floor(s/60); return `${m}:${String(s%60).padStart(2,'0')}`; }
function changeTrack(d){
  const titles = ['Midnight Rain - YOASOBI','Midnight in Tokyo','Cozy Night Drive','Rainy Lofi'];
  let idx = titles.indexOf($('#trackTitle').textContent);
  idx = (idx+d+titles.length)%titles.length;
  $('#trackTitle').textContent = titles[idx];
}
function randomQuote(){
  const q = quotes[Math.floor(Math.random()*quotes.length)];
  $('#quoteJp').textContent = q.jp; $('#quoteEn').textContent = q.en;
}
function cycleMood(){
  const moods = ['night','rainy','clear']; let i=moods.indexOf(mood);
  mood = moods[(i+1)%moods.length]; applyMood(mood);
}
function applyMood(m){
  document.body.dataset.mood = m; localStorage.setItem('lofi-mood', m);
}
let curMonth = new Date();
function renderCalendar(d){
  const year=d.getFullYear(), mon=d.getMonth();
  $('#monthLabel').textContent = d.toLocaleDateString('en-US',{month:'long', year:'numeric'});
  const first = new Date(year, mon, 1).getDay(); const days = new Date(year, mon+1, 0).getDate();
  const adjFirst = (first+6)%7; let html='';
  for(let i=0;i<adjFirst;i++) html+=`<div class="cal-empty"></div>`;
  for(let day=1; day<=days; day++){
    const iso = `${year}-${String(mon+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isToday = iso===new Date().toISOString().split('T')[0];
    const hasData = localStorage.getItem('lofi-note-'+iso);
    html+=`<button class="cal-day ${isToday?'active':''} ${hasData?'has-data':''}" data-date="${iso}">${day}</button>`;
  }
  $('#calendarDays').innerHTML = html;
  $('#calendarDays').querySelectorAll('.cal-day').forEach(b=>{
    b.addEventListener('click', ()=>{ selectedDate=b.dataset.date; document.querySelectorAll('.cal-day').forEach(x=>x.classList.remove('active')); b.classList.add('active'); loadNote(); });
  });
}
function loadNote(){
  $('#dailyNote').value = localStorage.getItem('lofi-note-'+selectedDate) || localStorage.getItem('lofi-note') || 'すべての夢は、最初の一歩から始まる。\nAll dreams begin with the first step.';
  const saved = localStorage.getItem('lofi-eventTitle'); if(saved) $('#eventTitle').textContent=saved;
}
function saveNote(){
  localStorage.setItem('lofi-note-'+selectedDate, $('#dailyNote').value);
  localStorage.setItem('lofi-note', $('#dailyNote').value);
  $('#savedStatus').textContent='Tersimpan '+new Date().toLocaleTimeString();
  renderCalendar(curMonth);
}
function loadTasks(){
  const key = 'lofi-tasks-'+selectedDate;
  const saved = JSON.parse(localStorage.getItem(key)||'null');
  if(saved){ document.querySelectorAll('.task-item input').forEach((cb,i)=>cb.checked=!!saved[i]); }
  updateTasks();
}
function updateTasks(){
  const checks = [...document.querySelectorAll('.task-item input')].map(c=>c.checked);
  const done = checks.filter(Boolean).length;
  $('#taskCount').textContent = `${done}/${checks.length}`;
  localStorage.setItem('lofi-tasks-'+selectedDate, JSON.stringify(checks));
}
function startFocus(){
  if(focusInt) clearInterval(focusInt); focusLeft=25*60;
  $('#taskCount').textContent = `Focus: ${fmt(focusLeft)}`;
  focusInt = setInterval(()=>{
    focusLeft--; $('#taskCount').textContent = `Focus: ${fmt(focusLeft)}`;
    document.querySelector('.app-shortcuts')?.querySelector('[data-action="focus"]')?.querySelector('span:last-child')?.textContent;
    if(focusLeft<=0){ clearInterval(focusInt); focusInt=null; alert('Focus done! ✦ Take a break'); const cbs=document.querySelectorAll('.task-item input'); if(cbs[0] && !cbs[0].checked){ cbs[0].checked=true; updateTasks(); } $('#taskCount').textContent=`Focus: done`; }
  },1000);
}
async function fetchWeather(){
  try{
    $('#weatherStatus').textContent='Updating Bekasi weather...';
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.24&longitude=107&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Jakarta');
    const data = await res.json();
    $('#temperature').textContent = Math.round(data.current.temperature_2m);
    $('#windSpeed').textContent = Math.round(data.current.wind_speed_10m);
    $('#highTemp').textContent = Math.round(data.daily.temperature_2m_max[0])+'°';
    $('#lowTemp').textContent = Math.round(data.daily.temperature_2m_min[0])+'°';
    $('#weatherStatus').textContent='Live • Bekasi, Indonesia • updated now';
    $('#weatherDescription').textContent = data.current.weather_code<3?'Partly Cloudy':'Rainy';
    $('#weatherIcon').textContent = data.current.weather_code<3?'🌙':'🌧️';
  }catch(e){ $('#weatherStatus').textContent='Offline - using last data'; }
}
document.addEventListener('DOMContentLoaded', init);
