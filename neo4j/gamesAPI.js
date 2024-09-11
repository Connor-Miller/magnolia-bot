const Neo4jHandler = require('./neo4jHandler');

class GamesAPI {
  constructor(uri, user, password) {
    this.neo4jHandler = new Neo4jHandler(uri, user, password);
  }

  async deleteGame(gameName) {
    const query = `
      MATCH (g:Game {name: $name})
      DETACH DELETE g
    `;

    const params = {
      name: String(gameName)
    };

    try {
      const result = await this.neo4jHandler.executeQuery(query, params);
      if (result.summary.counters.nodesDeleted() > 0) {
        return true; // Game was successfully deleted
      } else {
        return false; // No game found with the given name
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }


  async addGame(game) {
    const query = `
      CREATE (g:Game {
        name: $name,
        addDate: $addDate,
        lastPlayed: $lastPlayed,
        platform: $platform
      })
      WITH g
      MERGE (p:Person {username: $addBy})
      CREATE (g)-[:ADDED_BY]->(p)
    `;

    const params = {
      name: String(game.name),
      addDate: game.addDate instanceof Date ? game.addDate.toISOString() : new Date().toISOString(),
      addBy: String(game.addBy || ''),
      lastPlayed: game.lastPlayed instanceof Date ? game.lastPlayed.toISOString() : null,
      platform: String(game.platform),
    };

    await this.neo4jHandler.executeQuery(query, params, true);
  }

  async getAllGames() {
    const query = `
      MATCH (g:Game)
      RETURN g
    `;

    const result = await this.neo4jHandler.executeQuery(query);
    const games = result.records.map(record => record.get('g').properties);
    return games;
  }

  async getRandomGame() {
    const query = `
      MATCH (g:Game)
      RETURN g, rand() as r
      ORDER BY r
      LIMIT 1
    `;

    const result = await this.neo4jHandler.executeQuery(query);
    const game = result.records[0].get('g').properties;
    return game;
  }

  async playGame(game) {
    const query = `
      MATCH (g:Game {name: $name, platform: $platform})
      SET g.lastPlayed = $lastPlayed
    `;

    const params = {
      name: String(game.name),
      platform: String(game.platform),
      lastPlayed: new Date().toISOString(),
    };

    await this.neo4jHandler.executeQuery(query, params, true);
  }

  async close() {
    await this.neo4jHandler.close();
  }
}

module.exports = GamesAPI;
