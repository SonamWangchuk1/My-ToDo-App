// src/App.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

// Mock Firebase auth and Firestore
jest.mock("./firebase", () => {
  const currentUser = { uid: "123", email: "test@example.com" };
  return {
    auth: {
      onAuthStateChanged: jest.fn(cb => {
        // Call callback immediately with a fake user
        cb(currentUser);
        return jest.fn(); // return unsubscribe function
      }),
      signOut: jest.fn(),
    },
    db: {}, // We won’t interact with real Firestore in these tests
  };
});

// Mock react-router-dom Navigate so it doesn’t actually redirect
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  };
});

describe("App component", () => {
  test("renders home page if user is logged in", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/My Todo App/i)).toBeInTheDocument();
      expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });
  });

  test("renders login page if no user is logged in", async () => {
    // Override onAuthStateChanged to return null
    const { auth } = require("./firebase");
    auth.onAuthStateChanged.mockImplementation(cb => {
      cb(null);
      return jest.fn();
    });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    });
  });
});
