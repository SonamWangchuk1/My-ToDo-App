import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { auth } from './firebase';
import * as firestore from 'firebase/firestore';

// Mock Firebase auth
jest.mock('./firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
  db: {}, // db can be empty, since we mock firestore functions
}));

// Mock Firestore functions used in Home.jsx
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
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

    // Mock Firestore query for Home component
    const fakeTodos = [
      { id: '1', data: () => ({ task: 'Test Todo' }) },
      { id: '2', data: () => ({ task: 'Another Task' }) },
    ];

    firestore.onSnapshot.mockImplementation((q, callback) => {
      callback({ docs: fakeTodos });
      return jest.fn(); // unsubscribe function
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/test todo/i)).toBeInTheDocument();
      expect(screen.getByText(/another task/i)).toBeInTheDocument();
    });
  });
});
