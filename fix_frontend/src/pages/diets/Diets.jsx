// src/pages/diets/Diets.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import UserContext from "../../context/User-Context";

const emptyMeal = () => ({ name: "", foodItems: "", calories: "" });

export default function Diets() {
  const { role, user } = useContext(UserContext);
  const [list, setList] = useState([]);
  const [clients, setClients] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ clientId: "", trainerId: "" });
  const [meals, setMeals] = useState([emptyMeal()]);
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
        if (clientId) {
          res = await API.get(`/diet/client/${clientId}`);
        } else { setList([]); setLoading(false); return; }
      } else {
        res = await API.get("/diet/list");
      }
      setList(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (canEdit) {
      API.get("/user/clients").then(r => setClients(r.data || [])).catch(() => {});
      API.get("/user/trainers").then(r => setTrainers(r.data || [])).catch(() => {});
    }
  }, []);

  const onMealChange = (i, e) => {
    const updated = [...meals];
    updated[i] = { ...updated[i], [e.target.name]: e.target.value };
    setMeals(updated);
  };

  const resetForm = () => {
    setForm({ clientId: "", trainerId: "" });
    setMeals([emptyMeal()]);
    setShowForm(false);
    setEditItem(null);
    setErr("");
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.clientId) return setErr("Please select a client");
    const validMeals = meals.filter(m => m.name && m.calories);
    if (validMeals.length === 0) return setErr("Add at least one meal with name and calories");

    setSaving(true);
    try {
      // find trainer id - either selected or auto-detect
      let trainerId = form.trainerId;
      if (!trainerId && trainers.length > 0) {
        // find trainer that matches current user
        const myTrainer = trainers.find(t => String(t.userId) === String(user?._id));
        if (myTrainer) trainerId = myTrainer._id;
        else trainerId = trainers[0]._id; // fallback to first trainer
      }

      const parsedMeals = validMeals.map(m => ({
        name: m.name,
        foodItems: m.foodItems ? m.foodItems.split(",").map(f => f.trim()).filter(Boolean) : [],
        calories: Number(m.calories)
      }));
      const totalCalories = parsedMeals.reduce((sum, m) => sum + m.calories, 0);

      const payload = { clientId: form.clientId, trainerId, meals: parsedMeals, totalCalories };

      if (editItem) {
        await API.put(`/diet/${editItem._id}`, payload);
        setMsg("Diet plan updated!");
      } else {
        await API.post("/diet/create", payload);
        setMsg("Diet plan created!");
      }
      resetForm();
      load();
    } catch (e) {
      const raw = e.response?.data?.errors;
      setErr(Array.isArray(raw) ? raw.map(x => x.message || x).join(", ") : (raw || "Failed to save diet plan"));
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const startEdit = (d) => {
    setEditItem(d);
    setForm({
      clientId: d.clientId?._id || d.clientId || "",
      trainerId: d.trainerId?._id || d.trainerId || ""
    });
    setMeals(Array.isArray(d.meals) && d.meals.length > 0
      ? d.meals.map(m => ({ name: m.name, foodItems: Array.isArray(m.foodItems) ? m.foodItems.join(", ") : m.foodItems || "", calories: m.calories }))
      : [emptyMeal()]);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this diet plan?")) return;
    try { await API.delete(`/diet/${id}`); load(); }
    catch (e) { console.error(e); }
  };

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Diet Plans</h3>
        {canEdit && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            + Add Diet Plan
          </button>
        )}
      </div>

      {msg && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", padding: 10, borderRadius: 4, marginBottom: 12 }}>{msg}</div>}
      {err && <div style={{ background: "#fee", border: "1px solid #fca5a5", padding: 10, borderRadius: 4, marginBottom: 12 }}>{err}</div>}

      {showForm && canEdit && (
        <form onSubmit={save} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <h4 style={{ marginTop: 0 }}>{editItem ? "Edit" : "New"} Diet Plan</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Assign to Client *</label>
              <select name="clientId" value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))} required
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                <option value="">Select Client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name || c.email}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Trainer</label>
              <select name="trainerId" value={form.trainerId} onChange={e => setForm(p => ({ ...p, trainerId: e.target.value }))}
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                <option value="">Auto-detect</option>
                {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontWeight: 600 }}>Meals *</label>
              <button type="button" onClick={() => setMeals([...meals, emptyMeal()])}
                style={{ padding: "4px 10px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                + Add Meal
              </button>
            </div>
            {meals.map((m, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: 10, marginBottom: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr auto", gap: 8 }}>
                  <input name="name" value={m.name} onChange={e => onMealChange(i, e)} placeholder="Meal name *" required
                    style={{ padding: 6, border: "1px solid #ccc", borderRadius: 4 }} />
                  <input name="foodItems" value={m.foodItems} onChange={e => onMealChange(i, e)} placeholder="Food items (comma separated)"
                    style={{ padding: 6, border: "1px solid #ccc", borderRadius: 4 }} />
                  <input name="calories" type="number" value={m.calories} onChange={e => onMealChange(i, e)} placeholder="Calories *" min="0"
                    style={{ padding: 6, border: "1px solid #ccc", borderRadius: 4 }} />
                  {meals.length > 1 && (
                    <button type="button" onClick={() => setMeals(meals.filter((_, idx) => idx !== i))}
                      style={{ padding: "4px 8px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving}
              style={{ padding: "8px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              {saving ? "Saving..." : editItem ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm}
              style={{ padding: "8px 16px", background: "#6b7280", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : list.length === 0 ? (
        <p style={{ color: "#888" }}>{isClient ? "No diet plans assigned to you yet." : 'No diet plans. Click "+ Add Diet Plan".'}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {list.map(d => (
            <div key={d._id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <strong>Diet Plan</strong>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: d.status === "active" ? "#d1fae5" : "#f3f4f6", color: d.status === "active" ? "#16a34a" : "#6b7280" }}>
                  {d.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#2563eb", marginBottom: 6 }}>
                👤 {d.clientId?.name || d.clientId?.userId?.name || "Client"}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
                Total: <strong>{d.totalCalories} kcal</strong>
              </div>
              {Array.isArray(d.meals) && d.meals.map((m, i) => (
                <div key={i} style={{ background: "#f9fafb", padding: "6px 10px", borderRadius: 4, marginBottom: 4, fontSize: 13 }}>
                  <strong>{m.name}</strong> — {m.calories} kcal
                  {Array.isArray(m.foodItems) && m.foodItems.length > 0 && (
                    <div style={{ color: "#888", fontSize: 12 }}>{m.foodItems.join(", ")}</div>
                  )}
                </div>
              ))}
              {canEdit && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => startEdit(d)}
                    style={{ padding: "6px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                    Edit
                  </button>
                  <button onClick={() => remove(d._id)}
                    style={{ padding: "6px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
