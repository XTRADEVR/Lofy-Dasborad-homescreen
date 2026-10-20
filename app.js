document.addEventListener('DOMContentLoaded', () => {
  // --- 1. CLOCK & DATE ---
  const clockEl = document.getElementById('clock');
  const ampmEl = document.getElementById('ampm');
  const dateLineEl = document.getElementById('dateLine');

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');

    if (clockEl) clockEl.textContent = `${hoursStr}:${minutes}`;
    if (ampmEl) ampmEl.textContent = ampm;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (dateLineEl) dateLineEl.textContent = now.toLocaleDateString('en-US', options);
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- 2. WEATHER FETCH (Open-Meteo for Bekasi -6.24, 107) ---
  const tempEl = document.getElementById('temperature');
  const descEl = document.getElementById('weatherDescription');
  const windEl = document.getElementById('windSpeed');
  const weatherIconEl = document.getElementById('weatherIcon');
  const refreshWeatherBtn = document.getElementById('refreshWeather');
  const highTempEl = document.getElementById('highTemp');
  const lowTempEl = document.getElementById('lowTemp');

  async function fetchWeather() {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.24&longitude=107&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Jakarta');
      const data = await res.json();
      if (data && data.current) {
        const temp = Math.round(data.current.temperature_2m);
        const wind = data.current.wind_speed_10m;
        if (tempEl) tempEl.textContent = `${temp}°C`;
        if (windEl) windEl.textContent = `Wind: ${wind} km/h`;
        if (descEl) descEl.textContent = 'Partly Cloudy • Bekasi';
      }
      if (data && data.daily) {
        const max = Math.round(data.daily.temperature_2m_max[0] || 29);
        const min = Math.round(data.daily.temperature_2m_min[0] || 18);
        if (highTempEl) highTempEl.textContent = `${max}°`;
        if (lowTempEl) lowTempEl.textContent = `${min}°`;
      }
    } catch (e) {
      console.log('Weather offline / error', e);
    }
  }
  fetchWeather();
  if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener('click', () => {
      fetchWeather();
      showDialog('Weather', 'Weather refreshed successfully from Open-Meteo API.');
    });
  }

  // --- 3. MOOD & WALLPAPER TOGGLE ---
  const moods = ['night', 'rainy', 'clear'];
  let currentMoodIdx = 0;
  const wallpaperToggle = document.getElementById('wallpaperToggle');
  const quoteJp = document.getElementById('quoteJp');
  const quoteEn = document.getElementById('quoteEn');

  const quotes = [
    { jp: '焦らず、でも諦めに。', en: "Don't rush, but never give up." },
    { jp: '雨上がりの空に虹がかかる。', en: "After the rain, a rainbow appears in the sky." },
    { jp: '自分を信じて。', en: "Believe in yourself." }
  ];

  function setMood(mood) {
    document.body.setAttribute('data-mood', mood);
    const quoteObj = quotes[currentMoodIdx % quotes.length];
    if (quoteJp) quoteJp.textContent = quoteObj.jp;
    if (quoteEn) quoteEn.textContent = quoteObj.en;
  }

  if (wallpaperToggle) {
    wallpaperToggle.addEventListener('click', () => {
      currentMoodIdx = (currentMoodIdx + 1) % moods.length;
      setMood(moods[currentMoodIdx]);
      showDialog('Mood / Wallpaper', `Switched theme mood to: ${moods[currentMoodIdx].toUpperCase()}`);
    });
  }

  // --- 4. MUSIC PLAYER ---
  const playlist = [
    { title: 'Night Drive', artist: 'YOASOBI', duration: '3:45' },
    { title: 'Midnight Rain', artist: 'Lofi Cat', duration: '2:58' },
    { title: 'Tokyo Coffee', artist: 'ChillHop', duration: '4:12' }
  ];
  let currentTrackIdx = 0;
  let isPlaying = true;
  let progressVal = 35;

  const trackTitle = document.getElementById('trackTitle');
  const playBtn = document.getElementById('playBtn');
  const playGlyph = document.getElementById('playGlyph');
  const prevTrack = document.getElementById('prevTrack');
  const nextTrack = document.getElementById('nextTrack');
  const trackProgress = document.getElementById('trackProgress');
  const elapsed = document.getElementById('elapsed');
  const duration = document.getElementById('duration');
  const dockMusic = document.getElementById('dockMusic');

  function updateMusicUI() {
    const track = playlist[currentTrackIdx];
    if (trackTitle) trackTitle.textContent = track.title;
    if (duration) duration.textContent = track.duration;
    if (playGlyph) playGlyph.textContent = isPlaying ? '⏸' : '▶';
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      updateMusicUI();
    });
  }
  if (dockMusic) {
    dockMusic.addEventListener('click', () => {
      isPlaying = !isPlaying;
      updateMusicUI();
      showDialog('Music Player', isPlaying ? 'Resumed lofi stream' : 'Paused lofi stream');
    });
  }
  if (nextTrack) {
    nextTrack.addEventListener('click', () => {
      currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
      updateMusicUI();
    });
  }
  if (prevTrack) {
    prevTrack.addEventListener('click', () => {
      currentTrackIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
      updateMusicUI();
    });
  }

  setInterval(() => {
    if (isPlaying && trackProgress) {
      progressVal = (progressVal + 0.5) % 100;
      trackProgress.style.width = progressVal + '%';
    }
  }, 1000);

  // --- 5. TASKS / TODAY'S LIST & LOCALSTORAGE ---
  const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
  const taskCount = document.getElementById('taskCount');
  const todayKey = 'lofi-tasks-' + new Date().toISOString().slice(0, 10);

  function loadTasks() {
    const saved = localStorage.getItem(todayKey);
    if (saved) {
      try {
        const states = JSON.parse(saved);
        taskCheckboxes.forEach((cb, i) => {
          if (states[i] !== undefined) cb.checked = states[i];
          updateTaskItemStyle(cb);
        });
      } catch (e) {}
    }
    updateTaskCount();
  }

  function saveTasks() {
    const states = Array.from(taskCheckboxes).map(cb => cb.checked);
    localStorage.setItem(todayKey, JSON.stringify(states));
    updateTaskCount();
  }

  function updateTaskItemStyle(cb) {
    const parent = cb.closest('.task-item');
    if (parent) {
      if (cb.checked) parent.classList.add('completed');
      else parent.classList.remove('completed');
    }
  }

  function updateTaskCount() {
    const total = taskCheckboxes.length;
    const checked = Array.from(taskCheckboxes).filter(cb => cb.checked).length;
    if (taskCount) taskCount.textContent = `${checked}/${total} done`;
  }

  taskCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateTaskItemStyle(cb);
      saveTasks();
    });
  });
  loadTasks();

  // --- 6. CALENDAR & NOTES ---
  const monthLabel = document.getElementById('monthLabel');
  const calendarDays = document.getElementById('calendarDays');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const dailyNote = document.getElementById('dailyNote');
  const savedStatus = document.getElementById('savedStatus');

  let currentDateObj = new Date();
  let selectedDateStr = currentDateObj.toISOString().slice(0, 10);

  function renderCalendar() {
    if (!calendarDays || !monthLabel) return;
    calendarDays.innerHTML = '';
    const year = currentDateObj.getFullYear();
    const month = currentDateObj.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Empty offset cells
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day empty';
      calendarDays.appendChild(emptyCell);
    }

    // Days
    for (let day = 1; day <= totalDays; day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'cal-day';
      dayCell.textContent = day;

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (dateStr === selectedDateStr) dayCell.classList.add('selected');
      
      const todayStr = new Date().toISOString().slice(0, 10);
      if (dateStr === todayStr) dayCell.classList.add('today');

      dayCell.addEventListener('click', () => {
        selectedDateStr = dateStr;
        loadNoteForDate(dateStr);
        renderCalendar();
      });

      calendarDays.appendChild(dayCell);
    }
  }

  function loadNoteForDate(dateStr) {
    const noteKey = 'lofi-note-' + dateStr;
    const note = localStorage.getItem(noteKey) || '';
    if (dailyNote) dailyNote.value = note;
  }

  function saveNoteForDate() {
    if (!dailyNote) return;
    const noteKey = 'lofi-note-' + selectedDateStr;
    localStorage.setItem(noteKey, dailyNote.value);
    if (savedStatus) {
      savedStatus.textContent = 'Saved to device memory for ' + selectedDateStr;
      setTimeout(() => {
        savedStatus.textContent = 'Auto-saved to device memory';
      }, 2000);
    }
  }

  if (dailyNote) {
    dailyNote.addEventListener('input', saveNoteForDate);
  }

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentDateObj.setMonth(currentDateObj.getMonth() - 1);
      renderCalendar();
    });
  }
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentDateObj.setMonth(currentDateObj.getMonth() + 1);
      renderCalendar();
    });
  }

  renderCalendar();
  loadNoteForDate(selectedDateStr);

  // --- 7. FOCUS POMODORO TIMER ---
  let focusSeconds = 25 * 60;
  let focusInterval = null;
  const dockFocus = document.getElementById('dockFocus');

  function startFocusTimer() {
    if (focusInterval) {
      clearInterval(focusInterval);
      focusInterval = null;
      showDialog('Focus Timer', 'Pomodoro focus timer paused.');
      return;
    }
    showDialog('Focus Timer', 'Pomodoro 25-minute focus timer started!');
    focusInterval = setInterval(() => {
      focusSeconds--;
      const min = Math.floor(focusSeconds / 60);
      const sec = focusSeconds % 60;
      if (taskCount) taskCount.textContent = `Focus: ${min}:${sec < 10 ? '0' : ''}${sec}`;
      if (focusSeconds <= 0) {
        clearInterval(focusInterval);
        focusInterval = null;
        showDialog('Focus Timer', 'Focus session completed! Great job.');
        if (taskCheckboxes[2]) {
          taskCheckboxes[2].checked = true;
          updateTaskItemStyle(taskCheckboxes[2]);
          saveTasks();
        }
      }
    }, 1000);
  }

  if (dockFocus) dockFocus.addEventListener('click', startFocusTimer);

  // --- 8. SHORTCUTS & DOCK ACTIONS ---
  const actionDialog = document.getElementById('actionDialog');
  const dialogEyebrow = document.getElementById('dialogEyebrow');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogText = document.getElementById('dialogText');
  const dialogOk = document.getElementById('dialogOk');

  function showDialog(title, text, eyebrow = 'COZY DASHBOARD') {
    if (dialogTitle) dialogTitle.textContent = title;
    if (dialogText) dialogText.textContent = text;
    if (dialogEyebrow) dialogEyebrow.textContent = eyebrow;
    if (actionDialog) actionDialog.classList.add('active');
  }

  if (dialogOk) {
    dialogOk.addEventListener('click', () => {
      if (actionDialog) actionDialog.classList.remove('active');
    });
  }

  document.querySelectorAll('.shortcut-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      showDialog(action.toUpperCase() + ' SHORTCUT', `Launched ${action} module successfully. All local data synced.`);
    });
  });

  const dockNotes = document.getElementById('dockNotes');
  if (dockNotes) {
    dockNotes.addEventListener('click', () => {
      if (dailyNote) dailyNote.focus();
      showDialog('Notes Pad', 'Jumped to daily notes notepad.');
    });
  }

  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        showDialog('Fullscreen', 'Entered immersive fullscreen mode.');
      } else {
        document.exitFullscreen().catch(() => {});
        showDialog('Fullscreen', 'Exited fullscreen mode.');
      }
    });
  }

  // --- 9. PWA INSTALL PROMPT ---
  let deferredPrompt = null;
  const installBtn = document.getElementById('installBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installBtn.classList.add('hidden');
        }
        deferredPrompt = null;
      } else {
        showDialog('PWA Install', 'App is already installed or browser installation is not available.');
      }
    });
  }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
