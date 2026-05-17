// src/pages/progress/Progress.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import UserContext from "../../context/User-Context";

export default function Progress() {
  const { role, user } = useContext(UserContext);
  const [list, setList] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ clientId: "", weight: "", bmi: "", bodyFat: "", caloriesBurned: "", workoutDuration: "", notes: "", date: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const canEdit = role === "Trainer" || role === "Admin";
  const isClient = role === "Client";

  const load = async () => {
    try {
      let res;
      if (isClient && user?._id) {
        const clientRes = await API.get("/client/me");
        const clientId = clientRes.data?.data?._id || clientRes.data?._id;
        if (clientId) res = await API.get(`/progress/client/${clientId}`);
        else { setList([]); setLoading(false); return; }
      } else {
        res = await API.get("/progress/list");
      }
      const raw = res.data?.data || res.data || [];
      setList(Array.isArray(raw) ? raw : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (canEdit) API.get("/user/clients").then(r => setClients(r.data || [])).catch(() => {});
  }, []);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({ clientId: "", weight: "", bmi: "", bodyFat: "", caloriesBurned: "", workoutDuration: "", notes: "", date: "" });
    setShowForm(false);
    setEditItem(null);
    setErr("");
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.clientId) return setErr("Please select a client");
    if (!form.weight || !form.bmi || !form.bodyFat || !form.caloriesBurned)
      return setErr("Weight, BMI, Body Fat, and Calories Burned are required");

    setSaving(true);
    try {
      const payload = {
        clientId: form.clientId,
        weight: Number(form.weight),
        bmi: Number(form.bmi),
        bodyFat: Number(form.bodyFat),
        caloriesBurned: Number(form.caloriesBurned),
        workoutDuration: form.workoutDuration ? Number(form.workoutDuration) : 0,
        notes: form.notes,
        date: form.date || undefined
      };
      if (editItem) {
        await API.put(`/progress/${editItem._id}`, payload);
        setMsg("Progress updated!");
      } else {
        await API.post("/progress/create", payload);
        setMsg("Progress logged!");
      }
      resetForm();
      load();
    } catch (e) {
      const raw = e.response?.data?.errors;
      setErr(Array.isArray(raw) ? raw.map(x => x.message || x).join(", ") : (raw || "Failed to save progress"));
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const startEdit = (p) => {
    setEditItem(p);
    setForm({
      clientId: p.clientId?._id || p.clientId || "",
      weight: p.weight || "",
      bmi: p.bmi || "",
      bodyFat: p.bodyFat || "",
      caloriesBurned: p.caloriesBurned || "",
      workoutDuration: p.workoutDuration || "",
      notes: p.notes || "",
      date: p.date ? p.date.slice(0, 10) : ""
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try { await API.delete(`/progress/${id}`); load(); }
    catch (e) { console.error(e); }
  };

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Progress Tracker</h3>
        {canEdit && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            + Log Progress
          </button>
        )}
      </div>

      {msg && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", padding: 10, borderRadius: 4, marginBottom: 12 }}>{msg}</div>}
      {err && <div style={{ background: "#fee", border: "1px solid #fca5a5", padding: 10, borderRadius: 4, marginBottom: 12 }}>{err}</div>}

      {showForm && canEdit && (
        <form onSubmit={save} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <h4 style={{ marginTop: 0 }}>{editItem ? "Edit" : "Log New"} Progress</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Client *</label>
              <select name="clientId" value={form.clientId} onChange={onChange} required
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                <option value="">Select Client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name || c.email}</option>)}
              </select>
            </div>
            {[
              { name: "weight", label: "Weight (kg) *", type: "number", step: "0.1" },
              { name: "bmi", label: "BMI *", type: "number", step: "0.1" },
              { name: "bodyFat", label: "Body Fat (%) *", type: "number", step: "0.1" },
              { name: "caloriesBurned", label: "Calories Burned *", type: "number" },
              { name: "workoutDuration", label: "Workout Duration (min)", type: "number" },
              { name: "date", label: "Date", type: "date" }
            ].map(f => (
              <div key={f.name}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>{f.label}</label>
                <input name={f.name} type={f.type} step={f.step} value={form[f.name]} onChange={onChange}
                  style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Notes</label>
              <textarea name="notes" value={form.notes} onChange={onChange} rows={2}
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving}
              style={{ padding: "8px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              {saving ? "Saving..." : editItem ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm}
              style={{ padding: "8px 16px", background: "#6b7280", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : list.length === 0 ? (
        <p style={{ color: "#888" }}>{isClient ? "No progress records yet." : 'No progress entries. Click "+ Log Progress".'}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {list.map(p => (
            <div key={p._id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" }}>
              <div style={{ marginBottom: 8 }}>
                <strong>{p.clientId?.name || p.clientId?.userId?.name || "Client"}</strong>
                <span style={{ float: "right", fontSize: 12, color: "#888" }}>{p.date ? new Date(p.date).toLocaleDateString() : "—"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 13, marginBottom: 8 }}>
                <div>⚖️ Weight: <strong>{p.weight} kg</strong></div>
                <div>📊 BMI: <strong>{p.bmi}</strong></div>
                <div>🔥 Body Fat: <strong>{p.bodyFat}%</strong></div>
                <div>💪 Calories: <strong>{p.caloriesBurned}</strong></div>
                {p.workoutDuration > 0 && <div>⏱️ Duration: <strong>{p.workoutDuration} min</strong></div>}
              </div>
              {p.notes && <div style={{ fontSize: 13, color: "#666", background: "#f9fafb", padding: 8, borderRadius: 4, marginBottom: 8 }}>{p.notes}</div>}
              {canEdit && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startEdit(p)}
                    style={{ padding: "5px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>Edit</button>
                  <button onClick={() => remove(p._id)}
                    style={{ padding: "5px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
