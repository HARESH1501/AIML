import React from "react";

export default function DataTable({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="alert alert-info">No data available.</div>
    );
  }

  // Get all subject keys (exclude roll and name)
  const subjectKeys = Object.keys(data[0] || {}).filter(
    key => key !== 'roll' && key !== 'name' && typeof data[0][key] === 'number'
  );

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover mt-3">
        <thead className="table-dark">
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            {subjectKeys.map((subject) => (
              <th key={subject}>{subject}</th>
            ))}
            <th>Total</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          {data.map((student, index) => {
            const total = subjectKeys.reduce((sum, key) => sum + (student[key] || 0), 0);
            const average = subjectKeys.length > 0 ? total / subjectKeys.length : 0;
            
            return (
              <tr key={index}>
                <td className="fw-bold">{student.roll || '-'}</td>
                <td>{student.name || '-'}</td>
                {subjectKeys.map((subject) => (
                  <td key={subject} className={student[subject] < 30 ? 'text-danger' : ''}>
                    {student[subject] || 0}
                  </td>
                ))}
                <td className="fw-bold">{Math.round(total * 100) / 100}</td>
                <td className="fw-bold">{Math.round(average * 100) / 100}%</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="table-secondary">
          <tr>
            <td colSpan="2" className="fw-bold">Average</td>
            {subjectKeys.map((subject) => {
              const avg = data.reduce((sum, s) => sum + (s[subject] || 0), 0) / data.length;
              return (
                <td key={subject} className="fw-bold">
                  {Math.round(avg * 100) / 100}
                </td>
              );
            })}
            <td colSpan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
