import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="brand-link">
                    Option Trading
                </Link>
            </div>

            <div className="navbar-links">
                <Link to="/events" className="nav-link">
                    Events
                </Link>

                {user ? (
                    <>
                        <Link to="/trades" className="nav-link">
                            My Trades
                        </Link>

                        {user.role === 'admin' && (
                            <Link to="/admin/dashboard" className="nav-link">
                                Admin
                            </Link>
                        )}

                        <div className="user-info">
                            <span className="balance">
                                Balance: ${user.balance?.toFixed(2)}
                            </span>
                            <Link to="/profile" className="nav-link">
                                Profile
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="logout-button"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="nav-link">
                            Login
                        </Link>
                        <Link to="/register" className="nav-link">
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;