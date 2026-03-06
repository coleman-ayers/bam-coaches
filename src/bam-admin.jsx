import { useState, useEffect, useRef, useCallback } from "react";
import { Users, FileText, Megaphone, BarChart3, Eye, LogOut, Search, Download, MoreVertical, X, Plus, Trash2, GripVertical, ChevronDown, Clock, Send, Shield, Edit3, Check, Sun, Moon } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const GOLD = "#E2DD9F";

const BAM_LOGO_PNG="data:image/png;base64,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";

const DARK_ADMIN = {
  bg: "#0A0A0A", card: "#1A1A1A", border: "#2A2A2A",
  text: "#F2F2F2", dim: "#666", mid: "#999",
  inputBg: "#111", headerBg: "#1A1A1A", hoverRow: "#1E1E1E",
  hoverMenu: "#222", modalBg: "rgba(0,0,0,0.7)",
};
const LIGHT_ADMIN = {
  bg: "#F5F5F5", card: "#FFFFFF", border: "#E0E0E0",
  text: "#111111", dim: "#999", mid: "#666",
  inputBg: "#F0F0F0", headerBg: "#FFFFFF", hoverRow: "#F5F5F5",
  hoverMenu: "#EEE", modalBg: "rgba(0,0,0,0.3)",
};

const ADMIN_LOGINS = {
  Coleman: "BAMcoleman2025",
  Gabe: "BAMgabe2025",
  Mike: "BAMmike2025",
};

const ff = "'DM Sans',sans-serif";
const hf = "'Bebas Neue',sans-serif";

// ── MOCK DATA ──────────────────────────────────────────────────────────────

const MOCK_MEMBERS = [
  { id: 1, first: "Marcus", last: "Thompson", email: "marcus.t@email.com", country: "Canada", city: "Toronto", role: "Skills Trainer", experience: "5-10 years", joinDate: "2025-01-15", status: "active" },
  { id: 2, first: "James", last: "Okonkwo", email: "james.o@email.com", country: "Nigeria", city: "Lagos", role: "Academy Coach", experience: "10+ years", joinDate: "2025-01-22", status: "active" },
  { id: 3, first: "Sofia", last: "Rodriguez", email: "sofia.r@email.com", country: "Spain", city: "Barcelona", role: "Skills Trainer", experience: "5-10 years", joinDate: "2025-02-03", status: "active" },
  { id: 4, first: "Kwame", last: "Darko", email: "kwame.d@email.com", country: "Ghana", city: "Accra", role: "Academy Coach", experience: "3-5 years", joinDate: "2025-02-10", status: "active" },
  { id: 5, first: "Yuki", last: "Tanaka", email: "yuki.t@email.com", country: "Japan", city: "Osaka", role: "Skills Trainer", experience: "10+ years", joinDate: "2025-02-18", status: "active" },
  { id: 6, first: "Amir", last: "Hassan", email: "amir.h@email.com", country: "Egypt", city: "Cairo", role: "Team Coach", experience: "3-5 years", joinDate: "2025-03-01", status: "active" },
  { id: 7, first: "Lena", last: "Johansson", email: "lena.j@email.com", country: "Sweden", city: "Stockholm", role: "College Coach", experience: "10+ years", joinDate: "2025-03-05", status: "suspended" },
  { id: 8, first: "Diego", last: "Morales", email: "diego.m@email.com", country: "Argentina", city: "Buenos Aires", role: "Pro Coach", experience: "10+ years", joinDate: "2025-03-10", status: "active" },
  { id: 9, first: "Chen", last: "Wei", email: "chen.w@email.com", country: "China", city: "Shanghai", role: "Skills Trainer", experience: "1-3 years", joinDate: "2025-03-15", status: "active" },
  { id: 10, first: "Fatima", last: "Al-Salem", email: "fatima.a@email.com", country: "UAE", city: "Dubai", role: "Academy Coach", experience: "3-5 years", joinDate: "2025-03-20", status: "active" },
];

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: "Welcome to BAM Coaches Platform!", body: "We're thrilled to have you here. Take the platform tour and introduce yourself in Community.", targetRole: "All", scheduledAt: "2025-01-15T09:00", pinned: true, sent: true },
  { id: 2, title: "New Masterclass: Constraint-Led Coaching", body: "Coleman's 6-part masterclass on CLA is now live. Dive in and level up your practice design.", targetRole: "All", scheduledAt: "2025-02-01T12:00", pinned: false, sent: true },
  { id: 3, title: "March Community Challenge", body: "Post your best drill from this month with the tag #MarchMadness. Top contributor wins a free month.", targetRole: "All", scheduledAt: "2026-03-15T08:00", pinned: false, sent: false },
];

