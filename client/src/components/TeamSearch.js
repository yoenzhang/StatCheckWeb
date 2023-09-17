import React, { Component } from "react";
import "./TeamSearch.css";

const gameColumns = [
  "SEASON_ID",
  "GAME_DATE",
  "MATCHUP",
  "WL",
  "MIN",
  "PLUS_MINUS",
];

const columnTitles = ["SEASON", "DATE", "MATCHUP", "WL", "MIN", "+/-"];

const formatStat = (statName, statValue) => {
  if (statName.includes("_PCT")) {
    return `${(statValue * 100).toFixed(1)}%`;
  }

  if (statName === "SEASON_ID" && typeof statValue === "string") {
    return statValue.substring(1);
  }

  return statValue;
};

class TeamSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamName: "",
      statsAvailable: false,
      logsToShow: {
        regular: 5,
        playoff: 5,
        preseason: 5,
        playin: 5,
      },
      gameLogs: {
        regular: [],
        playoff: [],
        preseason: [],
        playin: [],
      },
      loading: false,
    };
  }

  fetchTeamGames = (seasonType) => {
    this.setState({ loading: true });

    const { teamName } = this.state;

    fetch("/get_team_games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team: teamName,
        season_type: seasonType,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(`Received ${seasonType} game log data:`, data);

        const gameLogsArray = Object.values(data);
        const gameLogs = { ...this.state.gameLogs };
        gameLogs[seasonType] = gameLogsArray;
        this.setState({ gameLogs, statsAvailable: true, loading: false });
      })
      .catch((error) => {
        console.error(`Error fetching ${seasonType} game logs:`, error);
        this.setState({ statsAvailable: false, loading: false });
      });
  };

  handleTeamNameChangeInput = (event) => {
    this.setState({ teamName: event.target.value });
  };

  fetchGames = () => {
    this.fetchTeamGames("Regular Season");
    this.fetchTeamGames("Playoffs");
    this.fetchTeamGames("Pre Season");
    this.fetchTeamGames("PlayIn");
  };

  handleKeyUp = (event) => {
    if (event.key === "Enter") {
      this.fetchGames();
    }
  };

  handleLogsExpand = (seasonType) => {
    const { logsToShow } = this.state;
    this.setState((prevState) => ({
      logsToShow: {
        ...prevState.logsToShow,
        [seasonType]: !logsToShow[seasonType],
      },
    }));
  };

  showMoreLogs = (seasonType) => {
    this.setState((prevState) => ({
      logsToShow: {
        ...prevState.logsToShow,
        [seasonType]: prevState.logsToShow[seasonType] + 5,
      },
    }));
  };

  renderGamesTable(seasonType) {
    const { logsToShow, gameLogs } = this.state;
    const games = gameLogs[seasonType];

    if (games && games.length > 0) {
      const showMore = logsToShow[seasonType];
      const displayedGames = showMore ? games : games.slice(0, 5);

      return (
        <div className="stats-table-container">
          <div className="stats-header">
            <h3>{seasonType} Games</h3>
            <div className="button-container">
              <button onClick={() => this.handleLogsExpand(seasonType)}>
                {showMore ? "Show Less Games" : "Show More Games"}
              </button>
            </div>
          </div>
          <div className="table-scroll">
            <table className="stats-table">
              <tbody>
                <tr>
                  {columnTitles.map((stat, index) => (
                    <th key={index}>{stat}</th>
                  ))}
                </tr>
                {displayedGames.map((game, gameIndex) => (
                  <tr key={gameIndex}>
                    {gameColumns.map((stat, index) => (
                      <td key={index} className="stat-cell">
                        {formatStat(stat, game[stat])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  }

  render() {
    const { teamName, statsAvailable, loading } = this.state;

    return (
      <div className="search-container">
        <span className="annotation">
          *Please note, abbreviations for teams must be{" "}
          <strong>official</strong> (eg. CHI for Chicago Bulls, MAVS will not
          work for Dallas Mavericks)*
        </span>
        <h2>Teams Search</h2>
        <input
          type="text"
          placeholder="Enter a Team Name (eg. Raptors)"
          value={teamName}
          onChange={this.handleTeamNameChangeInput}
          onKeyUp={this.handleKeyUp}
        />
        <button onClick={this.fetchGames}>Search Stats</button>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : statsAvailable ? (
          <div>
            {this.renderGamesTable("Regular Season")}
            {this.renderGamesTable("Playoffs")}
            {this.renderGamesTable("Pre Season")}
            {this.renderGamesTable("PlayIn")}
          </div>
        ) : (
          <div className="no-stats">No game logs to display</div>
        )}
      </div>
    );
  }
}

export default TeamSearch;
