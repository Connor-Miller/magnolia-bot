const neo4j = require('neo4j-driver');

class Neo4jHandler {
  constructor(uri, username, password) {
    this.uri = uri;
    this.username = username;
    this.password = password;
    this.driver = null;
  }

  formatResult(result) {
    return result.records.map(record => 
      record.keys.map(key => `${key}: ${record.get(key)}`).join(', ')
    ).join('\n');
  }

  async connect() {
    if (!this.driver) {
      this.driver = neo4j.driver(this.uri, neo4j.auth.basic(this.username, this.password));
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
    }
  }

  async executeQuery(query, params = {}, format = false) {
    if (!this.driver) {
      await this.connect();
    }

    const session = this.driver.session();
    try {
      const result = await session.run(query, params);


      if (format) {
        return this.formatResult(result);
      }
      return result;
      
    } catch (error) {
      console.error('Neo4j query error:', error);
      if (error.code === 'ServiceUnavailable') {
        // If the error is due to service unavailability, try to reconnect
        await this.close();
        await this.connect();
        // Retry the query once
        return await session.run(query, params);
      }
      throw new Error('An error occurred while executing the query.');
    } finally {
      await session.close();
    }
  }
}

module.exports = Neo4jHandler;
