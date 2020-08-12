import { API } from 'space-api';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { setContext } from 'apollo-link-context';
import { getMainDefinition } from 'apollo-utilities';
import gql from 'graphql-tag';

const initGraphQLClient = (httpURL, websocketURL, onWSReconnect) => {
  // Create an http link for GraphQL client:
  const httpLink = new HttpLink({
    uri: httpURL
  });

  // Create a WebSocket link for GraphQL client:
  const wsLink = new WebSocketLink({
    uri: websocketURL,
    options: {
      reconnect: true
    }
  })

  wsLink.subscriptionClient.onReconnected(onWSReconnect)

  const subscriptionMiddleware = {
    applyMiddleware: async (options, next) => {
      options.authToken = getToken()
      next()
    }
  }

  // add the middleware to the web socket link via the Subscription Transport client
  wsLink.subscriptionClient.use([subscriptionMiddleware])

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  const httpAuthLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = getToken()
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : ""
      }
    }
  });

  const defaultOptions = {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore'
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }
  }

  // Create a GraphQL client:
  const graphQLClient = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link: httpAuthLink.concat(link),
    defaultOptions: defaultOptions
  });

  return { graphQLClient, wsLink, httpLink }
}

function getToken() {
  return localStorage.getItem("token")
}

class Service {
  constructor(projectId, spaceAPIURL, graphqlHTTPURL, graphqlWebsocketURL) {
    this.todos = []
    const { graphQLClient, wsLink } = initGraphQLClient(graphqlHTTPURL, graphqlWebsocketURL, () => this.todos = [])
    this.api = new API(projectId, spaceAPIURL);
    this.db = this.api.DB("mydb");
    this.graphQLCLient = graphQLClient;
    this.wsLink = wsLink;
    this.setUserId(localStorage.getItem("userId"))
    this.setToken(localStorage.getItem("token"))
  }

  getToken() {
    return this.token;
  }

  setUserId(userId) {
    this.userId = userId;
    localStorage.setItem("userId", userId);
  }

  setToken(token) {
    this.api.setToken(token)
    localStorage.setItem("token", token);
  }

  login(username, pass) {
    return new Promise((resolve, reject) => {
      this.db.signIn(username, pass).then(res => {
        // Check if login was successfull
        if (res.status !== 200) {
          reject(res.data.error)
          return
        }

        this.setUserId(res.data.user._id)
        this.setToken(res.data.token)

        resolve()
      }).catch(ex => reject(ex))
    })
  }

  signUp(username, name, pass) {
    return new Promise((resolve, reject) => {
      this.db.signUp(username, name, pass, 'user').then(res => {
        // Check if signup was successfull
        if (res.status !== 200) {
          reject(res.data.error)
          return
        }

        this.setUserId(res.data.user._id)
        this.setToken(res.data.token)

        resolve()
      }).catch(ex => reject(ex))
    })
  }

  addTodo(value) {
    return new Promise((resolve, reject) => {
      const todos = [{ _id: this.generateId(), value: value, isCompleted: false, userId: this.userId }]
      this.graphQLCLient.mutate({
        mutation: gql`
        mutation {
          insert_todos(docs: $todos) @mydb {
            status
            error
            returning
          }
        }`,
        variables: { todos }
      }).then(({ data }) => {
        if (data.insert_todos.status !== 200) {
          reject(data, data.insert_todos.error)
          return
        }
        resolve()
      }).catch(ex => reject(ex))
    })
  }

  updateTodo(todoId, isCompleted) {
    return new Promise((resolve, reject) => {
      this.graphQLCLient.mutate({
        mutation: gql`
        mutation {
          update_todos(where: {_id: {_eq: $todoId}}, set: {isCompleted: $isCompleted}) @mydb {
            status
            error
            returning
          }
        }`,
        variables: { todoId, isCompleted }
      }).then(({ data }) => {
        if (data.update_todos.status !== 200) {
          reject(data, data.update_todos.error)
          return
        }
        resolve()
      }).catch(ex => reject(ex))
    })
  }

  deleteTodo(todoId) {
    return new Promise((resolve, reject) => {
      this.graphQLCLient.mutate({
        mutation: gql`
        mutation {
          delete_todos(where: {_id: {_eq: $todoId}}) @mdb {
            status
            error
            returning
          }
        }`,
        variables: { todoId }
      }).then(({ data }) => {
        if (data.delete_todos.status !== 200) {
          reject(data, data.delete_todos.error)
          return
        }
        resolve()
      }).catch(ex => reject(ex))
    })
  }

  subscribeToTodos(cb, onError) {
    return this.graphQLCLient.subscribe({
      query: gql`
      subscription {
        todos(where: {userId: {_eq: $userId}}) @mydb{
          type
          payload
          find {
            _id
          }
        }
      }`,
      variables: {
        userId: this.userId
      }
    }).subscribe(({ data }) => {
      const { type, payload, find } = data.todos

      switch (type) {
        case "initial":
        case "insert":
          this.todos = [...this.todos, payload]
          break;
        case "update":
          this.todos = this.todos.map(obj => obj._id === find._id ? payload : obj)
          break
        case "delete":
          this.todos = this.todos.filter(obj => obj._id !== find._id)
          break
      }
      cb(this.todos)
    }, error => onError(error.message))
  }

  generateId = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}

export default Service