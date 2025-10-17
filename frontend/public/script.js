// === CATEGORY DATA & RECIPES ===
const ANIMAL_CATEGORIES = {
    "Jungle": { initial: ["Cat 🐈", "Dog 🐕", "Monkey 🐒", "Rabbit 🐇","Sheep 🐑","Bird 🐦","Fish 🐟"] },
    "Ocean": { initial: ["Dolphin 🐬", "Shark 🦈", "Whale 🐳", "Crab 🦀","Squid 🦑","Eel 𓆙","Manta Ray 🐙","Turtle 🐢"] },
    "Insect": { initial: ["Ant 🐜", "Bee 🐝", "Fly 🪰", "Spider 🕷️"] },
    "Mythical": { initial: ["Unicorn 🦄", "Dragon 🐉", "Phoenix 🔥", "Mermaid 🧜‍♀️"] },
    "Jurassic": { initial: ["Dinosaur 🦖", "Pterosaur 🦅", "Plesiosaur 🦕", "Triceratops 🦏"] },
    "Cat Family": { initial: ["Cat 🐈", "Lion 🦁", "Tiger 🐅", "Leopard 🐆"] },
    "Swamp": { initial: ["Frog 🐸", "Alligator 🐊", "Snake 🐍", "Turtle 🐢"] } // UPDATED
};
// === BEAUTIFUL MESSAGES ===
const NEW_DISCOVERY_MESSAGES = [
    "Eureka! You've discovered the magnificent {animal}!",
    "A new creation emerges! Behold, the {animal}!",
    "Incredible! Your wisdom has brought forth the {animal}!",
    "A legendary discovery! You've created the {animal}!",
    "Great job! Your efforts have come to fruitition bringing {animal}!"
];
const REPEAT_DISCOVERY_MESSAGES = [
    "A familiar creation: You've crafted another {animal}.",
    "Masterfully done! You made another {animal}.",
    "The familiar form of the {animal} appears once more."
];
const INVALID_MERGE_MESSAGES = [
    "The elements fizzle and fade... Nothing happens.",
    "Hmm, that combination doesn't seem to work.",
    "The magic fails... Try a different pairing."
];

// === GAME STATE ===
let selectedCategory = null;
let inventory = [];
let discoveries = [];
let discoveryCount = 0;
let score = 0;
let maxTimeInSeconds = 0;
let timeLeft = 0;
let timerInterval = null;
let mergeZone = { A: null, B: null };
let draggedItemData = null;
let isPaused = false;

// === DOM REFERENCES ===
const categoryScreen = document.getElementById('category-screen');
const timeScreen = document.getElementById('time-screen');
const nextToTimeBtn = document.getElementById('next-to-time-btn');
const backToCategoryBtn = document.getElementById('back-to-category-btn');
const selectedCategoryNameEl = document.getElementById('selected-category-name');
const categoryGrid = document.getElementById('category-grid');
const startGameBtn = document.getElementById('start-game-btn');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const inventoryList = document.getElementById('inventory-list');
const dropZoneA = document.getElementById('drop-zone-a');
const dropZoneB = document.getElementById('drop-zone-b');
const timerValue = document.getElementById('timer-value');
const scoreValue = document.getElementById('score-value');
const discoveryCountEl = document.getElementById('discovery-count');
const exitBtn = document.getElementById('exit-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const pauseScreen = document.getElementById('pause-screen');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const restartBtn = document.getElementById('restart-btn');
const toast = document.getElementById('toast-message');
const warningOverlay = document.getElementById('warning-overlay');
const modal = document.getElementById('custom-modal');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const aboutScreen = document.getElementById('about-screen');
const aboutOptionBtn = document.getElementById('about-option-btn');
const backFromAboutBtn = document.getElementById('back-from-about-btn');
const mergeResultEl = document.getElementById('merge-result'); 
const modeToggleBtn = document.getElementById('mode-toggle-btn');
// === PARTICLE BACKGROUND LOGIC ===
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
});

function createParticles() {
    particles = [];
    const particleCount = 200;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            dx: Math.random() * 1 - 0.5,
            dy: Math.random() * 1 - 0.5,
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    });
    requestAnimationFrame(animateParticles);
}

