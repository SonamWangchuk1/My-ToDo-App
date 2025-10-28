import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { auth } from './firebase';

// Mock Firebase auth
jest.mock('./firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
}));

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
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});

test('renders home page if user is logged in', async () => {
  const fakeUser = { uid: '123', email: 'test@test.com' };
  auth.onAuthStateChanged.mockImplementation((callback) => {
    callback(fakeUser); // simulate logged in
    return jest.fn();
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/home/i)).toBeInTheDocument();
  });
});
