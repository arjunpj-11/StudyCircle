import { useEffect, useState } from "react";
import { apiGetMeetLinks, apiAddMeetLink, apiDeleteMeetLink } from "../api/services";
import { useToast } from "../hooks/useToast";

export default function MeetLinksPage() {
  const [links,   setLinks]   = useState([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(true);
  const { toast, ToastContainer } = useToast();

  useEffect(() => {
    apiGetMeetLinks()
      .then(setLinks)
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const url = input.trim();
    if (!url) { toast("Paste a Meet link first.", "error"); return; }
    if (!url.startsWith("https://")) { toast("Must be a valid https:// URL.", "error"); return; }
    try {
      const link = await apiAddMeetLink(url);
      setLinks((prev) => [...prev, link]);
      setInput("");
      toast("Meet link added to pool.", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDeleteMeetLink(id);
      setLinks((prev) => prev.filter((l) => l._id !== id));
      toast("Link removed.", "info");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="sec-head">
        <h2>Google Meet Link Pool</h2>
        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
          {links.length} link{links.length !== 1 ? "s" : ""} in pool
        </span>
      </div>

      <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 20 }}>
        Add Meet links in advance. Each session, groups are randomly assigned a unique link from this pool.
      </p>

      <div className="meet-links-list">
        {links.map((l) => (
          <div key={l._id} className="meet-link-row">
            <div className="meet-link-icon">🔗</div>
            <div className="meet-link-url" title={l.url}>{l.url}</div>
            <div className="meet-link-used">{l.used ? "Used" : "Available"}</div>
            <button className="meet-link-del" onClick={() => handleDelete(l._id)}>✕</button>
          </div>
        ))}
        {!links.length && (
          <div style={{ color: "var(--muted)", fontSize: "0.85rem", padding: "20px 0" }}>
            No links yet. Add one below.
          </div>
        )}
      </div>

      <div className="add-meet-row">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Google Meet link… https://meet.google.com/xxx-xxxx-xxx"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button className="btn btn-dark" onClick={handleAdd}>+ Add</button>
      </div>

      <ToastContainer />
    </>
  );
}