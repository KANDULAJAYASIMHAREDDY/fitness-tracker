// src/pages/payments/Payments.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import UserContext from "../../context/User-Context";

export default function Payments() {
  const { role, user } = useContext(UserContext);
  const [list, setList] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subscriptionId: "", clientId: "", amount: "", paymentMethod: "cash", transactionId: "", status: "success" });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const canEdit = role === "Trainer" || role === "Admin";
  const isClient = role === "Client";

  const load = async () => {
    try {
      let res;
      if (isClient) {
        const clientRes = await API.get("/client/me");
        const clientId = clientRes.data?.data?._id || clientRes.data?._id;
        if (clientId) {
          res = await API.get(`/payment/client/${clientId}`);
          // pre-fill clientId for payment form
          setForm(prev => ({ ...prev, clientId }));
        } else { setList([]); setLoading(false); return; }
      } else {
        res = await API.get("/payment/list");
      }
      const raw = res?.data?.data || res?.data || [];
      setList(Array.isArray(raw) ? raw : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (canEdit) {
      API.get("/subscription/list").then(r => { const d = r.data?.data || r.data || []; setSubscriptions(Array.isArray(d) ? d : []); }).catch(() => {});
      API.get("/user/clients").then(r => setClients(r.data || [])).catch(() => {});
    }
    if (isClient) {
      // Load client's own subscriptions
      API.get("/client/me").then(async clientRes => {
        const clientId = clientRes.data?.data?._id || clientRes.data?._id;
        if (clientId) {
          const subsRes = await API.get(`/subscription/client/${clientId}`);
          const d = subsRes.data?.data || subsRes.data || [];
          setSubscriptions(Array.isArray(d) ? d : []);
        }
      }).catch(() => {});
    }
  }, []);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubChange = (e) => {
    const subId = e.target.value;
    const sub = subscriptions.find(s => s._id === subId);
    setForm(prev => ({
      ...prev,
      subscriptionId: subId,
      amount: sub?.price || prev.amount,
      clientId: sub?.clientId?._id || sub?.clientId || prev.clientId,
    }));
  };

  const recordManual = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.subscriptionId || !form.clientId || !form.amount)
      return setErr("Subscription, Client and Amount are required");
    setSaving(true);
    try {
      await API.post("/payment/create", {
        subscriptionId: form.subscriptionId, clientId: form.clientId,
        amount: Number(form.amount), paymentMethod: form.paymentMethod,
        transactionId: form.transactionId || undefined, status: form.status,
      });
      setMsg("Payment recorded!");
      setForm(prev => ({ ...prev, subscriptionId: "", amount: "", transactionId: "" }));
      setShowForm(false);
      load();
    } catch (e) {
      const raw = e.response?.data?.errors;
      setErr(Array.isArray(raw) ? raw.map(x => x.message || x).join(", ") : (raw || "Failed to record payment"));
    } finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  };

  // Razorpay — supports UPI, Cards, Netbanking, Wallets
  const handleRazorpay = async (preferUPI = false) => {
    setErr("");
    if (!form.subscriptionId || !form.clientId || !form.amount)
      return setErr("Please select a subscription first");

    const loaded = await new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
    if (!loaded) return setErr("Could not load Razorpay. Check internet connection.");

    setSaving(true);
    try {
      const orderRes = await API.post("/razorpay/create-order", { amount: Number(form.amount), currency: "INR" });
      const { orderId, key, amount: orderAmount } = orderRes.data;

      // When preferUPI=true, restrict checkout to UPI only so it opens directly on UPI screen
      // When preferUPI=false, show all methods (cards default)
     const methodConfig = { upi: true, card: true, netbanking: true, wallet: true, paylater: true };
     
     const options = {
        key,
        amount: orderAmount,
        currency: "INR",
        name: "FitTracker",
        description: "Subscription Payment",
        order_id: orderId,
       
        handler: async (response) => {
          try {
            const vr = await API.post("/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (vr.data.success) {
              await API.post("/payment/create", {
                subscriptionId: form.subscriptionId, clientId: form.clientId,
                amount: Number(form.amount),
                paymentMethod: preferUPI ? "upi" : "razorpay",
                transactionId: response.razorpay_payment_id, status: "success",
              });
              setMsg(`✅ Payment successful! ID: ${response.razorpay_payment_id}`);
              setShowForm(false);
              setForm(prev => ({ ...prev, subscriptionId: "", amount: "", transactionId: "" }));
              load();
            } else {
              setErr("Payment verification failed.");
            }
          } catch { setErr("Error verifying payment."); }
          setSaving(false);
        },
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#2563eb" },
        modal: { ondismiss: () => { setMsg("Payment cancelled."); setSaving(false); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", r => { setErr(`Payment failed: ${r.error.description}`); setSaving(false); });
      rzp.open();
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to initiate Razorpay. Add RAZORPAY keys in backend .env");
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this payment?")) return;
    try { await API.delete(`/payment/${id}`); load(); }
    catch (e) { console.error(e); }
  };

  const statusColor = { success: "#16a34a", pending: "#d97706", failed: "#dc2626" };
  const totalRevenue = list.filter(p => p.status === "success").reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{isClient ? "My Payments" : "Payments"}</h3>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          {showForm ? "Cancel" : isClient ? "💳 Pay Now" : "+ Record Payment"}
        </button>
      </div>

      {canEdit && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Total Revenue", val: `₹${totalRevenue.toLocaleString()}`, color: "#16a34a" },
            { label: "Total Payments", val: list.length },
            { label: "Pending", val: list.filter(p => p.status === "pending").length, color: "#d97706" },
          ].map((s, i) => (
            <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" }}>
              <div style={{ color: "#888", fontSize: 13 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {msg && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", padding: 10, borderRadius: 4, marginBottom: 12 }}>{msg}</div>}
      {err && <div style={{ background: "#fee", border: "1px solid #fca5a5", padding: 10, borderRadius: 4, marginBottom: 12 }}>{err}</div>}

      {showForm && (
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <h4 style={{ marginTop: 0 }}>{isClient ? "Pay for Subscription" : "Record Payment"}</h4>

          {isClient ? (
            /* CLIENT self-pay: subscription select + Razorpay buttons */
            <div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Select Subscription *</label>
                <select name="subscriptionId" value={form.subscriptionId} onChange={onSubChange}
                  style={{ width: "100%", maxWidth: 400, padding: 8, border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box" }}>
                  <option value="">— Choose a subscription to pay —</option>
                  {subscriptions.map(s => (
                    <option key={s._id} value={s._id}>{s.planName} — ₹{s.price} ({s.duration} months)</option>
                  ))}
                </select>
              </div>
              {form.amount && (
                <div style={{ marginBottom: 16, padding: 12, background: "#eff6ff", borderRadius: 6, fontSize: 16, fontWeight: 600 }}>
                  Amount: ₹{form.amount}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" onClick={() => handleRazorpay(true)} disabled={saving || !form.subscriptionId}
                  style={{ padding: "10px 22px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>
                  📱 Pay via UPI
                </button>
                <button type="button" onClick={() => handleRazorpay(false)} disabled={saving || !form.subscriptionId}
                  style={{ padding: "10px 22px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
                  💳 Pay via Card / Netbanking
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                Supports Google Pay, PhonePe, Paytm UPI · Visa/Mastercard · Netbanking · Wallets
              </p>
            </div>
          ) : (
            /* TRAINER/ADMIN form */
            <form onSubmit={recordManual}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Subscription *</label>
                  <select name="subscriptionId" value={form.subscriptionId} onChange={onSubChange}
                    style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                    <option value="">Select Subscription</option>
                    {subscriptions.map(s => (
                      <option key={s._id} value={s._id}>{s.planName} — ₹{s.price} ({s.clientId?.name || "Client"})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Client *</label>
                  <select name="clientId" value={form.clientId} onChange={onChange}
                    style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name || c.email}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Amount (₹) *</label>
                  <input name="amount" type="number" value={form.amount} onChange={onChange} min="0"
                    style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Payment Method</label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={onChange}
                    style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="razorpay">Razorpay</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Transaction ID (optional)</label>
                  <input name="transactionId" value={form.transactionId} onChange={onChange} placeholder="e.g. TXN12345"
                    style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Status</label>
                  <select name="status" value={form.status} onChange={onChange}
                    style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" onClick={() => handleRazorpay(true)} disabled={saving}
                  style={{ padding: "8px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
                  📱 Collect via UPI
                </button>
                <button type="button" onClick={() => handleRazorpay(false)} disabled={saving}
                  style={{ padding: "8px 18px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
                  💳 Collect via Card
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                  {saving ? "Saving..." : "Record Manual (Cash/Offline)"}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                💡 Razorpay: UPI (GPay, PhonePe, Paytm) · Cards · Netbanking · Wallets. Record Manual for cash.
              </p>
            </form>
          )}
        </div>
      )}

      {loading ? <p>Loading...</p> : list.length === 0 ? (
        <p style={{ color: "#888" }}>{isClient ? "No payment records yet. Use \"Pay Now\" to make a payment." : "No payments recorded yet."}</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              {["Client", "Amount", "Method", "Transaction ID", "Status", "Date", ""].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "8px 10px", fontSize: 13, color: "#6b7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px", fontSize: 14 }}>{p.clientId?.name || p.clientId?.userId?.name || "—"}</td>
                <td style={{ padding: "10px", fontWeight: 700, color: "#16a34a" }}>₹{p.amount?.toLocaleString()}</td>
                <td style={{ padding: "10px", fontSize: 13, textTransform: "capitalize" }}>{(p.paymentMethod || "").replace(/_/g, " ")}</td>
                <td style={{ padding: "10px", fontSize: 12, color: "#888" }}>{p.transactionId || "—"}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 12, fontWeight: 600, color: statusColor[p.status] || "#888" }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: "10px", fontSize: 13, color: "#888" }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                <td style={{ padding: "10px" }}>
                  {canEdit && (
                    <button onClick={() => remove(p._id)}
                      style={{ padding: "4px 10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}









