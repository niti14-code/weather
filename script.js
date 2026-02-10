/**
 * Weather Application - Dynamic Weather Effects
 * Syncs background and effects with actual weather conditions
 */

// ==========================================
// CONFIGURATION
// ==========================================
if (typeof CONFIG === 'undefined') {
    alert('Error: config.js not loaded');
    throw new Error('CONFIG not found');
}

const API_KEY = CONFIG.API_KEY;
const BASE_URL = CONFIG.BASE_URL;

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    document.body.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: white;">
            <h2>⚠️ API Key Not Configured</h2>
        </div>
    `;
    throw new Error('API key not configured');
}

// ==========================================
// DOM ELEMENTS
// ==========================================
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const weatherResult = document.getElementById('weatherResult');
const weatherApp = document.getElementById('weatherApp');
const weatherEffects = document.getElementById('weatherEffects');

// Display elements
const weatherTitle = document.getElementById('weatherTitle');
const weatherSubtitle = document.getElementById('weatherSubtitle');
const weatherDescription = document.getElementById('weatherDescription');
const bigTemp = document.getElementById('bigTemp');
const tempMin = document.getElementById('tempMin');
const tempCurrent = document.getElementById('tempCurrent');
const tempMax = document.getElementById('tempMax');
const windSpeed = document.getElementById('windSpeed');
const humidityDisplay = document.getElementById('humidityDisplay');
const uvValue = document.getElementById('uvValue');
const uvProgress = document.getElementById('uvProgress');
const sunriseTime = document.getElementById('sunriseTime');
const sunsetTime = document.getElementById('sunsetTime');
const locationDisplay = document.getElementById('locationDisplay');
const currentTime = document.getElementById('currentTime');
const currentDate = document.getElementById('currentDate');
const forecastList = document.getElementById('forecastList');
const chartLabels = document.getElementById('chartLabels');

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load default city
    fetchWeatherData('Bengaluru');
});

searchBtn.addEventListener('click', () => handleSearch());
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// ==========================================
// WEATHER EFFECTS MANAGEMENT
// ==========================================

function updateWeatherEffects(weatherId, iconCode) {
    // Clear previous effects
    weatherEffects.innerHTML = '';
    weatherApp.className = 'weather-app';
    
    // Determine weather condition
    const condition = getWeatherCondition(weatherId);
    const isNight = iconCode && iconCode.includes('n');
    
    // Add base class
    weatherApp.classList.add(condition);
    if (isNight) weatherApp.classList.add('night');
    
    // Create appropriate effects
    switch(condition) {
        case 'rain':
        case 'drizzle':
            createRainEffect();
            break;
        case 'thunderstorm':
            createRainEffect();
            createLightningEffect();
            break;
        case 'snow':
            createSnowEffect();
            break;
        case 'clear':
            if (!isNight) createSunEffect();
            else createStarsEffect();
            break;
        case 'clouds':
            if (!isNight) createSunEffect(true); // Partial sun behind clouds
            break;
        case 'mist':
        case 'fog':
            createFogEffect();
            break;
        default:
            if (isNight) createStarsEffect();
    }
}

function getWeatherCondition(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
    if (weatherId >= 300 && weatherId < 400) return 'drizzle';
    if (weatherId >= 500 && weatherId < 600) return 'rain';
    if (weatherId >= 600 && weatherId < 700) return 'snow';
    if (weatherId >= 700 && weatherId < 800) return 'mist';
    if (weatherId === 800) return 'clear';
    if (weatherId > 800) return 'clouds';
    return 'clear';
}

function createRainEffect() {
    const container = document.createElement('div');
    container.className = 'rain-container';
    
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(drop);
    }
    
    weatherEffects.appendChild(container);
}

function createSnowEffect() {
    const container = document.createElement('div');
    container.className = 'snow-container';
    
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.innerHTML = '❄';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDuration = `${3 + Math.random() * 5}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        flake.style.fontSize = `${10 + Math.random() * 20}px`;
        container.appendChild(flake);
    }
    
    weatherEffects.appendChild(container);
}

