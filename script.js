// Egg boiling parameters
const eggTypes = {
    soft: { name: "Soft-Boiled", time: 6, minTemp: 62, maxTemp: 65 },
    medium: { name: "Medium-Boiled", time: 9, minTemp: 66, maxTemp: 70 },
    hard: { name: "Hard-Boiled", time: 12, minTemp: 71, maxTemp: 75 },
    overcooked: { name: "Over-Cooked", time: 15, minTemp: 76, maxTemp: 85 }
};

// State variables
let selectedEggType = 'soft';
let temperatureUnit = 'celsius';
let isBoiling = false;
let timer = null;
let timeElapsed = 0;
let currentTemp = 20; // Starting at room temperature
let targetTemp = 100; // Boiling point
let boilingAnimationActive = false;
let vaporAnimationActive = false;

// Elements
const eggTypeButtons = document.querySelectorAll('.egg-type');
const tempUnitButtons = document.querySelectorAll('.temp-unit');
const startButton = document.getElementById('start');
const timeDisplay = document.getElementById('time-display');
const tempDisplay = document.getElementById('temp-display');
const statusDisplay = document.getElementById('status-display');
const notification = document.getElementById('notification');
const fireElement = document.getElementById('fire');
const vaporContainer = document.getElementById('vapor-container');
const waterElement = document.querySelector('.water');
const eggElement = document.querySelector('.egg');
const beepSound = document.getElementById('beep-sound');

// Initialize button handlers
eggTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Deselect all buttons
        eggTypeButtons.forEach(btn => btn.classList.remove('selected'));
        // Select clicked button
        button.classList.add('selected');
        // Set selected egg type
        selectedEggType = button.id;
        
        // Reset if already boiling
        if (isBoiling) {
            stopBoiling();
            startBoiling();
        }
    });
});

tempUnitButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Deselect all buttons
        tempUnitButtons.forEach(btn => btn.classList.remove('selected'));
        // Select clicked button
        button.classList.add('selected');
        // Set selected temperature unit
        temperatureUnit = button.id;
        // Update temperature display
        updateTempDisplay();
    });
});

startButton.addEventListener('click', () => {
    if (!isBoiling) {
        startBoiling();
    } else {
        stopBoiling();
    }
});

// Function to start the boiling process
function startBoiling() {
    isBoiling = true;
    timeElapsed = 0;
    currentTemp = 20; // Start at room temperature
    startButton.textContent = "Stop Boiling";
    startButton.style.backgroundColor = "#f44336";
    statusDisplay.textContent = "Heating...";
    notification.style.display = "none";
    
    // Show the fire
    fireElement.style.display = "block";
    
    // Reset egg color
    eggElement.style.backgroundColor = "#f5f5dc";
    
    // Start timer
    timer = setInterval(updateSimulation, 1000);
    
    // Start temperature increase
    increaseTemperature();
}

// Function to stop the boiling process
function stopBoiling() {
    isBoiling = false;
    clearInterval(timer);
    startButton.textContent = "Start Boiling";
    startButton.style.backgroundColor = "#f44336";
    statusDisplay.textContent = "Stopped";
    
    // Hide fire and vapor
    fireElement.style.display = "none";
    vaporContainer.style.display = "none";
    vaporContainer.innerHTML = '';
    vaporAnimationActive = false;
    
    // Stop boiling animation
    if (boilingAnimationActive) {
        waterElement.style.animation = "";
        boilingAnimationActive = false;
    }
}

// Function to increase temperature over time
function increaseTemperature() {
    if (!isBoiling) return;
    
    // Increase temperature
    if (currentTemp < targetTemp) {
        currentTemp += 5;
        
        // Start boiling animation when temperature is close to 100°C
        if (currentTemp >= 95 && !boilingAnimationActive) {
            waterElement.style.animation = "boil 0.5s infinite alternate";
            boilingAnimationActive = true;
            statusDisplay.textContent = "Boiling";
        }
        
        // Start vapor animation when temperature is above 90°C
        if (currentTemp >= 90 && !vaporAnimationActive) {
            vaporContainer.style.display = "block";
            createVapor();
            vaporAnimationActive = true;
        }
        
        // Update temperature display
        updateTempDisplay();
        
        // Continue increasing temperature
        setTimeout(increaseTemperature, 1000);
    }
}

