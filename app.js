// =========================================
// 1. تنظیمات اولیه (Initial Configuration)
// =========================================
const TOTAL_DAYS = 60;
const TOTAL_HABITS = 11;

let radarChartInstance = null;
let barChartInstance = null;
let streakChartInstance = null;
let bigChartInstance = null;
let currentFilter = 'all';

// =========================================
// Medal Modal Variables
// =========================================
const MEDAL_DESCRIPTIONS = {
    1: {
        title: 'هفته ۱: جرقه',
        icon: 'fa-fire',
        color: '#ff3333',
        desc: 'اولین هفته کامل! اینجاست که جرقه شروع می‌شه. بدنت یاد می‌گیره که تعهد یعنی تعهد. آتش درونت روشن شده — نذار خاموش بشه.'
    },
    2: {
        title: 'هفته ۲: اراده آهنین',
        icon: 'fa-shield-alt',
        color: '#00f3ff',
        desc: 'دو هفته پشت سر هم! اراده‌ات مثل فولاد سخت شده. آدم‌های معمولی هفته اول رو می‌بازن — تو از اون‌ها قوی‌تری.'
    },
    3: {
        title: 'هفته ۳: ماشین',
        icon: 'fa-microchip',
        color: '#bc13fe',
        desc: 'سه هفته! الان دیگه یه ماشینی. عادت‌ها توی بدنت نصب شدن. دیگه با انگیزه کار نمی‌کنی — با سیستم کار می‌کنی.'
    },
    4: {
        title: 'هفته ۴: نشکستنی',
        icon: 'fa-gem',
        color: '#00ff66',
        desc: 'یک ماه کامل! تو مثل الماس شدی — تحت فشار شکل گرفتی و حالا نشکستنی هستی. اکثر آدم‌ها هیچ‌وقت به اینجا نمی‌رسن.'
    },
    5: {
        title: 'هفته ۵: استاد',
        icon: 'fa-crown',
        color: '#ffd700',
        desc: 'پنج هفته! تو حالا استادی. تاج لیاقتت رو گذاشتی. آدم‌های اطرافت تغییر رو می‌بینن — چه بخوان چه نخوان.'
    },
    6: {
        title: 'هفته ۶: افسانه',
        icon: 'fa-dragon',
        color: '#ff00ff',
        desc: 'شش هفته! وارد قلمرو افسانه‌ها شدی. کمتر از ۱٪ آدم‌ها اینجا می‌رسن. تو دیگه یه داستان هستی که دیگران تعریف می‌کنن.'
    },
    7: {
        title: 'هفته ۷: تایتان',
        icon: 'fa-meteor',
        color: '#ff8c00',
        desc: 'هفت هفته! تایتان شدی. قدرتی داری که خودت هم باور نمی‌کنی. این دیگه یه چالش نیست — این یه سبک زندگیه.'
    },
    8: {
        title: 'هفته ۸: جاویدان',
        icon: 'fa-infinity',
        color: '#ffffff',
        desc: 'هشت هفته! ۵۶ روز کامل! تو جاودان شدی. این مدال سفید، نماد خلوص و کماله. تو ثابت کردی که اراده انسانی حدی نداره. آیرون‌من واقعی تو هستی.'
    }
};

const ruleLabels = [
    "Sleep", "Water", "Workout", "Rest", "Diet",
    "Deep Work", "Meditation", "Gratitude",
    "No Porn", "No Social", "No Games"
];
const STORAGE_KEY = 'ironManProtocolData';

// =========================================
// Audio Context (برای صدای سینتتیک)
// =========================================
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    return audioCtx;
}

// صدای تیک زدن (دینگ کوتاه)
function playTickSound() {
    const ctx = initAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
}

// صدای باز کردن مدال (آکورد صعودی)
function playMedalSound() {
    const ctx = initAudio();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        osc.start(start);
        osc.stop(start + 0.3);
    });
}

// صدای خطا (باز کردن روز قفل‌شده)
function playErrorSound() {
    const ctx = initAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
}

// =========================================
// 9. متغیرهای مود تمرکز (Focus Mode Variables)
// =========================================
let timerInterval = null;
let timeLeft = 90 * 60;
let totalTime = 90 * 60;
let isTimerRunning = false;
let isBreakTime = false;
let currentTimerMode = { time: 90, label: 'DEEP WORK' };
let wakeLock = null;
// =========================================
// Pomodoro Stats Variables
// =========================================
let focusStartTime = null; // زمان شروع تمرکز

const timerModeBtns = document.querySelectorAll('.timer-mode-btn');

// =========================================
// 12. متغیرهای ردیاب درآمد (Finance Variables)
// =========================================
let totalIncome = 0;
let monthlyIncome = 0;
let incomeHistory = [];

// =========================================
// 17. متغیرهای زنجیره عادت (Habit Stacking Variables)
// =========================================
let habitStacks = [];
const stackList = document.getElementById('stack-list');
const addStackBtn = document.getElementById('add-stack-btn');

// پیدا کردن المان‌های HTML
const gridBody = document.getElementById('grid-body');
const headerCurrentDay = document.getElementById('header-current-day');
const headerStreak = document.getElementById('header-streak');
const statProgressText = document.getElementById('stat-progress-text');
const statProgressBar = document.getElementById('stat-progress-bar');
const statDaysPassed = document.getElementById('stat-days-passed');
const statDaysRemaining = document.getElementById('stat-days-remaining');
const resetBtn = document.getElementById('reset-btn');

