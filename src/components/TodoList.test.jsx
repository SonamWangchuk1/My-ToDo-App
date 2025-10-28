import React from "react";
import { render, screen } from "@testing-library/react";
import TodoList from "./TodoList";

// Mock TodoItem component to simplify testing
jest.mock("./TodoItem", () => {
  return function MockTodoItem({ todo }) {
    return <li data-testid={`todo-${todo.id}`}>{todo.text}</li>;
  };
});

describe("TodoList Component", () => {
  const mockRemoveTodo = jest.fn();
  const mockUpdateTodo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders 'No todos yet' when todos array is empty", () => {
    render(
      <TodoList
        todos={[]}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByText(/No todos yet/i)).toBeInTheDocument();
  });

  test("renders list of todos", () => {
    const todos = [
      { id: "1", text: "Buy groceries" },
      { id: "2", text: "Walk the dog" },
      { id: "3", text: "Read a book" },
    ];
    
    render(
      <TodoList
        todos={todos}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
    expect(screen.getByText("Read a book")).toBeInTheDocument();
  });

  test("renders correct number of TodoItems", () => {
    const todos = [
      { id: "1", text: "Buy groceries" },
      { id: "2", text: "Walk the dog" },
      { id: "3", text: "Read a book" },
    ];
    
    render(
      <TodoList
        todos={todos}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const todoItems = screen.getAllByTestId(/^todo-/);
    expect(todoItems).toHaveLength(3);
  });

  test("renders single todo", () => {
    const todos = [{ id: "1", text: "Buy groceries" }];
    
    render(
      <TodoList
        todos={todos}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.queryByText(/No todos yet/i)).not.toBeInTheDocument();
  });

  test("renders unordered list when todos exist", () => {
    const todos = [{ id: "1", text: "Buy groceries" }];
    
    const { container } = render(
      <TodoList
        todos={todos}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const ul = container.querySelector("ul");
    expect(ul).toBeInTheDocument();
  });

  test("does not render list when no todos", () => {
    const { container } = render(
      <TodoList
        todos={[]}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const ul = container.querySelector("ul");
    expect(ul).not.toBeInTheDocument();
  });

  test("passes correct props to TodoItem", () => {
    const todos = [{ id: "1", text: "Buy groceries" }];
    
    render(
      <TodoList
        todos={todos}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    // Verify the mocked TodoItem received the correct todo
    expect(screen.getByTestId("todo-1")).toBeInTheDocument();
  });

  test("renders todos with unique keys", () => {
    const todos = [
      { id: "1", text: "Buy groceries" },
      { id: "2", text: "Walk the dog" },
    ];
    
    render(
      <TodoList
        todos={todos}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByTestId("todo-1")).toBeInTheDocument();
    expect(screen.getByTestId("todo-2")).toBeInTheDocument();
  });

  test("updates when todos prop changes", () => {
    const initialTodos = [{ id: "1", text: "Buy groceries" }];
    const updatedTodos = [
      { id: "1", text: "Buy groceries" },
      { id: "2", text: "Walk the dog" },
    ];
    
    const { rerender } = render(
      <TodoList
        todos={initialTodos}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getAllByTestId(/^todo-/)).toHaveLength(1);
    
    rerender(
      <TodoList
        todos={updatedTodos}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getAllByTestId(/^todo-/)).toHaveLength(2);
  });

  test("handles empty todos array after having items", () => {
    const initialTodos = [{ id: "1", text: "Buy groceries" }];
    
    const { rerender } = render(
      <TodoList
        todos={initialTodos}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    
    rerender(
      <TodoList
        todos={[]}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByText(/No todos yet/i)).toBeInTheDocument();
    expect(screen.queryByText("Buy groceries")).not.toBeInTheDocument();
  });
});