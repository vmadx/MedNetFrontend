// // import React, { useState, useEffect } from 'react';
// // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { AuthProvider, useAuth } from './context/AuthContext'; // Import this
// // import { ThemeProvider } from './context/ThemeContext';
// // // Context
// // import { ThemeProvider } from './context/ThemeContext';

// // // Components
// // import Navbar from './components/Navbar';
// // import Footer from './components/Footer';

// // // Pages
// // import Landing from './pages/Landing';
// // import Home from './pages/Home';
// // import Features from './pages/Features';
// // import Documentation from './pages/Documentation';
// // import AboutUs from './pages/About';
// // import Login from './pages/Login';
// // import Signup from './pages/Signup';

// // // Wrapper to handle auth loading state and pass user data
// // const AppContent = () => {
// //   const { user, logout, isLoading } = useAuth();

// //   if (isLoading) {
// //     // You can replace this with a nice loading spinner component
// //     return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">Loading...</div>;
// //   }

// //   return (
// //     <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
// //       <Navbar 
// //         isLoggedIn={!!user} 
// //         user={user} 
// //         onLogout={logout} 
// //       />

// //       <AnimatePresence mode="wait">
// //         <Routes>
// //           <Route path="/" element={<Landing />} />
// //           <Route 
// //             path="/home" 
// //             element={
// //               user ? (
// //                 <Home user={user} onLogout={logout} />
// //               ) : (
// //                 // Keep your existing "Please log in" UI here
// //                 <motion.div
// //                   initial={{ opacity: 0 }}
// //                   animate={{ opacity: 1 }}
// //                   exit={{ opacity: 0 }}
// //                   className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900"
// //                 >
// //                   <div className="text-center">
// //                     <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
// //                       Please log in to access the workspace
// //                     </h2>
// //                     <a 
// //                       href="/login"
// //                       className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-300"
// //                     >
// //                       Go to Login
// //                     </a>
// //                   </div>
// //                 </motion.div>
// //               )
// //             } 
// //           />
// //           <Route path="/features" element={<Features />} />
// //           <Route path="/documentation" element={<Documentation />} />
// //           <Route path="/about" element={<AboutUs />} />
// //           <Route 
// //             path="/login" 
// //             element={<Login />} 
// //           />
// //           <Route 
// //             path="/signup" 
// //             element={<Signup />} 
// //           />
// //         </Routes>
// //       </AnimatePresence>

// //       <Footer />
// //     </div>
// //   );
// // };

// // function App() {
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// //   const [user, setUser] = useState(null);

// //   // Mock authentication check
// //   useEffect(() => {
// //     const savedUser = localStorage.getItem('dtaad-user');
// //     if (savedUser) {
// //       setUser(JSON.parse(savedUser));
// //       setIsLoggedIn(true);
// //     }
// //   }, []);

// //   const handleLogin = (userData) => {
// //     setUser(userData);
// //     setIsLoggedIn(true);
// //     localStorage.setItem('dtaad-user', JSON.stringify(userData));
// //   };

// //   const handleLogout = () => {
// //     setUser(null);
// //     setIsLoggedIn(false);
// //     localStorage.removeItem('dtaad-user');
// //   };

// //   return (
// //     <AuthProvider>
// //     <ThemeProvider>
// //       <Router>
// //         <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
// //           <Navbar 
// //             isLoggedIn={isLoggedIn} 
// //             user={user} 
// //             onLogout={handleLogout} 
// //           />
          
