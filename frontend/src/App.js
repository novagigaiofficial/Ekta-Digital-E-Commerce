import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Layout         from "./components/layout/Layout";
import AdminLayout    from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import HomePage          from "./pages/HomePage";
import ShopPage          from "./pages/ShopPage";
import ProductPage       from "./pages/ProductPage";
import CartPage          from "./pages/CartPage";
import CheckoutPage      from "./pages/CheckoutPage";
import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { PaymentSuccessPage, PaymentCancelPage } from "./pages/PaymentPage";
import ResetPasswordPage  from "./pages/ResetPasswordPage";
import AccountPage       from "./pages/AccountPage";
import QuotePage         from "./pages/QuotePage";
import WishlistPage      from "./pages/WishlistPage";
import BlogPage          from "./pages/BlogPage";
import FaqPage           from "./pages/FaqPage";
import AboutPage         from "./pages/AboutPage";
import ContactPage       from "./pages/ContactPage";
import NotFoundPage      from "./pages/NotFoundPage";

import AdminDashboard       from "./pages/admin/DashboardPage";
import AdminProducts        from "./pages/admin/ProductsPage";
import AdminOrders          from "./pages/admin/OrdersPage";
import AdminQuotes          from "./pages/admin/QuotesPage";
import AdminCustomers       from "./pages/admin/CustomersPage";
import AdminLoyalty         from "./pages/admin/LoyaltyPage";
import AdminPromotions      from "./pages/admin/PromotionsPage";
import AdminHomepage        from "./pages/admin/HomepageBuilderPage";
import AdminSettings        from "./pages/admin/SettingsPage";
import AdminCategories      from "./pages/admin/CategoriesPage";
import AdminInvoiceTemplate from "./pages/admin/InvoiceTemplatePage";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "Montserrat, sans-serif",
            fontSize: "14px",
            borderRadius: "12px",
          },
        }}
      />
      <Routes>
        {/* ── Public / Customer Routes ── */}
        <Route path="/" element={<Layout />}>
          <Route index                  element={<HomePage />}     />
          <Route path="shop"            element={<ShopPage />}     />
          <Route path="shop/:category"  element={<ShopPage />}     />
          <Route path="product/:slug"   element={<ProductPage />}  />
          <Route path="cart"            element={<CartPage />}     />
          <Route path="checkout"        element={<CheckoutPage />} />
          <Route path="wishlist"        element={<WishlistPage />} />
          <Route path="quote"           element={<QuotePage />}    />
          <Route path="blog"            element={<BlogPage />}     />
          <Route path="faq"             element={<FaqPage />}      />
          <Route path="about"           element={<AboutPage />}    />
          <Route path="contact"         element={<ContactPage />}  />

          {/* Auth pages */}
          <Route path="login"           element={<LoginPage />}           />
          <Route path="register"        element={<RegisterPage />}        />
          <Route path="forgot-password" element={<ForgotPasswordPage />}  />
          <Route path="payment/success"    element={<PaymentSuccessPage />}   />
          <Route path="payment/cancel"     element={<PaymentCancelPage />}    />
          <Route path="payment/paypal/success" element={<PaymentSuccessPage />} />
          <Route path="payment/paypal/cancel"  element={<PaymentCancelPage />}  />
          <Route path="reset-password"  element={<ResetPasswordPage />}   />

          {/* Protected customer pages */}
          <Route path="account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ── Admin Routes — admin role required ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index                    element={<AdminDashboard />}       />
          <Route path="products"          element={<AdminProducts />}        />
          <Route path="orders"            element={<AdminOrders />}          />
          <Route path="quotes"            element={<AdminQuotes />}          />
          <Route path="customers"         element={<AdminCustomers />}       />
          <Route path="loyalty"           element={<AdminLoyalty />}         />
          <Route path="promotions"        element={<AdminPromotions />}      />
          <Route path="homepage"          element={<AdminHomepage />}        />
          <Route path="settings"          element={<AdminSettings />}        />
          <Route path="categories"        element={<AdminCategories />}      />
          <Route path="invoice-template"  element={<AdminInvoiceTemplate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