createParticles();
animateParticles();

// === UTILITY FUNCTIONS ===
let resolveModalPromise = null;
function showModal(message) {
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
    return new Promise((resolve) => {
        resolveModalPromise = resolve;
    });
}
function closeModal(result) {
    modal.classList.add('hidden');
    if (resolveModalPromise) {
        resolveModalPromise(result);
        resolveModalPromise = null;
    }
}
modalConfirmBtn.addEventListener('click', () => closeModal(true));
modalCancelBtn.addEventListener('click', () => closeModal(false));

function showToast(message, duration = 2000) {
    if (!toast) return; 
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

function getRandomMessage(messageArray, animal = "") {
    const randomIndex = Math.floor(Math.random() * messageArray.length);
    return messageArray[randomIndex].replace('{animal}', animal);
}

// === MENU NAVIGATION ===
categoryGrid.addEventListener('click', (e) => {
    const clickedLabel = e.target.closest('.category-option');
    if (!clickedLabel) return;
    
    if (clickedLabel.id === 'about-option-btn') {
        categoryScreen.classList.remove('active');
        categoryScreen.classList.add('hidden');
        aboutScreen.classList.remove('hidden');
        aboutScreen.classList.add('active');
        return; 
    }
    
    selectedCategory = clickedLabel.dataset.category;
    nextToTimeBtn.disabled = false;
});

nextToTimeBtn.addEventListener('click', () => {
    if (!selectedCategory) return;
    categoryScreen.classList.remove('active');
    categoryScreen.classList.add('hidden');
    timeScreen.classList.add('active');
    timeScreen.classList.remove('hidden');
    selectedCategoryNameEl.textContent = selectedCategory;
});

backToCategoryBtn.addEventListener('click', () => {
    timeScreen.classList.remove('active');
    timeScreen.classList.add('hidden');
    categoryScreen.classList.add('active');
    categoryScreen.classList.remove('hidden');
});

backFromAboutBtn.addEventListener('click', () => {
    aboutScreen.classList.add('hidden');
    aboutScreen.classList.remove('active');
    categoryScreen.classList.remove('hidden');
    categoryScreen.classList.add('active');
});

// === GAME LIFECYCLE ===
// REPLACE your existing startGameBtn.addEventListener('click', ...) with this:
// REPLACE your existing startGameBtn.addEventListener('click', ...) with this:
startGameBtn.addEventListener('click', () => {
    const selectedTimeInput = document.querySelector('input[name="time-limit"]:checked');
    
    // 🛑 CRITICAL FIX: If no time is selected, stop and warn the user.
    if (!selectedTimeInput) {
        showToast("Please select a time limit to start the game.");
        return; 
    }
    
    // Script will not crash past this point
    maxTimeInSeconds = parseFloat(selectedTimeInput.value) * 60;
    
    // 3. UI Transition
    timeScreen.classList.add('hidden');
    timeScreen.classList.remove('active');
    gameScreen.classList.remove('hidden');
    gameScreen.classList.add('active');
    
    // 4. Game Start
    resetGameState();
    renderInventory();
    updateHUD(); // This will now run and set the initial Discovery Count
    
    if (maxTimeInSeconds > 0) startTimer();
});

function resetGameState() {
    const categoryData = ANIMAL_CATEGORIES[selectedCategory] || ANIMAL_CATEGORIES["Jungle"];
    inventory = [...categoryData.initial];
    discoveries = [...categoryData.initial];
    discoveryCount = discoveries.length;
    score = 0;
    isPaused = false;
    
    mergeZone = { A: null, B: null };
    draggedItemData = null;
    
    dropZoneA.textContent = "Drag Item A Here";
    dropZoneB.textContent = "Drag Item B Here";
    dropZoneA.classList.remove('occupied');
    dropZoneB.classList.remove('occupied');
    
    clearInterval(timerInterval);
    timeLeft = maxTimeInSeconds;
    warningOverlay.classList.remove('active');
}

function endGame() {
    gameScreen.classList.add('hidden');
    gameScreen.classList.remove('active');
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('active');
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-discoveries').textContent = discoveryCount;
}

function resetToMenu() {
    clearInterval(timerInterval);
    gameScreen.classList.add('hidden');
    gameScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('active');
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('active');
    timeScreen.classList.add('hidden');
    timeScreen.classList.remove('active');
    aboutScreen.classList.add('hidden');
    aboutScreen.classList.remove('active');
    
    categoryScreen.classList.remove('hidden');
    categoryScreen.classList.add('active');
    
    const checkedRadio = document.querySelector('input[name="animal-category"]:checked');
    if (checkedRadio) checkedRadio.checked = false;
    nextToTimeBtn.disabled = true;
}

// === UI & RENDERING ===
function renderInventory() {
    inventoryList.innerHTML = '';
    const uniqueInventory = [...new Set(inventory)].sort();

    uniqueInventory.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'animal-item';
        btn.textContent = item;
        btn.dataset.name = item;
        btn.draggable = true;
        btn.addEventListener('dragstart', e => {
            if (isPaused) {
                e.preventDefault();
                return;
            }
            draggedItemData = e.target.dataset.name;
        });
        inventoryList.appendChild(btn);
    });
}

