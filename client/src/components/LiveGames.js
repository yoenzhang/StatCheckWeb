import React, { useEffect, useState } from "react";
import "./LiveGames.css";

const playerInfo = ["jerseyNum", "position", "played", "name"];

const playerStatistics = [
  "minutes",
  "points",
  "assists",
  "reboundsTotal",
  "reboundsOffensive",
  "reboundsDefensive",
  "fieldGoalsMade",
  "fieldGoalsAttempted",
  "fieldGoalsPercentage",
  "twoPointersMade",
  "twoPointersAttempted",
  "twoPointersPercentage",
  "threePointersMade",
  "threePointersAttempted",
  "threePointersPercentage",
  "freeThrowsMade",
  "freeThrowsAttempted",
  "freeThrowsPercentage",
  "turnovers",
  "blocks",
  "steals",
  "foulsPersonal",
  "foulsOffensive",
  "foulsDrawn",
  "foulsTechnical",
  "pointsFastBreak",
  "pointsInThePaint",
  "pointsSecondChance",
  "plusMinusPoints",
  "plus",
  "minus",
];

const columnTitles = [
  "Jersey #",
  "Position",
  "Played",
  "Name",
  "Minutes",
  "Points",
  "Assists",
  "TRB",
  "ORB",
  "DRB",
  "FGM",
  "FGA",
  "FG %",
  "2PA",
  "2PM",
  "2P %",
  "3PA",
  "3PM",
  "3P%",
  "FTM",
  "FTA",
  "FT %",
  "Turnover",
  "Blocks",
  "Steals",
  "PF",
  "Offensive Fouls",
  "Fouls Drawn",
  "Technical Fouls",
  "Fast Break PTS",
  "PTS in paint",
  "Second Chance PTS",
  "+/-",
  "+",
  "-",
];

// Function to format minutes
function formatMinutes(duration) {
  if (typeof duration === "string") {
    const match = duration.match(/PT(\d+)M(\d+\.\d+)S/);

    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = Math.round(parseFloat(match[2]));

      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds} Min`;
    }
  }

  return "";
}

// Function to format game details
function formatGameDetail(statName, statValue) {
  if (statName === "minutes") {
    return formatMinutes(statValue);
  }

  if (statName.includes("Percentage")) {
    return `${(statValue * 100).toFixed(1)}%`;
  }

  if (statName.includes("played")) {
    if (statValue == 1) {
      return "Yes";
    } else {
      return "No";
    }
  }
  // Add more formatting logic for other stat names if needed
  return statValue;
}

function LiveGames() {
  const [liveGames, setLiveGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  // Function to fetch live games data
  const fetchLiveGames = () => {
    fetch("/get_live_games")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setLiveGames(data))
      .catch((error) => console.error("Error fetching live games:", error));
  };

  useEffect(() => {
    // Fetch live games data on component load
    fetchLiveGames();
  }, []);

  const selectGame = (gameId) => {
    // Fetch game details when a game is selected
    fetch(`/get_game_details/${gameId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setSelectedGame(data);
      })
      .catch((error) => console.error("Error fetching game details:", error));
  };

  return (
    <div className="live-games-container">
      <h2>Live Games</h2>
      <div className="game-list">
        {liveGames.length === 0 ? (
          <p>No live games available.</p>
        ) : (
          liveGames.map((game) => (
            <div
              key={game.gameId}
              className={`game-item ${
                selectedGame?.gameId === game.gameId ? "active" : ""
              }`}
              onClick={() => selectGame(game.gameId)}
            >
              <p>
                {game.awayTeam} vs. {game.homeTeam}
              </p>
              {/* Add this line */}
            </div>
          ))
        )}
      </div>

      <div className="game-details">
        <h2>Game Details</h2>
        {selectedGame ? (
          <div>
            <h3>
              Score: {selectedGame.awayTeam?.teamName} -{" "}
              {selectedGame.awayTeam?.score} @ {selectedGame.homeTeam?.teamName}{" "}
              - {selectedGame.homeTeam?.score}
            </h3>

            {/* Home Team Player Stats */}
            {selectedGame.homeTeam && selectedGame.awayTeam && (
              <div>
                <h3>Home Team Player Stats</h3>
                <div className="stats-table-container">
                  <div className="table-scroll">
                    <table className="stats-table">
                      <thead>
                        <tr>
                          {columnTitles.map((columnTitle, index) => (
                            <th key={index}>{columnTitle}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGame.homeTeam.players.map((playerData) => (
                          <tr key={playerData.personId}>
                            {playerInfo.map((column) => (
                              <td key={column}>
                                {column === "played"
                                  ? formatGameDetail(column, playerData[column])
                                  : typeof playerData[column] === "object"
                                  ? JSON.stringify(playerData[column])
                                  : playerData[column]}
                              </td>
                            ))}
                            {playerStatistics.map((column) => (
                              <td key={column}>
                                {formatGameDetail(
                                  column,
                                  playerData.statistics[column]
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Away Team Player Stats */}
            {selectedGame.awayTeam && (
              <div>
                <h3>Away Team Player Stats</h3>
                <div className="stats-table-container">
                  <div className="table-scroll">
                    <table className="stats-table">
                      <thead>
                        <tr>
                          {columnTitles.map((columnTitle, index) => (
                            <th key={index}>{columnTitle}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGame.awayTeam.players.map((playerData) => (
                          <tr key={playerData.personId}>
                            {playerInfo.map((column) => (
                              <td key={column}>
                                {typeof playerData[column] === "object"
                                  ? JSON.stringify(playerData[column])
                                  : playerData[column]}
                              </td>
                            ))}
                            {playerStatistics.map((column) => (
                              <td key={column}>
                                {formatGameDetail(
                                  column,
                                  playerData.statistics[column]
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Select a game to view details</p>
        )}
      </div>
    </div>
  );
}

export default LiveGames;
