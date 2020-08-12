import { API, cond } from 'space-api';

class Service {
  constructor(projectId, spaceAPIURL) {
    this.api = new API(projectId, spaceAPIURL);
    this.db = this.api.DB("mydb");
    this.setUserId(localStorage.getItem("userId"))
    this.setToken(localStorage.getItem("token"))
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
          console.log("Error", res, res.data.error)
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
      const todo = { _id: this.generateId(), value: value, isCompleted: false, userId: this.userId }
      this.db.insert("todos").doc(todo).apply().then((res) => {
        if (res.status !== 200) {
          reject(res.data.error)
          return
        }

        resolve()
      }).catch(ex => reject(ex))
    })
  }

  updateTodo(todoId, isCompleted) {
    return new Promise((resolve, reject) => {
      const whereClause = cond("_id", "==", todoId)
      this.db.update("todos").where(whereClause).set({ isCompleted }).apply().then((res) => {
        if (res.status !== 200) {
          reject(res.data.error)
          return
        }

        resolve()
      }).catch(ex => reject(ex))
    })
  }

  deleteTodo(todoId) {
    return new Promise((resolve, reject) => {
      const whereClause = cond("_id", "==", todoId)
      this.db.delete("todos").where(whereClause).apply().then((res) => {
        if (res.status !== 200) {
          reject(res.data.error)
          return
        }

        resolve()
      }).catch(ex => reject(ex))
    })
  }

  subscribeToTodos(onSnapshot, onError) {
    const whereClause = cond("userId", "==", this.userId)
    return this.db.liveQuery("todos")
      .where(whereClause).subscribe(onSnapshot, onError)
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