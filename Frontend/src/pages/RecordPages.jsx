import { useEffect, useState } from "react";
import {
  apiGetStudents, apiGetAllAttendance,
  apiGetAttendance, apiSaveAttendance,
} from "../api/services";
import { useToast } from "../hooks/useToast";
import { todayKey, formatDate, formatDateLong, initials } from "../utils/helpers";
import * as XLSX from "xlsx";

export default function RecordsPage() {
  const [students,    setStudents]    = useState([]);
  const [allRecords,  setAllRecords]  = useState([]); // array of Attendance docs
  const [todayAtt,    setTodayAtt]    = useState({});  // { studentId: status }
  const [filterFrom,  setFilterFrom]  = useState("");
  const [filterTo,    setFilterTo]    = useState(todayKey());
  const [loading,     setLoading]     = useState(true);
  const { toast, ToastContainer }     = useToast();
  const dateKey = todayKey();

  useEffect(() => {
    const load = async () => {
      try {
        const [studs, docs, todayDoc] = await Promise.all([
          apiGetStudents(),
          apiGetAllAttendance(),
          apiGetAttendance(dateKey).catch(() => null),
        ]);
        setStudents(studs);
        setAllRecords(docs);

        // Build today map
        const map = {};
        if (todayDoc?.records) {
          todayDoc.records.forEach((r) => { map[String(r.studentId)] = r.status; });
        }
        setTodayAtt(map);

        // Set default from date
        if (docs.length) setFilterFrom(docs[0].dateKey);
      } catch (err) {
        toast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Save today's attendance to DB
  const handleSave = async () => {
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: s.status === "frozen" ? "F" : todayAtt[String(s._id)] || "A",
      }));
      const saved = await apiSaveAttendance(dateKey, records);
      // Upsert into local allRecords
      setAllRecords((prev) => {
        const idx = prev.findIndex((d) => d.dateKey === dateKey);
        if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
        return [...prev, saved].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      });
      toast(`Attendance for ${formatDate(dateKey)} saved to records.`, "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  // Filtered dates
  const filteredDocs = allRecords.filter(
    (d) => (!filterFrom || d.dateKey >= filterFrom) && (!filterTo || d.dateKey <= filterTo)
  );
  const filteredDates = filteredDocs.map((d) => d.dateKey);

  // Helper: get status of a student on a date
  const getStatus = (dateKey, studentId) => {
    const doc = allRecords.find((d) => d.dateKey === dateKey);
    if (!doc) return null;
    const rec = doc.records.find((r) => String(r.studentId) === String(studentId));
    return rec?.status || null;
  };

  /* ── Excel export ── */
  const exportExcel = () => {
    if (!filteredDates.length) { toast("No records in selected range.", "error"); return; }

    const header = ["Roll No.", "Student Name", ...filteredDates.map(formatDate), "Present", "Absent", "Attendance %"];
    const rows = students.map((s) => {
      let p = 0, a = 0, eligible = 0;
      const cells = filteredDates.map((d) => {
        const v = getStatus(d, s._id);
        if (!v) return "—";
        if (v === "P") { p++; eligible++; return "P"; }
        if (v === "A") { a++; eligible++; return "A"; }
        return "Frozen";
      });
      return [s.roll, s.name, ...cells, p, a, eligible > 0 ? `${Math.round((p / eligible) * 100)}%` : "—"];
    });

    const totals = ["", "Daily Present Total",
      ...filteredDates.map((d) => {
        const doc = allRecords.find((r) => r.dateKey === d);
        return (doc?.records || []).filter((r) => r.status === "P").length;
      }), "", "", ""];

    const wb  = XLSX.utils.book_new();
    const ws  = XLSX.utils.aoa_to_sheet([header, ...rows, totals]);
    ws["!cols"] = [{ wch: 10 }, { wch: 22 }, ...filteredDates.map(() => ({ wch: 10 })), { wch: 9 }, { wch: 9 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    const ws2 = XLSX.utils.aoa_to_sheet([
      ["StudyCircle — Attendance Report"],
      [`Period: ${formatDateLong(filteredDates[0])} to ${formatDateLong(filteredDates[filteredDates.length - 1])}`],
      [`Total Students: ${students.length}`, `Sessions: ${filteredDates.length}`],
      [],
      ["Date", "Present", "Absent", "Frozen", "Total Active"],
      ...filteredDates.map((d) => {
        const doc = allRecords.find((r) => r.dateKey === d);
        const vals = doc?.records || [];
        const p = vals.filter((r) => r.status === "P").length;
        const a = vals.filter((r) => r.status === "A").length;
        const f = vals.filter((r) => r.status === "F").length;
        return [formatDate(d), p, a, f, p + a];
      }),
    ]);
    ws2["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Daily Summary");

    XLSX.writeFile(wb, `StudyCircle_Attendance_${filterFrom}_to_${filterTo}.xlsx`);
    toast("Excel downloaded!", "success");
  };

  /* ── PDF export ── */
  const exportPDF = async () => {
    if (!filteredDates.length) { toast("No records in selected range.", "error"); return; }
    const { jsPDF } = await import("jspdf");
    await import("jspdf-autotable");

    const doc = new jsPDF({
      orientation: filteredDates.length > 8 ? "landscape" : "portrait",
      unit: "mm", format: "a4",
    });

    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("StudyCircle — Attendance Report", 14, 18);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Period: ${formatDateLong(filteredDates[0])} → ${formatDateLong(filteredDates[filteredDates.length - 1])}   |   Students: ${students.length}   |   Sessions: ${filteredDates.length}`,
      14, 26
    );
    doc.setTextColor(0, 0, 0);

    const head = [["Roll", "Name", ...filteredDates.map(formatDate), "P", "A", "%"]];
    const body = students.map((s) => {
      let p = 0, a = 0, eligible = 0;
      const cells = filteredDates.map((d) => {
        const v = getStatus(d, s._id);
        if (!v) return "—";
        if (v === "P") { p++; eligible++; return "P"; }
        if (v === "A") { a++; eligible++; return "A"; }
        return "❄";
      });
      return [s.roll, s.name, ...cells, p, a, eligible > 0 ? `${Math.round((p / eligible) * 100)}%` : "—"];
    });
    const totalsRow = ["", "Present/day",
      ...filteredDates.map((d) => {
        const doc2 = allRecords.find((r) => r.dateKey === d);
        return (doc2?.records || []).filter((r) => r.status === "P").length;
      }), "", "", ""];
    body.push(totalsRow);

    doc.autoTable({
      startY: 32, head, body, theme: "grid",
      headStyles: { fillColor: [15, 14, 13], textColor: [245, 242, 235], fontSize: 7, fontStyle: "bold", cellPadding: 2 },
      bodyStyles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 16 }, 1: { cellWidth: 30 },
        ...Object.fromEntries(filteredDates.map((_, i) => [i + 2, { cellWidth: 11, halign: "center" }])),
        [filteredDates.length + 2]: { cellWidth: 8, halign: "center", fontStyle: "bold", textColor: [26, 122, 66] },
        [filteredDates.length + 3]: { cellWidth: 8, halign: "center", fontStyle: "bold", textColor: [200, 96, 42] },
        [filteredDates.length + 4]: { cellWidth: 12, halign: "center", fontStyle: "bold" },
      },
      didParseCell(data) {
        if (data.section !== "body") return;
        const v = data.cell.raw;
        if (v === "P") { data.cell.styles.fillColor = [212, 240, 224]; data.cell.styles.textColor = [26, 122, 66]; data.cell.styles.fontStyle = "bold"; }
        else if (v === "A") { data.cell.styles.fillColor = [253, 232, 216]; data.cell.styles.textColor = [200, 96, 42]; data.cell.styles.fontStyle = "bold"; }
        else if (data.row.index === body.length - 1) { data.cell.styles.fillColor = [240, 238, 233]; data.cell.styles.fontStyle = "bold"; }
      },
      margin: { left: 14, right: 14 },
    });

    doc.addPage();
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text("Daily Summary", 14, 18);
    const sumBody = filteredDates.map((d) => {
      const doc2 = allRecords.find((r) => r.dateKey === d);
      const vals = doc2?.records || [];
      const p = vals.filter((r) => r.status === "P").length;
      const a = vals.filter((r) => r.status === "A").length;
      const f = vals.filter((r) => r.status === "F").length;
      const total = p + a;
      return [formatDate(d), p, a, f, total, total > 0 ? `${Math.round((p / total) * 100)}%` : "—"];
    });
    doc.autoTable({
      startY: 26,
      head: [["Date", "Present", "Absent", "Frozen", "Total Active", "% Present"]],
      body: sumBody, theme: "grid",
      headStyles: { fillColor: [15, 14, 13], textColor: [245, 242, 235], fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        1: { halign: "center", textColor: [26, 122, 66], fontStyle: "bold" },
        2: { halign: "center", textColor: [200, 96, 42], fontStyle: "bold" },
        3: { halign: "center", textColor: [42, 110, 200] },
        4: { halign: "center" },
        5: { halign: "center", fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
    });

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i); doc.setFontSize(7); doc.setTextColor(160, 160, 160);
      doc.text(
        `StudyCircle Admin · Generated ${new Date().toLocaleDateString("en-IN")} · Page ${i} of ${pages}`,
        14, doc.internal.pageSize.getHeight() - 8
      );
    }
    doc.save(`StudyCircle_Attendance_${filterFrom}_to_${filterTo}.pdf`);
    toast("PDF downloaded!", "success");
  };

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;

  return (
    <>
      {/* Save banner */}
      <div className="save-banner">
        <div>
          <h3>Save today's attendance to records</h3>
          <p>Locks today's marked attendance into the database. Export any date range as Excel or PDF.</p>
        </div>
        <button className="btn btn-green" onClick={handleSave}>💾 Save Today's Attendance</button>
      </div>

      {/* Toolbar */}
      <div className="records-toolbar">
        <label>From</label>
        <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
        <label>To</label>
        <input type="date" value={filterTo}   onChange={(e) => setFilterTo(e.target.value)} />
        <div className="toolbar-sep" />
        <button className="btn btn-dark"   onClick={exportExcel}>📊 Download Excel</button>
        <button className="btn btn-accent" onClick={exportPDF}>📄 Download PDF</button>
        <div className="toolbar-sep" />
        <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
          {filteredDates.length} session{filteredDates.length !== 1 ? "s" : ""} in range
        </span>
      </div>

      {/* Table */}
      {!filteredDates.length ? (
        <div className="empty-records">
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No records found</div>
          <div>Save today's attendance first, or adjust the date filter.</div>
        </div>
      ) : (
        <div className="records-table-wrap">
          <table className="records-table">
            <thead>
              <tr>
                <th>Student</th>
                {filteredDates.map((d) => <th key={d} className="date-col">{formatDate(d)}</th>)}
                <th style={{ background: "#f0fbf6", color: "#1a7a42" }}>Present</th>
                <th style={{ background: "#fde8d8", color: "var(--accent)" }}>Absent</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                let pCount = 0, aCount = 0, eligible = 0;
                const cells = filteredDates.map((d) => {
                  const v = getStatus(d, s._id);
                  if (!v) return <td key={d}><span className="rec-na">—</span></td>;
                  if (v === "P") { pCount++; eligible++; return <td key={d}><span className="rec-present">P</span></td>; }
                  if (v === "A") { aCount++; eligible++; return <td key={d}><span className="rec-absent">A</span></td>; }
                  return <td key={d}><span className="rec-frozen">❄</span></td>;
                });
                const rate       = eligible > 0 ? Math.round((pCount / eligible) * 100) : null;
                const rateColor  = rate !== null ? (rate >= 75 ? "#1a7a42" : rate >= 50 ? "var(--accent)" : "var(--red)") : "var(--muted)";
                return (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="s-av" style={{ background: s.color }}>{initials(s.name)}</div>
                        <div>{s.name}<div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{s.roll}</div></div>
                      </div>
                    </td>
                    {cells}
                    <td style={{ color: "#1a7a42",        fontWeight: 600 }}>{pCount}</td>
                    <td style={{ color: "var(--accent)",  fontWeight: 600 }}>{aCount}</td>
                    <td style={{ color: rateColor,        fontWeight: 600 }}>{rate !== null ? `${rate}%` : "—"}</td>
                  </tr>
                );
              })}
              <tr className="summary-row">
                <td>Daily Total Present</td>
                {filteredDates.map((d) => {
                  const doc = allRecords.find((r) => r.dateKey === d);
                  const p   = (doc?.records || []).filter((r) => r.status === "P").length;
                  return <td key={d}><strong>{p}</strong></td>;
                })}
                <td colSpan={3} />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer />
    </>
  );
}