const CONTENT_SECTIONS = [
  { id: "pd", label: "Player Development" },
  { id: "team", label: "Team Coaching" },
  { id: "insights", label: "Insights" },
  { id: "ti", label: "Team Insights" },
  { id: "xo", label: "X & O Breakdowns" },
  { id: "plans", label: "Practice Plans" },
  { id: "master", label: "Masterclasses" },
  { id: "workouts", label: "Full Workouts" },
];

const ROLES = ["All", "Skills Trainer", "Team Coach", "Academy Coach", "College Coach", "Pro Coach"];

// ── STYLES ─────────────────────────────────────────────────────────────────

const btnStyle = (primary) => ({
  padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none",
  background: primary ? GOLD : "transparent", color: primary ? "#111" : GOLD,
  ...(primary ? {} : { border: `1px solid ${GOLD}` }),
  cursor: "pointer", fontFamily: ff, display: "flex", alignItems: "center", gap: 6,
});

const mkInput = (C) => ({
  width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 13,
  fontFamily: ff, background: C.inputBg, color: C.text, border: `1px solid ${C.border}`,
  outline: "none", boxSizing: "border-box",
});

const mkSelect = (C) => ({ ...mkInput(C), cursor: "pointer", appearance: "none", paddingRight: 32 });

const mkCard = (C) => ({
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20,
});

// Legacy aliases (AdminGate login screen is always dark)
const BG = DARK_ADMIN.bg;
const CARD = DARK_ADMIN.card;
const BORDER = DARK_ADMIN.border;
const TEXT = DARK_ADMIN.text;
const DIM = DARK_ADMIN.dim;
const MID = DARK_ADMIN.mid;
const inputBase = mkInput(DARK_ADMIN);
const selectBase = mkSelect(DARK_ADMIN);
const cardStyle = mkCard(DARK_ADMIN);

// ── PASSWORD GATE ──────────────────────────────────────────────────────────

