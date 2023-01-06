const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(2000, () => {
      console.log("server is running at http://localhost:2000/");
    });
  } catch (e) {
    console.log(`db error is ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// 1. GET ALL PLAYERS IN TEAM

app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT
    player_id AS playerId,
    player_name AS playerName,
    jersey_number AS jerseyNumber,
    role
    FROM
    cricket_team
    `;
  const getAllPlayersArray = await db.all(getAllPlayersQuery);
  response.send(getAllPlayersArray);
});

// 2. CREATE NEW PLAYER IN TEAM

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetails = `
    INSERT INTO
    cricket_team (player_name,jersey_number,role)
    VALUES
    (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    )`;
  const dbResponse = await db.run(addPlayerDetails);
  response.send("Player Added to Team");
});

// 3. GET SINGLE PLAYER

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT
    player_id AS playerId,
    player_name AS playerName,
    jersey_number AS jerseyNumber,
    role
    FROM
    cricket_team
    WHERE
    player_id = ${playerId}
    `;
  const getPlayerArray = await db.get(getPlayer);
  response.send(getPlayerArray);
});

// 4. UPDATE PLAYER DETAILS

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerDetails = `
    UPDATE
    cricket_team
    SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE
    player_id = ${playerId}
    `;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//5. DELETE PLAYER FROM TEAM

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetails = `
    DELETE FROM
    cricket_team
    WHERE
    player_id = ${playerId}
    `;
  const deletePlayer = await db.run(deletePlayerDetails);
  response.send("Player Removed");
});
module.exports = app;