// //           <AnimatePresence mode="wait">
// //             <Routes>
// //               <Route path="/" element={<Landing />} />
// //               <Route 
// //                 path="/home" 
// //                 element={
// //                   isLoggedIn ? (
// //                     <Home user={user} onLogout={handleLogout} />
// //                   ) : (
// //                     <motion.div
// //                       initial={{ opacity: 0 }}
// //                       animate={{ opacity: 1 }}
// //                       exit={{ opacity: 0 }}
// //                       className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900"
// //                     >
// //                       <div className="text-center">
// //                         <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
// //                           Please log in to access the workspace
// //                         </h2>
// //                         <a 
// //                           href="/login"
// //                           className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-300"
// //                         >
// //                           Go to Login
// //                         </a>
// //                       </div>
// //                     </motion.div>
// //                   )
// //                 } 
// //               />
// //               <Route path="/features" element={<Features />} />
// //               <Route path="/documentation" element={<Documentation />} />
// //               <Route path="/about" element={<AboutUs />} />
// //               <Route 
// //                 path="/login" 
// //                 element={
// //                   <Login onLogin={handleLogin} isLoggedIn={isLoggedIn} />
// //                 } 
// //               />
// //               <Route 
// //                 path="/signup" 
// //                 element={
// //                   <Signup onLogin={handleLogin} isLoggedIn={isLoggedIn} />
// //                 } 
// //               />
// //             </Routes>
// //           </AnimatePresence>
          
// //           <Footer />
// //         </div>
// //       </Router>
// //     </ThemeProvider>
// //     </AuthProvider>
// //   );
// // }

// // export default App;



// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';

// // Context
// import { AuthProvider, useAuth } from './context/AuthContext'; 
// import { ThemeProvider } from './context/ThemeContext'; // Ensure this is only imported once

// // Components
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';

// // Pages
// import Landing from './pages/Landing';
// import Home from './pages/Home';
// import Features from './pages/Features';
// import Documentation from './pages/Documentation';
// import AboutUs from './pages/About';
// import Login from './pages/Login';
// import Signup from './pages/Signup';

// // Wrapper component that uses AuthContext to handle loading and routing
// const AppContent = () => {
//   const { user, logout, isLoading } = useAuth(); // Read from context

//   if (isLoading) {
//     // Show a loading screen while checking the session
//     return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
//       <Navbar 
//         // Pass real auth status from context to Navbar
//         isLoggedIn={!!user} 
//         user={user} 
//         onLogout={logout} 
//       />

//       <AnimatePresence mode="wait">
//         <Routes>
//           <Route path="/" element={<Landing />} />
//           <Route 
//             path="/home" 
//             element={
//               // Protected route logic
//               user ? (
//                 <Home user={user} onLogout={logout} />
//               ) : (
//                 // Existing "Please log in" UI
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900"
//                 >
//                   <div className="text-center">
//                     <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
//                       Please log in to access the workspace
//                     </h2>
//                     <a 
//                       href="/login"
//                       className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-300"
//                     >
//                       Go to Login
//                     </a>
//                   </div>
//                 </motion.div>
//               )
//             } 
//           />
//           <Route path="/features" element={<Features />} />
//           <Route path="/documentation" element={<Documentation />} />
//           <Route path="/about" element={<AboutUs />} />
//           {/* Login and Signup no longer need props */}
//           <Route 
//             path="/login" 
//             element={<Login />} 
//           />
//           <Route 
//             path="/signup" 
//             element={<Signup />} 
//           />
//         </Routes>
//       </AnimatePresence>

//       <Footer />
//     </div>
//   );
// };

// function App() {
//   // --- MOCK AUTHENTICATION CODE REMOVED ---

//   return (
//     <AuthProvider> 
//       <ThemeProvider>
//         <Router>
//            <AppContent /> {/* Render the content wrapper */}
//         </Router>
//       </ThemeProvider>
//     </AuthProvider>
//   );
// }

// export default App;










import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Landing from './pages/Landing';
import Home from './pages/Home';
import Features from './pages/Features';
import Documentation from './pages/Documentation';
import AboutUs from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Wrapper component that uses AuthContext to handle loading and routing
const AppContent = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar 
        isLoggedIn={!!user} 
        user={user} 
        onLogout={logout} 
      />

      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          
          <Route 
            path="/home" 
            element={
              // FIX: If user is logged in, show Home. 
              // If not (logout), immediately redirect to Landing (/)
              user ? (
                <Home user={user} onLogout={logout} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          <Route path="/features" element={<Features />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/about" element={<AboutUs />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AnimatePresence>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider> 
      <ThemeProvider>
        <Router>
           <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;