import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useScrollReveal from './hooks/useScrollReveal';
import useRipple from './hooks/useRipple';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home        from './pages/Home';
import Products    from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart        from './pages/Cart';
import Checkout    from './pages/Checkout';
import About       from './pages/About';
import Contact     from './pages/Contact';
import Admin       from './pages/Admin';
import AdminLogin  from './pages/AdminLogin';
import OrderSuccess from './pages/OrderSuccess';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

// Pages that get no Navbar/Footer
const NO_LAYOUT = ['/admin', '/admin/login'];

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = NO_LAYOUT.some(p => pathname === p || pathname.startsWith(p + '/'));

  useScrollReveal();
  useRipple();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main style={!isAdmin ? { paddingTop: 0 } : {}}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/products"      element={<Products />} />
          <Route path="/product/:id"   element={<ProductDetail />} />
          <Route path="/cart"          element={<Cart />} />
          <Route path="/checkout"      element={<Checkout />} />
          <Route path="/about"         element={<About />} />
          <Route path="/contact"       element={<Contact />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Admin login — public */}
          <Route path="/admin/login"   element={<AdminLogin />} />

          {/* Admin dashboard — protected */}
          <Route path="/admin" element={
            <ProtectedRoute><Admin /></ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
