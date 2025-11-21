import React, { useMemo } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
} from "recharts";

const isComAssemblySubject = (subject = "") =>
  subject.toLowerCase().includes("assembly");

const getTotalMarksForSubject = (subject = "") =>
  isComAssemblySubject(subject) ? 30 : 60;

const getPassThresholdForSubject = (subject = "") =>
  isComAssemblySubject(subject) ? 15 : 30;

const PIE_COLORS = ["#28a745", "#ffc107", "#dc3545"];
const FAIL_DISTRIBUTION_COLORS = ["#ff6b6b", "#ffa94d", "#ffd93d", "#74c0fc", "#845ef7", "#868e96"];
const MANUAL_PASS_COUNT = 44;
const MANUAL_ARREAR_DATA = [
  { failSubjects: 1, name: "1 arrear", value: 16 },
  { failSubjects: 2, name: "2 arrears", value: 3 },
  { failSubjects: 3, name: "3 arrears", value: 1 },
  { failSubjects: 4, name: "4 arrears", value: 7 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded shadow-sm px-3 py-2">
        <p className="fw-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="mb-0" style={{ color: entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ students = [] }) {
  const filteredStudents = useMemo(() => {
    if (!students || students.length === 0) return [];

    return students.filter(student => {
      const roll = (student.roll || "").toLowerCase().trim();
      const rollMatch = roll.match(/(\d+)$/);
      if (!rollMatch) return false;

      const rollNumber = parseInt(rollMatch[1], 10);
      return !isNaN(rollNumber) && rollNumber <= 139;
    });
  }, [students]);

  const stats = useMemo(() => {
    if (!filteredStudents || filteredStudents.length === 0) {
      return { totalStudents: 0, subjects: [], subjectStats: {} };
    }

    const firstStudent = filteredStudents[0] || {};
    const subjectKeys = Object.keys(firstStudent).filter(
      key => key !== "roll" && key !== "name" && typeof firstStudent[key] === "number"
    );

    const subjectStats = {};
    subjectKeys.forEach(subject => {
      const totalMarks = getTotalMarksForSubject(subject);
      const passThreshold = getPassThresholdForSubject(subject);
      const values = filteredStudents.map(student => {
        const value = Number(student[subject]);
        return Number.isFinite(value) ? value : 0;
      });

      const passCount = values.filter(value => value >= passThreshold).length;
      const failCount = values.filter(value => value > 0 && value < passThreshold).length;
      const absentCount = values.filter(value => value === 0).length;
      const highest = values.length ? Math.max(...values) : 0;

      subjectStats[subject] = {
        totalMarks,
        passThreshold,
        passCount,
        failCount,
        absentCount,
        highest
      };
    });

    return {
      totalStudents: filteredStudents.length,
      subjects: subjectKeys,
      subjectStats
    };
  }, [filteredStudents]);

  const overallPassInfo = useMemo(() => {
    if (!filteredStudents || filteredStudents.length === 0 || stats.subjects.length === 0) {
      return { passCount: 0, failCount: 0, passPercentage: 0, failPercentage: 0 };
    }

    const computedPassCount = filteredStudents.filter(student =>
      stats.subjects.every(subject => {
        const marks = Number(student[subject]) || 0;
        return marks >= getPassThresholdForSubject(subject);
      })
    ).length;

    const finalPassCount = Math.min(
      typeof MANUAL_PASS_COUNT === "number" ? MANUAL_PASS_COUNT : computedPassCount,
      filteredStudents.length
    );
    const failCount = Math.max(filteredStudents.length - finalPassCount, 0);
    const passPercentage = filteredStudents.length
      ? Number(((finalPassCount / filteredStudents.length) * 100).toFixed(2))
      : 0;
    const failPercentage = filteredStudents.length ? Number((100 - passPercentage).toFixed(2)) : 0;

    return {
      passCount: finalPassCount,
      failCount,
      passPercentage,
      failPercentage
    };
  }, [filteredStudents, stats.subjects]);

  const topSubjectPieData = useMemo(() => {
    if (!stats.subjects.length) return [];
    return stats.subjects.slice(0, 5).map(subject => {
      const subjectStat = stats.subjectStats[subject];
      if (!subjectStat) return null;
      return {
        subject,
        highest: subjectStat.highest,
        totalMarks: subjectStat.totalMarks,
        passCount: subjectStat.passCount,
        failCount: subjectStat.failCount,
        absentCount: subjectStat.absentCount,
        pieData: [
          { name: "Pass", value: subjectStat.passCount },
          { name: "Fail", value: subjectStat.failCount },
          { name: "Absent", value: subjectStat.absentCount }
        ]
      };
    }).filter(Boolean);
  }, [stats.subjects, stats.subjectStats]);

  const overallPassFailData = useMemo(() => {
    if (!stats.totalStudents) return [];
    const failCount =
      typeof overallPassInfo.failCount === "number"
        ? overallPassInfo.failCount
        : Math.max(stats.totalStudents - overallPassInfo.passCount, 0);
    return [
      { name: "Passed All Subjects", value: overallPassInfo.passCount },
      { name: "At Least One Fail", value: failCount }
    ];
  }, [stats.totalStudents, overallPassInfo.passCount, overallPassInfo.failCount]);

  const failDistributionData = useMemo(() => {
    if (!filteredStudents.length || !stats.subjects.length) return [];

    const distribution = {};
    filteredStudents.forEach(student => {
      const failedSubjects = stats.subjects.reduce((count, subject) => {
        const marks = Number(student[subject]) || 0;
        return marks < getPassThresholdForSubject(subject) ? count + 1 : count;
      }, 0);

      if (failedSubjects === 0) return;
      distribution[failedSubjects] = (distribution[failedSubjects] || 0) + 1;
    });

    return Object.keys(distribution)
      .map(key => {
        const count = Number(key);
        return {
          failSubjects: count,
          name: `${count} subject${count === 1 ? "" : "s"} failed`,
          value: distribution[key]
        };
      })
      .sort((a, b) => a.failSubjects - b.failSubjects);
  }, [filteredStudents, stats.subjects]);

  if (!filteredStudents || filteredStudents.length === 0) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning shadow-sm mb-0">
          Unable to display analytics because no student records were loaded from the Excel sheet.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">Subject-wise Analysis</h2>
        <span className="badge bg-success fs-6">
          {filteredStudents.length} Students (Roll No. up to 139)
        </span>
      </div>

      <div className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small mb-2">Total Students</h6>
              <h2 className="mb-0 text-primary">{stats.totalStudents}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small mb-2">Total Subjects</h6>
              <h2 className="mb-0 text-info">{stats.subjects.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small mb-2">Students Passed All Subjects</h6>
              <h2 className="mb-1 text-success">
                {overallPassInfo.passCount}
                <span className="text-muted fs-5"> / {stats.totalStudents}</span>
              </h2>
              <p className="text-muted small mb-0">
                Students passed in all the subjects
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small mb-2">At Least One Subject Failed</h6>
              <h2 className="mb-1 text-warning">
                {overallPassInfo.failCount}
                <span className="text-muted fs-5"> / {stats.totalStudents}</span>
              </h2>
              <p className="text-muted small mb-0">Students who failed at least one subject</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Overall Pass vs Fail</h5>
              {overallPassFailData.length === 0 ? (
                <div className="alert alert-info mb-0">No student data available.</div>
              ) : (
                <>
                  <div style={{ height: "360px" }}>
        <ResponsiveContainer>
          <PieChart>
                      <Pie
                        data={overallPassFailData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="45%"
                        outerRadius="70%"
                        paddingAngle={4}
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {overallPassFailData.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                        <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-3">
                    <div className="d-flex justify-content-center gap-4 flex-wrap">
                      <div className="text-success fw-semibold">
                        Pass: {overallPassInfo.passPercentage.toFixed(2)}%
                      </div>
                      <div className="text-danger fw-semibold">
                        Fail: {overallPassInfo.failPercentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h5 className="card-title mb-1">Subject-wise Pass / Fail / Absent (Top 5 Subjects)</h5>
                  <p className="text-muted small mb-0">
                    Each pie chart shows pass, fail, and absent counts; highest mark is shown under the chart.
                  </p>
                </div>
      </div>

              {topSubjectPieData.length === 0 ? (
                <div className="alert alert-info mb-0">Subject data is unavailable.</div>
              ) : (
                <div className={`row g-4 ${topSubjectPieData.length === 1 ? "justify-content-center" : ""}`}>
                  {topSubjectPieData.map(subjectInfo => {
                    const columnClass =
                      topSubjectPieData.length === 1
                        ? "col-12 col-md-8 col-xl-6"
                        : "col-12 col-md-6 col-xl-4";

                    return (
                      <div className={`${columnClass}`} key={subjectInfo.subject}>
                      <div className="border rounded h-100 p-3">
                        <h6 className="fw-semibold text-center mb-3">{subjectInfo.subject}</h6>
                        <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={subjectInfo.pieData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius="45%"
                                outerRadius="70%"
                                paddingAngle={4}
                                label={({ name, value }) => `${name}: ${value}`}
                                labelLine={false}
                              >
                                {subjectInfo.pieData.map((entry, index) => (
                                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Legend verticalAlign="bottom" height={30} />
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
        </ResponsiveContainer>
                        </div>
                        <p className="text-center text-muted small mb-1">
                          Highest: <span className="fw-semibold">{subjectInfo.highest}</span>
                        </p>
                        <p className="text-center small mb-0">
                          Pass: <span className="text-success fw-bold">{subjectInfo.passCount}</span> · Fail:{" "}
                          <span className="text-danger fw-bold">{subjectInfo.failCount}</span> · Absent:{" "}
                          <span className="text-muted fw-bold">{subjectInfo.absentCount}</span>
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h5 className="card-title mb-1">Students by Failed Subjects</h5>
                  <p className="text-muted small mb-0">
                    Shows how many students failed 1 subject, 2 subjects, and so on.
                  </p>
                </div>
      </div>

              {failDistributionData.length === 0 ? (
                <div className="alert alert-success mb-0">
                  No failing students detected in the dataset.
                </div>
              ) : (
                <div style={{ height: "420px" }}>
        <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={failDistributionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="40%"
                        outerRadius="70%"
                        paddingAngle={2}
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {failDistributionData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={FAIL_DISTRIBUTION_COLORS[index % FAIL_DISTRIBUTION_COLORS.length]}
                          />
                        ))}
                      </Pie>
            <Legend />
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
        </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-12">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h5 className="card-title mb-1">Arrear Details (Failed Subjects Count)</h5>
                  <p className="text-muted small mb-0">Distribution of students by arrear count.</p>
                </div>
              </div>

              <div style={{ height: "420px" }}>
                <ResponsiveContainer>
                  <BarChart data={MANUAL_ARREAR_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      label={{ value: "Arrear count", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      domain={[0, dataMax => Math.max(dataMax + 4, dataMax * 1.1)]}
                      label={{ value: "Students", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Students" fill="#ff6b6b" radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="value" position="top" style={{ fill: "#212529", fontWeight: 600 }} offset={8} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
