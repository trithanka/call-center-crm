import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./pages/Login";
import GrievanceChat from "./pages/GrievanceChat";
import Dashboard from "./components/Dashboard";
import Grievance from "./pages/Grievance";
import Feedback from "./pages/Feedback";
import { Chat } from "./pages/chat";
import IncomingGrievanceForm from "./pages/IncomingGrievanceForm";
import OutgoingGrievanceForm from "./pages/OutgoingGrievanceForm";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/grievance" 
          element={
            <ProtectedRoute>
              <Grievance/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/feedback" 
          element={
            <ProtectedRoute>
              <Feedback/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/grievance/:id" 
          element={
            <ProtectedRoute>
              <GrievanceChat />
            </ProtectedRoute>
          } 
        /> 
        <Route 
          path="/outbound" 
          element={
            <ProtectedRoute>
              <GrievanceChat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chats" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/grievance/new/incoming" 
          element={
            <ProtectedRoute>
              <IncomingGrievanceForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/grievance/new/outgoing" 
          element={
            <ProtectedRoute>
              <OutgoingGrievanceForm />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
