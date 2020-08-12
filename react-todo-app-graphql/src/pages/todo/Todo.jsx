import React, { useState, useEffect } from 'react'
import './todo.css'
import { Link } from "react-router-dom";
import client from "../../client"

function Todo() {
  const [value, setValue] = useState('');
  const [list, setList] = useState([]);

  useEffect(() => {
    const subscription = client.subscribeToTodos(setList, errMsg => alert("Error subscribing to todos: " + errMsg))
      return function cleanup() {
        subscription.unsubscribe()
      }
  }, [0]);

  const handleAddTodo = () => {
    client.addTodo(value).catch(ex => alert("Error adding todo: " + ex.toString()))
    setValue("")
  }

  const handleUpdateTodo = ({ _id, isCompleted }) => {
    client.updateTodo(_id, !isCompleted).catch(ex => alert("Error updating todo: " + ex.toString()))
  }

  const handleDeleteTodo = (todoId) => {
    client.deleteTodo(todoId).catch(ex => alert("Error deleting todo: " + ex.toString()))
  }

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo()
    }
  }

  return (
    <div className="todo-app">
      <div className="add-todo">
        <Link to="/">
          <i className="material-icons">arrow_back</i>
        </Link>
        <h2>To-do App</h2>
        <div className="todo-flex">
          <div>Add a task:</div>
          <div className="todo-flex">
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={handleEnter}></input>
            <button type="button" onClick={handleAddTodo} disabled={!value}>Add</button>
          </div>
        </div>
      </div>
      <div>
        {list.map((item) => (
          <div key={item._id} className="single-todo">
            <input className="checkbox" onChange={() => handleUpdateTodo(item)} checked={item.isCompleted} type="checkbox" />
            <span className="todo-item">{item.value}</span>
            <i className="material-icons delete" onClick={() => handleDeleteTodo(item._id)}>delete</i>
          </div>)
        )}
      </div>
    </div>
  )
}

export default Todo
