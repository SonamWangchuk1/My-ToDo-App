import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./Home";

// Mock Firebase
const mockOnSnapshot = jest.fn();
const mockAddDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockSignOut = jest.fn();

jest.mock("../firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
  },
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("Home Component", () => {
  const mockUser = { uid: "user123", email: "test@example.com" };
  const mockTodos = [
    { id: "1", text: "Buy groceries", userId: "user123" },
    { id: "2", text: "Walk the dog", userId: "user123" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);

    const { auth } = require("../firebase");
    const firestore = require("firebase/firestore");

    // Mock auth state
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return jest.fn();
    });

    auth.signOut.mockImplementation(mockSignOut);

    // Mock Firestore operations
    firestore.onSnapshot.mockImplementation((query, callback) => {
      callback({
        docs: mockTodos.map(todo => ({
          id: todo.id,
          data: () => ({ text: todo.text, userId: todo.userId }),
        })),
      });
      return jest.fn();
    });

    firestore.addDoc.mockImplementation(mockAddDoc);
    firestore.deleteDoc.mockImplementation(mockDeleteDoc);
    firestore.updateDoc.mockImplementation(mockUpdateDoc);
  });

  test("renders home page with title", async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/My Todo App/i)).toBeInTheDocument();
    });
  });

  test("renders logout button", async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });
  });

  test("displays todos from Firestore", async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
      expect(screen.getByText("Walk the dog")).toBeInTheDocument();
    });
  });

  test("displays 'No tasks yet' when there are no todos", async () => {
    const firestore = require("firebase/firestore");
    firestore.onSnapshot.mockImplementation((query, callback) => {
      callback({ docs: [] });
      return jest.fn();
    });

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
    });
  });

  test("adds a new todo", async () => {
    const firestore = require("firebase/firestore");
    mockAddDoc.mockResolvedValue({ id: "3" });

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/My Todo App/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Add new task/i);
    const addButton = screen.getByText(/Add/i);

    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalled();
    });
  });

  test("does not add empty todo", async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/My Todo App/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Add new task/i);
    const addButton = screen.getByText(/Add/i);

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddDoc).not.toHaveBeenCalled();
    });
  });

  test("adds todo on Enter key press", async () => {
    const firestore = require("firebase/firestore");
    mockAddDoc.mockResolvedValue({ id: "3" });

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/My Todo App/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Add new task/i);

    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalled();
    });
  });

  test("clears input after adding todo", async () => {
    mockAddDoc.mockResolvedValue({ id: "3" });

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/My Todo App/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Add new task/i);
    const addButton = screen.getByText(/Add/i);

    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  test("starts editing a todo", async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/Edit/i);
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Buy groceries")).toBeInTheDocument();
    });
  });

  test("saves edited todo", async () => {
    mockUpdateDoc.mockResolvedValue({});

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/Edit/i);
    fireEvent.click(editButtons[0]);

    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "Buy groceries and milk" } });

    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  test("cancels editing", async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/Edit/i);
    fireEvent.click(editButtons[0]);

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByDisplayValue("Buy groceries")).not.toBeInTheDocument();
    });
  });

  test("deletes a todo with confirmation", async () => {
    mockDeleteDoc.mockResolvedValue({});

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  test("does not delete todo when confirmation is cancelled", async () => {
    window.confirm = jest.fn(() => false);

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
    });
  });

  test("logs out user", async () => {
    mockSignOut.mockResolvedValue({});

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });

    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("redirects to login if no user", async () => {
    const { auth } = require("../firebase");
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return jest.fn();
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("shows error alert when delete fails", async () => {
    mockDeleteDoc.mockRejectedValue(new Error("Delete failed"));

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to delete the task.");
    });
  });

  test("shows error alert when update fails", async () => {
    mockUpdateDoc.mockRejectedValue(new Error("Update failed"));

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/Edit/i);
    fireEvent.click(editButtons[0]);

    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "Updated task" } });

    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to update the task.");
    });
  });

  test("shows error alert when add fails", async () => {
    mockAddDoc.mockRejectedValue(new Error("Add failed"));

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/My Todo App/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Add new task/i);
    const addButton = screen.getByText(/Add/i);

    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to add task.");
    });
  });
});