function createSunEffect(partial = false) {
    const container = document.createElement('div');
    container.className = 'sun-container';
    container.style.opacity = partial ? '0.6' : '1';
    
    const sun = document.createElement('div');
    sun.className = 'sun';
    
    const rays = document.createElement('div');
    rays.className = 'sun-rays';
    
    container.appendChild(rays);
    container.appendChild(sun);
    weatherEffects.appendChild(container);
}

function createLightningEffect() {
    const container = document.createElement('div');
    container.className = 'lightning-container';
    weatherEffects.appendChild(container);
}

function createStarsEffect() {
    const container = document.createElement('div');
    container.className = 'stars-container';
    
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        container.appendChild(star);
    }
    
    weatherEffects.appendChild(container);
}

function createFogEffect() {
    // Fog is subtle, just add extra cloud layers
    const cloudContainer = document.getElementById('cloudContainer');
    cloudContainer.style.opacity = '0.9';
}

// ==========================================
// MAIN FUNCTIONS
// ==========================================

function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    fetchWeatherData(city);
}

async function fetchWeatherData(city) {
    showLoading();
    clearError();

    try {
        // Current weather
        const weatherUrl = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const weatherRes = await fetch(weatherUrl);
        
        if (!weatherRes.ok) {
            if (weatherRes.status === 404) throw new Error('City not found');
            throw new Error(`HTTP error! status: ${weatherRes.status}`);
        }
        
        const weatherData = await weatherRes.json();
        
        // Forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();
        
        displayWeather(weatherData, forecastData);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayWeather(data, forecastData) {
    locationDisplay.textContent = data.name;
    
    // Update weather effects based on condition
    updateWeatherEffects(data.weather[0].id, data.weather[0].icon);
    
    // Main weather info
    const condition = data.weather[0].main;
    const description = data.weather[0].description;
    
    weatherTitle.textContent = condition;
    weatherSubtitle.textContent = `with ${description}`;
    weatherDescription.textContent = `Current weather in ${data.name}. ${description}. 
        Wind speed ${Math.round(data.wind.speed * 3.6)} km/h. 
        Humidity ${data.main.humidity}%.`;
    
    // Temperatures
    bigTemp.textContent = Math.round(data.main.temp);
    tempMin.textContent = `${Math.round(data.main.temp_min)}°`;
    tempCurrent.textContent = `${Math.round(data.main.temp)}°`;
    tempMax.textContent = `${Math.round(data.main.temp_max)}°`;
    
    // Details
    windSpeed.textContent = `Wind ${Math.round(data.wind.speed * 3.6)} km/h`;
    humidityDisplay.textContent = `Humidity ${data.main.humidity}%`;
    
    // UV
    const uv = calculateUV(data.weather[0].id, data.clouds.all);
    uvValue.textContent = uv;
    uvProgress.style.width = `${(uv / 11) * 100}%`;
    
    // Sun times
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    sunriseTime.textContent = formatTime(sunrise);
    sunsetTime.textContent = formatTime(sunset);
    
    // Forecast and chart
    displayForecast(forecastData);
    drawChart(forecastData);
    
    weatherResult.classList.remove('hidden');
}

function displayForecast(forecastData) {
    // Get next 5 days at noon
    const daily = [];
    const seen = new Set();
    
    for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        
        if (!seen.has(dayKey) && date.getHours() >= 11 && date.getHours() <= 13) {
            seen.add(dayKey);
            daily.push(item);
            if (daily.length >= 5) break;
        }
    }
    
    forecastList.innerHTML = daily.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = getWeatherIcon(day.weather[0].icon);
        
        return `
            <div class="forecast-item">
                <span class="forecast-day">${dayName}</span>
                <div class="forecast-icon">${icon}</div>
                <span class="forecast-temp">${Math.round(day.main.temp)}°</span>
            </div>
        `;
    }).join('');
}

