import React from "react";
import DataTable from "../components/DataTable";

export default function DatasetView({ students = [] }) {
  return (
    <div className="p-3 p-md-4">
      <h2 className="mb-4">Full Dataset View</h2>
      {students.length > 0 ? (
      <DataTable data={students} />
      ) : (
        <div className="alert alert-warning">No data available. Please check the Excel file.</div>
      )}
    </div>
  );
}
