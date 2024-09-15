import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import SignUp from "./components/Auth/SignUp";
import Login from "./components/Auth/Login";
import RequireUser from "./RequireUser";

function App() {
  return (
    <Router>
      <Routes>
        {/* Define each route with a corresponding element */}
        <Route element={<RequireUser />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
