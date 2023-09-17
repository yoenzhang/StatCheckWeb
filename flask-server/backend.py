from flask import Flask, jsonify, request
from nba_api.stats.static import players, teams
from nba_api.stats.endpoints import playercareerstats, playergamelog, leaguegamefinder
from datetime import datetime, timezone
from dateutil import parser
from nba_api.live.nba.endpoints import scoreboard, boxscore

app = Flask(__name__)

testLiveData = [
    {
        "gameId": "0022000207",
        "awayTeam": "Spurs",
        "homeTeam": "Trail Blazers",
        "gameTimeUTC": "2021-01-18T20:00:00Z"
    },
    {
        "gameId": "0022000205",
        "awayTeam": "Timberwolves",
        "homeTeam": "Hawks",
        "gameTimeUTC": "2021-01-18T19:30:00Z"
    },
    {
        "gameId": "0022000203",
        "awayTeam": "Magic",
        "homeTeam": "Knicks",
        "gameTimeUTC": "2021-01-18T17:00:00Z"
    },
    {
        "gameId": "0022000204",
        "awayTeam": "Cavaliers",
        "homeTeam": "Wizards",
        "gameTimeUTC": "2021-01-18T19:00:00Z"
    },
    {
        "gameId": "0022000208",
        "awayTeam": "Suns",
        "homeTeam": "Grizzlies",
        "gameTimeUTC": "2021-01-18T22:00:00Z"
    },
    {
        "gameId": "0022000209",
        "awayTeam": "Bucks",
        "homeTeam": "Nets",
        "gameTimeUTC": "2021-01-19T00:30:00Z"
    },
    {
        "gameId": "0022000210",
        "awayTeam": "Mavericks",
        "homeTeam": "Raptors",
        "gameTimeUTC": "2021-01-19T00:30:00Z"
    },
    {
        "gameId": "0022000206",
        "awayTeam": "Pistons",
        "homeTeam": "Heat",
        "gameTimeUTC": "2021-01-19T01:00:00Z"
    },
    {
        "gameId": "0022000211",
        "awayTeam": "Rockets",
        "homeTeam": "Bulls",
        "gameTimeUTC": "2021-01-19T01:00:00Z"
    },
    {
        "gameId": "0022000212",
        "awayTeam": "Warriors",
        "homeTeam": "Lakers",
        "gameTimeUTC": "2021-01-19T03:00:00Z"
    }
]

nba_players = players.get_players()
allTeams = teams.get_teams()
teamIds = {team['full_name'].lower(): team['id'] for team in allTeams}

# Live Routes
@app.route('/get_game_details/<game_id>', methods=['GET'])
def get_box_score(game_id):
    box = boxscore.BoxScore(game_id)
    game_data = box.game.get_dict()
    
    # Convert the entire dictionary to a string and print it
    game_data_str = str(game_data)
    print(game_data_str)
    
    return jsonify(game_data)

@app.route('/get_live_games', methods=['GET'])
def get_live_games():

    f = "{gameId}: {awayTeam} vs. {homeTeam} @ {gameTimeLTZ}"

    board = scoreboard.ScoreBoard()
    games = board.games.get_dict()
    if len(games) < 1:
        return jsonify(testLiveData)
    
    live_games = []

    for game in games:
        gameTimeLTZ = parser.parse(game["gameTimeUTC"]).replace(tzinfo=timezone.utc).astimezone(tz=None)
        game_info = {
            'gameId': game['gameId'],
            'awayTeam': game['awayTeam']['teamName'],
            'homeTeam': game['homeTeam']['teamName'],
            'gameTimeLTZ': gameTimeLTZ.strftime('%Y-%m-%d %H:%M:%S %Z')
        }
        live_games.append(game_info)

    return jsonify(live_games)

# Team Routes
@app.route('/get_team_games', methods=['POST'])
def searchTeamGames():
    team_input = request.json.get('team', '').lower()  # Get the team input from the request
    season_type = request.json.get('season_type', '')
    team_id = get_team_id(team_input)
    if team_id is not None:
        games = get_team_games(team_id, season_type)
        return jsonify(games)
    else:
        return jsonify({"error": "Team not found."})

def get_team_id(team_input):
    # Check if the teamInput is a full team name or a valid abbreviation
    if team_input in teamIds:
        return teamIds[team_input]
    
    # Check if teamInput is a partial team name and find a match
    for full_name, team_id in teamIds.items():
        if team_input in full_name:
            return team_id
    
    return None

def get_team_games(team_id, season_type):
    gamefinder = leaguegamefinder.LeagueGameFinder(season_nullable='2022-23',team_id_nullable=team_id, season_type_nullable=season_type)
    games = gamefinder.get_data_frames()[0]
    return games.to_dict(orient='records')

#Player Routes
@app.route('/get_stats', methods=['POST'])
def get_stats():
    player_full_name = request.json.get('playerFullName', '')
    player_id = get_player_id_from_full_name(player_full_name)
    stat_type = request.json.get('statType', '')
    player_stats = get_player_stats_by_id(player_id, stat_type)
    return jsonify(player_stats)

@app.route('/get_game_logs', methods=['POST'])
def get_player_game_logs():
    player_full_name = request.json.get('playerFullName', '')
    player_id = get_player_id_from_full_name(player_full_name)
    season = request.json.get('season', '')
    game_logs = get_player_game_logs_by_id(player_id, season)
    return jsonify(game_logs)

def get_player_id_from_full_name(player_full_name):
    for player in nba_players:
        if player['full_name'].lower() == player_full_name.lower():
            return player['id']
    return None

def get_player_stats_by_id(player_id, stats_type):
    career = playercareerstats.PlayerCareerStats(player_id=str(player_id))
    stats_data = career.get_data_frames()[stats_type]
    return stats_data.to_dict()

def get_player_game_logs_by_id(player_id, season):
    player_game_log = playergamelog.PlayerGameLog(player_id=str(player_id), season=season)
    game_logs_data = player_game_log.get_data_frames()[0]
    return game_logs_data.to_dict(orient='records')

if __name__ == '__main__':
    app.run(debug=True)
