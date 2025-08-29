import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import PrivateRoute from './utils/PrivateRoute';

// Common Components
import Header from './Components/Common/Header';
import Footer from './components/common/Footer';
import Notifications from './components/common/Notifications';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';
import AccountsList from './components/dashboard/AccountsList';
import CreateAccount from './components/dashboard/CreateAccount';
import TransactionHistory from './components/dashboard/TransactionHistory';
import Profile from './components/dashboard/Profile';
import AccountDetails from "./Components/dashboard/AccountDetails.jsx";

// Transaction Components
import Deposit from './components/transactions/Deposit';
import Withdraw from './components/transactions/Withdraw';
import Transfer from './components/transactions/Transfer';

// Parental Control Components
import SetLimits from './components/parentControls/SetLimits';
import PendingTransactions from './components/parentControls/PendingTransactions';
import AuditLogs from './components/parentControls/AuditLogs';

// Error Pages
const UnauthorizedPage = () => (
    <div className="container text-center py-5">
        <h1>Unauthorized Access</h1>
        <p>You don't have permission to access this page.</p>
    </div>
);

const NotFoundPage = () => (
    <div className="container text-center py-5">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
    </div>
);

// Landing Page
const HomePage = () => {
    const navigate = useNavigate();

    const loginHandle = () => {
        navigate('/login');
    };

    const registerHandle = () => {
        navigate('/register');
    };

    return (
        <div className="container">
            <div className="row justify-content-center align-items-center py-5">
                <div className="col-md-6">
                    <h1 className="display-4 mb-4">Welcome to PayNest</h1>
                    <p className="lead">
                        The modern banking solution designed for families. Teach your children about financial
                        responsibility in a safe, controlled environment.
                    </p>
                    <div className="mt-4">
                        <button onClick={loginHandle} className="btn btn-primary me-2">Login</button>
                        <button onClick={registerHandle} className="btn btn-outline-secondary">Register</button>
                    </div>
                </div>
                <div className="col-md-6">
                    <img src="./assets/paynest_logo.jpeg" alt="Banking illustration" className="img-fluid rounded shadow" />
                </div>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="d-flex flex-column min-vh-100">
                    <Header />
                    <div className="flex-grow-1">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Routes for All Users */}
                            <Route element={<PrivateRoute />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/accounts" element={<AccountsList />} />
                                <Route path="/accounts/:id" element={<AccountDetails />} />
                                <Route path="/accounts/create" element={<CreateAccount />} />
                                <Route path="/transactions/history" element={<TransactionHistory />} />
                                <Route path="/transactions/deposit" element={<Deposit />} />
                                <Route path="/transactions/withdraw" element={<Withdraw />} />
                                <Route path="/transactions/transfer" element={<Transfer />} />
                                <Route path="/notifications" element={<Notifications />} />
                                <Route path="/profile" element={<Profile />} />
                            </Route>

                            {/* Parent-Only Routes */}
                            <Route element={<PrivateRoute requiredRole="PARENT" />}>
                                <Route path="/parent/set-limits" element={<SetLimits />} />
                                <Route path="/parent/pending-transactions" element={<PendingTransactions />} />
                                <Route path="/parent/audit-logs" element={<AuditLogs />} />
                            </Route>

                            {/* Error Routes */}
                            <Route path="/unauthorized" element={<UnauthorizedPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;