const Neo4jHandler = require('./neo4jHandler');

class BadgeAwardsAPI {
  constructor(uri, user, password) {
    this.neo4jHandler = new Neo4jHandler(uri, user, password);

  }

  async deleteBadgeAward(badgeAwardId) {
    const query = `
      MATCH (b:BadgeAward {id: $id})

      DETACH DELETE b
    `;

    const params = {
      id: String(badgeAwardId)
    };


    try {
      const result = await this.neo4jHandler.executeQuery(query, params);
      if (result.summary.counters.nodesDeleted() > 0) {
        return true; // BadgeAward was successfully deleted
      } else {
        return false; // No badge award found with the given id

      }
    } catch (error) {
      console.error('Error deleting badge award:', error);
      throw error;
    }
  }


  async addBadgeAward(badgeAward) {
    const query = `
      MERGE (awardedBy:Trainer {discordId: $awardedBy.discordId})
      ON CREATE SET awardedBy = $awardedBy
      
      MERGE (awardedTo:Trainer {discordId: $awardedTo.discordId})
      ON CREATE SET awardedTo = $awardedTo
      
      MERGE (badge:Badge {type: $badgeType})
      
      CREATE (b:BadgeAward {
        location: $location,
        timestamp: $timestamp
      })
      
      CREATE (b)-[:AWARDED_BY]->(awardedBy)
      CREATE (b)-[:AWARDED_TO]->(awardedTo)
      CREATE (b)-[:IS_TYPE]->(badge)
      
      RETURN b
    `;

    const params = {
      location: String(badgeAward.location),
      timestamp: String(badgeAward.timestamp),
      awardedBy: badgeAward.awardedBy,
      awardedTo: badgeAward.awardedTo,
      badgeType: String(badgeAward.type)
    };

    await this.neo4jHandler.executeQuery(query, params, true);
  }

  async getAllBadgeAwards() {
    const query = `
      MATCH (b:BadgeAward)

      RETURN b
    `;

    const result = await this.neo4jHandler.executeQuery(query);
    const badgeAwards = result.records.map(record => record.get('b').properties);
    return badgeAwards;
  }
  async getBadgeAwardsByTrainer(trainerId) {
    const query = `
      MATCH (b:BadgeAward)-[:AWARDED_TO]->(t:Trainer {discordId: $trainerId})
      MATCH (b)-[:IS_TYPE]->(badge:Badge)
      RETURN b, badge.type AS type
    `;

    const params = {
      trainerId: String(trainerId)
    };

    const result = await this.neo4jHandler.executeQuery(query, params);
    const badgeAwards = result.records.map(record => ({
      ...record.get('b').properties,
      type: record.get('type')
    }));
    return badgeAwards;
  }







  async close() {
    await this.neo4jHandler.close();
  }
}

module.exports = BadgeAwardsAPI;
