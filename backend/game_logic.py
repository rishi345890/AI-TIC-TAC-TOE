class TicTacToeLogic:
    def __init__(self):
        self.board = ["", "", "", "", "", "", "", "", ""]
        self.win_patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
            [0, 4, 8], [2, 4, 6]              # Diagonals
        ]

    def reset_board(self):
        """Reset the game board"""
        self.board = ["", "", "", "", "", "", "", "", ""]
        return self.board

    def make_move(self, position, player):
        """Make a move on the board"""
        if self.board[position] == "":
            self.board[position] = player
            return True
        return False

    def check_winner(self, player):
        """Check if the specified player has won"""
        for pattern in self.win_patterns:
            if all(self.board[i] == player for i in pattern):
                return True
        return False

    def is_board_full(self):
        """Check if the board is full (draw)"""
        return all(cell != "" for cell in self.board)

    def get_empty_cells(self):
        """Get list of empty cell indices"""
        return [i for i, cell in enumerate(self.board) if cell == ""]

    def get_game_state(self):
        """Get current game state"""
        if self.check_winner("X"):
            return "player_won"
        elif self.check_winner("O"):
            return "ai_won"
        elif self.is_board_full():
            return "draw"
        return "ongoing"

    def random_move(self):
        """Make a random move (for Easy difficulty)"""
        empty_cells = self.get_empty_cells()
        if empty_cells:
            import random
            return random.choice(empty_cells)
        return None

    def minimax(self, is_maximizing, depth=0):
        """
        Minimax algorithm for AI move selection
        Returns: best score for the current board state
        """
        # Check terminal states
        if self.check_winner("O"):
            return 10 - depth
        elif self.check_winner("X"):
            return depth - 10
        elif self.is_board_full():
            return 0

        if is_maximizing:
            # AI's turn (maximizing player - O)
            best_score = -float('inf')
            for i in self.get_empty_cells():
                self.board[i] = "O"
                score = self.minimax(False, depth + 1)
                self.board[i] = ""
                best_score = max(score, best_score)
            return best_score
        else:
            # Player's turn (minimizing player - X)
            best_score = float('inf')
            for i in self.get_empty_cells():
                self.board[i] = "X"
                score = self.minimax(True, depth + 1)
                self.board[i] = ""
                best_score = min(score, best_score)
            return best_score

    def best_move(self):
        """
        Find the best move using minimax algorithm
        Returns: index of best move
        """
        best_score = -float('inf')
        best_move = None

        for i in self.get_empty_cells():
            self.board[i] = "O"
            score = self.minimax(False)
            self.board[i] = ""

            if score > best_score:
                best_score = score
                best_move = i

        return best_move

    def ai_move(self, difficulty):
        """
        Make AI move based on difficulty
        difficulty: 'easy', 'medium', or 'hard'
        """
        if difficulty == "easy":
            return self.random_move()
        elif difficulty == "medium":
            # 50% chance of random move, 50% chance of best move
            import random
            if random.random() < 0.5:
                return self.random_move()
            else:
                return self.best_move()
        else:  # hard
            return self.best_move()