export const todayKey = () => new Date().toISOString().slice(0, 10);

export const formatDate = (key) => {
  const [y, m, d] = key.split("-");
  return `${d}/${m}/${y}`;
};

export const formatDateLong = (key) =>
  new Date(key + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

export const formatDateDisplay = (key) =>
  new Date(key + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Chunks of 3; if remainder===1 merge spare into last group (→4)
export const generateGroupChunks = (students) => {
  const shuffled = shuffle(students);
  const total    = shuffled.length;
  const rem      = total % 3;
  const chunks   = [];

  if (rem === 1 && total >= 4) {
    for (let i = 0; i < total - 4; i += 3) chunks.push(shuffled.slice(i, i + 3));
    chunks.push(shuffled.slice(total - 4));
  } else {
    for (let i = 0; i < total; i += 3) chunks.push(shuffled.slice(i, i + 3));
  }
  return chunks;
};

export const pickCoordinator = (members) =>
  [...members].sort((a, b) => (a.coordSessions || 0) - (b.coordSessions || 0))[0];

export const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export const AVATAR_COLORS = [
  "#c8602a","#2a6ec8","#2aa87a","#9b4db5",
  "#e07b2a","#c83a50","#3a9b6e","#7c5c3a",
  "#4d8ab5","#b54d7c",
];

export const colorFor = (index) => AVATAR_COLORS[index % AVATAR_COLORS.length];