function AdminGate({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (ADMIN_LOGINS[user] === pass) {
      onLogin(user);
    } else {
      setError("Invalid credentials");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div style={{ height: "100vh", background: DARK_ADMIN.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff }}>
      <form onSubmit={submit} style={{ ...cardStyle, width: 360, textAlign: "center" }}>
        <img src={BAM_LOGO_PNG} alt="BAM" style={{ width: 52, height: 52, marginBottom: 20 }} />
        <input placeholder="Username" value={user} onChange={e => setUser(e.target.value)}
          style={{ ...inputBase, marginBottom: 12 }} />
        <input placeholder="Password" type="password" value={pass} onChange={e => setPass(e.target.value)}
          style={{ ...inputBase, marginBottom: 20 }} />
        {error && <div style={{ color: "#E57373", fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ ...btnStyle(true), width: "100%", justifyContent: "center", padding: "12px 0", fontFamily: hf, fontSize: 16, letterSpacing: 2 }}>
          <Shield size={16} /> LOG IN
        </button>
      </form>
    </div>
  );
}

// ── MODAL ──────────────────────────────────────────────────────────────────

function Modal({ children, onClose, title, width = 520, C = DARK_ADMIN }) {
  const cs = mkCard(C);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff }}
      onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: C.modalBg }} />
      <div style={{ ...cs, position: "relative", width, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto", zIndex: 1 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: hf, fontSize: 22, color: C.text, letterSpacing: 1 }}>{title}</div>
          <X size={18} color={C.dim} style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ── MEMBERS TAB ────────────────────────────────────────────────────────────

function MembersTab({ C }) {
  const { card: CARD, border: BORDER, text: TEXT, dim: DIM, mid: MID, inputBg, hoverRow, hoverMenu } = C;
  const inputBase = mkInput(C), selectBase = mkSelect(C), cardStyle = mkCard(C);
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [msgModal, setMsgModal] = useState(null);
  const [msgText, setMsgText] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  const countries = ["All", ...new Set(MOCK_MEMBERS.map(m => m.country))];

  const filtered = members.filter(m => {
    if (search && !`${m.first} ${m.last} ${m.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "All" && m.role !== roleFilter) return false;
    if (countryFilter !== "All" && m.country !== countryFilter) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ["First Name", "Last Name", "Email", "Country", "City", "Role", "Experience", "Join Date", "Status"];
    const rows = filtered.map(m => [m.first, m.last, m.email, m.country, m.city, m.role, m.experience, m.joinDate, m.status]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bam-members.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleStatus = (id) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: m.status === "active" ? "suspended" : "active" } : m));
    setMenuOpen(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: hf, fontSize: 28, color: TEXT, letterSpacing: 2 }}>MEMBERS</div>
        <button style={btnStyle(false)} onClick={exportCSV}><Download size={14} /> Export CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} color={DIM} style={{ position: "absolute", left: 12, top: 12 }} />
          <input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputBase, paddingLeft: 34 }} />
        </div>
        <div style={{ position: "relative" }}>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...selectBase, width: 170 }}>
            {ROLES.map(r => <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>)}
          </select>
          <ChevronDown size={14} color={DIM} style={{ position: "absolute", right: 10, top: 13, pointerEvents: "none" }} />
        </div>
        <div style={{ position: "relative" }}>
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} style={{ ...selectBase, width: 170 }}>
            {countries.map(c => <option key={c} value={c}>{c === "All" ? "All Countries" : c}</option>)}
          </select>
          <ChevronDown size={14} color={DIM} style={{ position: "absolute", right: 10, top: 13, pointerEvents: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: TEXT }}>
            <thead>
              <tr style={{ background: inputBg, borderBottom: `1px solid ${BORDER}` }}>
                {["First", "Last", "Email", "Country", "City", "Role", "Experience", "Joined", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: MID, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                  onMouseEnter={e => e.currentTarget.style.background = hoverRow}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 14px" }}>{m.first}</td>
                  <td style={{ padding: "10px 14px" }}>{m.last}</td>
                  <td style={{ padding: "10px 14px", color: MID }}>{m.email}</td>
                  <td style={{ padding: "10px 14px" }}>{m.country}</td>
                  <td style={{ padding: "10px 14px" }}>{m.city}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, fontWeight: 700, color: "#111", background: GOLD, padding: "3px 10px", borderRadius: 12 }}>{m.role}</span></td>
                  <td style={{ padding: "10px 14px", color: MID }}>{m.experience}</td>
                  <td style={{ padding: "10px 14px", color: MID }}>{m.joinDate}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
                      background: m.status === "active" ? "rgba(90,181,132,0.15)" : "rgba(229,115,115,0.15)",
                      color: m.status === "active" ? "#5AB584" : "#E57373" }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", position: "relative" }}>
                    <MoreVertical size={16} color={DIM} style={{ cursor: "pointer" }}
                      onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)} />
                    {menuOpen === m.id && (
                      <div style={{ position: "absolute", right: 14, top: 36, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, zIndex: 10, minWidth: 160, boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>
                        <div style={{ padding: "10px 14px", fontSize: 13, color: TEXT, cursor: "pointer" }}
                          onClick={() => { setMsgModal(m); setMenuOpen(null); }}
                          onMouseEnter={e => e.currentTarget.style.background = hoverMenu}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <Send size={12} style={{ marginRight: 8 }} />Send Message
                        </div>
                        <div style={{ padding: "10px 14px", fontSize: 13, color: m.status === "active" ? "#E57373" : "#5AB584", cursor: "pointer" }}
                          onClick={() => toggleStatus(m.id)}
                          onMouseEnter={e => e.currentTarget.style.background = hoverMenu}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          {m.status === "active" ? "Suspend" : "Reactivate"}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ fontSize: 12, color: DIM, marginTop: 12 }}>{filtered.length} member{filtered.length !== 1 ? "s" : ""} shown</div>

      {/* Message Modal */}
      {msgModal && (
        <Modal title={`Message ${msgModal.first} ${msgModal.last}`} onClose={() => { setMsgModal(null); setMsgText(""); }} C={C}>
          <textarea placeholder="Type your message..." value={msgText} onChange={e => setMsgText(e.target.value)}
            style={{ ...inputBase, height: 120, resize: "vertical", marginBottom: 16 }} />
          <button style={btnStyle(true)} onClick={() => { setMsgModal(null); setMsgText(""); }}>
            <Send size={14} /> Send Message
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── CONTENT MANAGER TAB ────────────────────────────────────────────────────

function ContentManagerTab({ C }) {
  const { card: CARD, border: BORDER, text: TEXT, dim: DIM, mid: MID, inputBg } = C;
  const inputBase = mkInput(C), selectBase = mkSelect(C), cardStyle = mkCard(C);
  const [contentData, setContentData] = useState(() => {
    // Pull initial content from the main app's CONTENT object
    const sections = {};
    CONTENT_SECTIONS.forEach(s => { sections[s.id] = []; });
    return sections;
  });
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [expandedSection, setExpandedSection] = useState("pd");
  const [dragItem, setDragItem] = useState(null);

  const [form, setForm] = useState({
    title: "", desc: "", keyPoints: [""], section: "pd", tags: [],
    level: "All Levels", duration: "", coach: "", muxId: "",
  });

  const resetForm = () => setForm({ title: "", desc: "", keyPoints: [""], section: "pd", tags: [], level: "All Levels", duration: "", coach: "", muxId: "" });

  const openAdd = () => { resetForm(); setAddModal(true); setEditItem(null); };
  const openEdit = (section, item) => {
    setForm({ title: item.title, desc: item.desc || "", keyPoints: item.keyPoints || [""], section, tags: item.tag ? [item.tag] : [], level: item.level || "All Levels", duration: item.duration || "", coach: item.coach || "", muxId: item.muxId || "" });
    setEditItem({ section, id: item.id });
    setAddModal(true);
  };

  const saveContent = () => {
    const newItem = { id: Date.now(), title: form.title, sub: form.tags[0] || "", desc: form.desc, keyPoints: form.keyPoints.filter(k => k.trim()), tag: form.tags[0] || "", level: form.level, duration: form.duration, coach: form.coach, coachInitials: form.coach.split(" ").map(w => w[0]).join(""), muxId: form.muxId, isNew: true };
    if (editItem) {
      setContentData(prev => ({ ...prev, [editItem.section]: prev[editItem.section].map(i => i.id === editItem.id ? { ...i, ...newItem, id: i.id } : i) }));
    } else {
      setContentData(prev => ({ ...prev, [form.section]: [...(prev[form.section] || []), newItem] }));
    }
    setAddModal(false);
    resetForm();
    setEditItem(null);
  };

  const deleteItem = (section, id) => {
    setContentData(prev => ({ ...prev, [section]: prev[section].filter(i => i.id !== id) }));
  };

  const handleDragStart = (section, idx) => setDragItem({ section, idx });
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (section, idx) => {
    if (!dragItem || dragItem.section !== section) return;
    setContentData(prev => {
      const items = [...prev[section]];
      const [moved] = items.splice(dragItem.idx, 1);
      items.splice(idx, 0, moved);
      return { ...prev, [section]: items };
    });
    setDragItem(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: hf, fontSize: 28, color: TEXT, letterSpacing: 2 }}>CONTENT MANAGER</div>
        <button style={btnStyle(true)} onClick={openAdd}><Plus size={14} /> Add Content</button>
      </div>

      {CONTENT_SECTIONS.map(section => {
        const items = contentData[section.id] || [];
        const isExpanded = expandedSection === section.id;
        return (
          <div key={section.id} style={{ ...cardStyle, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              onClick={() => setExpandedSection(isExpanded ? null : section.id)}>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{section.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: DIM }}>{items.length} items</span>
                <ChevronDown size={16} color={DIM} style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </div>
            </div>
            {isExpanded && (
              <div style={{ marginTop: 14 }}>
                {items.length === 0 && <div style={{ fontSize: 13, color: DIM, padding: "10px 0" }}>No content items. Click "Add Content" to create one.</div>}
                {items.map((item, idx) => (
                  <div key={item.id} draggable onDragStart={() => handleDragStart(section.id, idx)}
                    onDragOver={handleDragOver} onDrop={() => handleDrop(section.id, idx)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${BORDER}`, cursor: "grab" }}>
                    <GripVertical size={14} color={DIM} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: DIM }}>{item.coach} &middot; {item.duration} &middot; {item.level}</div>
                    </div>
                    {item.tag && <span style={{ fontSize: 10, fontWeight: 700, color: "#111", background: GOLD, padding: "2px 8px", borderRadius: 10 }}>{item.tag}</span>}
                    <Edit3 size={14} color={MID} style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => openEdit(section.id, item)} />
                    <Trash2 size={14} color="#E57373" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => deleteItem(section.id, item.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add/Edit Modal */}
      {addModal && (
        <Modal title={editItem ? "Edit Content" : "Add Content"} onClose={() => { setAddModal(false); setEditItem(null); }} width={600} C={C}>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Title</label>
              <input style={inputBase} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Description</label>
              <textarea style={{ ...inputBase, height: 80, resize: "vertical" }} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Key Points</label>
              {form.keyPoints.map((kp, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <input style={{ ...inputBase, flex: 1 }} value={kp} onChange={e => {
                    const pts = [...form.keyPoints]; pts[i] = e.target.value; setForm(f => ({ ...f, keyPoints: pts }));
                  }} />
                  {form.keyPoints.length > 1 && <X size={16} color="#E57373" style={{ cursor: "pointer", flexShrink: 0, marginTop: 8 }}
                    onClick={() => setForm(f => ({ ...f, keyPoints: f.keyPoints.filter((_, j) => j !== i) }))} />}
                </div>
              ))}
              <button style={{ ...btnStyle(false), padding: "4px 12px", fontSize: 11 }} onClick={() => setForm(f => ({ ...f, keyPoints: [...f.keyPoints, ""] }))}>
                <Plus size={12} /> Add Point
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Section</label>
                <div style={{ position: "relative" }}>
                  <select style={selectBase} value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}>
                    {CONTENT_SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <ChevronDown size={14} color={DIM} style={{ position: "absolute", right: 10, top: 13, pointerEvents: "none" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Difficulty</label>
                <div style={{ position: "relative" }}>
                  <select style={selectBase} value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                    {["All Levels", "Beginner", "Intermediate", "Advanced"].map(l => <option key={l}>{l}</option>)}
                  </select>
                  <ChevronDown size={14} color={DIM} style={{ position: "absolute", right: 10, top: 13, pointerEvents: "none" }} />
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Duration</label>
                <input style={inputBase} placeholder="e.g. 15 min" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Coach Name</label>
                <input style={inputBase} value={form.coach} onChange={e => setForm(f => ({ ...f, coach: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Tags (comma-separated)</label>
              <input style={inputBase} placeholder="Finishing, Shooting"
                value={form.tags.join(", ")} onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Mux Video ID (optional)</label>
              <input style={inputBase} placeholder="Enter Mux video ID" value={form.muxId} onChange={e => setForm(f => ({ ...f, muxId: e.target.value }))} />
            </div>
            <button style={{ ...btnStyle(true), justifyContent: "center", padding: "12px 0", marginTop: 8 }}
              onClick={saveContent} disabled={!form.title.trim()}>
              <Check size={14} /> {editItem ? "Update" : "Add"} Content
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── ANNOUNCEMENTS TAB ──────────────────────────────────────────────────────

function AnnouncementsTab({ C }) {
  const { card: CARD, border: BORDER, text: TEXT, dim: DIM, mid: MID } = C;
  const inputBase = mkInput(C), selectBase = mkSelect(C), cardStyle = mkCard(C);
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", targetRole: "All", scheduledAt: "", pinned: false });
  const [now, setNow] = useState(Date.now());

  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);

  const resetForm = () => setForm({ title: "", body: "", targetRole: "All", scheduledAt: "", pinned: false });

  const openNew = () => { resetForm(); setEditId(null); setModal(true); };
  const openEdit = (a) => { setForm({ title: a.title, body: a.body, targetRole: a.targetRole, scheduledAt: a.scheduledAt, pinned: a.pinned }); setEditId(a.id); setModal(true); };

  const save = () => {
    const sent = new Date(form.scheduledAt).getTime() < now;
    if (editId) {
      setAnnouncements(prev => prev.map(a => a.id === editId ? { ...a, ...form, sent } : a));
    } else {
      setAnnouncements(prev => [...prev, { ...form, id: Date.now(), sent }]);
    }
    setModal(false);
    resetForm();
    setEditId(null);
  };

  const deleteAnn = (id) => setAnnouncements(prev => prev.filter(a => a.id !== id));

  const countdown = (dateStr) => {
    const diff = new Date(dateStr).getTime() - now;
    if (diff <= 0) return "Sent";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: hf, fontSize: 28, color: TEXT, letterSpacing: 2 }}>ANNOUNCEMENTS</div>
        <button style={btnStyle(true)} onClick={openNew}><Plus size={14} /> New Announcement</button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {announcements.map(a => (
          <div key={a.id} style={{ ...cardStyle, borderLeft: a.pinned ? `3px solid ${GOLD}` : `3px solid ${BORDER}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{a.title}</div>
                  {a.pinned && <span style={{ fontSize: 9, fontWeight: 700, color: "#111", background: GOLD, padding: "2px 8px", borderRadius: 10 }}>PINNED</span>}
                </div>
                <div style={{ fontSize: 13, color: MID, lineHeight: 1.6, marginBottom: 8 }}>{a.body}</div>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: DIM }}>
                  <span>Target: {a.targetRole}</span>
                  <span>Scheduled: {new Date(a.scheduledAt).toLocaleString()}</span>
                  <span style={{ color: a.sent ? "#5AB584" : GOLD, fontWeight: 700 }}>
                    {a.sent ? "Sent" : countdown(a.scheduledAt)}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                <Edit3 size={14} color={MID} style={{ cursor: "pointer" }} onClick={() => openEdit(a)} />
                <Trash2 size={14} color="#E57373" style={{ cursor: "pointer" }} onClick={() => deleteAnn(a.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={editId ? "Edit Announcement" : "New Announcement"} onClose={() => { setModal(false); setEditId(null); }} C={C}>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Title</label>
              <input style={inputBase} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Body</label>
              <textarea style={{ ...inputBase, height: 100, resize: "vertical" }} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Target Role</label>
                <div style={{ position: "relative" }}>
                  <select style={selectBase} value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={14} color={DIM} style={{ position: "absolute", right: 10, top: 13, pointerEvents: "none" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: MID, display: "block", marginBottom: 4 }}>Schedule Date & Time</label>
                <input type="datetime-local" style={inputBase} value={form.scheduledAt}
                  onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: TEXT, cursor: "pointer" }}>
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} />
              Pin to top of community
            </label>
            <button style={{ ...btnStyle(true), justifyContent: "center", padding: "12px 0", marginTop: 8 }}
              onClick={save} disabled={!form.title.trim() || !form.scheduledAt}>
              <Check size={14} /> {editId ? "Update" : "Schedule"} Announcement
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── ANALYTICS TAB ──────────────────────────────────────────────────────────

const GOLD2 = "#C9C48B";
const GOLD3 = "#B0AC78";
const CHART_COLORS = [GOLD, GOLD2, GOLD3, "#9E9A65", "#8C8855", "#7A7645"];

function readEvents() {
  try { return JSON.parse(localStorage.getItem("bam_analytics_events") || "[]"); } catch { return []; }
}

function AnalyticsTab({ C }) {
  const { card: CARD, border: BORDER, text: TEXT, dim: DIM, mid: MID } = C;
  const cardStyle = mkCard(C);

  const events = readEvents();

  // ── Derived from real events ──

  // Page views by section
  const pvCounts = {};
  events.filter(e => e.name === "page_view").forEach(e => { pvCounts[e.page] = (pvCounts[e.page] || 0) + 1; });
  const pageViewData = Object.entries(pvCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([page, views]) => ({ page, views }));

  // Top search terms
  const termCounts = {};
  events.filter(e => e.name === "search").forEach(e => {
    const t = (e.term || "").toLowerCase();
    if (t) termCounts[t] = (termCounts[t] || 0) + 1;
  });
  const topSearches = Object.entries(termCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term, count]) => ({ term, count }));

  // Most saved content
  const saveCounts = {};
  events.filter(e => e.name === "content_save").forEach(e => {
    const key = `${e.section}:${e.contentId}`;
    if (!saveCounts[key]) saveCounts[key] = { title: e.title || key, section: e.section, count: 0 };
    saveCounts[key].count++;
  });
  const topSaved = Object.values(saveCounts).sort((a, b) => b.count - a.count).slice(0, 10);

  // Avg session length
  const sessionEnds = events.filter(e => e.name === "session_end" && typeof e.duration === "number");
  const avgSession = sessionEnds.length
    ? Math.round(sessionEnds.reduce((s, e) => s + e.duration, 0) / sessionEnds.length)
    : 0;
  const fmtDuration = avgSession >= 60 ? `${Math.floor(avgSession / 60)}m ${avgSession % 60}s` : `${avgSession}s`;

  const totalSessions = events.filter(e => e.name === "session_start").length;
  const totalPageViews = events.filter(e => e.name === "page_view").length;
  const totalSearches = events.filter(e => e.name === "search").length;
  const totalSaves = events.filter(e => e.name === "content_save").length;

  // ── Mock data (existing) ──
  const growthData = Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`, members: 180 + Math.floor(i * 2.3 + Math.random() * 8),
  }));

  const roleBreakdown = [
    { name: "Skills Trainer", value: 42 }, { name: "Team Coach", value: 28 },
    { name: "Academy Coach", value: 18 }, { name: "College Coach", value: 8 },
    { name: "Pro Coach", value: 4 },
  ];

  const stats = [
    { label: "Total Sessions", value: String(totalSessions || 0) },
    { label: "Total Page Views", value: String(totalPageViews || 0) },
    { label: "Total Searches", value: String(totalSearches || 0) },
    { label: "Total Saves", value: String(totalSaves || 0) },
    { label: "Avg Session Length", value: fmtDuration || "—" },
    { label: "Total Members", value: "247" },
  ];

  return (
    <div>
      <div style={{ fontFamily: hf, fontSize: 28, color: TEXT, letterSpacing: 2, marginBottom: 20 }}>ANALYTICS</div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...cardStyle, textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: GOLD, fontFamily: hf, letterSpacing: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: DIM, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts & Lists Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Page Views by Section */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Page Views by Section</div>
          {pageViewData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pageViewData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis type="number" tick={{ fill: DIM, fontSize: 10 }} />
                <YAxis dataKey="page" type="category" tick={{ fill: DIM, fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="views" fill={GOLD} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ fontSize: 13, color: DIM, padding: "40px 0", textAlign: "center" }}>No page view data yet</div>
          )}
        </div>

        {/* Top Search Terms */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Top Search Terms</div>
          {topSearches.length > 0 ? (
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {topSearches.map((s, i) => (
                <div key={s.term} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, width: 20, textAlign: "right" }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, color: TEXT }}>{s.term}</span>
                  </div>
                  <span style={{ fontSize: 12, color: MID, fontWeight: 600 }}>{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: DIM, padding: "40px 0", textAlign: "center" }}>No search data yet</div>
          )}
        </div>

        {/* Most Saved Content */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Most Saved Content</div>
          {topSaved.length > 0 ? (
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {topSaved.map((s, i) => (
                <div key={`${s.section}-${s.title}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, width: 20, textAlign: "right", flexShrink: 0 }}>#{i + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                      <div style={{ fontSize: 10, color: DIM }}>{s.section}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: MID, fontWeight: 600, flexShrink: 0 }}>{s.count} save{s.count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: DIM, padding: "40px 0", textAlign: "center" }}>No saves yet</div>
          )}
        </div>

        {/* Member Roles (existing mock) */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Member Roles</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={roleBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {roleBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: MID }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Member Growth (existing mock) */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Member Growth (30 Days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="day" tick={{ fill: DIM, fontSize: 10 }} interval={6} />
              <YAxis tick={{ fill: DIM, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="members" stroke={GOLD} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── PLATFORM PREVIEW TAB ───────────────────────────────────────────────────

function PlatformPreviewTab({ onExitAdmin, C }) {
  const { card: CARD, border: BORDER, text: TEXT, dim: DIM } = C;
  const selectBase = mkSelect(C), cardStyle = mkCard(C);
  const [previewRole, setPreviewRole] = useState("Skills Trainer");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: hf, fontSize: 28, color: TEXT, letterSpacing: 2 }}>PLATFORM PREVIEW</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <select value={previewRole} onChange={e => setPreviewRole(e.target.value)} style={{ ...selectBase, width: 180 }}>
              {ROLES.filter(r => r !== "All").map(r => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} color={DIM} style={{ position: "absolute", right: 10, top: 13, pointerEvents: "none" }} />
          </div>
          <button style={btnStyle(true)} onClick={() => onExitAdmin(previewRole)}>
            <Eye size={14} /> View as Coach
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden", borderRadius: 14 }}>
        <div style={{ background: C.inputBg, padding: "10px 16px", fontSize: 11, color: DIM, display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E57373" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#5AB584" }} />
          <span style={{ marginLeft: 8 }}>BAM Coaches Platform &mdash; Viewing as: {previewRole}</span>
        </div>
        <div style={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center", background: CARD }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>
              <Eye size={48} color={GOLD} />
            </div>
            <div style={{ fontFamily: hf, fontSize: 24, color: TEXT, letterSpacing: 2, marginBottom: 8 }}>PLATFORM PREVIEW</div>
            <div style={{ fontSize: 14, color: DIM, lineHeight: 1.6, maxWidth: 400 }}>
              Click "View as Coach" to exit admin mode and experience the full platform as a <strong style={{ color: GOLD }}>{previewRole}</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN LAYOUT ───────────────────────────────────────────────────────────

const ADMIN_TABS = [
  { id: "members", label: "Members", Icon: Users },
  { id: "content", label: "Content Manager", Icon: FileText },
  { id: "announcements", label: "Announcements", Icon: Megaphone },
  { id: "analytics", label: "Analytics", Icon: BarChart3 },
  { id: "preview", label: "Platform Preview", Icon: Eye },
];

function AdminLayout({ user, onLogout, onExitAdmin, dark, toggleDark }) {
  const [tab, setTab] = useState("members");
  const C = dark ? DARK_ADMIN : LIGHT_ADMIN;

  return (
    <div style={{ fontFamily: ff, background: C.bg, minHeight: "100vh", color: C.text, transition: "background .2s, color .2s" }}>
      {/* Top Nav */}
      <div style={{ background: C.headerBg, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100, transition: "background .2s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 56 }}>
          <img src={BAM_LOGO_PNG} alt="BAM" style={{ width: 30, height: 30, marginRight: 32 }} />
          <div style={{ display: "flex", gap: 2, flex: 1 }}>
            {ADMIN_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                  background: tab === t.id ? `${GOLD}18` : "transparent", color: tab === t.id ? GOLD : C.mid,
                  border: "none", cursor: "pointer", fontFamily: ff, display: "flex", alignItems: "center", gap: 6,
                  transition: "all .15s" }}>
                <t.Icon size={15} />
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: C.dim }}>Logged in as <strong style={{ color: C.text }}>{user}</strong></span>
            <button onClick={toggleDark} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}>
              {dark ? <Sun size={14} color={GOLD} /> : <Moon size={14} color={C.mid} />}
            </button>
            <button onClick={onLogout} style={{ ...btnStyle(false), padding: "6px 14px", fontSize: 12 }}>
              <LogOut size={13} /> Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        {tab === "members" && <MembersTab C={C} />}
        {tab === "content" && <ContentManagerTab C={C} />}
        {tab === "announcements" && <AnnouncementsTab C={C} />}
        {tab === "analytics" && <AnalyticsTab C={C} />}
        {tab === "preview" && <PlatformPreviewTab onExitAdmin={onExitAdmin} C={C} />}
      </div>
    </div>
  );
}

// ── MAIN EXPORT ────────────────────────────────────────────────────────────

export default function AdminPortal({ onExitAdmin }) {
  const [user, setUser] = useState(() => {
    try { return sessionStorage.getItem("bam_admin_user") || null; } catch { return null; }
  });
  const [dark, setDark] = useState(true);

  const handleLogin = (u) => {
    setUser(u);
    try { sessionStorage.setItem("bam_admin_user", u); } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    try { sessionStorage.removeItem("bam_admin_user"); } catch {}
  };

  if (!user) return <AdminGate onLogin={handleLogin} />;
  return <AdminLayout user={user} onLogout={handleLogout} onExitAdmin={onExitAdmin} dark={dark} toggleDark={() => setDark(d => !d)} />;
}
