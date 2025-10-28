import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Home() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [user, setUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // Subscribe to auth
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(u => {
      if (!u) navigate("/login");
      else setUser(u);
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  // Subscribe to Firestore todos after user is available
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "todos"), where("userId", "==", user.uid));
    const unsubscribeTodos = onSnapshot(q, snapshot => {
      const userTodos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodos(userTodos);
    });

    return () => unsubscribeTodos();
  }, [user]);

  const addTodo = async () => {
    const task = newTask.trim();
    if (!task || !user) return;
    setNewTask("");

    try {
      await addDoc(collection(db, "todos"), { text: task, userId: user.uid });
    } catch (err) {
      console.error("Failed to add todo:", err);
      alert("Failed to add task.");
    }
  };

  const removeTodo = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    setDeletingId(id); // Disable button while deleting

    try {
      await deleteDoc(doc(db, "todos", id));
      // UI will update automatically via onSnapshot
    } catch (err) {
      console.error("Failed to delete todo:", err);
      alert("Failed to delete the task.");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = async (id) => {
    const text = editingText.trim();
    if (!text) return;
    setEditingId(null);
    setEditingText("");

    try {
      await updateDoc(doc(db, "todos", id), { text });
      // UI will update automatically via onSnapshot
    } catch (err) {
      console.error("Failed to update todo:", err);
      alert("Failed to update the task.");
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center" }}>
      <h1 style={{ marginBottom: "20px" }}>My Todo App</h1>
      <button onClick={handleLogout} style={{ marginBottom: "20px", padding: "8px 16px", borderRadius: "5px", cursor: "pointer" }}>Logout</button>

      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
        <input
          type="text"
          placeholder="Add new task"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTodo()}
          style={{ padding: "10px", width: "70%", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button onClick={addTodo} style={{ padding: "10px 20px", marginLeft: "10px", borderRadius: "5px", backgroundColor: "#1976d2", color: "#fff", border: "none", cursor: "pointer" }}>Add</button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.length === 0 ? <p>No tasks yet.</p> : todos.map(todo => (
          <li key={todo.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
            {editingId === todo.id ? (
              <>
                <input value={editingText} onChange={e => setEditingText(e.target.value)} style={{ flex: 1, marginRight: "10px", padding: "5px" }} />
                <button onClick={() => saveEdit(todo.id)} style={{ marginRight: "10px", cursor: "pointer" }}>Save</button>
                <button onClick={() => setEditingId(null)} style={{ cursor: "pointer" }}>Cancel</button>
              </>
            ) : (
              <>
                <span>{todo.text}</span>
                <div>
                  <button onClick={() => startEdit(todo)} style={{ marginRight: "10px", cursor: "pointer" }}>Edit</button>
                  <button 
                    onClick={() => removeTodo(todo.id)} 
                    disabled={deletingId === todo.id} 
                    style={{ cursor: deletingId === todo.id ? "not-allowed" : "pointer" }}
                  >
                    {deletingId === todo.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
