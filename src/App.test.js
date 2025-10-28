import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { auth } from './firebase';
import * as firestore from 'firebase/firestore';

// Mock Firebase auth
jest.mock('./firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
  db: {}, // db can be empty, mocks will handle firestore functions
}));

// Mock Firestore functions
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
      callback(null); // simulate no user
      return jest.fn(); // unsubscribe function
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
      return jest.fn(); // unsubscribe
    });

    // Mock Firestore snapshot for todos
    const fakeTodos = [
      { id: '1', data: () => ({ task: 'Test Todo' }) },
      { id: '2', data: () => ({ task: 'Another Task' }) },
    ];

    firestore.onSnapshot.mockImplementation((q, callback) => {
      callback({ docs: fakeTodos }); // send fake todos
      return jest.fn(); // unsubscribe function
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Test Todo'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Another Task'))).toBeInTheDocument();
    });
  });
});
