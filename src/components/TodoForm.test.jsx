import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TodoForm from "./TodoForm";

describe("TodoForm Component", () => {
  const mockAddTodo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders input field and button", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    expect(screen.getByPlaceholderText(/Add new todo.../i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add/i })).toBeInTheDocument();
  });

  test("updates input value on change", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText(/Add new todo.../i);
    fireEvent.change(input, { target: { value: "New todo item" } });
    
    expect(input.value).toBe("New todo item");
  });

  test("calls addTodo with input text on submit", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText(/Add new todo.../i);
    const button = screen.getByRole("button", { name: /Add/i });
    
    fireEvent.change(input, { target: { value: "New todo item" } });
    fireEvent.click(button);
    
    expect(mockAddTodo).toHaveBeenCalledWith("New todo item");
  });

  test("clears input after submit", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText(/Add new todo.../i);
    const button = screen.getByRole("button", { name: /Add/i });
    
    fireEvent.change(input, { target: { value: "New todo item" } });
    fireEvent.click(button);
    
    expect(input.value).toBe("");
  });

  test("does not call addTodo with empty input", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const button = screen.getByRole("button", { name: /Add/i });
    fireEvent.click(button);
    
    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  test("does not call addTodo with whitespace only", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText(/Add new todo.../i);
    const button = screen.getByRole("button", { name: /Add/i });
    
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(button);
    
    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  test("prevents default form submission", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const form = screen.getByRole("button", { name: /Add/i }).closest("form");
    const event = { preventDefault: jest.fn() };
    
    fireEvent.change(screen.getByPlaceholderText(/Add new todo.../i), {
      target: { value: "Test" },
    });
    fireEvent.submit(form, event);
    
    expect(mockAddTodo).toHaveBeenCalled();
  });

  test("trims whitespace from input before adding", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText(/Add new todo.../i);
    const button = screen.getByRole("button", { name: /Add/i });
    
    fireEvent.change(input, { target: { value: "  Trimmed todo  " } });
    fireEvent.click(button);
    
    expect(mockAddTodo).toHaveBeenCalledWith("  Trimmed todo  ");
  });

  test("can submit multiple todos", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText(/Add new todo.../i);
    const button = screen.getByRole("button", { name: /Add/i });
    
    fireEvent.change(input, { target: { value: "First todo" } });
    fireEvent.click(button);
    
    fireEvent.change(input, { target: { value: "Second todo" } });
    fireEvent.click(button);
    
    expect(mockAddTodo).toHaveBeenCalledTimes(2);
    expect(mockAddTodo).toHaveBeenNthCalledWith(1, "First todo");
    expect(mockAddTodo).toHaveBeenNthCalledWith(2, "Second todo");
  });
});s