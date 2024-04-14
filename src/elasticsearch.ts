import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@gateway/config';
import { winstonLogger } from '@wrightkhlebisol/jobber-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'gateway-elastic-search-server',
  'debug',
);

class ElasticSearch {

  private elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`,
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;

    while (!isConnected) {
      log.info('GatewayService connecting to ElasticSearch...');

      try {
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
        log.info(`GatewayService ElasticSearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        log.error('Connection to Elasticsearch failed, retrying...');
        log.log('error', 'GatewayService ElasticSearch checkConnection() method error:', error);
      }
    }
  }
}

export const elasticSearch: ElasticSearch = new ElasticSearch();