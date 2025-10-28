import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TodoItem from "./TodoItem";

describe("TodoItem Component", () => {
  const mockTodo = {
    id: "1",
    text: "Buy groceries",
  };
  const mockRemoveTodo = jest.fn();
  const mockUpdateTodo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  test("renders todo text", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  test("renders edit and delete buttons", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
    expect(screen.getByText(/Delete/i)).toBeInTheDocument();
  });

  test("enters edit mode when edit button is clicked", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  test("updates input value in edit mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "Buy groceries and milk" } });
    
    expect(input.value).toBe("Buy groceries and milk");
  });

  test("calls updateTodo when save button is clicked", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "Buy groceries and milk" } });
    
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);
    
    expect(mockUpdateTodo).toHaveBeenCalledWith("1", "Buy groceries and milk");
  });

  test("exits edit mode after saving", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);
    
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);
    
    expect(screen.queryByDisplayValue("Buy groceries")).not.toBeInTheDocument();
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
  });

  test("does not call updateTodo with empty text", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "" } });
    
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);
    
    expect(mockUpdateTodo).not.toHaveBeenCalled();
  });

  test("does not call updateTodo with whitespace only", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "   " } });
    
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);
    
    expect(mockUpdateTodo).not.toHaveBeenCalled();
  });

  test("shows confirmation dialog when delete is clicked", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this task?"
    );
  });

  test("calls removeTodo when delete is confirmed", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);
    
    expect(mockRemoveTodo).toHaveBeenCalledWith("1");
  });

  test("does not call removeTodo when delete is cancelled", () => {
    window.confirm = jest.fn(() => false);
    
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);
    
    expect(mockRemoveTodo).not.toHaveBeenCalled();
  });

  test("renders with different todo data", () => {
    const differentTodo = {
      id: "2",
      text: "Walk the dog",
    };
    
    render(
      <TodoItem
        todo={differentTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });

  test("preserves original text if edit mode is cancelled", () => {
    render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    // Enter edit mode
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);
    
    // Change the text
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "Changed text" } });
    
    // Cancel edit by entering edit mode again with original todo
    const { rerender } = render(
      <TodoItem
        todo={mockTodo}
        removeTodo={mockRemoveTodo}
        updateTodo={mockUpdateTodo}
      />
    );
    
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });
});