const focusOverlay = document.getElementById('focus-overlay');
const focusBtn = document.getElementById('focus-mode-btn');
const exitFocusBtn = document.getElementById('exit-focus-btn');
const startTimerBtn = document.getElementById('start-timer-btn');
const resetTimerBtn = document.getElementById('reset-timer-btn');
const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');
const timerProgress = document.getElementById('timer-progress');
const saveLogBtn = document.getElementById('save-log-btn');
const logLearn = document.getElementById('log-learn');
const logChallenge = document.getElementById('log-challenge');
const logStatus = document.getElementById('log-status');

const incomeInput = document.getElementById('income-input');
const addIncomeBtn = document.getElementById('add-income-btn');
const statTotalIncome = document.getElementById('stat-total-income');
const statMonthIncome = document.getElementById('stat-month-income');
const recentIncomeList = document.getElementById('recent-income-list');
const notificationBtn = document.getElementById('notification-btn');

const failModal = document.getElementById('fail-modal');
const failBtn = document.getElementById('fail-btn');
const cancelFailBtn = document.getElementById('cancel-fail-btn');
const confirmFailBtn = document.getElementById('confirm-fail-btn');
const failReason = document.getElementById('fail-reason');
const failPenalty = document.getElementById('fail-penalty');

// =========================================
// 2. مدیریت داده‌ها (State Management)
// =========================================
let appData = {
    checks: Array(TOTAL_DAYS).fill().map(() => Array(TOTAL_HABITS).fill(false)),
    currentDay: 1,
    streak: 0,
    startDate: null  // تاریخ شروعی که کاربر روز ۱ رو کامل کرد
};

