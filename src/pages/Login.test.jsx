import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import Login from "./Login";

// Mock Firebase
jest.mock("../firebase", () => ({
  auth: {},
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  test("renders login form", () => {
    render(<Login />);
    
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("renders signup link", () => {
    render(<Login />);
    
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
    expect(screen.getByText(/Signup/i)).toBeInTheDocument();
  });

  test("updates email input value", () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    
    expect(emailInput.value).toBe("test@example.com");
  });

  test("updates password input value", () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    
    expect(passwordInput.value).toBe("password123");
  });

  test("submits form with email and password", async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: "123" } });
    
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "test@example.com",
        "password123"
      );
    });
  });

  test("navigates to home on successful login", async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: "123" } });
    
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });
  });

  test("displays error message on failed login", async () => {
    const errorMessage = "Invalid credentials";
    signInWithEmailAndPassword.mockRejectedValue({ message: errorMessage });
    
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(errorMessage);
    });
  });

  test("prevents default form submission", async () => {
    render(<Login />);
    
    const form = screen.getByRole("button", { name: /Login/i }).closest("form");
    const event = { preventDefault: jest.fn() };
    
    fireEvent.submit(form, event);
    
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
    });
  });
});