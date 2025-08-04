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
    scrambleDisplay.textContent = "Generating Scramble...";
    try {
        var response = await fetch("http://localhost:3000/api/scramble");
        if (!response.ok) { 
                // If the response is not OK, try to get an error message from the backend
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    // Try to parse the error response as JSON
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage; // Use backend's specific error message
                } catch (jsonError) {
                    // If the response isn't JSON, just use the status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage); // Throw an error to be caught by the catch block
            }

            // Parse the successful JSON response from the backend
            const data = await response.json();

            const latestScramble = data["scramble"];
            scrambleDisplay.textContent = latestScramble;
    } catch (error) {
        console.error("Error generating scramble:", error);
        scrambleDisplay.textContent = "Error generating scramble.";
    }
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

// Initialize
generateScramble();
drawCube();