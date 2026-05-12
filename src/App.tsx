/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/src/pages/Home.tsx";
import Overlay from "@/src/pages/Overlay.tsx";
import Admin from "@/src/pages/Admin.tsx";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen grid-bg">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/overlay" element={<Overlay />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}
