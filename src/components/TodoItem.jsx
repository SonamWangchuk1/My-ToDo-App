import React, { useState } from "react";

function TodoItem({ todo, removeTodo, updateTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  const handleUpdate = () => {
    if (!text.trim()) return;
    updateTodo(todo.id, text);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      removeTodo(todo.id);
    }
  };

  return (
    <li style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {isEditing ? (
        <input type="text" value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, marginRight: "0.5rem", padding: "0.25rem" }} />
      ) : (
        <span>{todo.text}</span>
      )}
      <div>
        {isEditing ? (
          <button onClick={handleUpdate} style={{ marginRight: "0.5rem" }}>Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ marginRight: "0.5rem" }}>Edit</button>
        )}
        <button onClick={handleDelete} style={{ color: "red" }}>Delete</button>
      </div>
    </li>
  );
}

export default TodoItem;
