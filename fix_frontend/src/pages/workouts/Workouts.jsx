// src/pages/workouts/Workouts.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import UserContext from "../../context/User-Context";

const emptyExercise = () => ({ name: "", sets: 3, reps: 10, restTime: 30, videoUrl: "" });

export default function Workouts() {
  const { role, user } = useContext(UserContext);
  const [list, setList] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", clientId: "", startDate: "", endDate: "" });
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(null); // index of exercise being uploaded
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const canEdit = role === "Trainer" || role === "Admin";
  const isClient = role === "Client";

  const load = async () => {
    try {
      let res;
      if (isClient && user?._id) {
        // Client sees only their own plans
        const clientRes = await API.get("/client/me");
        const clientId = clientRes.data?.data?._id || clientRes.data?._id;
        if (clientId) {
          res = await API.get(`/workout/client/${clientId}`);
        } else {
          setList([]); setLoading(false); return;
        }
      } else {
        res = await API.get("/workout/list");
      }
      setList(res.data || []);
    } catch (e) {
      console.error("load workouts", e);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const res = await API.get("/user/clients");
      setClients(res.data || []);
    } catch (e) { console.error("load clients", e); }
  };

  useEffect(() => {
    load();
    if (canEdit) loadClients();
  }, []);

  const onFormChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const onExerciseChange = (i, e) => {
    const updated = [...exercises];
    updated[i] = { ...updated[i], [e.target.name]: e.target.value };
    setExercises(updated);
  };

  const resetForm = () => {
    setForm({ title: "", description: "", clientId: "", startDate: "", endDate: "" });
    setExercises([emptyExercise()]);
    setShowForm(false);
    setEditItem(null);
    setErr("");
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.title) return setErr("Title is required");
    if (!form.startDate || !form.endDate) return setErr("Start and end dates required");
    const validEx = exercises.filter(ex => ex.name && ex.sets && ex.reps);
    if (validEx.length === 0) return setErr("Add at least one complete exercise (name, sets, reps)");

    setSaving(true);
    try {
      const payload = {
        ...form,
        exercises: validEx.map((ex, i) => ({
          exerciseId: `ex_${i}_${Date.now()}`,
          name: ex.name,
          sets: Number(ex.sets),
          reps: Number(ex.reps),
          restTime: Number(ex.restTime) || 30
        }))
      };
      if (editItem) {
        await API.put(`/workout/${editItem._id}`, payload);
        setMsg("Workout updated!");
      } else {
        await API.post("/workout/create", payload);
        setMsg("Workout created!");
      }
      resetForm();
      load();
    } catch (e) {
      const raw = e.response?.data?.errors;
      setErr(Array.isArray(raw) ? raw.map(x => x.message || x).join(", ") : (raw || "Failed to save workout"));
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const startEdit = (w) => {
    setEditItem(w);
    setForm({
      title: w.title || "",
      description: w.description || "",
      clientId: w.clientId?._id || w.clientId || "",
      startDate: w.startDate ? w.startDate.slice(0, 10) : "",
      endDate: w.endDate ? w.endDate.slice(0, 10) : ""
    });
    setExercises(Array.isArray(w.exercises) && w.exercises.length > 0
      ? w.exercises.map(ex => ({ name: ex.name, sets: ex.sets, reps: ex.reps, restTime: ex.restTime || 30, videoUrl: ex.videoUrl || "" }))
      : [emptyExercise()]);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this workout?")) return;
    try { await API.delete(`/workout/${id}`); load(); }
    catch (e) { console.error(e); }
  };

  const uploadVideo = async (idx, file) => {
    if (!file) return;
    setUploadingVideo(idx);
    try {
      const fd = new FormData();
      fd.append("video", file);
      const res = await API.post("/upload/video", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const url = res.data?.url;
      if (url) {
        const updated = [...exercises];
        updated[idx] = { ...updated[idx], videoUrl: url };
        setExercises(updated);
        setMsg("Video uploaded!");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (e) {
      setErr("Video upload failed. Ensure CLOUDINARY vars are set in backend .env");
    } finally {
      setUploadingVideo(null);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Workout Plans</h3>
        {canEdit && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            + Add Workout Plan
          </button>
        )}
      </div>

      {msg && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", padding: 10, borderRadius: 4, marginBottom: 12 }}>{msg}</div>}
      {err && <div style={{ background: "#fee", border: "1px solid #fca5a5", padding: 10, borderRadius: 4, marginBottom: 12 }}>{err}</div>}

      {showForm && canEdit && (
        <form onSubmit={save} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <h4 style={{ marginTop: 0 }}>{editItem ? "Edit" : "New"} Workout Plan</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Title *</label>
              <input name="title" value={form.title} onChange={onFormChange} required placeholder="e.g. Full Body Blast"
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Assign to Client</label>
              <select name="clientId" value={form.clientId} onChange={onFormChange}
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                <option value="">— General (no client) —</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name || c.email}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Start Date *</label>
              <input name="startDate" type="date" value={form.startDate} onChange={onFormChange} required
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>End Date *</label>
              <input name="endDate" type="date" value={form.endDate} onChange={onFormChange} required
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Description</label>
              <textarea name="description" value={form.description} onChange={onFormChange} rows={2} placeholder="Describe the workout..."
                style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontWeight: 600 }}>Exercises * (name, sets, reps required)</label>
              <button type="button" onClick={() => setExercises([...exercises, emptyExercise()])}
                style={{ padding: "4px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                + Add Exercise
              </button>
            </div>
            {exercises.map((ex, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", flexWrap: "wrap", gap: 8, marginBottom: 8, background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }}>
                <input name="name" value={ex.name} onChange={e => onExerciseChange(i, e)} placeholder="Exercise name *"
                  style={{ padding: 6, border: "1px solid #ccc", borderRadius: 4 }} />
                <input name="sets" type="number" value={ex.sets} onChange={e => onExerciseChange(i, e)} placeholder="Sets" min="1"
                  style={{ padding: 6, border: "1px solid #ccc", borderRadius: 4 }} />
                <input name="reps" type="number" value={ex.reps} onChange={e => onExerciseChange(i, e)} placeholder="Reps" min="1"
                  style={{ padding: 6, border: "1px solid #ccc", borderRadius: 4 }} />
                <input name="restTime" type="number" value={ex.restTime} onChange={e => onExerciseChange(i, e)} placeholder="Rest (sec)"
                  style={{ padding: 6, border: "1px solid #ccc", borderRadius: 4 }} />
                {exercises.length > 1 && (
                  <button type="button" onClick={() => setExercises(exercises.filter((_, idx) => idx !== i))}
                    style={{ padding: "4px 8px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>✕</button>
                )}
                {/* Video URL or upload */}
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, alignItems: "center" }}>
                  <input name="videoUrl" value={ex.videoUrl || ""} onChange={e => onExerciseChange(i, e)} placeholder="Video URL (optional, or upload below)"
                    style={{ flex: 1, padding: 6, border: "1px solid #ccc", borderRadius: 4, fontSize: 12 }} />
                  <label style={{ cursor: "pointer", padding: "5px 10px", background: "#f3f4f6", border: "1px solid #ccc", borderRadius: 4, fontSize: 12, whiteSpace: "nowrap" }}>
                    {uploadingVideo === i ? "Uploading..." : "📹 Upload Clip"}
                    <input type="file" accept="video/*" style={{ display: "none" }}
                      onChange={e => uploadVideo(i, e.target.files[0])} disabled={uploadingVideo !== null} />
                  </label>
                  {ex.videoUrl && (
                    <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "#2563eb", whiteSpace: "nowrap" }}>▶ Preview</a>
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
        <p style={{ color: "#888" }}>
          {isClient ? "No workout plans assigned to you yet." : 'No workout plans. Click "+ Add Workout Plan" to create one.'}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {list.map(w => (
            <div key={w._id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <strong style={{ fontSize: 16 }}>{w.title || "Workout Plan"}</strong>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: w.status === "active" ? "#d1fae5" : "#f3f4f6", color: w.status === "active" ? "#16a34a" : "#6b7280" }}>
                  {w.status}
                </span>
              </div>
              {w.clientId && <div style={{ fontSize: 13, color: "#2563eb", marginBottom: 6 }}>👤 {w.clientId?.name || w.clientId?.email || "Client assigned"}</div>}
              {w.description && <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>{w.description}</div>}
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                {w.startDate && `📅 ${new Date(w.startDate).toLocaleDateString()} → ${new Date(w.endDate).toLocaleDateString()}`}
              </div>
              {Array.isArray(w.exercises) && w.exercises.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>EXERCISES ({w.exercises.length})</div>
                  {w.exercises.map((ex, i) => (
                    <div key={i} style={{ background: "#f9fafb", padding: "4px 8px", borderRadius: 4, marginBottom: 3, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{ex.name}</span>
                        <span style={{ color: "#888" }}>{ex.sets}×{ex.reps} · {ex.restTime}s rest</span>
                      </div>
                      {ex.videoUrl && (
                        <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: "#2563eb" }}>▶ Watch video</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {canEdit && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startEdit(w)}
                    style={{ padding: "6px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                    Edit
                  </button>
                  <button onClick={() => remove(w._id)}
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
