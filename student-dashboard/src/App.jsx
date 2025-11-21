import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import DatasetView from "./pages/DatasetView";
import { readExcelFile } from "./utils/excelReader";
import "./App.css";

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from Excel file - use ONLY the Excel data
    const loadData = async () => {
      try {
        // Load from Excel file in public directory
        const excelData = await readExcelFile("/1 AIML B- Result Analysis.xlsx");
        if (excelData && excelData.length > 0) {
          console.log(`Loaded ${excelData.length} students from Excel file`);
          setStudents(excelData);
        } else {
          console.warn("Excel file loaded but no data found. Please check the file structure.");
          setStudents([]);
        }
      } catch (error) {
        console.error("Error loading Excel file:", error);
        console.error("Please ensure the Excel file '1 AIML B- Result Analysis.xlsx' is in the public directory");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div>
          <Navbar />

          <div className="container-fluid">
            <Routes>
            <Route path="/" element={<Dashboard students={students} />} />
            <Route path="/dataset" element={<DatasetView students={students} />} />
            </Routes>
        </div>
      </div>
    </Router>
  );
}