function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (!parsed.checks || parsed.checks.length !== TOTAL_DAYS) {
                throw new Error("Invalid data structure");
            }
            appData = {
                checks: parsed.checks,
                currentDay: parsed.currentDay || 1,
                streak: parsed.streak || 0,
                startDate: parsed.startDate || null
            };
        } catch (e) {
            console.error("خطا در خواندن داده‌ها، ریست کردن سیستم...", e);
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function resetData() {
    if (confirm('WARNING: Are you sure you want to reset the entire 60-day protocol? All progress will be lost.')) {
        appData = {
            checks: Array(TOTAL_DAYS).fill().map(() => Array(TOTAL_HABITS).fill(false)),
            currentDay: 1,
            streak: 0,
            startDate: null
        };
        saveData();
        renderGrid();
        updateStats();
    }
}

// =========================================
// 3. ساخت جدول (Render Grid)
// =========================================
function renderGrid() {
    gridBody.innerHTML = '';

    for (let i = 0; i < TOTAL_DAYS; i++) {
        const dayNum = i + 1;
        const dayChecks = appData.checks[i].filter(v => v).length;
        
        // اعمال فیلتر
        if (currentFilter === 'today' && dayNum !== appData.currentDay) continue;
        if (currentFilter === 'incomplete' && (dayNum > appData.currentDay || dayChecks === TOTAL_HABITS)) continue;

        const row = document.createElement('div');
        row.className = 'day-row';


        const isFuture = dayNum > appData.currentDay;
        const isOld = dayNum < appData.currentDay - 1;

        if (dayNum === appData.currentDay) row.classList.add('active-day');
        if (isFuture) row.classList.add('locked-row');
        if (isOld) row.classList.add('locked-day');

        const dayNumEl = document.createElement('div');
        dayNumEl.className = 'day-number';

        let extraLabel = (dayNum === 33) ? '<span>UNIVERSITY</span>' : '';
        dayNumEl.innerHTML = `DAY ${dayNum.toString().padStart(2, '0')} ${extraLabel}`;
        row.appendChild(dayNumEl);

        for (let j = 0; j < TOTAL_HABITS; j++) {
            const box = document.createElement('div');
            box.className = 'check-box';

            if (appData.checks[i][j]) box.classList.add('checked');

            if (isFuture || isOld) {
                box.classList.add('disabled');
                box.title = isFuture ? 'این روز هنوز فرا نرسیده' : 'این روز قفل شده';
            } else {
                box.addEventListener('click', () => toggleCheck(i, j, box));
            }

            row.appendChild(box);
        }

        gridBody.appendChild(row);
    }
}

// =========================================
// 4. منطق تیک زدن (Toggle Logic)
// =========================================
function toggleCheck(dayIndex, habitIndex, boxElement) {
    const dayNum = dayIndex + 1;
    // فقط امروز و دیروز قابل ویرایش
    if (dayNum > appData.currentDay || dayNum < appData.currentDay - 1) {
        playErrorSound();
        showToast('فقط امروز و دیروز قابل ویرایش هستند.', 'error');
        return;
    }

    appData.checks[dayIndex][habitIndex] = !appData.checks[dayIndex][habitIndex];

    if (appData.checks[dayIndex][habitIndex]) {
        boxElement.classList.add('checked');
        playTickSound();
    } else {
        boxElement.classList.remove('checked');
    }

    saveData();
    updateStats();
        if (currentFilter === 'incomplete') renderGrid();
    loadDailyLog();
}

// =========================================
// 5. محاسبه آمار (Calculate Stats & Streak)
// =========================================
function updateStats() {
    let streak = 0;
    let daysPassed = 0;
    let totalChecks = 0;

    for (let i = 0; i < TOTAL_DAYS; i++) {
        const dayChecks = appData.checks[i].filter(val => val === true).length;
        totalChecks += dayChecks;

        if (dayChecks === TOTAL_HABITS) {
            streak++;
            daysPassed = i + 1;
        } else {
            break;
        }
    }

    let currentDay = daysPassed + 1;
    if (currentDay > TOTAL_DAYS) currentDay = TOTAL_DAYS;

    const totalPossibleChecks = TOTAL_DAYS * TOTAL_HABITS;
    const progressPercent = Math.round((totalChecks / totalPossibleChecks) * 100);

    appData.streak = streak;
    appData.currentDay = currentDay;

    headerCurrentDay.innerText = `Day ${currentDay}`;
    headerStreak.innerText = streak;

    statProgressText.innerText = `${progressPercent}%`;
    statProgressBar.style.width = `${progressPercent}%`;

    statDaysPassed.innerText = daysPassed;
    statDaysRemaining.innerText = TOTAL_DAYS - daysPassed;

    // بروزرسانی ظاهر روزها
    document.querySelectorAll('.day-row').forEach((row, index) => {
        const dayNum = index + 1;
        const isFuture = dayNum > currentDay;
        const isOld = dayNum < currentDay - 1; // قدیمی‌تر از دیروز
        const isYesterday = dayNum === currentDay - 1;

        row.classList.toggle('active-day', dayNum === currentDay);
        row.classList.toggle('locked-row', isFuture);
        row.classList.toggle('locked-day', isOld);

        row.querySelectorAll('.check-box').forEach(box => {
            if (isFuture) {
                box.classList.add('disabled');
                box.title = 'این روز هنوز فرا نرسیده';
            } else if (isOld) {
                box.classList.add('disabled');
                box.title = 'این روز قفل شده (فقط امروز و دیروز قابل ویرایش)';
            } else {
                box.classList.remove('disabled');
                box.title = isYesterday ? 'دیروز (قابل ویرایش)' : '';
            }
        });
    });

    updateCharts();
    checkMedals(streak);
    saveData();
}

// =========================================
// شروع برنامه (Initialization)
// =========================================
function initApp() {
        // فعال‌سازی Audio با اولین کلیک (به‌خاطر سیاست مرورگرها)
    document.addEventListener('click', initAudio, { once: true });
    loadData();
    renderGrid();
    updateStats();
    initCharts();

    // اتصال دکمه‌های هدر
    if (focusBtn) focusBtn.addEventListener('click', toggleFocusMode);
    if (exitFocusBtn) exitFocusBtn.addEventListener('click', toggleFocusMode);
    if (startTimerBtn) startTimerBtn.addEventListener('click', toggleTimer);
    if (resetTimerBtn) resetTimerBtn.addEventListener('click', resetTimer);

    if (timerModeBtns.length > 0) {
        timerModeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const time = Number(e.target.dataset.time);
                const label = e.target.dataset.label;
                switchTimerMode(time, label, e.target);
            });
        });
    }

    if (saveLogBtn) saveLogBtn.addEventListener('click', saveDailyLog);

    if (failBtn) {
        failBtn.addEventListener('click', openFailModal);
        cancelFailBtn.addEventListener('click', closeFailModal);
        confirmFailBtn.addEventListener('click', executeFailureProtocol);
    }

    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotifications);
        updateNotificationButtonState();
    }

        // Export / Import
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // انتخاب فرمت
            const format = prompt('فرمت خروجی را انتخاب کن:\n1 = JSON (کامل، برای بازیابی)\n2 = CSV (ماتریس، برای اکسل)\n\nعدد ۱ یا ۲ را وارد کن:', '1');
            if (format === '1') exportData('json');
            else if (format === '2') exportData('csv');
        });
    }

        // کلیک روی مدال‌ها برای دیدن توضیح
    for (let i = 1; i <= 8; i++) {
        const medal = document.getElementById(`medal-${i}`);
        if (medal) {
            medal.style.cursor = 'pointer';
            medal.addEventListener('click', () => openMedalModal(i));
        }
    }

    // بستن مودال مدال
    const closeMedalBtn = document.getElementById('close-medal-btn');
    const dismissMedalBtn = document.getElementById('medal-modal-dismiss');
    const medalModal = document.getElementById('medal-modal');

    if (closeMedalBtn) closeMedalBtn.addEventListener('click', closeMedalModal);
    if (dismissMedalBtn) dismissMedalBtn.addEventListener('click', closeMedalModal);
    if (medalModal) {
        medalModal.addEventListener('click', (e) => {
            if (e.target === medalModal) closeMedalModal();
        });
    }

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                importData(e.target.files[0]);
                e.target.value = ''; // ریست
            }
        });
    }

        // فیلترهای جدول
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active-mode', 'text-cyber-neon', 'bg-cyber-neon/10', 'border-cyber-neon');
                b.classList.add('text-cyber-muted', 'border-cyber-border');
            });
            e.target.classList.remove('text-cyber-muted', 'border-cyber-border');
            e.target.classList.add('active-mode', 'text-cyber-neon', 'bg-cyber-neon/10', 'border-cyber-neon');
            
            currentFilter = e.target.dataset.filter;
            renderGrid();
        });
    });

    // مودال آمار
    const statsBtn = document.getElementById('stats-btn');
    const statsModal = document.getElementById('stats-modal');
    const closeStatsBtn = document.getElementById('close-stats-btn');

    if (statsBtn) {
        statsBtn.addEventListener('click', () => {
            statsModal.classList.remove('hidden');
            statsModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
            updateStatsModal();
        });
    }

    if (closeStatsBtn) {
        closeStatsBtn.addEventListener('click', () => {
            statsModal.classList.add('hidden');
            statsModal.classList.remove('flex');
            document.body.style.overflow = 'auto';
        });
    }

    if (addIncomeBtn) {
        addIncomeBtn.addEventListener('click', addIncome);
        incomeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addIncome();
        });
    }

    if (addStackBtn) addStackBtn.addEventListener('click', addNewStack);
    if (resetBtn) resetBtn.addEventListener('click', resetData);

    // اتصال دکمه‌های صوتی
    document.querySelectorAll('.voice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            startVoiceInput(btn.dataset.target, btn);
        });
    });

    loadIncomeData();
    loadHabitStacks();
    loadDailyLog();
    updateTimerDisplay();

    // ثبت Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed', err));
    }

        // پشتیبانی از shortcutهای PWA
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'focus' && focusBtn) {
        setTimeout(() => toggleFocusMode(), 100);
    }
    if (action === 'today') {
        setTimeout(() => {
            const activeRow = document.querySelector('.day-row.active-day');
            if (activeRow) activeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
    }

        // بستن مودال‌ها با Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMedalModal();
            if (failModal && failModal.classList.contains('active')) closeFailModal();
            if (focusOverlay && focusOverlay.classList.contains('active')) toggleFocusMode();
            if (document.getElementById('stats-modal').classList.contains('flex')) {
                document.getElementById('stats-modal').classList.add('hidden');
                document.getElementById('stats-modal').classList.remove('flex');
                document.body.style.overflow = 'auto';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);

// =========================================
// 7. رسم و آپدیت نمودارها (Chart.js Logic)
// =========================================
Chart.defaults.color = '#666';
Chart.defaults.font.family = "'Vazirmatn', sans-serif";
Chart.defaults.borderColor = 'rgba(42, 42, 53, 0.5)';

function initCharts() {
    const initialRadarData = new Array(TOTAL_HABITS).fill(0);
    const initialBarData = new Array(10).fill(0);

    const ctxRadar = document.getElementById('radarChart').getContext('2d');
    radarChartInstance = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ruleLabels,
            datasets: [{
                label: 'Mastery %',
                data: initialRadarData,
                backgroundColor: 'rgba(0, 243, 255, 0.2)',
                borderColor: '#00f3ff',
                pointBackgroundColor: '#bc13fe',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#bc13fe',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    pointLabels: { color: '#e0e0e0', font: { size: 9 } },
                    ticks: { display: false, min: 0, max: 100 }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    const ctxBar = document.getElementById('barChart').getContext('2d');
    barChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
            datasets: [{
                label: 'Rules Completed',
                data: initialBarData,
                backgroundColor: 'rgba(188, 19, 254, 0.5)',
                borderColor: '#bc13fe',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: TOTAL_HABITS,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { stepSize: 2, color: '#666', font: { size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#666', font: { size: 10 } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

        // 3. نمودار Streak هفتگی
    const ctxStreak = document.getElementById('streakChart').getContext('2d');
    streakChartInstance = new Chart(ctxStreak, {
        type: 'line',
        data: {
            labels: ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴', 'هفته ۵', 'هفته ۶', 'هفته ۷', 'هفته ۸'],
            datasets: [{
                label: 'استریک',
                data: new Array(8).fill(0),
                borderColor: '#00ff66',
                backgroundColor: 'rgba(0, 255, 102, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00ff66',
                pointBorderColor: '#fff',
                pointRadius: 4,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 7,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { stepSize: 1, color: '#666', font: { size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#666', font: { size: 9 } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function updateCharts() {
    if (!radarChartInstance || !barChartInstance) return;

    const ruleMastery = new Array(TOTAL_HABITS).fill(0);
    for (let j = 0; j < TOTAL_HABITS; j++) {
        let count = 0;
        for (let i = 0; i < TOTAL_DAYS; i++) {
            if (appData.checks[i][j]) count++;
        }
        ruleMastery[j] = Math.round((count / TOTAL_DAYS) * 100);
    }
    radarChartInstance.data.datasets[0].data = ruleMastery;
    radarChartInstance.update();

    const currentDayIndex = appData.currentDay - 1;
    const startDay = Math.max(0, currentDayIndex - 9);
    const labels = [];
    const barData = [];

    for (let i = startDay; i <= currentDayIndex; i++) {
        if (i >= TOTAL_DAYS) break;
        labels.push(`D${i + 1}`);
        const checksCount = appData.checks[i].filter(val => val === true).length;
        barData.push(checksCount);
    }

    barChartInstance.data.labels = labels;
    barChartInstance.data.datasets[0].data = barData;
    barChartInstance.update();

        // آپدیت نمودار Streak هفتگی
    if (streakChartInstance) {
        const weeklyStreak = [];
        for (let w = 0; w < 8; w++) {
            const weekStart = w * 7;
            const weekEnd = Math.min(weekStart + 7, TOTAL_DAYS);
            let weekStreak = 0;
            let maxWeekStreak = 0;

            for (let i = weekStart; i < weekEnd; i++) {
                const dayChecks = appData.checks[i].filter(v => v === true).length;
                if (dayChecks === TOTAL_HABITS) {
                    weekStreak++;
                    maxWeekStreak = Math.max(maxWeekStreak, weekStreak);
                } else {
                    weekStreak = 0;
                }
            }
            weeklyStreak.push(maxWeekStreak);
        }
        streakChartInstance.data.datasets[0].data = weeklyStreak;
        streakChartInstance.update();
    }
}

// =========================================
// 8. سیستم مدال‌ها (Medal System)
// =========================================
function checkMedals(currentStreak) {
    for (let i = 1; i <= 8; i++) {
        const targetDays = i * 7;
        const medalElement = document.getElementById(`medal-${i}`);
        if (!medalElement) continue;

        if (currentStreak >= targetDays) {
            if (medalElement.classList.contains('locked')) {
                medalElement.classList.remove('locked');
                medalElement.classList.add('unlocked');
                playMedalSound();
                showToast(`🏆 مدال «${medalElement.title}» باز شد!`, 'success');
            }
        }
    }
}

// =========================================
// Toast Notification (برای مدال‌ها و پیام‌ها)
// =========================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-lg font-vazir text-sm shadow-2xl transition-all duration-300 ${
        type === 'success' ? 'bg-cyber-success/20 border border-cyber-success text-cyber-success' :
        type === 'error' ? 'bg-cyber-danger/20 border border-cyber-danger text-cyber-danger' :
        'bg-cyber-neon/20 border border-cyber-neon text-cyber-neon'
    }`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =========================================
// 10. منطق تایمر پومودورو (Pomodoro Timer Logic)
// =========================================
function toggleFocusMode() {
    focusOverlay.classList.toggle('active');
    if (focusOverlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        requestWakeLock();
    } else {
        document.body.style.overflow = 'auto';
        if (isTimerRunning) toggleTimer();
        releaseWakeLock();
    }
}

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
            });
        } catch (err) {
            console.log('Wake Lock error:', err);
        }
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (timeLeft / totalTime) * circumference;
    timerProgress.style.strokeDashoffset = offset;
}

function toggleTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        startTimerBtn.innerText = 'RESUME';
        startTimerBtn.classList.remove('running');
    } else {
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                
                // === ثبت آمار تمرکز (فقط اگه جلسه تمرکز بود، نه استراحت) ===
                if (!isBreakTime) {
                    saveFocusSession(currentTimerMode.time);
                }

                if (isBreakTime) {
                    isBreakTime = false;
                    timeLeft = currentTimerMode.time * 60;
                    timerStatus.innerText = currentTimerMode.label;
                    timerStatus.className = 'text-cyber-neon mt-2 font-vazir tracking-widest';
                    startTimerBtn.innerText = 'START';
                } else {
                    isBreakTime = true;
                    timeLeft = 5 * 60;
                    timerStatus.innerText = 'BREAK';
                    timerStatus.className = 'text-cyber-purple mt-2 font-vazir tracking-widest';
                    startTimerBtn.innerText = 'START BREAK';
                    showToast('زمان تمرکز تموم شد. استراحت کن.', 'success');
                }
                updateTimerDisplay();
                startTimerBtn.classList.remove('running');
            }
        }, 1000);

        isTimerRunning = true;
        startTimerBtn.innerText = 'PAUSE';
        startTimerBtn.classList.add('running');
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    isBreakTime = false;
    timeLeft = currentTimerMode.time * 60;
    totalTime = currentTimerMode.time * 60;

    timerStatus.innerText = currentTimerMode.label;
    timerStatus.className = 'text-cyber-neon mt-2 font-vazir tracking-widest';
    startTimerBtn.innerText = 'START';
    startTimerBtn.classList.remove('running');
    updateTimerDisplay();
}

function switchTimerMode(modeTime, modeLabel, btnElement) {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }

    timerModeBtns.forEach(btn => btn.classList.remove('active-mode'));
    btnElement.classList.add('active-mode');

    currentTimerMode = { time: modeTime, label: modeLabel };
    resetTimer();
}

// =========================================
// 11. منطق دفترچه خاطرات (Daily Log Logic)
// =========================================
function saveDailyLog() {
    const learnText = logLearn.value.trim();
    const challengeText = logChallenge.value.trim();

    if (!learnText && !challengeText) {
        showToast('چیزی برای ذخیره وجود نداره.', 'error');
        return;
    }

    const today = appData.currentDay;
    const logData = {
        day: today,
        date: new Date().toLocaleDateString('fa-IR'),
        learn: learnText,
        challenge: challengeText
    };

    let allLogs = JSON.parse(localStorage.getItem('ironManLogs')) || [];
    const existingIndex = allLogs.findIndex(log => log.day === today);
    if (existingIndex > -1) {
        allLogs[existingIndex] = logData;
    } else {
        allLogs.push(logData);
    }

    localStorage.setItem('ironManLogs', JSON.stringify(allLogs));

    logStatus.classList.remove('hidden');
    setTimeout(() => { logStatus.classList.add('hidden'); }, 3000);

    logLearn.value = '';
    logChallenge.value = '';
}

function loadDailyLog() {
    const today = appData.currentDay;
    const allLogs = JSON.parse(localStorage.getItem('ironManLogs')) || [];
    const todayLog = allLogs.find(log => log.day === today);

    if (todayLog) {
        logLearn.value = todayLog.learn || '';
        logChallenge.value = todayLog.challenge || '';
    } else {
        logLearn.value = '';
        logChallenge.value = '';
    }
}

// =========================================
// 13. منطق ردیاب درآمد (Income Tracker Logic)
// =========================================
function loadIncomeData() {
    const savedIncome = JSON.parse(localStorage.getItem('ironManIncome'));
    if (savedIncome) {
        totalIncome = savedIncome.total || 0;
        monthlyIncome = savedIncome.monthly || 0;
        incomeHistory = savedIncome.history || [];
        renderIncome();
    }
}

function addIncome() {
    const amount = Number(incomeInput.value);
    if (!amount || amount <= 0) {
        showToast('یه مقدار معتبر وارد کن.', 'error');
        return;
    }

    const today = new Date();
    const dateString = today.toLocaleDateString('fa-IR');

    totalIncome += amount;
    monthlyIncome += amount;

    incomeHistory.unshift({
        amount: amount,
        date: dateString,
        day: appData.currentDay
    });

    if (incomeHistory.length > 10) incomeHistory.pop();

    saveIncomeData();
    incomeInput.value = '';

    statTotalIncome.classList.add('income-flash');
    statMonthIncome.classList.add('income-flash');
    setTimeout(() => {
        statTotalIncome.classList.remove('income-flash');
        statMonthIncome.classList.remove('income-flash');
    }, 1000);

    renderIncome();
    showToast('درآمد ثبت شد.', 'success');
}

function saveIncomeData() {
    localStorage.setItem('ironManIncome', JSON.stringify({
        total: totalIncome,
        monthly: monthlyIncome,
        history: incomeHistory
    }));
}

function renderIncome() {
    statTotalIncome.innerText = totalIncome.toLocaleString('en-US');
    statMonthIncome.innerText = monthlyIncome.toLocaleString('en-US');

    recentIncomeList.innerHTML = '';
    if (incomeHistory.length === 0) {
        recentIncomeList.innerHTML = '<div class="text-center opacity-50">No records yet.</div>';
        return;
    }

    incomeHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center border-b border-cyber-border/30 pb-1 mb-1';
        div.innerHTML = `
            <span class="text-cyber-success">+${item.amount.toLocaleString('en-US')}</span>
            <span class="opacity-70 text-[10px]">Day ${item.day} - ${item.date}</span>
        `;
        recentIncomeList.appendChild(div);
    });
}

// =========================================
// 14. سیستم یادآور هوشمند (Smart Notifications)
// =========================================
const NOTIFICATION_STATE_KEY = 'ironManNotificationState';

function getNotificationState() {
    return JSON.parse(localStorage.getItem(NOTIFICATION_STATE_KEY)) || {
        enabled: false,
        lastMorning: null,
        lastNight: null,
        lastIncomplete: null  // ← این خط اضافه شد
    };
}

function setNotificationState(state) {
    localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(state));
}

function updateNotificationButtonState() {
    if (!notificationBtn) return;
    const state = getNotificationState();
    if (state.enabled) {
        notificationBtn.classList.add('active');
        notificationBtn.title = 'Notifications ON (click to disable)';
    } else {
        notificationBtn.classList.remove('active');
        notificationBtn.title = 'Enable Notifications';
    }
}

async function toggleNotifications() {
    const state = getNotificationState();

    if (state.enabled) {
        state.enabled = false;
        setNotificationState(state);
        updateNotificationButtonState();
        showToast('یادآورها خاموش شد.', 'info');
        return;
    }

    if (!("Notification" in window)) {
        showToast('مرورگر شما از Notification پشتیبانی نمی‌کند.', 'error');
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        state.enabled = true;
        setNotificationState(state);
        updateNotificationButtonState();
        showToast('یادآورها فعال شد.', 'success');

        new Notification("Iron Man Protocol", {
            body: "یادآورها فعال شد. من هوشیارت می‌کنم.",
            icon: "./icon-192x192.png",
            badge: "./icon-192x192.png"
        });

        scheduleNotifications();
    } else {
        showToast('برای فعال‌سازی، اجازه اعلان بده.', 'error');
    }
}

function scheduleNotifications() {
    if (!getNotificationState().enabled) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const today = now.toDateString();
    const state = getNotificationState();

    // 6:00 AM — Wake up
    if (currentHour === 6 && currentMinute === 0 && state.lastMorning !== today) {
        new Notification("WAKE UP, IRON MAN.", {
            body: "روز جدید شروع شد. بلند شو.",
            icon: "./icon-192x192.png"
        });
        state.lastMorning = today;
        setNotificationState(state);
    }

    // 23:00 — Sleep
    if (currentHour === 23 && currentMinute === 0 && state.lastNight !== today) {
        new Notification("SYSTEM SHUTDOWN.", {
            body: "زمان خوابه. فردا بجنگ.",
            icon: "./icon-192x192.png"
        });
        state.lastNight = today;
        setNotificationState(state);
    }

        // یادآور پویا: اگه بعد از ۲۰:۰۰ هنوز تیک امروز ناقصه
    if (currentHour >= 20 && currentHour < 23) {
        const dayIndex = appData.currentDay - 1;
        if (dayIndex >= 0 && dayIndex < TOTAL_DAYS) {
            const todayChecks = appData.checks[dayIndex].filter(v => v).length;
            // دقت کن: از today که بالای تابع تعریف شده استفاده می‌کنیم
            if (todayChecks < TOTAL_HABITS && todayChecks > 0 && state.lastIncomplete !== today) {
                new Notification("PROTOCOL INCOMPLETE.", {
                    body: `امروز ${TOTAL_HABITS - todayChecks} قانون مونده. نذار زنجیره بشکنه.`,
                    icon: "./icon-192x192.png"
                });
                state.lastIncomplete = today;
                setNotificationState(state);
            }
        }
    }
}

// هر ۳۰ ثانیه چک کن (کمتر از ۱ دقیقه که دقیق باشه)
setInterval(scheduleNotifications, 30 * 1000);

// =========================================
// 15. پروتکل شکست و ریکاوری (Failure Protocol)
// =========================================
function openFailModal() {
    failModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFailModal() {
    failModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    failReason.value = '';
}

function executeFailureProtocol() {
    const reason = failReason.value.trim();
    const penalty = failPenalty.value;

    if (!reason) {
        showToast('باید بنویسی چرا شکست خوردی.', 'error');
        return;
    }

    let failureLogs = JSON.parse(localStorage.getItem('ironManFailures')) || [];
    failureLogs.unshift({
        day: appData.currentDay,
        date: new Date().toLocaleDateString('fa-IR'),
        reason: reason,
        penalty: penalty
    });
    localStorage.setItem('ironManFailures', JSON.stringify(failureLogs));

    appData.streak = 0;
    saveData();
    updateStats();
    closeFailModal();

    showToast('استریک ریست شد. فردا از نو.', 'error');
}

// =========================================
// 16. دستیار صوتی (Voice Journaling Logic)
// =========================================
const voiceBtns = document.querySelectorAll('.voice-btn');
let recognition = null;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'fa-IR';
}

function startVoiceInput(targetId, btnElement) {
    if (!recognition) {
        showToast('مرورگر شما از تبدیل صدا به متن پشتیبانی نمی‌کند. Chrome استفاده کن.', 'error');
        return;
    }

    const targetTextarea = document.getElementById(targetId);
    if (!targetTextarea) return;

    if (btnElement.classList.contains('recording')) {
        recognition.stop();
        return;
    }

    voiceBtns.forEach(btn => btn.classList.remove('recording'));
    btnElement.classList.add('recording');

    recognition.onstart = () => {
        targetTextarea.placeholder = "Listening...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        targetTextarea.value += (targetTextarea.value ? " " : "") + transcript;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        showToast('خطا در ضبط صدا: ' + event.error, 'error');
    };

    recognition.onend = () => {
        btnElement.classList.remove('recording');
        targetTextarea.placeholder = targetId === 'log-learn' ? "Today I learned..." : "I struggled with...";
    };

    recognition.start();
}

// =========================================
// 19. منطق زنجیره عادت (Habit Stacking Logic)
// =========================================
function loadHabitStacks() {
    habitStacks = JSON.parse(localStorage.getItem('ironManStacks')) || [
        { id: 1, text: "After I drink water, I will do 10 push-ups.", done: false },
        { id: 2, text: "After I finish Deep Work, I will meditate for 5 mins.", done: false }
    ];
    renderHabitStacks();
}

function renderHabitStacks() {
    stackList.innerHTML = '';
    habitStacks.forEach(stack => {
        const div = document.createElement('div');
        div.className = `stack-item ${stack.done ? 'completed' : ''}`;
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <button class="text-cyber-muted hover:text-cyber-danger" onclick="deleteStack(${stack.id})">
                    <i class="fas fa-trash text-xs"></i>
                </button>
                <span class="stack-text text-sm ${stack.done ? 'text-cyber-muted' : 'text-white'}">${stack.text}</span>
            </div>
            <button class="w-6 h-6 rounded border ${stack.done ? 'bg-cyber-success border-cyber-success' : 'border-cyber-border'} flex items-center justify-center transition-colors" onclick="toggleStack(${stack.id})">
                ${stack.done ? '<i class="fas fa-check text-black text-xs"></i>' : ''}
            </button>
        `;
        stackList.appendChild(div);
    });
}

function toggleStack(id) {
    const stack = habitStacks.find(s => s.id === id);
    if (stack) {
        stack.done = !stack.done;
        saveHabitStacks();
        renderHabitStacks();
    }
}

function deleteStack(id) {
    habitStacks = habitStacks.filter(s => s.id !== id);
    saveHabitStacks();
    renderHabitStacks();
}

function addNewStack() {
    const text = prompt("عادت جدیدت رو بنویس (مثلاً: بعد از بیدار شدن، آب می‌خورم):");
    if (text && text.trim() !== "") {
        const newStack = {
            id: Date.now(),
            text: text.trim(),
            done: false
        };
        habitStacks.push(newStack);
        saveHabitStacks();
        renderHabitStacks();
    }
}

function saveHabitStacks() {
    localStorage.setItem('ironManStacks', JSON.stringify(habitStacks));
}

// =========================================
// 21. Export / Import (بکاپ‌گیری)
// =========================================
function exportData(format = 'json') {
    const exportObject = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        appData: appData,
        logs: JSON.parse(localStorage.getItem('ironManLogs')) || [],
        income: JSON.parse(localStorage.getItem('ironManIncome')) || {},
        failures: JSON.parse(localStorage.getItem('ironManFailures')) || [],
        stacks: JSON.parse(localStorage.getItem('ironManStacks')) || [],
        notificationState: JSON.parse(localStorage.getItem('ironManNotificationState')) || {}
    };

    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `ironman-backup-${dateStr}.json`);
        showToast('بکاپ JSON دانلود شد.', 'success');
    } else if (format === 'csv') {
        let csv = 'روز,';
        // هدر قوانین
        csv += ruleLabels.join(',') + '\n';
        // داده‌ها
        for (let i = 0; i < TOTAL_DAYS; i++) {
            csv += `روز ${i + 1},`;
            csv += appData.checks[i].map(v => v ? '✓' : '').join(',');
            csv += '\n';
        }
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `ironman-matrix-${dateStr}.csv`);
        showToast('فایل CSV دانلود شد.', 'success');
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            let parsed;

            if (file.name.endsWith('.json')) {
                parsed = JSON.parse(content);
            } else {
                showToast('فعلاً فقط فایل JSON قابل بازیابیه.', 'error');
                return;
            }

            if (!parsed.appData || !parsed.appData.checks) {
                throw new Error('ساختار فایل نامعتبر است');
            }

            if (!confirm('همه داده‌های فعلی جایگزین می‌شن. مطمئنی؟')) return;

            // بازیابی
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.appData));
            if (parsed.logs) localStorage.setItem('ironManLogs', JSON.stringify(parsed.logs));
            if (parsed.income) localStorage.setItem('ironManIncome', JSON.stringify(parsed.income));
            if (parsed.failures) localStorage.setItem('ironManFailures', JSON.stringify(parsed.failures));
            if (parsed.stacks) localStorage.setItem('ironManStacks', JSON.stringify(parsed.stacks));
            if (parsed.notificationState) localStorage.setItem('ironManNotificationState', JSON.stringify(parsed.notificationState));

            showToast('بازیابی موفق! در حال بارگذاری مجدد...', 'success');
            setTimeout(() => location.reload(), 1000);
        } catch (err) {
            console.error(err);
            showToast('خطا در بازیابی: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
}

// =========================================
// 22. Medal Detail Modal
// =========================================
function openMedalModal(medalIndex) {
    const medalEl = document.getElementById(`medal-${medalIndex}`);
    if (!medalEl) return;

    const info = MEDAL_DESCRIPTIONS[medalIndex];
    if (!info) return;

    const isUnlocked = medalEl.classList.contains('unlocked');
    const targetDays = medalIndex * 7;
    const currentStreak = appData.streak;
    const progressPercent = Math.min(100, Math.round((currentStreak / targetDays) * 100));

    // آیکون و رنگ
    const iconEl = document.getElementById('medal-modal-icon');
    iconEl.className = `w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 border-2`;
    iconEl.style.color = info.color;
    iconEl.style.borderColor = info.color;
    iconEl.style.boxShadow = isUnlocked ? `0 0 30px ${info.color}` : 'none';
    iconEl.innerHTML = `<i class="fas ${info.icon}"></i>`;

    // عنوان
    document.getElementById('medal-modal-title').innerText = info.title;

    // وضعیت
    const statusEl = document.getElementById('medal-modal-status');
    if (isUnlocked) {
        statusEl.innerText = '✅ باز شده';
        statusEl.className = 'text-sm mt-2 text-cyber-success font-bold';
    } else {
        statusEl.innerText = '🔒 قفل';
        statusEl.className = 'text-sm mt-2 text-cyber-muted';
    }

    // توضیح
    document.getElementById('medal-modal-description').innerText = info.desc;

    // پیشرفت
    const progressSection = document.getElementById('medal-modal-progress-section');
    if (isUnlocked) {
        progressSection.style.display = 'none';
    } else {
        progressSection.style.display = 'block';
        document.getElementById('medal-modal-progress-text').innerText = `${currentStreak} / ${targetDays} روز`;
        document.getElementById('medal-modal-progress-bar').style.width = `${progressPercent}%`;
        document.getElementById('medal-modal-progress-bar').style.background = info.color;
        document.getElementById('medal-modal-progress-bar').style.boxShadow = `0 0 10px ${info.color}`;
    }

    // نمایش مودال
    const modal = document.getElementById('medal-modal');
    modal.classList.add('active');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    playTickSound();
}

function closeMedalModal() {
    const modal = document.getElementById('medal-modal');
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// =========================================
// 23. Full Stats Modal Logic
// =========================================
function updateStatsModal() {
    let totalChecks = 0;
    let bestStreak = 0;
    let currentStreak = 0;
    let activeDays = 0;

    // محاسبه داده‌ها
    for (let i = 0; i < TOTAL_DAYS; i++) {
        const dayChecks = appData.checks[i].filter(v => v).length;
        totalChecks += dayChecks;

        if (dayChecks > 0) activeDays++;

        if (dayChecks === TOTAL_HABITS) {
            currentStreak++;
            if (currentStreak > bestStreak) bestStreak = currentStreak;
        } else {
            currentStreak = 0;
        }
    }

    const avgChecks = activeDays > 0 ? (totalChecks / activeDays).toFixed(1) : 0;
    const fails = JSON.parse(localStorage.getItem('ironManFailures')) || [];

    // آپدیت DOM
    document.getElementById('stats-best-streak').innerText = bestStreak;
    document.getElementById('stats-total-checks').innerText = totalChecks;
    document.getElementById('stats-avg-checks').innerText = avgChecks;
    document.getElementById('stats-total-fails').innerText = fails.length;

    // رسم نمودار بزرگ
    if (bigChartInstance) bigChartInstance.destroy();
    
    const ctxBig = document.getElementById('bigChart').getContext('2d');
    const labels = Array.from({length: TOTAL_DAYS}, (_, i) => `D${i+1}`);
    const data = appData.checks.map(day => day.filter(v => v).length);

    bigChartInstance = new Chart(ctxBig, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'تیک‌های روزانه',
                data: data,
                backgroundColor: data.map(v => v === TOTAL_HABITS ? 'rgba(0, 255, 102, 0.6)' : 'rgba(0, 243, 255, 0.4)'),
                borderColor: data.map(v => v === TOTAL_HABITS ? '#00ff66' : '#00f3ff'),
                borderWidth: 1,
                borderRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: TOTAL_HABITS, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { display: false }, ticks: { font: { size: 9 } } }
            },
            plugins: { legend: { display: false } }
        }
    });

        // آمار تمرکز
    const focusStats = loadFocusStats();
    document.getElementById('stats-focus-today').innerText = focusStats.todayMinutes;
    document.getElementById('stats-focus-total').innerText = focusStats.totalSessions;
}

// =========================================
// 24. Focus Timer Stats
// =========================================
function saveFocusSession(minutes) {
    let focusStats = JSON.parse(localStorage.getItem('ironManFocusStats')) || {
        totalSessions: 0,
        todayMinutes: 0,
        todayDate: new Date().toDateString()
    };

    // چک کن اگه روز عوض شده، امروز رو ریست کن
    const today = new Date().toDateString();
    if (focusStats.todayDate !== today) {
        focusStats.todayMinutes = 0;
        focusStats.todayDate = today;
    }

    focusStats.totalSessions++;
    focusStats.todayMinutes += minutes;

    localStorage.setItem('ironManFocusStats', JSON.stringify(focusStats));
    showToast(`جلسه تمرکز ${minutes} دقیقه‌ای ثبت شد!`, 'success');
}

function loadFocusStats() {
    const stats = JSON.parse(localStorage.getItem('ironManFocusStats')) || {
        totalSessions: 0,
        todayMinutes: 0,
        todayDate: new Date().toDateString()
    };

    const today = new Date().toDateString();
    if (stats.todayDate !== today) {
        stats.todayMinutes = 0;
        stats.todayDate = today;
        localStorage.setItem('ironManFocusStats', JSON.stringify(stats));
    }

    return stats;
}