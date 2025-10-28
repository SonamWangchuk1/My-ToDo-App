import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Signup from "./Signup";

// Mock Firebase
jest.mock("../firebase", () => ({
  auth: {},
}));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe("Signup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  test("renders signup form", () => {
    render(<Signup />);
    
    expect(screen.getByText(/Signup/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Signup/i })).toBeInTheDocument();
  });

  test("renders login link", () => {
    render(<Signup />);
    
    expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test("updates email input value", () => {
    render(<Signup />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
    
    expect(emailInput.value).toBe("newuser@example.com");
  });

  test("updates password input value", () => {
    render(<Signup />);
    
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
    
    expect(passwordInput.value).toBe("newpassword123");
  });

  test("submits form with email and password", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: "123" } });
    
    render(<Signup />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Signup/i });
    
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "newuser@example.com",
        "newpassword123"
      );
    });
  });

  test("shows success message on successful signup", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: "123" } });
    
    render(<Signup />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Signup/i });
    
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Account successfully created!🎉");
    });
  });

  test("navigates to login page on successful signup", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: "123" } });
    
    render(<Signup />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Signup/i });
    
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("displays error message on failed signup", async () => {
    const errorMessage = "Email already in use";
    createUserWithEmailAndPassword.mockRejectedValue({ message: errorMessage });
    
    render(<Signup />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Signup/i });
    
    fireEvent.change(emailInput, { target: { value: "existing@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(errorMessage);
    });
  });

  test("email input is required", () => {
    render(<Signup />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    expect(emailInput).toBeRequired();
  });

  test("password input is required", () => {
    render(<Signup />);
    
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    expect(passwordInput).toBeRequired();
  });
});