// Game state
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;
let difficulty = "hard";
let sessionId = generateSessionId();

// DOM elements
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("winnerMessage");
const resetBtn = document.getElementById("resetGameBtn");
const difficultyText = document.getElementById("difficulty-status");

// API endpoint
const API_URL = "http://localhost:5000/api";

// Generate unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize game
async function initGame() {
    try {
        const response = await fetch(`${API_URL}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: sessionId })
        });
        const data = await response.json();
        board = data.board;
        updateBoardDisplay();
        statusText.innerText = "Your Turn (X)";
    } catch (error) {
        console.error("Error starting game:", error);
        statusText.innerText = "Error connecting to server!";
    }
}

// Set difficulty
function setDifficulty(level) {
    difficulty = level;
    difficultyText.innerHTML = "<b>Difficulty:</b> " + level.toUpperCase();
    restartGame();
}

// Make move
async function makeMove(index, player) {
    if (player !== "X") return false;
    
    try {
        const response = await fetch(`${API_URL}/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                position: index,
                difficulty: difficulty
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error(data.error);
            return false;
        }
        
        // Update board
        board = data.board;
        updateBoardDisplay();
        
        // Check game over
        if (data.status === 'game_over') {
            gameOver = true;
            statusText.innerText = data.message;
            if (data.game_state === 'player_won') {
                alert("🎉 CONGRATS! YOU BEAT THE AI! 🎉");
            } else if (data.game_state === 'ai_won') {
                alert("🤖 SORRY! THE AI WON! 🤖");
            } else if (data.game_state === 'draw') {
                alert("📊 IT'S A DRAW! TRY AGAIN! 📊");
            }
            return true;
        }
        
        // Update AI move display
        if (data.ai_move !== undefined && data.ai_move !== null) {
            // Update status
            if (data.game_state === 'ongoing') {
                statusText.innerText = "Your Turn (X)";
            }
        }
        
        return true;
    } catch (error) {
        console.error("Error making move:", error);
        statusText.innerText = "Error making move!";
        return false;
    }
}

// Update board display
function updateBoardDisplay() {
    cells.forEach((cell, index) => {
        const value = board[index];
        cell.innerText = value;
        if (value === "X") {
            cell.style.color = "#22c55e";
        } else if (value === "O") {
            cell.style.color = "#ef4444";
        } else {
            cell.style.color = "white";
        }
    });
}

// Reset game
async function restartGame() {
    try {
        const response = await fetch(`${API_URL}/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: sessionId })
        });
        
        const data = await response.json();
        board = data.board;
        gameOver = false;
        statusText.innerText = "Your Turn (X)";
        updateBoardDisplay();
    } catch (error) {
        console.error("Error resetting game:", error);
        // Fallback to local reset
        board = ["", "", "", "", "", "", "", "", ""];
        gameOver = false;
        statusText.innerText = "Your Turn (X)";
        updateBoardDisplay();
    }
}

// Event listeners
cells.forEach(cell => {
    cell.addEventListener("click", async () => {
        if (gameOver) {
            alert("Game is over! Please reset to play again.");
            return;
        }
        
        const index = parseInt(cell.getAttribute("data-index"));
        
        if (board[index] !== "") {
            alert("This cell is already taken!");
            return;
        }
        
        // Disable clicks while processing
        cells.forEach(c => c.style.pointerEvents = "none");
        statusText.innerText = "Processing...";
        
        const success = await makeMove(index, "X");
        
        // Re-enable clicks
        cells.forEach(c => c.style.pointerEvents = "auto");
        
        if (!success && !gameOver) {
            statusText.innerText = "Your Turn (X)";
        }
    });
});

resetBtn.addEventListener("click", restartGame);

// Start the game
initGame();