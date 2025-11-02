// Clase para manejar cronómetros
class Stopwatch {
    constructor(id) {
        this.id = id;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.intervalId = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startTime = Date.now() - this.elapsedTime;
            this.intervalId = setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
                this.update();
            }, 10);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.intervalId);
        }
    }

    reset() {
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.elapsedTime = 0;
        this.update();
    }

    update() {
        const card = document.getElementById(`stopwatch-${this.id}`);
        if (card) {
            const timeDisplay = card.querySelector('.timer-time');
            const millisDisplay = card.querySelector('.timer-milliseconds');
            const formatted = this.formatTime(this.elapsedTime);
            timeDisplay.textContent = formatted.time;
            millisDisplay.textContent = formatted.milliseconds;
        }
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10);

        return {
            time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            milliseconds: String(milliseconds).padStart(2, '0')
        };
    }
}

// Clase para manejar cuentas regresivas
class Countdown {
    constructor(id, hours, minutes, seconds) {
        this.id = id;
        this.totalTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        this.remainingTime = this.totalTime;
        this.isRunning = false;
        this.intervalId = null;
        this.finished = false;
    }

    start() {
        if (!this.isRunning && this.remainingTime > 0) {
            this.isRunning = true;
            this.startTime = Date.now();
            this.intervalId = setInterval(() => {
                const elapsed = Date.now() - this.startTime;
                this.remainingTime = Math.max(0, this.totalTime - elapsed);
                
                if (this.remainingTime <= 0) {
                    this.finish();
                } else {
                    this.update();
                }
            }, 10);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.intervalId);
            this.totalTime = this.remainingTime;
        }
    }

    reset() {
        this.isRunning = false;
        this.finished = false;
        clearInterval(this.intervalId);
        this.totalTime = this.remainingTime = (
            Math.floor(this.totalTime / 3600000) * 3600000 +
            Math.floor((this.totalTime % 3600000) / 60000) * 60000 +
            Math.floor((this.totalTime % 60000) / 1000) * 1000
        );
        const card = document.getElementById(`countdown-${this.id}`);
        if (card) {
            card.classList.remove('finished');
        }
        this.update();
    }

    finish() {
        this.isRunning = false;
        this.finished = true;
        clearInterval(this.intervalId);
        this.remainingTime = 0;
        this.update();
        
        const card = document.getElementById(`countdown-${this.id}`);
        if (card) {
            card.classList.add('finished');
        }
        
        // Mostrar notificación
        showNotification('¡Tiempo completado!', `La cuenta regresiva #${this.id} ha finalizado`);
        
        // Reproducir sonido
        playAlertSound();
    }

    update() {
        const card = document.getElementById(`countdown-${this.id}`);
        if (card) {
            const timeDisplay = card.querySelector('.timer-time');
            const millisDisplay = card.querySelector('.timer-milliseconds');
            const formatted = this.formatTime(this.remainingTime);
            timeDisplay.textContent = formatted.time;
            millisDisplay.textContent = formatted.milliseconds;
        }
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10);

        return {
            time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            milliseconds: String(milliseconds).padStart(2, '0')
        };
    }
}

// Variables globales
let stopwatches = [];
let countdowns = [];
let stopwatchCounter = 0;
let countdownCounter = 0;

// Generar sonido de alerta
function playAlertSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Crear una secuencia de pitidos
    const beepTimes = [0, 0.15, 0.3, 0.45, 0.6];
    
    beepTimes.forEach(time => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.1);
        
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + 0.1);
    });
}

// Mostrar notificación
function showNotification(title, message) {
    const notificationsContainer = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;
    
    notificationsContainer.appendChild(notification);
    
    // Solicitar permiso para notificaciones del navegador
    if (Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '⏲️' });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: message, icon: '⏲️' });
            }
        });
    }
    
    // Eliminar notificación después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Crear tarjeta de cronómetro
function createStopwatchCard(stopwatch) {
    const card = document.createElement('div');
    card.className = 'timer-card';
    card.id = `stopwatch-${stopwatch.id}`;
    
    card.innerHTML = `
        <div class="timer-display">
            <div class="timer-time">00:00:00</div>
            <div class="timer-milliseconds">00</div>
        </div>
        <div class="timer-controls">
            <button class="timer-btn btn-start" onclick="startStopwatch(${stopwatch.id})">▶ Start</button>
            <button class="timer-btn btn-pause" onclick="pauseStopwatch(${stopwatch.id})">⏸ Pause</button>
            <button class="timer-btn btn-reset" onclick="resetStopwatch(${stopwatch.id})">↻ Clear</button>
            <button class="timer-btn btn-delete" onclick="deleteStopwatch(${stopwatch.id})">🗑 Delete</button>
        </div>
    `;
    
    return card;
}

