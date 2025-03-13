import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EventList from './components/events/EventList';
import EventDetails from './components/events/EventDetails';
import LiveEvents from './components/events/LiveEvents';
import TradeHistory from './components/trades/TradeHistory';
import Profile from './components/profile/Profile';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Event Routes */}
                <Route path="/events" element={<EventList />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/live-events" element={<LiveEvents />} />

                {/* Protected Routes */}
                <Route path="/trades" element={
                  <ProtectedRoute>
                    <TradeHistory />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Default Route */}
                <Route path="/" element={<EventList />} />
              </Routes>
            </main>
          </div>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;