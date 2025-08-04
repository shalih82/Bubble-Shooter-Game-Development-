const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let score = 0;
let bubbles = [];
const bubbleColors = ['red', 'blue', 'green', 'yellow', 'purple'];
const bubbleImages = {};
const sounds = {
    shoot: new Audio('assets/sounds/shoot.mp3'),
    pop: new Audio('assets/sounds/pop.mp3'),
    gameOver: new Audio('assets/sounds/game-over.mp3')
};

// Load bubble images
bubbleColors.forEach(color => {
    const img = new Image();
    img.src = `assets/bubbles/${color}-bubble.png`;
    bubbleImages[color] = img;
});

// Initialize game
function init() {
    createBubbleGrid();
    draw();
}

// Create bubble grid
function createBubbleGrid() {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 10; j++) {
            const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
            bubbles.push({ x: j * 50, y: i * 50, color: color });
        }
    }
}

// Draw bubbles
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach(bubble => {
        ctx.drawImage(bubbleImages[bubble.color], bubble.x, bubble.y, 50, 50);
    });
    document.getElementById('score').innerText = `Score: ${score}`;
}

// Event listener for shooting
canvas.addEventListener('click', shootBubble);

function shootBubble(event) {
    sounds.shoot.play();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create a new bubble object
    const newBubble = {
        x: x - 25, // Center the bubble
        y: canvas.height - 50, // Start from the bottom
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
        radius: 25
    };

    // Move the bubble upwards
    const interval = setInterval(() => {
        newBubble.y -= 5; // Move bubble upwards
        draw();
        if (checkCollision(newBubble)) {
            clearInterval(interval);
            bubbles.push(newBubble);
            checkMatches();
            if (bubbles.some(bubble => bubble.y >= canvas.height - 50)) {
                gameOver();
            }
        }
    }, 30);
}

// Check for collision with existing bubbles
function checkCollision(newBubble) {
    return bubbles.some(bubble => {
        const dx = newBubble.x - bubble.x;
        const dy = newBubble.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < newBubble.radius + 25; // 25 is the radius of existing bubbles
    });
}

// Check for matches and remove them
function checkMatches() {
    const matchedBubbles = {};
    bubbles.forEach((bubble, index) => {
        if (!matchedBubbles[index]) {
            const match = findMatches(bubble, index);
            if (match.length >= 3) {
                match.forEach(i => {
                    matchedBubbles[i] = true;
                });
                score += match.length; // Increase score
                sounds.pop.play();
            }
        }
    });
    bubbles = bubbles.filter((_, index) => !matchedBubbles[index]);
    draw();
}

// Find matches recursively
function findMatches(bubble, index) {
    const matches = [index];
    const color = bubble.color;

    // Check adjacent bubbles
    const directions = [
        { x: 0, y: 50 },  // Down
        { x: 0, y: -50 }, // Up
        { x: 50, y: 0 },  // Right
        { x: -50, y: 0 }, // Left
    ];

    directions.forEach(dir => {
        const adjacentBubble = bubbles.find((b, i) => {
            return i !== index && b.color === color &&
                b.x === bubble.x + dir.x && b.y === bubble.y + dir.y;
        });
        if (adjacentBubble) {
            matches.push(...findMatches(adjacentBubble, bubbles.indexOf(adjacentBubble)));
        }
    });

    return matches;
}

// Handle game over
function gameOver() {
    sounds.gameOver.play();
    document.getElementById('gameOver').style.display = 'block';
    canvas.removeEventListener('click', shootBubble);
}

// Start the game
init();