function drawChart(forecastData) {
    // Define all days of week in order
    const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get current day index (0 = Sunday, 1 = Monday, etc.)
    const today = new Date();
    const currentDayIndex = today.getDay();
    const currentDayName = allDays[currentDayIndex];
    
    // Create array starting from current day: [Today, Tomorrow, ..., 6 days later]
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const dayIndex = (currentDayIndex + i) % 7;
        weekDays.push({
            name: allDays[dayIndex],
            isToday: i === 0
        });
    }
    
    // Get temps from API data mapped to days
    const dayMap = new Map();
    
    for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const dayName = allDays[date.getDay()];
        const hour = date.getHours();
        
        // Prefer noon readings, store if not exists
        if (!dayMap.has(dayName) || (hour >= 11 && hour <= 13)) {
            dayMap.set(dayName, item.main.temp);
        }
    }
    
    // Build temps array matching weekDays order
    // Use API temp if available, otherwise estimate from available data
    const temps = weekDays.map(day => {
        if (dayMap.has(day.name)) {
            return dayMap.get(day.name);
        }
        // Fallback: use average of available temps
        const availableTemps = Array.from(dayMap.values());
        const avg = availableTemps.reduce((a, b) => a + b, 0) / availableTemps.length;
        return Math.round(avg);
    });
    
    // Chart dimensions
    const maxTemp = Math.max(...temps) + 5;
    const minTemp = Math.min(...temps) - 5;
    const range = maxTemp - minTemp;
    
    const width = 800;
    const height = 100;
    const padding = 50;
    
    // Calculate points
    const points = temps.map((temp, i) => {
        const x = (i / 6) * (width - padding * 2) + padding;
        const y = height - ((temp - minTemp) / range) * (height - padding * 2) - padding;
        return `${x},${y}`;
    }).join(' ');
    
    // Draw chart
    const chartSvg = document.getElementById('tempChart');
    chartSvg.innerHTML = `
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:white;stop-opacity:0.5" />
                <stop offset="100%" style="stop-color:white;stop-opacity:0" />
            </linearGradient>
        </defs>
        <polyline class="chart-line" points="${points}"/>
        <polygon class="chart-area" points="${points} ${width-padding},${height} ${padding},${height}"/>
        ${temps.map((temp, i) => {
            const x = (i / 6) * (width - padding * 2) + padding;
            const y = height - ((temp - minTemp) / range) * (height - padding * 2) - padding;
            return `<circle class="chart-point" cx="${x}" cy="${y}" r="6"/>`;
        }).join('')}
    `;
    
    // Update labels - ALL 7 DAYS with today highlighted
    chartLabels.innerHTML = weekDays.map((day, i) => {
        const isCurrent = day.isToday;
        return `<span class="chart-label ${isCurrent ? 'current-day' : ''}">${day.name}</span>`;
    }).join('');
}

// ==========================================
// UTILITIES
// ==========================================

function calculateUV(weatherId, clouds) {
    let baseUV = 5;
    if (weatherId < 300) baseUV = 2;
    else if (weatherId < 600) baseUV = 3;
    else if (weatherId === 800) baseUV = 8;
    else if (weatherId > 800) baseUV = 4;
    
    return Math.round(baseUV * (1 - clouds / 200));
}

function getWeatherIcon(iconCode) {
    const icons = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return icons[iconCode] || '🌡️';
}

function updateDateTime() {
    const now = new Date();
    currentTime.textContent = formatTime(now);
    currentDate.textContent = now.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short' 
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

function showLoading() {
    loading.classList.remove('hidden');
    weatherResult.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => errorMessage.classList.add('hidden'), 5000);
}

function clearError() {
    errorMessage.classList.add('hidden');
}