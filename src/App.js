import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    let isMounted = true; // avoid state updates if unmounted
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      if (isMounted) {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;

  return (
    <Router>
      <Routes>
        {/* Signup page: only accessible if user is NOT logged in */}
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/home" replace /> : <Signup />} 
        />

        {/* Login page: only accessible if user is NOT logged in */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/home" replace /> : <Login />} 
        />

        {/* Home page: only accessible if user IS logged in */}
        <Route 
          path="/home" 
          element={user ? <Home /> : <Navigate to="/login" replace />} 
        />

        {/* Default route */}
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
