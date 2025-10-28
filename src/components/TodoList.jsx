import React from "react";
import TodoItem from "./TodoItem";

function TodoList({ todos, removeTodo, updateTodo }) {
  if (!todos.length) return <p>No todos yet.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} removeTodo={removeTodo} updateTodo={updateTodo} />
      ))}
    </ul>
  );
}

export default TodoList;