// Function to create vapor bubbles
function createVapor() {
    if (!isBoiling || !vaporAnimationActive) return;
    
    // Create a vapor bubble
    const vapor = document.createElement('div');
    vapor.className = 'vapor';
    vapor.style.width = Math.random() * 10 + 5 + 'px';
    vapor.style.height = Math.random() * 10 + 5 + 'px';
    vapor.style.left = Math.random() * 180 + 10 + 'px';
    vapor.style.animationDuration = Math.random() * 2 + 2 + 's';
    
    vaporContainer.appendChild(vapor);
    
    // Remove vapor after animation
    setTimeout(() => {
        if (vapor.parentNode === vaporContainer) {
            vaporContainer.removeChild(vapor);
        }
    }, 3000);
    
    // Create new vapor if still boiling
    if (isBoiling && vaporAnimationActive) {
        setTimeout(createVapor, Math.random() * 500 + 200);
    }
}

// Function to update the simulation
function updateSimulation() {
    timeElapsed++;
    
    // Format minutes and seconds
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Get the target time based on egg type
    const targetTime = eggTypes[selectedEggType].time * 60;
    
    // Check if cooking is complete
    if (timeElapsed >= targetTime) {
        completeBoiling();
    }
    
    // Update egg color based on cooking progress
    updateEggColor();
}

// Function to update egg color based on cooking time
function updateEggColor() {
    const targetTime = eggTypes[selectedEggType].time * 60;
    const progressRatio = Math.min(timeElapsed / targetTime, 1);
    
    // Change from raw to cooked color
    if (selectedEggType === 'soft') {
        eggElement.style.backgroundColor = lerpColor('#f5f5dc', '#fffad1', progressRatio);
    } else if (selectedEggType === 'medium') {
        eggElement.style.backgroundColor = lerpColor('#f5f5dc', '#fff7b3', progressRatio);
    } else if (selectedEggType === 'hard') {
        eggElement.style.backgroundColor = lerpColor('#f5f5dc', '#fff491', progressRatio);
    } else if (selectedEggType === 'overcooked') {
        eggElement.style.backgroundColor = lerpColor('#f5f5dc', '#b3a76c', progressRatio);
    }
}

// Function to interpolate between two colors
function lerpColor(a, b, amount) {
    const ah = parseInt(a.replace('#', ''), 16);
    const ar = ah >> 16;
    const ag = (ah >> 8) & 0xff;
    const ab = ah & 0xff;
    const bh = parseInt(b.replace('#', ''), 16);
    const br = bh >> 16;
    const bg = (bh >> 8) & 0xff;
    const bb = bh & 0xff;
    const rr = ar + amount * (br - ar);
    const rg = ag + amount * (bg - ag);
    const rb = ab + amount * (bb - ab);
    
    return '#' + ((1 << 24) + (Math.round(rr) << 16) + (Math.round(rg) << 8) + Math.round(rb)).toString(16).slice(1);
}

// Function to complete the boiling process
function completeBoiling() {
    stopBoiling();
    startButton.textContent = "Start Again";
    statusDisplay.textContent = "Complete!";
    notification.style.display = "block";
    
    // Play sound
    beepSound.play();
}

// Function to update temperature display
function updateTempDisplay() {
    let displayTemp;
    let unit;
    
    if (temperatureUnit === 'celsius') {
        displayTemp = currentTemp;
        unit = '°C';
    } else {
        // Convert to Fahrenheit
        displayTemp = Math.round(currentTemp * 9/5 + 32);
        unit = '°F';
    }
    
    tempDisplay.textContent = `${displayTemp}${unit}`;
}

// Initial display update
updateTempDisplay();