// src/pages/trainers/Trainers.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import UserContext from "../../context/User-Context";

export default function Trainers() {
  const { role } = useContext(UserContext);
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", specialization: "", experience: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await API.get("/trainer/list");
      // API returns { message, data: [...] }
      const raw = res.data?.data || res.data || [];
      setList(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error("load trainers", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await API.post("/trainer/create", { ...form, experience: Number(form.experience) });
      setMsg("Trainer profile created!");
      setForm({ name: "", specialization: "", experience: "", bio: "" });
      setShowForm(false);
      load();
    } catch (e) {
      const errMsg = e.response?.data?.errors;
      setErr(Array.isArray(errMsg) ? errMsg.map(x => x.message || x).join(", ") : (errMsg || "Failed to create trainer"));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this trainer?")) return;
    try { await API.delete(`/trainer/${id}`); load(); }
    catch (e) { console.error(e); }
  };

  const canCreate = role === "Trainer" || role === "Admin";
  const canDelete = role === "Admin" || role === "Trainer";

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Trainers</h3>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            {showForm ? "Cancel" : "+ Create My Profile"}
          </button>
        )}
      </div>

      {msg && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", padding: 10, borderRadius: 4, marginBottom: 12 }}>{msg}</div>}
      {err && <div style={{ background: "#fee", border: "1px solid #fca5a5", padding: 10, borderRadius: 4, marginBottom: 12 }}>{err}</div>}

      {showForm && canCreate && (
        <form onSubmit={create} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h4 style={{ marginTop: 0 }}>Create Trainer Profile</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Name *</label>
              <input name="name" value={form.name} onChange={onChange} required placeholder="Your full name"
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Specialization *</label>
              <input name="specialization" value={form.specialization} onChange={onChange} required placeholder="e.g. Weight Loss, Yoga"
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Experience (years) *</label>
              <input name="experience" type="number" value={form.experience} onChange={onChange} required min="0" placeholder="e.g. 5"
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Bio</label>
              <input name="bio" value={form.bio} onChange={onChange} placeholder="Short bio"
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
          </div>
          <button type="submit" style={{ marginTop: 12, padding: "8px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            Save Profile
          </button>
        </form>
      )}

      {loading ? <p>Loading...</p> : list.length === 0 ? (
        <p style={{ color: "#888" }}>No trainer profiles yet. {canCreate ? 'Click "+ Create My Profile" above.' : ''}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {list.map(t => (
            <div key={t._id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20, color: "#2563eb" }}>
                  {(t.name || "T")[0].toUpperCase()}
                </div>
                <div>
                  <strong>{t.name || t.userId?.name || "—"}</strong>
                  <div style={{ color: "#2563eb", fontSize: 13 }}>{t.specialization}</div>
                </div>
              </div>
              {t.experience !== undefined && <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Experience: {t.experience} years</div>}
              {t.bio && <div style={{ fontSize: 13, color: "#777", marginBottom: 8 }}>{t.bio}</div>}
              <div style={{ fontSize: 13, color: t.isAvailable ? "#16a34a" : "#dc2626" }}>
                {t.isAvailable ? "✓ Available" : "✗ Unavailable"}
              </div>
              {canDelete && (
                <button onClick={() => remove(t._id)}
                  style={{ marginTop: 10, padding: "6px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
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