// Crear tarjeta de cuenta regresiva
function createCountdownCard(countdown) {
    const card = document.createElement('div');
    card.className = 'timer-card';
    card.id = `countdown-${countdown.id}`;
    
    const formatted = countdown.formatTime(countdown.remainingTime);
    
    card.innerHTML = `
        <div class="timer-display">
            <div class="timer-time">${formatted.time}</div>
            <div class="timer-milliseconds">${formatted.milliseconds}</div>
        </div>
        <div class="timer-controls">
            <button class="timer-btn btn-start" onclick="startCountdown(${countdown.id})">▶ Start</button>
            <button class="timer-btn btn-pause" onclick="pauseCountdown(${countdown.id})">⏸ Pause</button>
            <button class="timer-btn btn-reset" onclick="resetCountdown(${countdown.id})">↻ Reset</button>
            <button class="timer-btn btn-delete" onclick="deleteCountdown(${countdown.id})">🗑 Delete</button>
        </div>
    `;
    
    return card;
}

// Funciones de control de cronómetros
function addStopwatch() {
    stopwatchCounter++;
    const stopwatch = new Stopwatch(stopwatchCounter);
    stopwatches.push(stopwatch);
    
    const container = document.getElementById('stopwatchesContainer');
    container.appendChild(createStopwatchCard(stopwatch));
}

function startStopwatch(id) {
    const stopwatch = stopwatches.find(s => s.id === id);
    if (stopwatch) stopwatch.start();
}

function pauseStopwatch(id) {
    const stopwatch = stopwatches.find(s => s.id === id);
    if (stopwatch) stopwatch.pause();
}

function resetStopwatch(id) {
    const stopwatch = stopwatches.find(s => s.id === id);
    if (stopwatch) stopwatch.reset();
}

function deleteStopwatch(id) {
    const stopwatch = stopwatches.find(s => s.id === id);
    if (stopwatch) {
        stopwatch.pause();
        stopwatches = stopwatches.filter(s => s.id !== id);
        document.getElementById(`stopwatch-${id}`).remove();
    }
}

// Funciones de control de cuentas regresivas
function addCountdown() {
    const hours = parseInt(document.getElementById('countdownHours').value) || 0;
    const minutes = parseInt(document.getElementById('countdownMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('countdownSeconds').value) || 0;
    
    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Por favor, ingresa un tiempo válido para la cuenta regresiva');
        return;
    }
    
    countdownCounter++;
    const countdown = new Countdown(countdownCounter, hours, minutes, seconds);
    countdowns.push(countdown);
    
    const container = document.getElementById('countdownsContainer');
    container.appendChild(createCountdownCard(countdown));
    
    // Limpiar inputs
    document.getElementById('countdownHours').value = 0;
    document.getElementById('countdownMinutes').value = 0;
    document.getElementById('countdownSeconds').value = 0;
}

function startCountdown(id) {
    const countdown = countdowns.find(c => c.id === id);
    if (countdown) countdown.start();
}

function pauseCountdown(id) {
    const countdown = countdowns.find(c => c.id === id);
    if (countdown) countdown.pause();
}

function resetCountdown(id) {
    const countdown = countdowns.find(c => c.id === id);
    if (countdown) countdown.reset();
}

function deleteCountdown(id) {
    const countdown = countdowns.find(c => c.id === id);
    if (countdown) {
        countdown.pause();
        countdowns = countdowns.filter(c => c.id !== id);
        document.getElementById(`countdown-${id}`).remove();
    }
}

// Sistema de pestañas
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar clase active al botón clickeado y su contenido
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    
    // Solicitar permiso para notificaciones
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    document.getElementById('addStopwatch').addEventListener('click', addStopwatch);
    document.getElementById('addCountdown').addEventListener('click', addCountdown);
    
    // Permitir Enter en los inputs de countdown
    const countdownInputs = ['countdownHours', 'countdownMinutes', 'countdownSeconds'];
    countdownInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addCountdown();
            }
        });
    });
});