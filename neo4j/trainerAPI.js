const Neo4jHandler = require('./neo4jHandler');

class TrainerAPI {
  constructor(uri, user, password) {
    this.neo4jHandler = new Neo4jHandler(uri, user, password);
  }

  async deleteTrainer(trainerName) {
    const query = `
      MATCH (t:Trainer {name: $name})
      DETACH DELETE t
    `;

    const params = {
      name: String(trainerName)
    };

    try {
      const result = await this.neo4jHandler.executeQuery(query, params);
      if (result.summary.counters.nodesDeleted() > 0) {
        return true; // Trainer was successfully deleted
      } else {
        return false; // No trainer found with the given name
      }
    } catch (error) {
      console.error('Error deleting trainer:', error);
      throw error;
    }
  }


  async addTrainer(trainer) {
    const query = `
      CREATE (t:Trainer {
        discordId: $discordId,
        discordMention: $discordMention,
        serverName: $serverName,
        vpTotal: $vpTotal,

      })
        return t
      `;

    const params = {
      discordId: String(trainer.discordId),
      discordMention: String(trainer.discordMention),
      serverName: String(trainer.serverName),
      vpTotal: Number(trainer.vpTotal ?? 0),
    };

    await this.neo4jHandler.executeQuery(query, params, true);
  }

  async getAllTrainers() {
    const query = `
      MATCH (t:Trainer)
      RETURN t
    `;

    const result = await this.neo4jHandler.executeQuery(query);
    const trainers = result.records.map(record => record.get('t').properties);
    return trainers;
  }

  async updateVPTotal(discordId, vpToAdd) {
    const query = `
      MATCH (t:Trainer {discordId: $discordId})
      SET t.vpTotal = coalesce(t.vpTotal, 0) + $vpToAdd
      RETURN t
    `;

    const params = {
      discordId: discordId, // No need to convert to String if it's already a string
      vpToAdd: Number(vpToAdd),
    };

    console.log('Updating VP for discordId:', discordId, 'Adding VP:', vpToAdd);
    const result = await this.neo4jHandler.executeQuery(query, params);

    if (result.records.length === 0) {
      console.log('No trainer found with discordId:', discordId);
      return 0;
    }

    const updatedTrainer = result.records[0].get('t').properties;
    console.log('Updated trainer:', updatedTrainer);
    return updatedTrainer.vpTotal;
  }

  async getVPTotal(trainerId) {
    const query = `
      MATCH (t:Trainer {discordId: $discordId})
      RETURN t.vpTotal
    `;

    const params = {
      discordId: String(trainerId)
    };

    const result = await this.neo4jHandler.executeQuery(query, params);
    const vpTotal = result.records.map(record => record.get('t.vpTotal'));
    return vpTotal ?? 0;
  }

  async close() {
    await this.neo4jHandler.close();
  }
}

module.exports = TrainerAPI;
