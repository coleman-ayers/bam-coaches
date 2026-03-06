import { useState, useEffect, useRef, useCallback } from "react";
import { Users, FileText, Megaphone, BarChart3, Eye, LogOut, Search, Download, MoreVertical, X, Plus, Trash2, GripVertical, ChevronDown, Clock, Send, Shield, Edit3, Check } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const GOLD = "#E2DD9F";
const BG = "#0A0A0A";
const CARD = "#1A1A1A";
const BORDER = "#2A2A2A";
const TEXT = "#F2F2F2";
const DIM = "#666";
const MID = "#999";

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

const inputBase = {
  width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 13,
  fontFamily: ff, background: "#111", color: TEXT, border: `1px solid ${BORDER}`,
  outline: "none", boxSizing: "border-box",
};

const selectBase = { ...inputBase, cursor: "pointer", appearance: "none", paddingRight: 32 };

const cardStyle = {
  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20,
};

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
    <div style={{ height: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff }}>
      <form onSubmit={submit} style={{ ...cardStyle, width: 360, textAlign: "center" }}>
        <div style={{ fontFamily: hf, fontSize: 36, color: GOLD, letterSpacing: 3, marginBottom: 4 }}>BAM ADMIN</div>
        <div style={{ fontSize: 12, color: DIM, marginBottom: 28, letterSpacing: 1 }}>COACHES PLATFORM</div>
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

function Modal({ children, onClose, title, width = 520 }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff }}
      onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
      <div style={{ ...cardStyle, position: "relative", width, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto", zIndex: 1 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: hf, fontSize: 22, color: TEXT, letterSpacing: 1 }}>{title}</div>
          <X size={18} color={DIM} style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ── MEMBERS TAB ────────────────────────────────────────────────────────────

function MembersTab() {
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
              <tr style={{ background: "#111", borderBottom: `1px solid ${BORDER}` }}>
                {["First", "Last", "Email", "Country", "City", "Role", "Experience", "Joined", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: MID, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1E1E1E"}
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
                          onMouseEnter={e => e.currentTarget.style.background = "#222"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <Send size={12} style={{ marginRight: 8 }} />Send Message
                        </div>
                        <div style={{ padding: "10px 14px", fontSize: 13, color: m.status === "active" ? "#E57373" : "#5AB584", cursor: "pointer" }}
                          onClick={() => toggleStatus(m.id)}
                          onMouseEnter={e => e.currentTarget.style.background = "#222"}
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
        <Modal title={`Message ${msgModal.first} ${msgModal.last}`} onClose={() => { setMsgModal(null); setMsgText(""); }}>
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

function ContentManagerTab() {
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
        <Modal title={editItem ? "Edit Content" : "Add Content"} onClose={() => { setAddModal(false); setEditItem(null); }} width={600}>
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

function AnnouncementsTab() {
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
        <Modal title={editId ? "Edit Announcement" : "New Announcement"} onClose={() => { setModal(false); setEditId(null); }}>
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

function AnalyticsTab() {
  // Mock data
  const growthData = Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`, members: 180 + Math.floor(i * 2.3 + Math.random() * 8),
  }));

  const postsPerWeek = [
    { week: "W1", posts: 34 }, { week: "W2", posts: 41 }, { week: "W3", posts: 38 },
    { week: "W4", posts: 52 }, { week: "W5", posts: 47 }, { week: "W6", posts: 55 },
    { week: "W7", posts: 61 }, { week: "W8", posts: 58 },
  ];

  const roleBreakdown = [
    { name: "Skills Trainer", value: 42 }, { name: "Team Coach", value: 28 },
    { name: "Academy Coach", value: 18 }, { name: "College Coach", value: 8 },
    { name: "Pro Coach", value: 4 },
  ];

  const contentViews = [
    { section: "PD Drills", views: 1240 }, { section: "Team", views: 890 },
    { section: "Insights", views: 760 }, { section: "X&O", views: 620 },
    { section: "Plans", views: 540 }, { section: "Master", views: 480 },
    { section: "Workouts", views: 410 },
  ];

  const stats = [
    { label: "Total Members", value: "247" },
    { label: "Unique Posters This Week", value: "38" },
    { label: "Posts This Week", value: "58" },
    { label: "Avg Comments/Post", value: "3.2" },
    { label: "Top Contributor", value: "Marcus T." },
    { label: "Churn Rate", value: "2.1%" },
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

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Member Growth */}
        <div style={cardStyle}>
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

        {/* Posts Per Week */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Community Posts (8 Weeks)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={postsPerWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="week" tick={{ fill: DIM, fontSize: 10 }} />
              <YAxis tick={{ fill: DIM, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="posts" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role Breakdown */}
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

        {/* Content Views */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Content Views by Section</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={contentViews} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis type="number" tick={{ fill: DIM, fontSize: 10 }} />
              <YAxis dataKey="section" type="category" tick={{ fill: DIM, fontSize: 10 }} width={70} />
              <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="views" fill={GOLD2} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── PLATFORM PREVIEW TAB ───────────────────────────────────────────────────

function PlatformPreviewTab({ onExitAdmin }) {
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
        <div style={{ background: "#111", padding: "10px 16px", fontSize: 11, color: DIM, display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E57373" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#5AB584" }} />
          <span style={{ marginLeft: 8 }}>BAM Coaches Platform &mdash; Viewing as: {previewRole}</span>
        </div>
        <div style={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "#1A1A1A" }}>
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

function AdminLayout({ user, onLogout, onExitAdmin }) {
  const [tab, setTab] = useState("members");

  return (
    <div style={{ fontFamily: ff, background: BG, minHeight: "100vh", color: TEXT }}>
      {/* Top Nav */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 56 }}>
          <div style={{ fontFamily: hf, fontSize: 20, color: GOLD, letterSpacing: 2, marginRight: 40 }}>BAM ADMIN</div>
          <div style={{ display: "flex", gap: 2, flex: 1 }}>
            {ADMIN_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                  background: tab === t.id ? `${GOLD}18` : "transparent", color: tab === t.id ? GOLD : MID,
                  border: "none", cursor: "pointer", fontFamily: ff, display: "flex", alignItems: "center", gap: 6,
                  transition: "all .15s" }}>
                <t.Icon size={15} />
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: DIM }}>Logged in as <strong style={{ color: TEXT }}>{user}</strong></span>
            <button onClick={onLogout} style={{ ...btnStyle(false), padding: "6px 14px", fontSize: 12 }}>
              <LogOut size={13} /> Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        {tab === "members" && <MembersTab />}
        {tab === "content" && <ContentManagerTab />}
        {tab === "announcements" && <AnnouncementsTab />}
        {tab === "analytics" && <AnalyticsTab />}
        {tab === "preview" && <PlatformPreviewTab onExitAdmin={onExitAdmin} />}
      </div>
    </div>
  );
}

// ── MAIN EXPORT ────────────────────────────────────────────────────────────

export default function AdminPortal({ onExitAdmin }) {
  const [user, setUser] = useState(() => {
    try { return sessionStorage.getItem("bam_admin_user") || null; } catch { return null; }
  });

  const handleLogin = (u) => {
    setUser(u);
    try { sessionStorage.setItem("bam_admin_user", u); } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    try { sessionStorage.removeItem("bam_admin_user"); } catch {}
  };

  if (!user) return <AdminGate onLogin={handleLogin} />;
  return <AdminLayout user={user} onLogout={handleLogout} onExitAdmin={onExitAdmin} />;
}
