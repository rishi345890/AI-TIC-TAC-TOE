let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;
let difficulty = "hard";

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("winnerMessage");
const resetBtn = document.getElementById("resetGameBtn");
const difficultyText = document.getElementById("difficulty-status");

/* ------------------ DIFFICULTY ------------------ */
function setDifficulty(level) {
    difficulty = level;
    difficultyText.innerHTML = "<b>Difficulty:</b> " + level.toUpperCase();
    restartGame();
}

/* ------------------ PLAYER MOVE ------------------ */
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const index = cell.getAttribute("data-index");

        if (board[index] !== "" || gameOver) return;

        makeMove(index, "X");

        if (checkWinner("X")) {
            statusText.innerText = "You Win ";
            alert("CONGRATS! YOU BEAT THE AI!"); // Alert message
            gameOver = true;
            return;
        }

        if (!board.includes("")) {
            statusText.innerText = "Draw";
                alert("IT'S A DRAW! TRY AGAIN!"); // Alert message
            gameOver = true;
            return;
        }

        statusText.innerText = "AI Thinking...";

        setTimeout(aiMove, 500);
    });
});

/* ------------------ MAKE MOVE ------------------ */
function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;

    // Color styling
    if (player === "X") {
        cells[index].style.color = "#22c55e";
    } else {
        cells[index].style.color = "#ef4444";
    }
}

/* ------------------ AI MOVE ------------------ */
function aiMove() {
    let move;

    if (difficulty === "easy") {
        move = randomMove();
    } 
    else if (difficulty === "medium") {
        move = Math.random() < 0.5 ? randomMove() : bestMove();
    } 
    else {
        move = bestMove();
    }

    if (move !== null) {
        makeMove(move, "O");
    }

    if (checkWinner("O")) {
        statusText.innerText = "AI Wins ";
        alert("SORRY! THE AI WON!"); // Alert message
        gameOver = true;
        return;
    }

    if (!board.includes("")) {
        statusText.innerText = "Draw";
        alert("IT'S A DRAW! TRY AGAIN!"); // Alert message
        gameOver = true;
        return;
    }

    statusText.innerText = "Your Turn (X)";
}

/* ------------------ RANDOM MOVE ------------------ */
function randomMove() {
    let empty = board
        .map((val, index) => val === "" ? index : null)
        .filter(v => v !== null);

    return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
}

/* ------------------ MINIMAX ------------------ */
function bestMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";

            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

function minimax(board, depth, isMaximizing) {
    if (checkWinner("O")) return 10 - depth;
    if (checkWinner("X")) return depth - 10;
    if (!board.includes("")) return 0;

    if (isMaximizing) {
        let best = -Infinity;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                best = Math.max(score, best);
            }
        }
        return best;
    } else {
        let best = Infinity;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                best = Math.min(score, best);
            }
        }
        return best;
    }
}

/* ------------------ CHECK WINNER ------------------ */
function checkWinner(player) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    return winPatterns.some(pattern =>
        pattern.every(index => board[index] === player)
    );
}

/* ------------------ RESET ------------------ */
resetBtn.addEventListener("click", restartGame);

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameOver = false;
    statusText.innerText = "Play First!";

    cells.forEach(cell => {
        cell.innerText = "";
        cell.style.color = "white";
    });
}