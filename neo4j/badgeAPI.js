const Neo4jHandler = require('./neo4jHandler');

class BadgeAPI {
  constructor(uri, user, password) {
    this.neo4jHandler = new Neo4jHandler(uri, user, password);
  }

  async deleteBadge(badgeName) {
    const query = `
      MATCH (b:Badge {name: $name})
      DETACH DELETE b
    `;

    const params = {
      name: String(badgeName)
    };

    try {
      const result = await this.neo4jHandler.executeQuery(query, params);
      if (result.summary.counters.nodesDeleted() > 0) {
        return true; // Badge was successfully deleted
      } else {
        return false; // No badge found with the given name
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      throw error;
    }
  }


  async addBadge(badge) {
    const query = `
      CREATE (b:Badge {
        type: $type,
      })
        return b
      `;

    const params = {
      type: String(badge.type),
    };

    await this.neo4jHandler.executeQuery(query, params, true);
  }

  async getAllBadges() {
    const query = `
      MATCH (b:Badge)
      RETURN b
    `;

    const result = await this.neo4jHandler.executeQuery(query);
    const badges = result.records.map(record => record.get('b').properties);
    return badges;
  }




  async close() {
    await this.neo4jHandler.close();
  }
}

module.exports = BadgeAPI;
