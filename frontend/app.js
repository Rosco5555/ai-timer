const timerDisplay = document.getElementById('timer');
const scrambleDisplay = document.getElementById('scramble-display');
let timerInterval = null;
let startTime = 0;
let running = false;
let spaceDown = false;
let readyToStart = false;

// Cube colors for the 3D representation
const colors = {
    'U': '#FFFF00', // Yellow
    'R': '#FF0000', // Red
    'F': '#0000FF', // Blue
    'D': '#FFFFFF', // White
    'L': '#FFA500', // Orange
    'B': '#008000'  // Green
};

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function updateTimer() {
    if (running) {
        const elapsed = Date.now() - startTime;
        timerDisplay.textContent = formatTime(elapsed);
    }
}

function startTimer() {
    if (!running) {
        startTime = Date.now();
        running = true;
        timerInterval = setInterval(updateTimer, 1);
        timerDisplay.style.color = '#dc3545'; // Change color to red when running
        scrambleDisplay.textContent = "Solving...";
    }
}

function stopTimer() {
    if (running) {
        clearInterval(timerInterval);
        running = false;
        timerDisplay.style.color = '#007bff'; // Revert color
        generateScramble(); // Generate new scramble when timer stops
    }
}

async function generateScramble() {
    scrambleDisplay.textContent = generateWCAScramble();
}

function drawCube() {
    // This representation is a simplified, fixed state for visual flair.
    // For a dynamic representation based on scramble, more complex logic is needed.
    const faces = {
        'front': ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'],
        'back': ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
        'right': ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
        'left': ['L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L'],
        'top': ['U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U'],
        'bottom': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D']
    };

    for (const faceName in faces) {
        const faceElement = document.querySelector(`.face.${faceName}`);
        faceElement.innerHTML = ''; // Clear existing stickers
        faces[faceName].forEach(colorCode => {
            const sticker = document.createElement('div');
            sticker.classList.add('sticker');
            sticker.style.backgroundColor = colors[colorCode];
            faceElement.appendChild(sticker);
        });
    }
}

// Event listeners for spacebar
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !spaceDown) {
        e.preventDefault(); // Prevent scrolling
        spaceDown = true;
        timerDisplay.style.color = '#ffc107'; // Yellow/orange for "ready" state
        if (!running) {
            readyToStart = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        spaceDown = false;
        if (running) {
            stopTimer();
        } else if (readyToStart) {
            startTimer();
            readyToStart = false; // Reset ready state
        }
    }
});


// Scramble generation function
function generateWCAScramble(length = 20) {
    const faces = ['U', 'D', 'R', 'L', 'F', 'B'];
    const suffixes = ['', '2', "'"];
    
    // Group faces by axis
    const axes = [
        ['U', 'D'],  // y-axis
        ['R', 'L'],  // x-axis
        ['F', 'B']   // z-axis
    ];
    
    let scramble = [];
    let lastAxis = -1;
    let lastFace = '';
    
    while (scramble.length < length) {
        // Choose a random axis (but not the same as the last one if possible)
        let axisIndex;
        do {
            axisIndex = Math.floor(Math.random() * axes.length);
        } while (axisIndex === lastAxis && scramble.length > 0 && Math.random() > 0.1);
        
        // Choose a random face from this axis
        const axis = axes[axisIndex];
        let face = axis[Math.floor(Math.random() * axis.length)];
        
        // If we're on the same axis as last move, ensure we don't use the same face
        if (axisIndex === lastAxis && face === lastFace) {
            face = axis[1 - axis.indexOf(face)];
        }
        
        // Choose a random suffix
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        scramble.push(face + suffix);
        lastAxis = axisIndex;
        lastFace = face;
    }
    
    return scramble.join(' ');
}

// Initialize
generateScramble();
drawCube();