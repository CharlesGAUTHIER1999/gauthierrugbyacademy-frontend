import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from "./pages/Dashboard";
import CartPage from "./pages/CartPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentCancel from "./pages/PaymentCancel.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import { AuthProvider, useAuth } from "./store/auth";
import ProtectedRoute from "./routes/ProtectedRoutes.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import AddressesPage from "./pages/AddressesPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersPage from  "./pages/OrdersPage.jsx";
import OrderDetailsPage from  "./pages/OrderDetailsPage.jsx";

function GuestOnly({ children }) {
    const { token, loading } = useAuth();

    if (loading) return null; // ou un spinner
    if (token) return <Navigate to="/account" replace />;
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/payment-success" element={<PaymentSuccess />} />
                        <Route path="/payment-cancel" element={<PaymentCancel />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route
                            path="/login"
                            element={
                                <GuestOnly>
                                    <Login />
                                </GuestOnly>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <GuestOnly>
                                    <Register />
                                </GuestOnly>
                            }
                        />

                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <AccountPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/account/orders"
                            element={
                                <ProtectedRoute>
                                    <OrdersPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/account/orders/:id"
                            element={
                                <ProtectedRoute>
                                    <OrderDetailsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/account/addresses"
                            element={
                                <ProtectedRoute>
                                    <AddressesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AppLayout>

                <CartDrawer />
            </AuthProvider>
        </BrowserRouter>
    );
}