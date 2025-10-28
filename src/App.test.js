import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { auth } from './firebase';
import * as firestore from 'firebase/firestore';

// Mock Firebase auth
jest.mock('./firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

describe('App component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading first', () => {
    auth.onAuthStateChanged.mockImplementation(() => {});
    render(<App />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders login page if user is not logged in', async () => {
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null); // simulate not logged in
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    });
  });

  test('renders home page if user is logged in', async () => {
    const fakeUser = { uid: '123', email: 'test@test.com' };
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(fakeUser); // simulate logged in
      return jest.fn();
    });

    // Mock Firestore getDocs for Home component
    firestore.getDocs.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ task: 'Test Todo' }) },
        { id: '2', data: () => ({ task: 'Another Task' }) },
      ],
    });

    render(<App />);

    await waitFor(() => {
      // Check if a todo item is rendered instead of literal "home"
      expect(screen.getByText(/test todo/i)).toBeInTheDocument();
    });
  });
});
