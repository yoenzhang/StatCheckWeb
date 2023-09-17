import React, { Component } from "react";
import "./PlayerSearch.css";

const offensiveColumns = [
  "MIN",
  "PTS",
  "AST",
  "REB",
  "BLK",
  "STL",
  "OREB",
  "DREB",
  "FGA",
  "FGM",
  "FG_PCT",
  "FTA",
  "FTM",
  "FT_PCT",
  "FG3A",
  "FG3M",
  "FG3_PCT",
  "PF",
  "TOV",
];

const offensiveTitles = [
  "MIN",
  "PTS",
  "AST",
  "REB",
  "BLK",
  "STL",
  "OREB",
  "DREB",
  "FGA",
  "FGM",
  "FG %",
  "FTA",
  "FTM",
  "FT %",
  "FG3A",
  "FG3M",
  "FG3 %",
  "PF",
  "TOV",
];

const careerColumns = ["GP", "GS", ...offensiveColumns];

const careerTitles = ["GP", "GS", ...offensiveTitles];

const seasonColumns = [
  "PLAYER_AGE",
  "TEAM_ABBREVIATION",
  "SEASON_ID",
  ...careerColumns,
];

const seasonTitles = ["AGE", "TEAM", "SEASON", ...careerTitles];

const gameLogColumns = [
  "GAME_DATE",
  "MATCHUP",
  "WL",
  ...offensiveColumns,
  "PLUS_MINUS",
];

const gameLogTitles = ["DATE", "MATCHUP", "WL", ...offensiveTitles, "+/-"];

const formatStat = (statName, statValue) => {
  if (statName.includes("_PCT")) {
    return `${(statValue * 100).toFixed(1)}%`;
  }
  return statValue;
};

class PlayerSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playerCareerData: {},
      playerSeasonData: {},
      playerNameInput: "",
      statsAvailable: false,
      logsToShow: 5, // Track the number of logs to display
      gameLogData: {},
      gameLogsToShow: 5,
    };
  }

  fetchCareerStats = () => {
    const { playerNameInput } = this.state;

    fetch("/get_stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerFullName: playerNameInput,
        statType: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Received career stats data:", data);
        this.setState({ playerCareerData: data, statsAvailable: true });
      })
      .catch((error) => {
        console.error("Error fetching career stats:", error);
        this.setState({ statsAvailable: false });
      });
  };

  fetchSeasonStats = () => {
    const { playerNameInput } = this.state;

    fetch("/get_stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerFullName: playerNameInput,
        statType: 0,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Received season stats data:", data);
        this.setState({ playerSeasonData: data, statsAvailable: true });
      })
      .catch((error) => {
        console.error("Error fetching season stats:", error);
        this.setState({ statsAvailable: false });
      });
  };

  fetchGameLogs = () => {
    const { playerNameInput } = this.state;

    fetch("/get_game_logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerFullName: playerNameInput,
        season: "2022-23",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Received gamelog data:", data);
        this.setState({ gameLogData: data, statsAvailable: true });
      })
      .catch((error) => {
        console.error("Error fetching season stats:", error);
        this.setState({ statsAvailable: false });
      });
  };

  handlePlayerNameInputChange = (event) => {
    this.setState({ playerNameInput: event.target.value });
  };

  fetchStats = () => {
    this.fetchCareerStats();
    this.fetchSeasonStats();
    this.fetchGameLogs();
  };

  handleKeyUp = (event) => {
    if (event.key === "Enter") {
      this.fetchStats();
    }
  };

  handleLogsExpand = () => {
    this.setState((prevState) => ({
      showMoreLogs: !prevState.showMoreLogs, // Toggle showMoreLogs between true and false
    }));
  };

  showMoreLogs = () => {
    this.setState((prevState) => ({
      logsToShow: prevState.logsToShow + 5,
    }));
  };

  handleGameLogsExpand = () => {
    this.setState((prevState) => ({
      showMoreGameLogs: !prevState.showMoreGameLogs, // Toggle showMoreGameLogs between true and false
    }));
  };

  showMoreGameLogs = () => {
    this.setState((prevState) => ({
      gameLogsToShow: prevState.gameLogsToShow + 5,
    }));
  };

  render() {
    const {
      playerCareerData,
      playerSeasonData,
      gameLogData,
      playerNameInput,
      statsAvailable,
      logsToShow,
      gameLogsToShow,
      showMoreLogs,
      showMoreGameLogs,
    } = this.state;

    let playerLogs = null;

    if (playerSeasonData && playerSeasonData["PLAYER_ID"]) {
      playerLogs = Object.keys(playerSeasonData["PLAYER_ID"])
        .map((seasonIndex) => {
          return (
            <tr key={seasonIndex}>
              {seasonColumns.map((stat, index) => (
                <td key={index} className="stat-cell">
                  {formatStat(stat, playerSeasonData[stat][seasonIndex])}
                </td>
              ))}
            </tr>
          );
        })
        .slice(0, showMoreLogs ? undefined : logsToShow);
    }

    let gameLogs = null;

    if (gameLogData && gameLogData["PLAYER_ID"]) {
      gameLogs = Object.keys(gameLogData["PLAYER_ID"])
        .map((gameIndex) => {
          return (
            <tr key={gameIndex}>
              {seasonColumns.map((stat, index) => (
                <td key={index} className="stat-cell">
                  {formatStat(stat, playerSeasonData[stat][gameIndex])}
                </td>
              ))}
            </tr>
          );
        })
        .slice(0, showMoreGameLogs ? undefined : gameLogsToShow);
    }

    return (
      <div className="search-container">
        <h2>Player Search</h2>
        <input
          type="text"
          placeholder="Enter Player Full Name"
          value={playerNameInput}
          onChange={this.handlePlayerNameInputChange}
          onKeyUp={this.handleKeyUp}
        />
        <button onClick={this.fetchStats}>Search Stats</button>

        {statsAvailable ? (
          <div>
            {Object.keys(playerCareerData).length > 0 && (
              <div className="stats-table-container">
                <h3 className="stats-header">Player Career Stats</h3>
                <div className="table-scroll">
                  <table className="stats-table">
                    <tbody>
                      <tr>
                        {careerTitles.map((stat, index) => (
                          <th key={index}>{stat}</th>
                        ))}
                      </tr>
                      <tr>
                        {careerColumns.map((stat, index) => (
                          <td key={index} className="stat-cell">
                            {formatStat(stat, playerCareerData[stat][0])}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {playerLogs && playerLogs.length > 0 && (
              <div className="stats-table-container">
                <div className="stats-header">
                  <h3>Player Season Stats</h3>
                  <div className="button-container">
                    <button onClick={this.handleLogsExpand}>
                      {showMoreLogs ? "Show Less Logs" : "Show More Logs"}
                    </button>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="stats-table">
                    <tbody>
                      <tr>
                        {seasonTitles.map((stat, index) => (
                          <th key={index}>{stat}</th>
                        ))}
                      </tr>
                      {playerLogs}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {gameLogData && Object.keys(gameLogData).length > 0 && (
              <div className="stats-table-container">
                <div className="stats-header">
                  <h3>Player Game Logs</h3>
                  <div className="button-container">
                    <button onClick={this.handleGameLogsExpand}>
                      {showMoreGameLogs ? "Show Less Logs" : "Show More Logs"}
                    </button>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="stats-table">
                    <tbody>
                      <tr>
                        {gameLogTitles.map((stat, index) => (
                          <th key={index}>{stat}</th>
                        ))}
                      </tr>
                      {Object.keys(gameLogData)
                        .slice(0, showMoreGameLogs ? undefined : gameLogsToShow) // Add this line to limit the number of logs
                        .map((gameIndex) => (
                          <tr key={gameIndex}>
                            {gameLogColumns.map((stat, index) => (
                              <td key={index} className="stat-cell">
                                {formatStat(stat, gameLogData[gameIndex][stat])}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-stats">No player stats to display</div>
        )}
      </div>
    );
  }
}

export default PlayerSearch;
