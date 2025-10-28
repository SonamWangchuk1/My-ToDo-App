import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

// Mock Firebase
jest.mock("./firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
  },
  db: {},
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => <div>{element}</div>,
  Navigate: () => <div>Navigate</div>,
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially", () => {
    const { auth } = require("./firebase");
    auth.onAuthStateChanged.mockImplementation(() => jest.fn());
    
    render(<App />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test("renders home page when user is logged in", async () => {
    const { auth } = require("./firebase");
    const mockUser = { uid: "123", email: "test@example.com" };
    
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return jest.fn();
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });

  test("renders login page when user is not logged in", async () => {
    const { auth } = require("./firebase");
    
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return jest.fn();
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });

  test("unsubscribes from auth on unmount", () => {
    const { auth } = require("./firebase");
    const mockUnsubscribe = jest.fn();
    
    auth.onAuthStateChanged.mockImplementation(() => mockUnsubscribe);

    const { unmount } = render(<App />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});