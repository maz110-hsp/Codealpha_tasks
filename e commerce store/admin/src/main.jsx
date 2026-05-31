import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminLoginScreen from './screens/AdminLoginScreen.jsx';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen.jsx';
import ProductListScreen from './screens/admin/ProductListScreen.jsx';
import ProductEditScreen from './screens/admin/ProductEditScreen.jsx';
import OrderListScreen from './screens/admin/OrderListScreen.jsx';
import AdminOrderScreen from './screens/admin/AdminOrderScreen.jsx';
import UserListScreen from './screens/admin/UserListScreen.jsx';
import UserEditScreen from './screens/admin/UserEditScreen.jsx';
import './index.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/login" element={<AdminLoginScreen />} />
      <Route path="" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardScreen />} />
          <Route path="/admin/productlist" element={<ProductListScreen />} />
          <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
          <Route path="/admin/orderlist" element={<OrderListScreen />} />
          <Route path="/admin/order/:id" element={<AdminOrderScreen />} />
          <Route path="/admin/userlist" element={<UserListScreen />} />
          <Route path="/admin/user/:id/edit" element={<UserEditScreen />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
