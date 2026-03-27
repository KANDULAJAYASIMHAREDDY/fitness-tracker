// src/pages/subscriptions/Subscriptions.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import UserContext from "../../context/User-Context";

const PLANS = [
  { label: "Basic", price: 999, duration: 30 },
  { label: "Standard", price: 2499, duration: 90 },
  { label: "Premium", price: 4999, duration: 180 },
  { label: "Elite", price: 8999, duration: 365 },
];

export default function Subscriptions() {
  const { role, user } = useContext(UserContext);
  const [list, setList] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: "", planName: "", price: "", startDate: "", endDate: "", paymentStatus: "pending" });
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
        if (clientId) res = await API.get(`/subscription/client/${clientId}`);
        else { setList([]); setLoading(false); return; }
      } else {
        res = await API.get("/subscription/list");
      }
      setList(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (canEdit) API.get("/user/clients").then(r => setClients(r.data || [])).catch(() => {});
  }, []);

  const selectPlan = (plan) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + plan.duration);
    setForm(prev => ({
      ...prev,
      planName: plan.label,
      price: plan.price,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    }));
    setShowForm(true);
  };

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.clientId) return setErr("Please select a client");
    if (!form.planName || !form.price) return setErr("Plan name and price are required");
    setSaving(true);
    try {
      await API.post("/subscription/create", { ...form, price: Number(form.price) });
      setMsg("Subscription created!");
      setForm({ clientId: "", planName: "", price: "", startDate: "", endDate: "", paymentStatus: "pending" });
      setShowForm(false);
      load();
    } catch (e) {
      const raw = e.response?.data?.errors;
      setErr(Array.isArray(raw) ? raw.map(x => x.message || x).join(", ") : (raw || "Failed to create subscription"));
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try { await API.delete(`/subscription/${id}`); load(); }
    catch (e) { console.error(e); }
  };

  const statusColor = { paid: "#16a34a", pending: "#d97706", failed: "#dc2626" };

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <h3>Subscriptions</h3>

      {msg && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", padding: 10, borderRadius: 4, marginBottom: 12 }}>{msg}</div>}
      {err && <div style={{ background: "#fee", border: "1px solid #fca5a5", padding: 10, borderRadius: 4, marginBottom: 12 }}>{err}</div>}

      {canEdit && (
        <>
          <h4>Choose a Plan to Assign</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {PLANS.map(plan => (
              <div key={plan.label} onClick={() => selectPlan(plan)}
                style={{ border: "2px solid #e5e7eb", borderRadius: 8, padding: 16, textAlign: "center", cursor: "pointer", background: "#fff" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{plan.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#2563eb", marginBottom: 4 }}>₹{plan.price.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{plan.duration} days</div>
                <button style={{ marginTop: 8, padding: "5px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                  Select
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && canEdit && (
        <form onSubmit={create} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <h4 style={{ marginTop: 0 }}>Assign Subscription</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Client *</label>
              <select name="clientId" value={form.clientId} onChange={onChange} required
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                <option value="">Select Client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name || c.email}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Plan Name *</label>
              <input name="planName" value={form.planName} onChange={onChange} required
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Price (₹) *</label>
              <input name="price" type="number" value={form.price} onChange={onChange} required min="0"
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Payment Status</label>
              <select name="paymentStatus" value={form.paymentStatus} onChange={onChange}
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Start Date *</label>
              <input name="startDate" type="date" value={form.startDate} onChange={onChange} required
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>End Date *</label>
              <input name="endDate" type="date" value={form.endDate} onChange={onChange} required
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving}
              style={{ padding: "8px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              {saving ? "Saving..." : "Create Subscription"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ padding: "8px 16px", background: "#6b7280", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <h4>All Subscriptions</h4>
      {loading ? <p>Loading...</p> : list.length === 0 ? (
        <p style={{ color: "#888" }}>{isClient ? "No subscriptions for you yet." : "No subscriptions found."}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {list.map(s => (
            <div key={s._id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <strong>{s.planName}</strong>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, fontWeight: 600, color: statusColor[s.paymentStatus] || "#888", background: "#f9fafb" }}>
                  {s.paymentStatus}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
                👤 {s.clientId?.name || s.clientId?.userId?.name || "Client"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>₹{s.price?.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {s.startDate && `${new Date(s.startDate).toLocaleDateString()} → ${new Date(s.endDate).toLocaleDateString()}`}
              </div>
              {canEdit && (
                <button onClick={() => remove(s._id)}
                  style={{ marginTop: 10, padding: "5px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
