import Service from './services/service';

const SPACE_API_URL = 'http://localhost:4122'
const client = new Service('todoapp', SPACE_API_URL);
export default client;