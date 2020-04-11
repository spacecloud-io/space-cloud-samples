import Service from './services/service';

const GRAPHQL_HTTP_URL = 'http://localhost:4122/v1/api/todoapp/graphql'
const GRAPHQL_WEBSOCKET_URL = 'ws://localhost:4122/v1/api/todoapp/graphql/socket'
const SPACE_API_URL = 'http://localhost:4122'
const client = new Service('todoapp', SPACE_API_URL, GRAPHQL_HTTP_URL, GRAPHQL_WEBSOCKET_URL);
export default client;