function updateHUD() {
    scoreValue.textContent = score;
    // NEW STABLE CODE - Uses a fixed placeholder for the total
// You can set 'MAX_DISCOVERIES' to a number you expect, or use '??' as a placeholder
const MAX_DISCOVERIES_PLACEHOLDER = '??';
discoveryCountEl.textContent = `${discoveryCount}/${MAX_DISCOVERIES_PLACEHOLDER}`;
    timerValue.textContent = maxTimeInSeconds > 0 ? formatTime(timeLeft) : "∞";
}

// === DRAG & DROP LOGIC ===
[dropZoneA, dropZoneB].forEach(zone => {
    zone.addEventListener('dragover', e => {
        e.preventDefault();
        if (!zone.classList.contains('occupied')) {
             zone.classList.add('hovered');
        }
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('hovered'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('hovered');
        if (isPaused || zone.classList.contains('occupied')) return;
        
        const droppedItem = draggedItemData;
        if (zone.id === 'drop-zone-a') mergeZone.A = droppedItem;
        if (zone.id === 'drop-zone-b') mergeZone.B = droppedItem;
        
        zone.textContent = droppedItem;
        zone.classList.add('occupied');
        
        if (mergeZone.A && mergeZone.B) {
            checkMerge();
        }
    });
});

// Replace the existing checkMerge function in script.js
// 🌟 REPLACE YOUR EXISTING checkMerge FUNCTION WITH THIS:

async function checkMerge() {
    const item1 = mergeZone.A; // e.g., "Cat 🐈"
    const item2 = mergeZone.B; // e.g., "Dog 🐕"
    
    if (!item1 || !item2) return;
    
    let result = null;
    
    // 1. API Call to Spring Boot Backend
    try {
        // Assumes Spring Boot is accessible at the same host/port for '/api/merge'
        const response = await fetch(`http://localhost:8085/api/merge?itemA=${item1}&itemB=${item2}`, {
            method: 'GET'
            //headers: { 'Content-Type': 'application/json' },
            // Send the full item names; the backend handles the sorting/normalization
            //body: JSON.stringify({ itemA: item1, itemB: item2 }) 
        });
        
        if (!response.ok) {
            showToast("Server error during merge lookup. Status: " + response.status, 3000);
            mergeResultEl.textContent = 'ERROR';
            return;
        }

        const data = await response.json();
        // Server returns { "result": "Wolf 🐺" } or { "result": null }
        result = data.result;
         

    } catch (e) {
        console.error("Failed to connect to merge API:", e);
        showToast("Connection failed. Check Spring Boot server status.", 3000);
        mergeResultEl.textContent = '... Nothing!';
        return;
    }

    // 2. Process the Result
    // Check if the result is a valid string (not null or the string "null")
    if (result && result.toLowerCase() !== 'null') { 
        const isNewDiscovery = !discoveries.includes(result);

    
        inventory.push(result); // Add the new item
        
        if (isNewDiscovery) { 
            showToast(getRandomMessage(NEW_DISCOVERY_MESSAGES, result));
            discoveries.push(result);
            discoveryCount++;
            score += 110; // Base 10 + 50 for new discovery
        } else {
            showToast(getRandomMessage(REPEAT_DISCOVERY_MESSAGES, result));
            score += 10;

        }
        console.log("Merge Complete. Score:", score, "Discoveries:", discoveryCount); // <--- ADD THIS LINE
        mergeResultEl.textContent = `= ${result}`;
        
    } else {
        showToast(getRandomMessage(INVALID_MERGE_MESSAGES));
        mergeResultEl.textContent = '... Nothing!';
        score = Math.max(0, score - 5); // Penalty for failed merge
    }

    // 3. Cleanup and UI Update
    mergeZone.A = null;
    mergeZone.B = null;
    dropZoneA.textContent = "Drag Item A Here";
    dropZoneB.textContent = "Drag Item B Here";
    dropZoneA.classList.remove('occupied');
    dropZoneB.classList.remove('occupied');
    console.log("HUD Update Triggered. New Score:", score, "Discoveries:", discoveryCount);
    renderInventory();
    updateHUD();
}

// Also update the drop event listener to call the async function directly
// Find the drag & drop logic and change:
// if (mergeZone.A && mergeZone.B) {
//     setTimeout(checkMerge, 100); 
// }
// TO:
// if (mergeZone.A && mergeZone.B) {
//     checkMerge(); 
// }
// === END ASYNCHRONOUS MERGE LOGIC ===

// === TIMER LOGIC AND EVENT LISTENERS ===
// ... (All other functions and event listeners remain unchanged) ...
// === DARK/LIGHT MODE TOGGLE LOGIC ===

function setMode(isLight) {
    if (isLight) {
        document.body.classList.add('light-mode');
        modeToggleBtn.textContent = '🌙'; // Moon for switching to Dark Mode
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        modeToggleBtn.textContent = '☀️'; // Sun for switching to Light Mode
        localStorage.setItem('theme', 'dark');
    }
}

function checkInitialMode() {
    const savedTheme = localStorage.getItem('theme');
    // Default to dark mode if no preference is saved
    if (savedTheme === 'light') {
        setMode(true);
    } else {
        setMode(false);
    }
}

modeToggleBtn.addEventListener('click', () => {
    const isCurrentlyLight = document.body.classList.contains('light-mode');
    setMode(!isCurrentlyLight);
});

// === INITIALIZATION ===
// Run the initial mode check right after defining the function
checkInitialMode();

// === TIMER LOGIC ===
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (isPaused) return; // Time stops if paused
        timeLeft--;
        updateHUD();
        if (timeLeft === 10) {
            warningOverlay.classList.add('active');
            showToast("⚠️ Only 10 seconds left!", 2000);
        }
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            warningOverlay.classList.remove('active');
            endGame();
        }
    }, 1000);
}

function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2, '0')}`;
}

// === EVENT LISTENERS ===
playAgainBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('active');
    gameScreen.classList.remove('hidden');
    gameScreen.classList.add('active');
    resetGameState();
    renderInventory();
    updateHUD();
    if (maxTimeInSeconds > 0) startTimer();
});

backToMenuBtn.addEventListener('click', resetToMenu);

exitBtn.addEventListener('click', async () => {
    isPaused = true;
    if (await showModal("Exit to menu? Progress will be lost.")) {
        resetToMenu();
    } else {
        isPaused = false;
    }
});

pauseBtn.addEventListener('click', () => {
    if (isPaused) return;
    isPaused = true;
    pauseScreen.classList.remove('hidden');
    pauseScreen.classList.add('active');
});

resumeBtn.addEventListener('click', () => {
    if (!isPaused) return;
    isPaused = false;
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('active');
});

restartBtn.addEventListener('click', async () => {
    isPaused = true;
    if (await showModal("Restart the game? Progress will be lost.")) {
        if(isPaused) resumeBtn.click();
        resetGameState();
        renderInventory();
        updateHUD();
        if (maxTimeInSeconds > 0) startTimer();
    } else {
        isPaused = false;
    }
});

