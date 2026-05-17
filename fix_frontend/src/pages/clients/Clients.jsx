// src/pages/clients/Clients.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import UserContext from "../../context/User-Context";

export default function Clients() {
  const { role } = useContext(UserContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const res = await API.get("/client/list");
      // API returns { message, data: [...] }
      const raw = res.data?.data || res.data || [];
      setList(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error("load clients", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      await API.post(`/client/${id}/approve`);
      setMsg("Client approved!");
      setTimeout(() => setMsg(""), 3000);
      load();
    } catch (e) {
      console.error("approve client", e);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    try { await API.delete(`/client/${id}`); load(); }
    catch (e) { console.error(e); }
  };

  const isAdmin = role === "Admin";
  const isTrainer = role === "Trainer";

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h3>Clients</h3>

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
        💡 <strong>How clients are added:</strong> Clients register themselves on the Register page (select "Client" role). Once registered, they appear here for approval.
      </div>

      {msg && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", padding: 10, borderRadius: 4, marginBottom: 12 }}>{msg}</div>}

      {loading ? <p>Loading...</p> : list.length === 0 ? (
        <p style={{ color: "#888" }}>No clients found. Clients must register at the Register page with the "Client" role.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {list.map((c) => {
            const name = c.name || c.userId?.name || "—";
            const email = c.email || c.userId?.email || "—";
            return (
              <div key={c._id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18, color: "#16a34a" }}>
                      {(name)[0].toUpperCase()}
                    </div>
                    <div>
                      <strong>{name}</strong>
                      <div style={{ fontSize: 13, color: "#888" }}>{email}</div>
                    </div>
                  </div>
                  <span style={{ padding: "3px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: c.approved ? "#d1fae5" : "#fef3c7", color: c.approved ? "#16a34a" : "#d97706" }}>
                    {c.approved ? "Approved" : "Pending"}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
                  <div>Goal: {c.goal || "—"}</div>
                  <div>Status: <span style={{ color: c.subscriptionStatus === "active" ? "#16a34a" : "#888" }}>{c.subscriptionStatus || "pending"}</span></div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {(isAdmin || isTrainer) && !c.approved && (
                    <button onClick={() => approve(c._id)}
                      style={{ padding: "6px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                      ✓ Approve
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => remove(c._id)}
                      style={{ padding: "6px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
