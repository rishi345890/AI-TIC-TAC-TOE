from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.game_logic import TicTacToeLogic
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Game state storage (in production, use a database or session)
game_sessions = {}

@app.route("/")
def home():
    return "Backend Running 🚀"

@app.route('/api/start', methods=['POST'])
def start_game():
    """Start a new game session"""
    data = request.json
    session_id = data.get('session_id', 'default')
    
    game = TicTacToeLogic()
    game_sessions[session_id] = game
    
    return jsonify({
        'status': 'success',
        'message': 'Game started',
        'board': game.board
    })

@app.route('/api/move', methods=['POST'])
def make_move():
    """Make a move (player or AI)"""
    data = request.json
    session_id = data.get('session_id', 'default')
    position = data.get('position')
    difficulty = data.get('difficulty', 'hard')
    
    if session_id not in game_sessions:
        return jsonify({'error': 'Game session not found'}), 404
    
    game = game_sessions[session_id]
    
    # Check if game is already over
    game_state = game.get_game_state()
    if game_state != 'ongoing':
        return jsonify({
            'status': 'game_over',
            'game_state': game_state,
            'board': game.board,
            'message': get_game_over_message(game_state)
        })
    
    # Make player's move
    if position is not None:
        if not game.make_move(position, "X"):
            return jsonify({'error': 'Invalid move'}), 400
        
        # Check if player won after their move
        game_state = game.get_game_state()
        if game_state != 'ongoing':
            return jsonify({
                'status': 'game_over',
                'game_state': game_state,
                'board': game.board,
                'message': get_game_over_message(game_state)
            })
        
        # Check for draw after player's move
        if game.is_board_full():
            return jsonify({
                'status': 'game_over',
                'game_state': 'draw',
                'board': game.board,
                'message': "It's a Draw!"
            })
    
    # Make AI move
    ai_position = game.ai_move(difficulty)
    if ai_position is not None:
        game.make_move(ai_position, "O")
        
        # Check game state after AI move
        game_state = game.get_game_state()
        
        return jsonify({
            'status': 'move_made',
            'ai_move': ai_position,
            'board': game.board,
            'game_state': game_state,
            'player_turn': game_state == 'ongoing',
            'message': get_game_over_message(game_state) if game_state != 'ongoing' else None
        })
    
    return jsonify({
        'status': 'move_made',
        'ai_move': None,
        'board': game.board,
        'game_state': game.get_game_state(),
        'player_turn': True
    })

@app.route('/api/reset', methods=['POST'])
def reset_game():
    """Reset the current game"""
    data = request.json
    session_id = data.get('session_id', 'default')
    
    if session_id in game_sessions:
        game_sessions[session_id].reset_board()
        return jsonify({
            'status': 'success',
            'message': 'Game reset',
            'board': game_sessions[session_id].board
        })
    else:
        # Create new game if session doesn't exist
        game = TicTacToeLogic()
        game_sessions[session_id] = game
        return jsonify({
            'status': 'success',
            'message': 'Game created and reset',
            'board': game.board
        })

@app.route('/api/state', methods=['GET'])
def get_game_state():
    """Get current game state"""
    session_id = request.args.get('session_id', 'default')
    
    if session_id not in game_sessions:
        return jsonify({'error': 'Game session not found'}), 404
    
    game = game_sessions[session_id]
    return jsonify({
        'board': game.board,
        'game_state': game.get_game_state(),
        'is_board_full': game.is_board_full()
    })

def get_game_over_message(game_state):
    """Get message for game over state"""
    if game_state == 'player_won':
        return "Congratulations! You won! 🎉"
    elif game_state == 'ai_won':
        return "AI Wins! Better luck next time! 🤖"
    elif game_state == 'draw':
        return "It's a Draw! 🤝"
    return ""


   

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
