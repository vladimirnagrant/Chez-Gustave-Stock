import { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Clock,
  Package,
  User,
  ClipboardList,
  Trash2,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Settings,
  ArrowLeft,
} from "lucide-react";

const EMPLOYEES_KEY = "stock:employees";
const CATALOGUE_KEY = "stock:catalogue:v2";
const REQUESTS_KEY = "stock:demandes";
const HISTORY_KEY = "stock:historique";
const CASH_KEY = "stock:monnaie";
const PINS_KEY = "stock:pins";

const DENOMINATIONS = [
  { id: "r005", type: "rouleau", value: 2.50, label: "Rouleau 5 cts (2.50)" },
  { id: "r010", type: "rouleau", value: 5, label: "Rouleau 10 cts (5.-)" },
  { id: "r020", type: "rouleau", value: 10, label: "Rouleau 20 cts (10.-)" },
  { id: "r050", type: "rouleau", value: 25, label: "Rouleau 50 cts (25.-)" },
  { id: "r1", type: "rouleau", value: 50, label: "Rouleau 1.- (50.-)" },
  { id: "r2", type: "rouleau", value: 100, label: "Rouleau 2.- (100.-)" },
  { id: "r5", type: "rouleau", value: 125, label: "Rouleau 5.- (125.-)" },
  { id: "b10", type: "billet", value: 10, label: "Billet 10.-" },
  { id: "b20", type: "billet", value: 20, label: "Billet 20.-" },
  { id: "b50", type: "billet", value: 50, label: "Billet 50.-" },
  { id: "b100", type: "billet", value: 100, label: "Billet 100.-" },
];

// Users: { id, name, role }  role: "employe" | "chef" | "manager"
const DEFAULT_USERS = [
  { id: "u1", name: "Vladimir",        role: "manager" },
  { id: "u2", name: "Antonio",         role: "employe" },
  { id: "u3", name: "Patricia",        role: "employe" },
  { id: "u4", name: "Lara",            role: "employe" },
  { id: "u5", name: "Silvestro",       role: "employe" },
  { id: "u6", name: "Ilaria",          role: "employe" },
  { id: "u7", name: "Tristan",         role: "employe" },
  { id: "u8", name: "Ahmed",           role: "employe" },
  { id: "u9", name: "Chef d'équipe",   role: "chef" },
  { id: "u10", name: "Manager",        role: "manager" },
];
const DEFAULT_PINS = Object.fromEntries(DEFAULT_USERS.map((u) => [u.id, "1234"]));
// Legacy: keep a flat name list for backward-compat where employees[] is still used
const DEFAULT_EMPLOYEES = DEFAULT_USERS.filter((u) => u.role === "employe").map((u) => u.name);

// Article: { id, code, name, category, subcategory, minStock }
const DEFAULT_CATALOGUE = [
  { id: "a1", code: "BOI-001", name: "Café en grains", category: "Boissons", subcategory: "Café", groupe: "Alimentaire", minStock: 5 },
  { id: "a42", code: "BOI-015", name: "Café en grains 1kg", category: "Boissons", subcategory: "Café", groupe: "Alimentaire", minStock: 5 },
  { id: "a2", code: "BOI-002", name: "Jus d'orange", category: "Boissons", subcategory: "Jus", groupe: "Alimentaire", minStock: 10 },
  { id: "a21", code: "BOI-008", name: "Jus de poire", category: "Boissons", subcategory: "Jus", groupe: "Alimentaire", minStock: 10 },
  { id: "a22", code: "BOI-009", name: "Jus de pêche", category: "Boissons", subcategory: "Jus", groupe: "Alimentaire", minStock: 10 },
  { id: "a3", code: "BOI-003", name: "Eau minérale", category: "Boissons", subcategory: "Eau", groupe: "Alimentaire", minStock: 24 },
  { id: "a17", code: "BOI-004", name: "Coca Cola PET", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24 },
  { id: "a18", code: "BOI-005", name: "Coca Cola Zéro PET", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24 },
  { id: "a28", code: "BOI-010", name: "Schweppes Tonic", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24 },
  { id: "a29", code: "BOI-011", name: "Sinalco", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24 },
  { id: "a30", code: "BOI-012", name: "Thé froid pêche", category: "Boissons", subcategory: "Thé froid", groupe: "Alimentaire", minStock: 24 },
  { id: "a31", code: "BOI-013", name: "Thé froid citron", category: "Boissons", subcategory: "Thé froid", groupe: "Alimentaire", minStock: 24 },
  { id: "a32", code: "BOI-014", name: "Thé froid vert", category: "Boissons", subcategory: "Thé froid", groupe: "Alimentaire", minStock: 24 },
  { id: "a19", code: "BOI-006", name: "Henniez Bleue PET", category: "Boissons", subcategory: "Eau", groupe: "Alimentaire", minStock: 24 },
  { id: "a20", code: "BOI-007", name: "Henniez Verte PET", category: "Boissons", subcategory: "Eau", groupe: "Alimentaire", minStock: 24 },
  { id: "a4", code: "LAI-001", name: "Lait entier", category: "Produits laitiers", subcategory: "Lait", groupe: "Alimentaire", minStock: 10 },
  { id: "a5", code: "LAI-002", name: "Yaourts nature", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15 },
  { id: "a23", code: "LAI-004", name: "Yaourts vanille", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15 },
  { id: "a24", code: "LAI-005", name: "Yaourts café", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15 },
  { id: "a25", code: "LAI-006", name: "Yaourts chocolat", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15 },
  { id: "a26", code: "LAI-007", name: "Yaourts framboise", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15 },
  { id: "a27", code: "LAI-008", name: "Yaourts fraise", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15 },
  { id: "a6", code: "LAI-003", name: "Beurre", category: "Produits laitiers", subcategory: "Beurre & crème", groupe: "Alimentaire", minStock: 6 },
  { id: "a7", code: "FRU-001", name: "Bananes", category: "Fruits", subcategory: "Fruits frais", groupe: "Alimentaire", minStock: 8 },
  { id: "a8", code: "FRU-002", name: "Pommes", category: "Fruits", subcategory: "Fruits frais", groupe: "Alimentaire", minStock: 8 },
  { id: "a9", code: "MAT-001", name: "Gants jetables", category: "Matériel", subcategory: "Hygiène", groupe: "Non Alimentaire", minStock: 10 },
  { id: "a10", code: "MAT-002", name: "Sacs poubelle", category: "Matériel", subcategory: "Nettoyage", groupe: "Non Alimentaire", minStock: 5 },
  { id: "a33", code: "MAT-003", name: "Renversé - Thé", category: "Matériel", subcategory: "Gobelets", groupe: "Non Alimentaire", minStock: 50 },
  { id: "a34", code: "MAT-004", name: "Café", category: "Matériel", subcategory: "Gobelets", groupe: "Non Alimentaire", minStock: 50 },
  { id: "a35", code: "MAT-005", name: "Espresso", category: "Matériel", subcategory: "Gobelets", groupe: "Non Alimentaire", minStock: 50 },
  { id: "a36", code: "MAT-006", name: "Boîte à pâtes", category: "Matériel", subcategory: "Boîte à pâtes", groupe: "Non Alimentaire", minStock: 20 },
  { id: "a37", code: "MAT-007", name: "Couverts BIO", category: "Matériel", subcategory: "Couverts BIO", groupe: "Non Alimentaire", minStock: 50 },
  { id: "a38", code: "MAT-008", name: "Serviettes Gustave", category: "Matériel", subcategory: "Serviettes Gustave", groupe: "Non Alimentaire", minStock: 50 },
  { id: "a39", code: "MAT-009", name: "Pailles", category: "Matériel", subcategory: "Brasserie", groupe: "Non Alimentaire", minStock: 50 },
  { id: "a40", code: "MAT-010", name: "Sous-verres", category: "Matériel", subcategory: "Brasserie", groupe: "Non Alimentaire", minStock: 50 },
  { id: "a41", code: "MAT-011", name: "Serviette Brasserie", category: "Matériel", subcategory: "Brasserie", groupe: "Non Alimentaire", minStock: 50 },
  { id: "a11", code: "KIO-001", name: "Chips", category: "Kiosque", subcategory: "Snacks salés", groupe: "Alimentaire", minStock: 12 },
  { id: "a12", code: "KIO-002", name: "Barres chocolatées", category: "Kiosque", subcategory: "Snacks sucrés", groupe: "Alimentaire", minStock: 12 },
  { id: "a13", code: "GLA-001", name: "Glace vanille (bac)", category: "Glace", subcategory: "Bacs", groupe: "Alimentaire", minStock: 4 },
  { id: "a14", code: "GLA-002", name: "Cornets glacés", category: "Glace", subcategory: "Individuel", groupe: "Alimentaire", minStock: 20 },
  { id: "a15", code: "CON-001", name: "Frites surgelées", category: "Congelé", subcategory: "Légumes", groupe: "Alimentaire", minStock: 10 },
  { id: "a16", code: "CON-002", name: "Petits pois surgelés", category: "Congelé", subcategory: "Légumes", groupe: "Alimentaire", minStock: 6 },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const SUPABASE_URL = "https://rmfraspxdwmgqkxbmobg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZnJhc3B4ZHdtZ3FreGJtb2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDM2NjYsImV4cCI6MjA5ODQ3OTY2Nn0.HZAp3ki90kkyEp5zmHE0vd7p3kHN5N59gqZ-jUWMpEY";
const SB_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function loadList(key, fallback) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/app_data?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: SB_HEADERS }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0].value;
    return fallback;
  } catch {
    return undefined;
  }
}

async function saveList(key, value) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/app_data`, {
      method: "POST",
      headers: { ...SB_HEADERS, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ key, value }),
    });
  } catch (e) {
    console.error("Erreur de sauvegarde", e);
  }
}

export default function StockApp() {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [pins, setPins] = useState(DEFAULT_PINS);
  const [catalogue, setCatalogue] = useState(DEFAULT_CATALOGUE);
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [cashRequests, setCashRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // full user object
  const [verified, setVerified] = useState(false);
  const [view, setView] = useState("home");

  // Derived convenience
  const isVladimir = currentUser?.name === "Vladimir";
  const role = isVladimir ? "manager" : (currentUser?.role || null);
  const currentEmployee = currentUser?.name || null;
  const employees = users.filter((u) => u.role === "employe").map((u) => u.name);

  useEffect(() => {
    (async () => {
      async function loadOrInit(key, fallback) {
        const res = await loadList(key, null);
        if (res !== null && res !== undefined) return res;
        await saveList(key, fallback);
        return fallback;
      }
      const [u, p, c, r, h, m] = await Promise.all([
        loadOrInit(EMPLOYEES_KEY, DEFAULT_USERS),
        loadOrInit(PINS_KEY, DEFAULT_PINS),
        loadOrInit(CATALOGUE_KEY, DEFAULT_CATALOGUE),
        loadOrInit(REQUESTS_KEY, []),
        loadOrInit(HISTORY_KEY, []),
        loadOrInit(CASH_KEY, []),
      ]);
      setUsers(u);
      setPins(p);
      setCatalogue(c);
      setRequests(r);
      setHistory(h);
      setCashRequests(m);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(async () => {
      const [r, h, c, u, p, m] = await Promise.all([
        loadList(REQUESTS_KEY, []),
        loadList(HISTORY_KEY, []),
        loadList(CATALOGUE_KEY, DEFAULT_CATALOGUE),
        loadList(EMPLOYEES_KEY, DEFAULT_USERS),
        loadList(PINS_KEY, DEFAULT_PINS),
        loadList(CASH_KEY, []),
      ]);
      if (r !== undefined) setRequests(r);
      if (h !== undefined) setHistory(h);
      if (c !== undefined) setCatalogue(c);
      if (u !== undefined) setUsers(u);
      if (p !== undefined) setPins(p);
      if (m !== undefined) setCashRequests(m);
    }, 4000);
    return () => clearInterval(id);
  }, [ready]);

  async function addRequest(articleId, quantite, nomLibre) {
    const newReq = { id: uid(), articleId, quantite, nomLibre: nomLibre || null, isNouveau: !articleId, par: currentEmployee, date: new Date().toISOString() };
    const updated = [...requests, newReq];
    setRequests(updated);
    await saveList(REQUESTS_KEY, updated);
  }
  async function updateRequestQty(id, quantite) {
    const updated = requests.map((r) => (r.id === id ? { ...r, quantite } : r));
    setRequests(updated);
    await saveList(REQUESTS_KEY, updated);
  }
  async function updateRequestComment(id, commentaire) {
    const updated = requests.map((r) => (r.id === id ? { ...r, commentaire } : r));
    setRequests(updated);
    await saveList(REQUESTS_KEY, updated);
  }
  async function removeRequest(id) {
    const updated = requests.filter((r) => r.id !== id);
    setRequests(updated);
    await saveList(REQUESTS_KEY, updated);
  }
  async function validateOrder(selectedIds = null) {
    const toValidate = selectedIds ? requests.filter((r) => selectedIds.includes(r.id)) : requests;
    if (toValidate.length === 0) return;
    const remaining = selectedIds ? requests.filter((r) => !selectedIds.includes(r.id)) : [];
    const order = {
      id: uid(),
      date: new Date().toISOString(),
      articles: toValidate.map((r) => ({ ...r, recu: false })),
    };
    const updatedHistory = [order, ...history];
    setHistory(updatedHistory);
    setRequests(remaining);
    await Promise.all([saveList(HISTORY_KEY, updatedHistory), saveList(REQUESTS_KEY, remaining)]);
  }

  async function toggleReceived(orderId, articleId, actor) {
    const updated = history.map((order) =>
      order.id !== orderId
        ? order
        : {
            ...order,
            articles: order.articles.map((a) => {
              if (a.id !== articleId) return a;
              const now = new Date().toISOString();
              if (!a.recuPar) {
                // First time ever marking this article: simple receipt, no correction involved
                return { ...a, recu: true, recuPar: actor, recuDate: now };
              }
              // Already had a first receipt before: this toggle is a correction
              return {
                ...a,
                recu: !a.recu,
                corrigePar: actor,
                corrigeDate: now,
              };
            }),
          }
    );
    setHistory(updated);
    await saveList(HISTORY_KEY, updated);
  }

  async function updateHistoryComment(orderId, articleId, commentaire) {
    const updated = history.map((order) =>
      order.id !== orderId
        ? order
        : { ...order, articles: order.articles.map((a) => (a.id === articleId ? { ...a, commentaire } : a)) }
    );
    setHistory(updated);
    await saveList(HISTORY_KEY, updated);
  }

  async function addCashRequest(lines, total, requester) {
    const newReq = { id: uid(), par: requester, date: new Date().toISOString(), lines, total, livre: false };
    const updated = [...cashRequests, newReq];
    setCashRequests(updated);
    await saveList(CASH_KEY, updated);
  }

  async function removeCashRequest(id) {
    const updated = cashRequests.filter((c) => c.id !== id);
    setCashRequests(updated);
    await saveList(CASH_KEY, updated);
  }

  async function toggleCashDelivered(id, actor) {
    const updated = cashRequests.map((c) => {
      if (c.id !== id) return c;
      const now = new Date().toISOString();
      if (!c.livrePar) {
        return { ...c, livre: true, livrePar: actor, livreDate: now };
      }
      return { ...c, livre: !c.livre, corrigePar: actor, corrigeDate: now };
    });
    setCashRequests(updated);
    await saveList(CASH_KEY, updated);
  }

  async function addCatalogueItem(item) {
    const updated = [...catalogue, { ...item, id: uid() }];
    setCatalogue(updated);
    await saveList(CATALOGUE_KEY, updated);
  }
  async function updateCatalogueItem(id, patch) {
    const updated = catalogue.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setCatalogue(updated);
    await saveList(CATALOGUE_KEY, updated);
  }
  async function removeCatalogueItem(id) {
    const updated = catalogue.filter((c) => c.id !== id);
    setCatalogue(updated);
    await saveList(CATALOGUE_KEY, updated);
  }

  async function addUser(name, role) {
    const newUser = { id: uid(), name: name.trim(), role };
    const updatedUsers = [...users, newUser];
    const updatedPins = { ...pins, [newUser.id]: "1234" };
    setUsers(updatedUsers);
    setPins(updatedPins);
    await Promise.all([saveList(EMPLOYEES_KEY, updatedUsers), saveList(PINS_KEY, updatedPins)]);
    return newUser;
  }

  async function removeUser(userId) {
    const updatedUsers = users.filter((u) => u.id !== userId);
    const updatedPins = { ...pins };
    delete updatedPins[userId];
    setUsers(updatedUsers);
    setPins(updatedPins);
    await Promise.all([saveList(EMPLOYEES_KEY, updatedUsers), saveList(PINS_KEY, updatedPins)]);
  }

  async function changePin(userId, newPin) {
    const updatedPins = { ...pins, [userId]: newPin };
    setPins(updatedPins);
    await saveList(PINS_KEY, updatedPins);
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-400 text-sm tracking-wide">Chargement…</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <UserSelect
        users={users}
        onSelect={(user) => setCurrentUser(user)}
      />
    );
  }

  if (!verified) {
    return (
      <PinEntry
        label={currentUser.name}
        correctPin={pins[currentUser.id] || "1234"}
        onSuccess={() => setVerified(true)}
        onBack={() => setCurrentUser(null)}
      />
    );
  }

  const isManager = role === "manager";
  const isChef = role === "chef" || role === "manager";
  // Vladimir has full access but displays as regular employee

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        role={role}
        currentEmployee={currentEmployee}
        view={view}
        isChef={isChef}
        onBack={() => {
          setCurrentUser(null);
          setVerified(false);
          setView("home");
        }}
        onToggleCatalogue={() => setView(view === "catalogue" ? "home" : "catalogue")}
        onToggleUsers={() => setView(view === "users" ? "home" : "users")}
        isManager={isManager}
      />
      {role === "employe" && currentEmployee !== "Vladimir" ? (
        <EmployeeView
          catalogue={catalogue}
          onAddRequest={addRequest}
          allRequests={requests}
          history={history}
          employees={employees}
          onToggleReceived={toggleReceived}
          onUpdateComment={updateRequestComment}
          onUpdateHistoryComment={updateHistoryComment}
          onRemoveRequest={removeRequest}
          onUpdateQty={updateRequestQty}
          currentEmployee={currentEmployee}
          currentUser={currentUser}
          pins={pins}
          onChangePin={changePin}
          myRequests={requests.filter((r) => r.par === currentEmployee)}
          cashRequests={cashRequests}
          onAddCashRequest={addCashRequest}
          onToggleCashDelivered={toggleCashDelivered}
          onRemoveCashRequest={removeCashRequest}
        />
      ) : view === "catalogue" ? (
        <CatalogueManager
          catalogue={catalogue}
          onAdd={addCatalogueItem}
          onUpdate={updateCatalogueItem}
          onRemove={removeCatalogueItem}
        />
      ) : view === "users" ? (
        <UserManager
          users={users}
          pins={pins}
          currentUser={currentUser}
          onAddUser={addUser}
          onRemoveUser={removeUser}
          onChangePin={changePin}
        />
      ) : (
        <ResponsableView
          requests={requests}
          history={history}
          catalogue={catalogue}
          employees={employees}
          onUpdateQty={updateRequestQty}
          onUpdateComment={updateRequestComment}
          onUpdateHistoryComment={updateHistoryComment}
          onRemove={removeRequest}
          onValidate={validateOrder}
          onToggleReceived={toggleReceived}
          onAddRequest={addRequest}
          view={view}
          setView={setView}
          cashRequests={cashRequests}
          onToggleCashDelivered={toggleCashDelivered}
          onRemoveCashRequest={removeCashRequest}
          currentUser={currentUser}
          currentEmployee={currentEmployee}
          pins={pins}
          onChangePin={changePin}
        />
      )}
    </div>
  );
}

function GustaveLogo({ size = 100 }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 180 120" className="mx-auto mb-4">
      <ellipse cx="90" cy="60" rx="86" ry="56" fill="#78350f" />
      <ellipse cx="90" cy="60" rx="86" ry="56" fill="none" stroke="#fef3c7" strokeWidth="2" />
      <ellipse cx="90" cy="60" rx="76" ry="47" fill="none" stroke="#fef3c7" strokeWidth="1" />
      <text x="90" y="42" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" letterSpacing="3" fill="#fef3c7">
        BRASSERIE
      </text>
      <text x="90" y="70" textAnchor="middle" fontFamily="Georgia, serif" fontSize="22" fontWeight="700" fill="#fef3c7">
        Chez Gustave
      </text>
      <line x1="55" y1="82" x2="125" y2="82" stroke="#fef3c7" strokeWidth="1" />
      <text x="90" y="97" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" letterSpacing="3.5" fill="#fef3c7">
        GENÈVE
      </text>
    </svg>
  );
}

function PinEntry({ label, correctPin, onSuccess, onBack }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function press(digit) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === (correctPin || "1234")) {
        setTimeout(() => onSuccess(), 150);
      } else {
        setTimeout(() => { setError(true); setPin(""); }, 300);
      }
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
      <GustaveLogo />
      <p className="text-stone-500 text-sm mb-1">Code à 4 chiffres</p>
      <p className="font-semibold text-stone-800 mb-6">{label}</p>
      <div className="flex gap-3 mb-6">
        {[0,1,2,3].map((i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${i < pin.length ? "bg-amber-700 border-amber-700" : "border-stone-300"} ${error ? "border-red-400" : ""}`} />
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mb-4">Code incorrect, réessaie</p>}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {["1","2","3","4","5","6","7","8","9"].map((d) => (
          <button key={d} onClick={() => press(d)} className="w-16 h-16 rounded-full bg-white border border-stone-200 text-xl font-medium text-stone-700 hover:border-amber-400 active:bg-amber-50 transition-colors">{d}</button>
        ))}
        <div />
        <button onClick={() => press("0")} className="w-16 h-16 rounded-full bg-white border border-stone-200 text-xl font-medium text-stone-700 hover:border-amber-400 active:bg-amber-50 transition-colors">0</button>
        <button onClick={() => setPin((p) => p.slice(0,-1))} className="w-16 h-16 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600">⌫</button>
      </div>
      <button onClick={onBack} className="text-sm text-stone-400 hover:text-stone-600">← Retour</button>
    </div>
  );
}

function UserSelect({ users, onSelect }) {
  const roleOrder = { manager: 0, chef: 1, employe: 2 };
  const sorted = [...users].sort((a, b) => {
    const aOrder = a.role === "manager" && a.name !== "Vladimir" ? 0 : a.role === "chef" ? 1 : 2;
    const bOrder = b.role === "manager" && b.name !== "Vladimir" ? 0 : b.role === "chef" ? 1 : 2;
    return aOrder - bOrder;
  });

  function roleLabel(role) {
    if (role === "manager") return "Manager";
    if (role === "chef") return "Chef d'équipe";
    return "Employé";
  }
  function roleColor(role, name) {
    if (name === "Vladimir") return "bg-white border border-stone-200 text-stone-700";
    if (role === "manager") return "bg-stone-800 text-white";
    if (role === "chef") return "bg-amber-700 text-amber-50";
    return "bg-white border border-stone-200 text-stone-700";
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <GustaveLogo />
        <h1 className="text-2xl font-semibold text-stone-800">Chez Gustave Stock</h1>
        <p className="text-stone-500 text-sm mt-1">Qui es-tu aujourd'hui ?</p>
      </div>
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        {sorted.map((user) => (
          <button key={user.id} onClick={() => onSelect(user)} className={`rounded-xl py-4 px-3 text-center font-medium shadow-sm hover:opacity-90 transition-opacity ${roleColor(user.role, user.name)}`}>
            <div>{user.name}</div>
            {user.role === "chef" && <div className="text-xs mt-0.5 text-amber-200">{roleLabel(user.role)}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Header({ role, currentEmployee, onBack, onToggleCatalogue, onToggleUsers, view, isChef, isManager }) {
  function viewLabel() {
    if (view === "catalogue") return "Gérer le catalogue";
    if (view === "users") return "Gérer les utilisateurs";
    if (role === "employe") return currentEmployee;
    return "Gestion des commandes";
  }
  function roleLabel() {
    if (role === "manager" && currentEmployee !== "Vladimir") return "Manager";
    if (role === "chef") return "Chef d'équipe";
    return "Employé";
  }

  return (
    <div className="bg-white border-b border-stone-200 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {(view === "catalogue" || view === "users") && (
          <button onClick={view === "catalogue" ? onToggleCatalogue : onToggleUsers} className="text-stone-400 hover:text-stone-600">
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <div className="text-xs text-stone-400 uppercase tracking-wide">{roleLabel()}</div>
          <div className="font-medium text-stone-800">{viewLabel()}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isChef && view !== "catalogue" && view !== "users" && (
          <button onClick={onToggleCatalogue} className="text-stone-400 hover:text-amber-700">
            <Settings size={18} />
          </button>
        )}
        {isChef && view !== "users" && view !== "catalogue" && (
          <button onClick={onToggleUsers} className="text-stone-400 hover:text-stone-700">
            <User size={18} />
          </button>
        )}
        <button onClick={onBack} className="text-xs text-stone-400 hover:text-stone-600 underline">Changer</button>
      </div>
    </div>
  );
}

// Group catalogue into { category: { subcategory: [items] } }
function groupCatalogue(catalogue) {
  const tree = {};
  for (const item of catalogue) {
    const cat = item.category || "Sans catégorie";
    const sub = item.subcategory || "Général";
    if (!tree[cat]) tree[cat] = {};
    if (!tree[cat][sub]) tree[cat][sub] = [];
    tree[cat][sub].push(item);
  }
  return tree;
}

// Returns the groupe (Alimentaire / Non Alimentaire) a category belongs to, based on existing items
function categoryGroupe(catalogue, category) {
  const item = catalogue.find((c) => c.category === category && c.groupe);
  return item ? item.groupe : "Alimentaire";
}

// List of distinct categories belonging to a given groupe
function categoriesForGroupe(catalogue, groupe) {
  const cats = new Set();
  for (const item of catalogue) {
    if ((item.groupe || "Alimentaire") === groupe) cats.add(item.category || "Sans catégorie");
  }
  return [...cats].sort();
}

function EmployeeView({ catalogue, onAddRequest, allRequests, history, employees, onToggleReceived, onUpdateComment, onUpdateHistoryComment, onRemoveRequest, onUpdateQty, currentEmployee, currentUser, pins, onChangePin, myRequests, cashRequests, onAddCashRequest, onToggleCashDelivered, onRemoveCashRequest }) {
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState("1");
  const [openCat, setOpenCat] = useState(null);
  const [openSub, setOpenSub] = useState(null);
  const [sent, setSent] = useState(false);
  const [duplicateModal, setDuplicateModal] = useState(null); // { matches: [] }
  const [tab, setTab] = useState("nouvelle");
  const [showCashForm, setShowCashForm] = useState(false);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [showAutre, setShowAutre] = useState(false); // "Alimentaire" | "Non Alimentaire"

  const filteredCatalogue = selectedGroupe ? catalogue.filter((c) => (c.groupe || "Alimentaire") === selectedGroupe) : [];
  const tree = groupCatalogue(filteredCatalogue);
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  // Count articles validated but not yet received
  const pendingDeliveryCount = history.reduce((sum, order) =>
    sum + order.articles.filter((a) => !a.recu).length, 0
  );

  function findRecentMatches(articleId) {
    const now = Date.now();
    const matches = [];

    // Pending requests from other employees
    for (const r of allRequests) {
      if (r.articleId === articleId && r.par !== currentEmployee) {
        matches.push({ par: r.par, date: r.date, quantite: r.quantite, statut: "en attente" });
      }
    }

    // Validated orders within the last 3 days
    for (const order of history) {
      for (const a of order.articles) {
        if (a.articleId === articleId && now - new Date(a.date).getTime() <= THREE_DAYS_MS) {
          matches.push({ par: a.par, date: a.date, quantite: a.quantite, statut: "commandé" });
        }
      }
    }

    // Most recent first
    matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    return matches;
  }

  function attemptSubmit() {
    if (!selected || !qty || Number(qty) <= 0) return;
    const matches = findRecentMatches(selected.id);
    if (matches.length > 0) {
      setDuplicateModal({ matches });
    } else {
      doSubmit();
    }
  }

  function doSubmit() {
    onAddRequest(selected.id, Number(qty));
    setSelected(null);
    setQty("1");
    setDuplicateModal(null);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }


  return (
    <div className="max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-2 p-3 bg-stone-100 sticky top-[65px] z-10">
        <button onClick={() => setTab("nouvelle")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "nouvelle" ? "bg-amber-700 text-white shadow-md" : "bg-white text-amber-700 border border-amber-200"}`}>
          🛒<br/>Nouvelle<br/>commande
        </button>
        <button onClick={() => setTab("panier")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "panier" ? "bg-teal-600 text-white shadow-md" : "bg-white text-teal-600 border border-teal-200"}`}>
          🧺<br/>Panier<br/>{allRequests.length > 0 ? `(${allRequests.length})` : "commun"}
        </button>
        <button onClick={() => setTab("historique")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${tab === "historique" ? "bg-orange-500 text-white shadow-md" : "bg-white text-orange-500 border border-orange-200"}`}>
          ⏳<br/>En attente<br/>livraison
          {pendingDeliveryCount > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 border-2 border-white">
              {pendingDeliveryCount}
            </span>
          )}
        </button>
        <button onClick={() => setTab("livre")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "livre" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-emerald-600 border border-emerald-200"}`}>
          ✅<br/>Historique
        </button>
        <button onClick={() => setTab("monnaie")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "monnaie" ? "bg-red-600 text-white shadow-md" : "bg-white text-red-600 border border-red-200"}`}>
          💰<br/>Monnaie
        </button>
        <button onClick={() => setTab("profil")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "profil" ? "bg-stone-700 text-white shadow-md" : "bg-white text-stone-600 border border-stone-200"}`}>
          👤<br/>Mon<br/>profil
        </button>
      </div>

      {tab === "profil" ? (
        <div className="p-5 max-w-md mx-auto">
          <ProfilView currentUser={currentUser} pins={pins} onChangePin={onChangePin} />
        </div>
      ) : tab === "monnaie" ? (
        <div className="p-5">
          <CashList
            cashRequests={cashRequests}
            employees={employees}
            currentIdentity={currentEmployee}
            onToggleDelivered={onToggleCashDelivered}
            onRemove={onRemoveCashRequest}
          />
        </div>
      ) : tab === "panier" ? (
        <div className="p-5">
          <PanierCommun
            allRequests={allRequests}
            catalogue={catalogue}
            onUpdateComment={onUpdateComment}
            onRemoveRequest={onRemoveRequest}
            onUpdateQty={onUpdateQty}
          />
        </div>
      ) : tab === "historique" ? (
        <div className="p-5">
          {history.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">Aucune commande passée encore</div>
          ) : (
            <HistoryByDate
              history={history}
              catalogue={catalogue}
              employees={employees}
              onToggleReceived={onToggleReceived}
              onUpdateComment={onUpdateHistoryComment}
              currentIdentity={currentEmployee}
              mode="attente"
            />
          )}
        </div>
      ) : tab === "livre" ? (
        <div className="p-5">
          {history.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">Aucune commande passée encore</div>
          ) : (
            <HistoryByDate
              history={history}
              catalogue={catalogue}
              employees={employees}
              onToggleReceived={onToggleReceived}
              onUpdateComment={onUpdateHistoryComment}
              currentIdentity={currentEmployee}
              mode="livre"
            />
          )}
        </div>
      ) : (
        <div className="p-5">
      {sent && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3 max-w-[90vw]">
          <span className="text-2xl">😊</span>
          <span className="text-sm font-medium">Demande bien enregistrée !</span>
        </div>
      )}

      {duplicateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <AlertTriangle className="text-amber-600" size={22} />
              </div>
              <h3 className="font-semibold text-stone-800 mb-1">Déjà demandé récemment</h3>
              <p className="text-sm text-stone-500">
                "<span className="font-medium text-stone-700">{selected?.name}</span>" a déjà été signalé ces 3
                derniers jours :
              </p>
            </div>

            <div className="bg-stone-50 rounded-xl p-3 mb-5 space-y-2 max-h-40 overflow-y-auto">
              {duplicateModal.matches.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-stone-700">{m.par}</span>
                    <span className="text-stone-400"> · x{m.quantite}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-stone-400">
                      {new Date(m.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}
                    </div>
                    <div className={`text-[10px] ${m.statut === "commandé" ? "text-emerald-600" : "text-amber-600"}`}>
                      {m.statut}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-stone-500 text-center mb-4">Veux-tu envoyer ta demande quand même ?</p>

            <div className="flex gap-2">
              <button
                onClick={() => setDuplicateModal(null)}
                className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 font-medium hover:bg-stone-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={doSubmit}
                className="flex-1 bg-amber-700 text-amber-50 rounded-xl py-3 font-medium hover:bg-amber-800 transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {showAutre ? (
        <AutreArticleView
          onSubmit={async (items) => {
            for (const item of items) {
              await onAddRequest(null, item.quantite, item.nom);
            }
            setShowAutre(false);
            setSent(true);
            setTimeout(() => setSent(false), 3000);
          }}
          onBack={() => setShowAutre(false)}
        />
      ) : !selectedGroupe ? (
        <>
          <h2 className="text-stone-700 font-medium mb-3 text-sm">Quel type de produit ?</h2>
          <div className="grid grid-cols-1 gap-3 mb-6">
            <button
              onClick={() => setSelectedGroupe("Alimentaire")}
              className="bg-white border border-stone-200 rounded-xl py-5 text-center font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm"
            >
              🧃 Alimentaires
            </button>
            <button
              onClick={() => setSelectedGroupe("Non Alimentaire")}
              className="bg-white border border-stone-200 rounded-xl py-5 text-center font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm"
            >
              🥡 Non Alimentaires
            </button>
            <button
              onClick={() => { setShowAutre(true); setSelectedGroupe(null); }}
              className="bg-white border-2 border-dashed border-stone-300 rounded-xl py-5 text-center font-medium text-stone-500 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm"
            >
              ➕ Autre<br/>
              <span className="text-xs font-normal text-stone-400">Article non répertorié</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-stone-700 font-medium text-sm">
              {selectedGroupe === "Alimentaire" ? "🧃 Alimentaires" : "🥡 Non Alimentaires"}
            </h2>
            <button
              onClick={() => {
                setSelectedGroupe(null);
                setSelected(null);
                setOpenCat(null);
                setOpenSub(null);
              }}
              className="text-xs text-amber-700 underline"
            >
              Changer
            </button>
          </div>

      <div className="space-y-2 mb-6">
        {Object.entries(tree).map(([cat, subs]) => (
          <div key={cat} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenCat(openCat === cat ? null : cat)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-800"
            >
              {cat}
              <ChevronDown
                size={16}
                className={`text-stone-400 transition-transform ${openCat === cat ? "rotate-180" : ""}`}
              />
            </button>
            {openCat === cat && (
              <div className="px-2 pb-2">
                {Object.entries(subs).map(([sub, items]) => (
                  <div key={sub} className="mb-1">
                    <button
                      onClick={() => setOpenSub(openSub === sub ? null : sub)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide text-stone-400"
                    >
                      {sub}
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${openSub === sub ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openSub === sub && (
                      <div className="flex flex-col gap-2 px-3 pb-2">
                        {items.map((item) => (
                          <div key={item.id}>
                            <button
                              onClick={() => {
                                if (selected?.id === item.id) {
                                  setSelected(null);
                                } else {
                                  setSelected(item);
                                  setQty("1");
                                }
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                                selected?.id === item.id
                                  ? "bg-amber-700 text-amber-50 border-amber-700"
                                  : "bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{item.name}</span>
                                {selected?.id === item.id && <ChevronDown size={14} className="rotate-180" />}
                              </div>
                              <div className={`text-[10px] mt-0.5 ${selected?.id === item.id ? "text-amber-100" : "text-stone-400"}`}>
                                {item.code ? `${item.code} · ` : ""}{item.minStock ? `Min: ${item.minStock} ${item.minUnit || ''}` : ""}
                              </div>
                            </button>

                            {selected?.id === item.id && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-1 flex items-center gap-3">
                                <span className="text-xs text-stone-500 shrink-0">Quantité</span>
                                <div className="flex items-center gap-2 ml-auto">
                                  <button
                                    onClick={() => setQty((q) => String(Math.max(1, Number(q) - 1)))}
                                    className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 font-medium flex items-center justify-center hover:border-amber-400"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                    className="w-12 text-center border border-stone-200 rounded-lg py-1 text-sm"
                                  />
                                  <button
                                    onClick={() => setQty((q) => String(Number(q) + 1))}
                                    className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 font-medium flex items-center justify-center hover:border-amber-400"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={attemptSubmit}
                                  className="bg-amber-700 text-amber-50 rounded-lg px-3 py-2 text-sm font-medium hover:bg-amber-800 transition-colors shrink-0"
                                >
                                  Envoyer
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
        </>
      )}

      {myRequests.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wide text-stone-400 mb-2">Mes demandes en attente</h3>
          <div className="space-y-2">
            {myRequests.map((r) => {
              const item = catalogue.find((c) => c.id === r.articleId);
              return (
                <div
                  key={r.id}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-2 flex items-center justify-between text-sm"
                >
                  <span className="text-stone-700">{a.isNouveau ? (a.nomLibre || "Article libre") : (item ? item.name : "Article supprimé")}</span>
                  <span className="text-stone-400">x{r.quantite}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowCashForm(!showCashForm)}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-4 font-bold text-base tracking-wide transition-colors flex items-center justify-center gap-2"
        >
          💰 DEMANDE DE MONNAIE
        </button>

        {showCashForm && (
          <CashRequestForm
            currentEmployee={currentEmployee}
            onSubmit={(lines, total) => {
              onAddCashRequest(lines, total, currentEmployee);
              setShowCashForm(false);
            }}
            onCancel={() => setShowCashForm(false)}
          />
        )}
      </div>
        </div>
      )}
    </div>
  );
}


function AutreArticleView({ onSubmit, onBack }) {
  const [items, setItems] = useState([{ id: uid(), nom: "", quantite: 1 }]);

  function addLine() {
    setItems(prev => [...prev, { id: uid(), nom: "", quantite: 1 }]);
  }
  function updateLine(id, field, value) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }
  function removeLine(id) {
    if (items.length === 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  }
  function handleSubmit() {
    const valid = items.filter(i => i.nom.trim());
    if (valid.length === 0) return;
    onSubmit(valid);
  }

  return (
    <div className="bg-white border-2 border-dashed border-stone-300 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-700">➕ Article non répertorié</h3>
      </div>
      <div className="space-y-2 mb-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              value={item.nom}
              onChange={(e) => updateLine(item.id, "nom", e.target.value)}
              placeholder="Nom de l'article..."
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-1">
              <button onClick={() => updateLine(item.id, "quantite", Math.max(1, item.quantite - 1))} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold flex items-center justify-center">−</button>
              <span className="w-6 text-center text-sm font-medium">{item.quantite}</span>
              <button onClick={() => updateLine(item.id, "quantite", item.quantite + 1)} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold flex items-center justify-center">+</button>
            </div>
            {items.length > 1 && (
              <button onClick={() => removeLine(item.id)} className="text-stone-300 hover:text-red-500"><Trash2 size={14} /></button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addLine} className="text-xs text-amber-700 underline mb-3 flex items-center gap-1"><Plus size={12} /> Ajouter un autre article</button>
      <div className="flex gap-2">
        <button onClick={onBack} className="flex-none bg-stone-100 text-stone-600 rounded-xl py-3 px-5 font-medium hover:bg-stone-200 transition-colors">← Retour</button>
        <button onClick={handleSubmit} className="flex-1 bg-amber-700 text-amber-50 rounded-xl py-3 font-medium hover:bg-amber-800 transition-colors">Envoyer</button>
      </div>
    </div>
  );
}

function PanierCommun({ allRequests, catalogue, onUpdateComment, onRemoveRequest, onUpdateQty }) {
  const [commentOpenId, setCommentOpenId] = useState(null);
  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(13, 30, 0, 0);
  const minutesLeft = Math.round((deadline - now) / 60000);
  const isPast = minutesLeft < 0;

  // Group by category
  const byCategory = {};
  for (const r of allRequests) {
    const item = catalogue.find((c) => c.id === r.articleId);
    const cat = item?.category || "Sans catégorie";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({ ...r, item });
  }
  // Distinct people who have contributed
  const contributors = [...new Set(allRequests.map((r) => r.par))];

  return (
    <div>
      <div
        className={`rounded-xl p-4 mb-5 text-sm ${
          isPast ? "bg-stone-100 text-stone-500" : "bg-amber-50 border border-amber-200 text-amber-700"
        }`}
      >
        {isPast ? (
          <>L'heure limite de 13h30 est passée pour aujourd'hui.</>
        ) : (
          <>
            ⏰ Envoyez vos demandes avant <span className="font-semibold">13h30</span> — encore{" "}
            <span className="font-semibold">{minutesLeft} min</span>. Idéalement, tout le monde envoie en même
            temps pour ne faire qu'une seule commande.
          </>
        )}
      </div>

      {contributors.length > 0 && (
        <div className="text-xs text-stone-400 mb-4">
          Ont déjà ajouté quelque chose : <span className="text-stone-600 font-medium">{contributors.join(", ")}</span>
        </div>
      )}

      {allRequests.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">
          <ClipboardList className="mx-auto mb-2" size={28} />
          Personne n'a encore rien ajouté
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <div className="text-xs font-semibold text-stone-500 mb-1">{cat}</div>
              <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
                {items.map((r) => (
                  <div key={r.id} className="px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span className="flex-1 text-stone-700 flex items-center gap-1 flex-wrap">
                        {r.isNouveau ? (
                          <>
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                            <span>{r.nomLibre || "Article libre"}</span>
                          </>
                        ) : (
                          <>{r.item?.code ? `${r.item.code} · ` : ""}{r.isNouveau ? (r.nomLibre || "Article libre") : (r.item ? r.item.name : "Article supprimé")}</>
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                      <button onClick={() => onUpdateQty && onUpdateQty(r.id, Math.max(1, r.quantite - 1))} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-sm">−</button>
                      <span className="text-stone-700 font-medium text-sm w-6 text-center">{r.quantite}</span>
                      <button onClick={() => onUpdateQty && onUpdateQty(r.id, r.quantite + 1)} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-sm">+</button>
                    </div>
                    </div>
                    <div className="pl-6 mt-1">
                      {r.commentaire ? (
                        <button
                          onClick={() => setCommentOpenId(commentOpenId === r.id ? null : r.id)}
                          className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-flex items-center gap-1"
                        >
                          💬 {r.commentaire}
                        </button>
                      ) : (
                        <button
                          onClick={() => setCommentOpenId(commentOpenId === r.id ? null : r.id)}
                          className="text-xs text-stone-400 underline"
                        >
                          + Ajouter un commentaire
                        </button>
                      )}
                      {commentOpenId === r.id && (
                        <CommentEditor
                          value={r.commentaire || ""}
                          onSave={(text) => {
                            onUpdateComment && onUpdateComment(r.id, text);
                            setCommentOpenId(null);
                          }}
                          onCancel={() => setCommentOpenId(null)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CashRequestForm({ currentEmployee, onSubmit, onCancel }) {
  const [qtys, setQtys] = useState({}); // { denomId: quantity }

  function setQty(id, value) {
    const n = Math.max(0, Number(value) || 0);
    setQtys((prev) => ({ ...prev, [id]: n }));
  }

  const lines = DENOMINATIONS.map((d) => ({
    ...d,
    qty: qtys[d.id] || 0,
    subtotal: (qtys[d.id] || 0) * d.value,
  }));
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const rouleaux = lines.filter((l) => l.type === "rouleau");
  const billets = lines.filter((l) => l.type === "billet");

  function submit() {
    const selected = lines.filter((l) => l.qty > 0).map(({ id, type, value, label, qty, subtotal }) => ({ id, type, value, label, qty, subtotal }));
    if (selected.length === 0) return;
    onSubmit(selected, total);
  }

  function renderRow(l) {
    return (
      <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
        <span className="text-sm text-stone-700">{l.label}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={qtys[l.id] || ""}
            onChange={(e) => setQty(l.id, e.target.value)}
            placeholder="0"
            className="w-16 border border-stone-200 rounded-lg px-2 py-1 text-center text-sm"
          />
          <span className="text-xs text-stone-400 w-16 text-right">
            {l.subtotal > 0 ? `${l.subtotal.toFixed(2)} CHF` : ""}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-red-200 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-semibold text-red-700 mb-3">💰 Demande de monnaie — {currentEmployee}</h3>

      <div className="mb-3">
        <div className="text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Rouleaux</div>
        {rouleaux.map(renderRow)}
      </div>

      <div className="mb-4">
        <div className="text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Billets</div>
        {billets.map(renderRow)}
      </div>

      <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
        <span className="text-sm font-semibold text-red-700">Total global</span>
        <span className="text-lg font-bold text-red-700">{total.toFixed(2)} CHF</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 font-medium hover:bg-stone-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={total === 0}
          className="flex-1 bg-red-600 text-white rounded-xl py-3 font-medium hover:bg-red-700 disabled:opacity-40 transition-colors"
        >
          Envoyer la demande
        </button>
      </div>
    </div>
  );
}

function CashList({ cashRequests, employees, currentIdentity, onToggleDelivered, onRemove }) {
  const sorted = [...cashRequests].sort((a, b) => new Date(b.date) - new Date(a.date));
  const pending = sorted.filter((c) => !c.livre);
  const delivered = sorted.filter((c) => c.livre);

  function renderCard(c) {
    return (
      <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-sm font-medium text-stone-800">{c.par}</div>
            <div className="text-xs text-stone-400">
              {new Date(c.date).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <span className="text-base font-bold text-red-700">{c.total.toFixed(2)} CHF</span>
        </div>

        <div className="space-y-0.5 mb-3">
          {c.lines.map((l) => (
            <div key={l.id} className="flex justify-between text-xs text-stone-500">
              <span>{l.label} × {l.qty}</span>
              <span>{l.subtotal.toFixed(2)} CHF</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggleDelivered(c.id, currentIdentity || "Inconnu")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              c.livre
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-stone-200 text-stone-500 hover:border-amber-400"
            }`}
          >
            <Check size={13} />
            {c.livre ? "Livré" : "Marquer comme livré"}
          </button>
          {!c.livre && onRemove && (
            <button onClick={() => onRemove(c.id)} className="text-stone-300 hover:text-red-500">
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {c.livrePar && (
          <div className="text-[11px] text-stone-400 mt-2">
            Livré par <span className="font-medium text-emerald-600">{c.livrePar}</span>
            {c.livreDate && <> le {new Date(c.livreDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</>}
            {c.corrigePar && (
              <>
                {" "}
                · <span className="font-medium text-orange-600">
                  {c.livre ? "Re-confirmé" : "Corrigé (non livré)"} par {c.corrigePar}
                </span>
                {c.corrigeDate && <> le {new Date(c.corrigeDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</>}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (cashRequests.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400 text-sm">
        <ClipboardList className="mx-auto mb-2" size={28} />
        Aucune demande de monnaie
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {pending.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
            En attente de livraison ({pending.length})
          </div>
          <div className="space-y-3">{pending.map(renderCard)}</div>
        </div>
      )}
      {delivered.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Livrées ({delivered.length})
          </div>
          <div className="space-y-3">{delivered.map(renderCard)}</div>
        </div>
      )}
    </div>
  );
}

function PinChanger({ userId, currentPin, onSave, onCancel }) {
  const [step, setStep] = useState("old"); // "old" | "new" | "confirm"
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");

  function press(digit) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError("");
    if (next.length === 4) {
      setTimeout(() => {
        if (step === "old") {
          if (next !== currentPin) { setError("Code actuel incorrect"); setPin(""); return; }
          setStep("new"); setPin("");
        } else if (step === "new") {
          setNewPin(next); setStep("confirm"); setPin("");
        } else {
          if (next !== newPin) { setError("Les codes ne correspondent pas"); setPin(""); setStep("new"); setNewPin(""); return; }
          onSave(next);
        }
      }, 150);
    }
  }

  const labels = { old: "Code actuel", new: "Nouveau code", confirm: "Confirmer le nouveau code" };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-xl text-center">
        <h3 className="font-semibold text-stone-800 mb-1">Changer mon code</h3>
        <p className="text-sm text-stone-500 mb-4">{labels[step]}</p>
        <div className="flex gap-3 justify-center mb-4">
          {[0,1,2,3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${i < pin.length ? "bg-amber-700 border-amber-700" : "border-stone-300"}`} />
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <button key={d} onClick={() => press(d)} className="h-12 rounded-xl bg-stone-50 border border-stone-200 text-lg font-medium text-stone-700 hover:border-amber-400">{d}</button>
          ))}
          <div />
          <button onClick={() => press("0")} className="h-12 rounded-xl bg-stone-50 border border-stone-200 text-lg font-medium text-stone-700 hover:border-amber-400">0</button>
          <button onClick={() => setPin((p) => p.slice(0,-1))} className="h-12 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600">⌫</button>
        </div>
        <button onClick={onCancel} className="text-sm text-stone-400 hover:text-stone-600">Annuler</button>
      </div>
    </div>
  );
}

function ProfilView({ currentUser, pins, onChangePin }) {
  const [showPinChanger, setShowPinChanger] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <div>
      {showPinChanger && (
        <PinChanger
          userId={currentUser.id}
          currentPin={pins[currentUser.id] || "1234"}
          onSave={async (newPin) => {
            await onChangePin(currentUser.id, newPin);
            setShowPinChanger(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
          }}
          onCancel={() => setShowPinChanger(false)}
        />
      )}
      <div className="bg-white border border-stone-200 rounded-xl p-5 text-center mb-4">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <User className="text-amber-700" size={24} />
        </div>
        <div className="font-semibold text-stone-800 text-lg">{currentUser.name}</div>
        <div className="text-xs text-stone-400 mt-0.5">
          {currentUser.role === "manager" ? "Manager" : currentUser.role === "chef" ? "Chef d'équipe" : "Employé"}
        </div>
      </div>

      {success && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3">
          <span className="text-xl">✅</span>
          <span className="text-sm font-medium">Code PIN mis à jour !</span>
        </div>
      )}

      <button
        onClick={() => setShowPinChanger(true)}
        className="w-full bg-white border border-stone-200 rounded-xl py-4 text-sm font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors flex items-center justify-center gap-2"
      >
        🔑 Changer mon code PIN
      </button>
    </div>
  );
}

function UserManager({ users, pins, currentUser, onAddUser, onRemoveUser, onChangePin }) {
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("employe");
  const [changingPinFor, setChangingPinFor] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const roleLabel = { employe: "Employé", chef: "Chef d'équipe", manager: "Manager" };
  const roleColor = { employe: "text-stone-600 bg-stone-100", chef: "text-amber-700 bg-amber-50", manager: "text-white bg-stone-800" };

  async function handleAdd() {
    if (!newName.trim()) return;
    await onAddUser(newName.trim(), newRole);
    setNewName("");
    setNewRole("employe");
  }

  return (
    <div className="p-5 max-w-md mx-auto">
      {changingPinFor && (
        <PinChanger
          userId={changingPinFor.id}
          currentPin={pins[changingPinFor.id] || "1234"}
          onSave={async (newPin) => { await onChangePin(changingPinFor.id, newPin); setChangingPinFor(null); }}
          onCancel={() => setChangingPinFor(null)}
        />
      )}
      {confirmRemove && (
        <ConfirmDialog
          title="Supprimer cet utilisateur ?"
          message={`"${confirmRemove.name}" sera retiré définitivement.`}
          onCancel={() => setConfirmRemove(null)}
          onConfirm={async () => { await onRemoveUser(confirmRemove.id); setConfirmRemove(null); }}
        />
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-stone-700 mb-3">Ajouter un utilisateur</h3>
        <div className="space-y-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Prénom"
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="employe">Employé</option>
            <option value="chef">Chef d'équipe</option>
            <option value="manager">Manager</option>
          </select>
          <button
            onClick={handleAdd}
            className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Ajouter (Code PIN: 1234 par défaut)
          </button>
        </div>
      </div>

      <h3 className="text-xs uppercase tracking-wide text-stone-400 mb-2">Utilisateurs</h3>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-800 text-sm">{u.name}</div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${roleColor[u.role] || "text-stone-500 bg-stone-100"}`}>
                {roleLabel[u.role] || u.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChangingPinFor(u)}
                className="text-xs text-amber-700 border border-amber-200 bg-amber-50 rounded-lg px-2 py-1"
              >
                🔑 PIN
              </button>
              {u.id !== currentUser.id && (
                <button onClick={() => setConfirmRemove(u)} className="text-stone-300 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
            <Trash2 className="text-red-600" size={20} />
          </div>
          <h3 className="font-semibold text-stone-800 mb-1">{title}</h3>
          <p className="text-sm text-stone-500">{message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 font-medium hover:bg-stone-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white rounded-xl py-3 font-medium hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentEditor({ value, onSave, onCancel }) {
  const presets = ["Rupture stock", "Livraison tardive", "Plus référencé"];

  // Parse existing value to separate base text from an appended date, if any
  const dateMatch = value.match(/ \(prévue le (\d{4}-\d{2}-\d{2})\)$/);
  const initialText = dateMatch ? value.slice(0, dateMatch.index) : value;
  const initialDate = dateMatch ? dateMatch[1] : "";

  const [text, setText] = useState(initialText);
  const [lateDate, setLateDate] = useState(initialDate);

  const isLate = text === "Livraison tardive";

  function buildFinalText() {
    const base = text.trim();
    if (!base) return "";
    if (isLate && lateDate) {
      return `${base} (prévue le ${lateDate})`;
    }
    return base;
  }

  return (
    <div className="mt-2 bg-stone-50 border border-stone-200 rounded-xl p-3">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setText(p)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              text === p
                ? "bg-amber-700 text-amber-50 border-amber-700"
                : "bg-white text-stone-600 border-stone-200 hover:border-amber-300"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {isLate && (
        <div className="mb-2">
          <label className="text-xs text-stone-500 mb-1 block">Date de livraison prévue</label>
          <input
            type="date"
            value={lateDate}
            onChange={(e) => setLateDate(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Commentaire libre…"
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-stone-200 text-stone-500 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-100"
        >
          Annuler
        </button>
        <button
          onClick={() => onSave(buildFinalText())}
          className="flex-1 bg-amber-700 text-amber-50 rounded-lg py-1.5 text-xs font-medium hover:bg-amber-800"
        >
          Enregistrer
        </button>
        {value && (
          <button
            onClick={() => onSave("")}
            className="text-xs text-red-500 px-2"
            title="Supprimer le commentaire"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function ChefCommandeView({ catalogue, allRequests, onAddRequest, currentEmployee, myRequests }) {
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState("1");
  const [openCat, setOpenCat] = useState(null);
  const [openSub, setOpenSub] = useState(null);
  const [sent, setSent] = useState(false);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [duplicateModal, setDuplicateModal] = useState(null);
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  const filteredCatalogue = selectedGroupe ? catalogue.filter((c) => (c.groupe || "Alimentaire") === selectedGroupe) : [];
  const tree = groupCatalogue(filteredCatalogue);

  function findRecentMatches(articleId) {
    const now = Date.now();
    const matches = [];
    for (const r of allRequests) {
      if (r.articleId === articleId && r.par !== currentEmployee) {
        matches.push({ par: r.par, date: r.date, quantite: r.quantite, statut: "en attente" });
      }
    }
    matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    return matches;
  }

  function attemptSubmit() {
    if (!selected || !qty || Number(qty) <= 0) return;
    const matches = findRecentMatches(selected.id);
    if (matches.length > 0) {
      setDuplicateModal({ matches });
    } else {
      doSubmit();
    }
  }

  function doSubmit() {
    onAddRequest(selected.id, Number(qty));
    setSelected(null);
    setQty("1");
    setDuplicateModal(null);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="max-w-md mx-auto p-5">
      {sent && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3 max-w-[90vw]">
          <span className="text-2xl">😊</span>
          <span className="text-sm font-medium">Ajouté à la liste en attente !</span>
        </div>
      )}

      {duplicateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <AlertTriangle className="text-amber-600" size={22} />
              </div>
              <h3 className="font-semibold text-stone-800 mb-1">Déjà demandé récemment</h3>
              <p className="text-sm text-stone-500">"{selected?.name}" a déjà été signalé :</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 mb-5 space-y-2 max-h-40 overflow-y-auto">
              {duplicateModal.matches.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div><span className="font-medium text-stone-700">{m.par}</span><span className="text-stone-400"> · x{m.quantite}</span></div>
                  <div className="text-xs text-stone-400">{new Date(m.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDuplicateModal(null)} className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 font-medium">Annuler</button>
              <button onClick={doSubmit} className="flex-1 bg-amber-700 text-amber-50 rounded-xl py-3 font-medium">Continuer</button>
            </div>
          </div>
        </div>
      )}

      {!selectedGroupe ? (
        <>
          <h2 className="text-stone-700 font-medium mb-3 text-sm">Quel type de produit ?</h2>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => setSelectedGroupe("Alimentaire")} className="bg-white border border-stone-200 rounded-xl py-5 text-center font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm">🧃 Alimentaires</button>
            <button onClick={() => setSelectedGroupe("Non Alimentaire")} className="bg-white border border-stone-200 rounded-xl py-5 text-center font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm">🥡 Non Alimentaires</button>
            <button onClick={() => { setShowAutre(true); setSelectedGroupe(null); }} className="bg-white border-2 border-dashed border-stone-300 rounded-xl py-5 text-center font-medium text-stone-500 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm">➕ Autre<div className="text-xs font-normal text-stone-400 mt-1">Article non répertorié</div></button>
          </div>
        </>
      ) : showAutre ? (
        <AutreArticleView
          onSubmit={async (items) => {
            for (const item of items) {
              await onAddRequest(null, item.quantite, item.nom);
            }
            setShowAutre(false);
            setSent(true);
            setTimeout(() => setSent(false), 3000);
          }}
          onBack={() => setShowAutre(false)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-stone-700 font-medium text-sm">{selectedGroupe === "Alimentaire" ? "🧃 Alimentaires" : "🥡 Non Alimentaires"}</h2>
            <button onClick={() => { setSelectedGroupe(null); setSelected(null); setOpenCat(null); setOpenSub(null); }} className="text-xs text-amber-700 underline">Changer</button>
          </div>
          <div className="space-y-2 mb-4">
            {Object.entries(tree).map(([cat, subs]) => (
              <div key={cat} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenCat(openCat === cat ? null : cat)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-800">
                  {cat}
                  <ChevronDown size={16} className={`text-stone-400 transition-transform ${openCat === cat ? "rotate-180" : ""}`} />
                </button>
                {openCat === cat && (
                  <div className="px-2 pb-2">
                    {Object.entries(subs).map(([sub, items]) => (
                      <div key={sub} className="mb-1">
                        <button onClick={() => setOpenSub(openSub === sub ? null : sub)} className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide text-stone-400">
                          {sub}
                          <ChevronDown size={12} className={`transition-transform ${openSub === sub ? "rotate-180" : ""}`} />
                        </button>
                        {openSub === sub && (
                          <div className="flex flex-col gap-2 px-3 pb-2">
                            {items.map((item) => (
                              <div key={item.id}>
                                <button
                                  onClick={() => { if (selected?.id === item.id) { setSelected(null); } else { setSelected(item); setQty("1"); } }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${selected?.id === item.id ? "bg-amber-700 text-amber-50 border-amber-700" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-300"}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{item.name}</span>
                                    {selected?.id === item.id && <ChevronDown size={14} className="rotate-180" />}
                                  </div>
                                  <div className={`text-[10px] mt-0.5 ${selected?.id === item.id ? "text-amber-100" : "text-stone-400"}`}>{item.code ? `${item.code} · ` : ""}{item.minStock ? `Min: ${item.minStock} ${item.minUnit || ''}` : ""}</div>
                                </button>
                                {selected?.id === item.id && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-1 flex items-center gap-3">
                                    <span className="text-xs text-stone-500 shrink-0">Quantité</span>
                                    <div className="flex items-center gap-2 ml-auto">
                                      <button onClick={() => setQty((q) => String(Math.max(1, Number(q) - 1)))} className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 font-medium flex items-center justify-center hover:border-amber-400">−</button>
                                      <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="w-12 text-center border border-stone-200 rounded-lg py-1 text-sm" />
                                      <button onClick={() => setQty((q) => String(Number(q) + 1))} className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 font-medium flex items-center justify-center hover:border-amber-400">+</button>
                                    </div>
                                    <button onClick={attemptSubmit} className="bg-amber-700 text-amber-50 rounded-lg px-3 py-2 text-sm font-medium hover:bg-amber-800 shrink-0">Ajouter</button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {myRequests.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs uppercase tracking-wide text-stone-400 mb-2">Mes ajouts en attente</h3>
          <div className="space-y-2">
            {myRequests.map((r) => {
              const item = catalogue.find((c) => c.id === r.articleId);
              return (
                <div key={r.id} className="bg-white border border-stone-200 rounded-lg px-3 py-2 flex items-center justify-between text-sm">
                  <span className="text-stone-700">{a.isNouveau ? (a.nomLibre || "Article libre") : (item ? item.name : "Article supprimé")}</span>
                  <span className="text-stone-400">x{r.quantite}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ResponsableView({ requests, history, catalogue, employees, onUpdateQty, onUpdateComment, onUpdateHistoryComment, onRemove, onValidate, onToggleReceived, onAddRequest, view, setView, cashRequests, onToggleCashDelivered, onRemoveCashRequest, currentUser, currentEmployee, pins, onChangePin }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [commentOpenId, setCommentOpenId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showPinChanger, setShowPinChanger] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false); // { id, label }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAll() {
    setSelectedIds(requests.map((r) => r.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  return (
    <div className="max-w-md mx-auto">
      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cette demande ?"
          message={`"${confirmDelete.label}" sera retiré définitivement de la liste en attente.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            onRemove(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
      <div className="grid grid-cols-3 gap-2 p-3 bg-stone-100 sticky top-[65px] z-10">
        <button onClick={() => setView("nouvelle")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${view === "nouvelle" ? "bg-amber-700 text-white shadow-md" : "bg-white text-amber-700 border border-amber-200"}`}>
          🛒<br/>Nouvelle<br/>commande
        </button>
        <button onClick={() => setView("home")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${view === "home" ? "bg-orange-500 text-white shadow-md" : "bg-white text-orange-500 border border-orange-200"}`}>
          ⏳<br/>En attente
          {requests.length > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 border border-white">
              {requests.length}
            </span>
          )}
        </button>
        <button onClick={() => setView("history")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${view === "history" ? "bg-yellow-500 text-white shadow-md" : "bg-white text-yellow-600 border border-yellow-200"}`}>
          📦<br/>Validée en<br/>attente
          {history.reduce((sum, o) => sum + o.articles.filter((a) => !a.recu).length, 0) > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 border-2 border-white">
              {history.reduce((sum, o) => sum + o.articles.filter((a) => !a.recu).length, 0)}
            </span>
          )}
        </button>
        <button onClick={() => setView("livre")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${view === "livre" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-emerald-600 border border-emerald-200"}`}>
          ✅<br/>Historique
        </button>
        <button onClick={() => setView("monnaie")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${view === "monnaie" ? "bg-red-600 text-white shadow-md" : "bg-white text-red-600 border border-red-200"}`}>
          💰<br/>Monnaie
          {cashRequests.filter((c) => !c.livre).length > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 border border-white">
              {cashRequests.filter((c) => !c.livre).length}
            </span>
          )}
        </button>
        <button onClick={() => setView("profil")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${view === "profil" ? "bg-stone-700 text-white shadow-md" : "bg-white text-stone-600 border border-stone-200"}`}>
          👤<br/>Mon<br/>profil
        </button>
      </div>

      {showPinChanger && currentUser && (
        <PinChanger
          userId={currentUser.id}
          currentPin={pins[currentUser.id] || "1234"}
          onSave={async (newPin) => { await onChangePin(currentUser.id, newPin); setShowPinChanger(false); setPinSuccess(true); setTimeout(() => setPinSuccess(false), 2000); }}
          onCancel={() => setShowPinChanger(false)}
        />
      )}
      {pinSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3">
          <span className="text-xl">✅</span>
          <span className="text-sm font-medium">Code PIN mis à jour !</span>
        </div>
      )}

      {view === "nouvelle" ? (
        <ChefCommandeView
          catalogue={catalogue}
          allRequests={requests}
          onAddRequest={onAddRequest}
          currentEmployee={currentEmployee}
          myRequests={requests.filter((r) => r.par === currentEmployee)}
        />
      ) : view === "profil" ? (
        <div className="p-5 max-w-md mx-auto">
          <ProfilView currentUser={currentUser} pins={pins} onChangePin={onChangePin} />
        </div>
      ) : view === "monnaie" ? (
        <div className="p-5">
          <CashList
            cashRequests={cashRequests}
            employees={employees}
            currentIdentity={currentUser?.name || "Chef d'équipe"}
            onToggleDelivered={onToggleCashDelivered}
            onRemove={onRemoveCashRequest}
          />
        </div>
      ) : view === "home" ? (
        <div className="p-5">
          {cashRequests.filter((c) => !c.livre).length > 0 && (
            <button
              onClick={() => setView("monnaie")}
              className="w-full bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium flex items-center gap-2 text-left"
            >
              💰
              <span>
                {cashRequests.filter((c) => !c.livre).length} demande{cashRequests.filter((c) => !c.livre).length > 1 ? "s" : ""} de monnaie en attente de livraison
              </span>
            </button>
          )}
          {requests.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">
              <Clock className="mx-auto mb-2" size={28} />
              Aucune demande en attente
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs text-stone-400">{selectedIds.length} sélectionné(s)</span>
                <div className="flex gap-3">
                  <button onClick={selectAll} className="text-xs text-amber-700 underline">
                    Tout sélectionner
                  </button>
                  {selectedIds.length > 0 && (
                    <button onClick={clearSelection} className="text-xs text-stone-400 underline">
                      Désélectionner
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {requests.map((r) => {
                  const item = catalogue.find((c) => c.id === r.articleId);
                  const aboveMin = item?.minStock && r.quantite > item.minStock;
                  const isSelected = selectedIds.includes(r.id);
                  const commentOpen = commentOpenId === r.id;
                  return (
                    <div
                      key={r.id}
                      className={`bg-white border rounded-xl px-4 py-3 transition-colors ${
                        isSelected ? "border-amber-400 bg-amber-50" : "border-stone-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleSelect(r.id)}
                            className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? "bg-amber-600 border-amber-600" : "border-stone-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check size={13} className="text-white" />}
                          </button>
                          <div>
                            <div className="font-medium text-stone-800 text-sm flex items-center gap-1 flex-wrap">
                              {r.isNouveau && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>}
                              {r.isNouveau ? (r.nomLibre || "Article libre") : (item ? item.name : "Article supprimé")}
                              {aboveMin && (
                                <span className="flex items-center gap-1 text-amber-600 text-xs font-normal bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                  <AlertTriangle size={12} />
                                  Min: {item.minStock} {item.minUnit || ''}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-400">
                              {item?.code ? `${item.code} · ` : ""}
                              {item?.category} {item?.subcategory ? `· ${item.subcategory}` : ""} · {r.par} ·{" "}
                              {new Date(r.date).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={r.quantite}
                            onChange={(e) => onUpdateQty(r.id, Number(e.target.value))}
                            className="w-16 border border-stone-200 rounded-lg px-2 py-1 text-center text-sm"
                          />
                          <button
                            onClick={() => setConfirmDelete({ id: r.id, label: item ? item.name : "cet article" })}
                            className="text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 pl-8">
                        {r.commentaire ? (
                          <button
                            onClick={() => setCommentOpenId(commentOpen ? null : r.id)}
                            className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-flex items-center gap-1"
                          >
                            💬 {r.commentaire}
                          </button>
                        ) : (
                          <button
                            onClick={() => setCommentOpenId(commentOpen ? null : r.id)}
                            className="text-xs text-stone-400 underline"
                          >
                            + Ajouter un commentaire
                          </button>
                        )}

                        {commentOpen && (
                          <CommentEditor
                            value={r.commentaire || ""}
                            onSave={(text) => {
                              onUpdateComment(r.id, text);
                              setCommentOpenId(null);
                            }}
                            onCancel={() => setCommentOpenId(null)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                {selectedIds.length > 0 && (
                  <button
                    onClick={() => {
                      onValidate(selectedIds);
                      setSelectedIds([]);
                    }}
                    className="w-full bg-amber-700 text-amber-50 rounded-xl py-3 font-medium hover:bg-amber-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Valider la sélection ({selectedIds.length})
                  </button>
                )}
                <button
                  onClick={() => onValidate()}
                  className="w-full bg-emerald-600 text-white rounded-xl py-3 font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Valider toute la commande
                </button>
              </div>
            </>
          )}
        </div>
      ) : view === "history" ? (
        <div className="p-5">
          {history.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">Aucune commande passée encore</div>
          ) : (
            <HistoryByDate
              history={history}
              catalogue={catalogue}
              employees={employees}
              onToggleReceived={onToggleReceived}
              onUpdateComment={onUpdateHistoryComment}
              currentIdentity="Chef d'équipe"
              mode="attente"
            />
          )}
        </div>
      ) : (
        <div className="p-5">
          {history.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">Aucune commande passée encore</div>
          ) : (
            <HistoryByDate
              history={history}
              catalogue={catalogue}
              employees={employees}
              onToggleReceived={onToggleReceived}
              onUpdateComment={onUpdateHistoryComment}
              currentIdentity="Chef d'équipe"
              mode="livre"
            />
          )}
        </div>
      )}
    </div>
  );
}

function HistoryByDate({ history, catalogue, employees, onToggleReceived, onUpdateComment, currentIdentity, mode }) {
  const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD", only used for mode "livre"
  const [commentOpenId, setCommentOpenId] = useState(null);

  const [justChecked, setJustChecked] = useState(null);

  function handleCheckClick(a) {
    if (a.recu) {
      // Unchecking - do it immediately
      onToggleReceived(a.orderId, a.id, currentIdentity || "Inconnu");
      return;
    }
    // Checking - show green briefly then let parent update (which removes from attente list)
    setJustChecked(a.id);
    setTimeout(() => {
      onToggleReceived(a.orderId, a.id, currentIdentity || "Inconnu");
      setJustChecked(null);
    }, 600);
  }

  // Flatten + filter all articles across all orders according to mode
  const flatArticles = [];
  for (const order of history) {
    for (const a of order.articles) {
      const item = catalogue.find((c) => c.id === a.articleId);
      flatArticles.push({ ...a, orderId: order.id, item, orderDate: order.date });
    }
  }
  let filtered = mode === "livre" ? flatArticles.filter((a) => a.recu) : flatArticles.filter((a) => !a.recu);

  if (mode === "livre" && selectedDate) {
    filtered = filtered.filter((a) => {
      const d = new Date(a.orderDate);
      const localKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return localKey === selectedDate;
    });
  }

  // Group filtered articles by calendar day (based on order date)
  const byDay = {};
  for (const a of filtered) {
    const d = new Date(a.orderDate);
    const dayKey = d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
    if (!byDay[dayKey]) byDay[dayKey] = { date: d, articles: [] };
    byDay[dayKey].articles.push(a);
  }
  const sortedDays = Object.entries(byDay).sort((a, b) => b[1].date - a[1].date);

  return (
    <div className="space-y-5">
      {mode === "livre" && (
        <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3">
          <Clock className="text-stone-400 shrink-0" size={16} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="text-xs text-amber-700 underline shrink-0">
              Tout voir
            </button>
          )}
        </div>
      )}

      {mode === "attente" && filtered.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={16} />
            <span className="text-sm font-semibold text-amber-700">
              {filtered.length} article{filtered.length > 1 ? "s" : ""} en attente de livraison
            </span>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">
          {mode === "livre"
            ? selectedDate
              ? "Aucun article livré ce jour-là"
              : "Aucun article livré pour le moment"
            : "Tout a été livré 🎉"}
        </div>
      ) : (
        sortedDays.map(([dayLabel, { articles }]) => {
          const byCategory = {};
          for (const a of articles) {
            const cat = a.item?.category || "Sans catégorie";
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(a);
          }
          function printDay(dayLabel, byCategory, articles) {
            const win = window.open('', '_blank');
            const articleRows = Object.entries(byCategory).map(([cat, items]) =>
              `<h3 style="color:#78350f;margin:12px 0 4px;font-size:13px">${cat}</h3>` +
              items.map(a => {
                const name = a.isNouveau ? (a.nomLibre || 'Article libre') : (a.item?.name || 'Article supprimé');
                const code = a.item?.code ? `${a.item.code} · ` : '';
                const status = a.recu ? '✅ Reçu' : '⏳ En attente';
                const recuPar = a.recuPar ? ` par ${a.recuPar}` : '';
                return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f5f5f4;font-size:13px">
                  <span>${code}${name}${a.isNouveau ? ' 🆕' : ''} <small style="color:#888">— ${a.par}</small></span>
                  <span style="color:${a.recu?'#059669':'#d97706'}">${status}${recuPar} &nbsp; x${a.quantite}</span>
                </div>`;
              }).join('')
            ).join('');
            win.document.write(`<!DOCTYPE html><html><head>
              <meta charset="UTF-8">
              <title>Commande ${dayLabel} — Chez Gustave</title>
              <style>body{font-family:Arial,sans-serif;padding:20px;max-width:700px;margin:auto}h1{color:#78350f;font-size:18px}h2{color:#92400e;font-size:14px;border-bottom:2px solid #78350f;padding-bottom:4px}@media print{button{display:none}}</style>
            </head><body>
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                <div style="background:#78350f;color:#fef3c7;border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px">CG</div>
                <div><h1 style="margin:0">Chez Gustave — Brasserie</h1><div style="color:#888;font-size:12px">Commande du ${dayLabel}</div></div>
              </div>
              ${articleRows}
              <div style="margin-top:20px;font-size:11px;color:#aaa;text-align:center">Chez Gustave Stock — Imprimé le ${new Date().toLocaleDateString('fr-FR')}</div>
              <script>setTimeout(()=>window.print(),300)</script>
            </body></html>`);
            win.document.close();
          }

          return (
            <div key={dayLabel}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-amber-700 uppercase tracking-wide capitalize">
                  {dayLabel}
                </div>
                <button
                  onClick={() => printDay(dayLabel, byCategory, articles)}
                  className="text-xs text-stone-400 hover:text-amber-700 flex items-center gap-1 border border-stone-200 rounded-lg px-2 py-1 hover:border-amber-300 transition-colors"
                >
                  🖨️ Imprimer
                </button>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                {Object.entries(byCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="text-xs font-semibold text-stone-500 mb-1">{cat}</div>
                    <div className="space-y-2">
                      {items.map((a) => (
                        <div key={a.id} className="flex items-start gap-2 text-sm py-0.5">
                          <button
                            onClick={() => handleCheckClick(a)}
                            className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              a.recu || justChecked === a.id ? "bg-emerald-600 border-emerald-600" : "border-stone-300 bg-white"
                            }`}
                          >
                            {(a.recu || justChecked === a.id) && <Check size={13} className="text-white" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={a.recu ? "text-stone-700" : "text-stone-700"}>
                                {a.item?.code ? `${a.item.code} · ` : ""}
                                {a.isNouveau ? (a.nomLibre || "Article libre") : (a.item ? a.item.name : "Article supprimé")}
                              </span>
                              <span className="text-stone-400 text-xs">x{a.quantite}</span>
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              Commandé par <span className="font-medium text-stone-500">{a.par}</span>
                              {a.recuPar && (
                                <>
                                  {" "}
                                  · Reçu par <span className="font-medium text-emerald-600">{a.recuPar}</span>
                                  {a.recuDate && (
                                    <> le {new Date(a.recuDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</>
                                  )}
                                </>
                              )}
                              {a.corrigePar && (
                                <>
                                  {" "}
                                  · <span className="font-medium text-orange-600">
                                    {a.recu ? "Re-confirmé" : "Corrigé (non livré)"} par {a.corrigePar}
                                  </span>
                                  {a.corrigeDate && (
                                    <> le {new Date(a.corrigeDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</>
                                  )}
                                </>
                              )}
                            </div>

                            <div className="mt-1">
                              {a.commentaire ? (
                                <button
                                  onClick={() => setCommentOpenId(commentOpenId === a.id ? null : a.id)}
                                  className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-flex items-center gap-1"
                                >
                                  💬 {a.commentaire}
                                </button>
                              ) : (
                                <button
                                  onClick={() => setCommentOpenId(commentOpenId === a.id ? null : a.id)}
                                  className="text-xs text-stone-400 underline"
                                >
                                  + Ajouter un commentaire
                                </button>
                              )}

                              {commentOpenId === a.id && (
                                <CommentEditor
                                  value={a.commentaire || ""}
                                  onSave={(text) => {
                                    onUpdateComment && onUpdateComment(a.orderId, a.id, text);
                                    setCommentOpenId(null);
                                  }}
                                  onCancel={() => setCommentOpenId(null)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function CatalogueManager({ catalogue, onAdd, onUpdate, onRemove }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [minStock, setMinStock] = useState("");
  const [minUnit, setMinUnit] = useState("pièce");
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, label }
  const tree = groupCatalogue(catalogue);

  const existingCategories = Object.keys(tree).sort();
  const finalCategory = category === "__new__" ? newCategory.trim() : category;
  const subcategoriesForCategory = category && category !== "__new__" ? Object.keys(tree[category] || {}).sort() : [];
  const finalSubcategory = subcategory === "__new__" ? newSubcategory.trim() : subcategory;

  function submit() {
    if (!name.trim() || !finalCategory) return;
    onAdd({
      code: code.trim(),
      name: name.trim(),
      category: finalCategory,
      subcategory: finalSubcategory || "Général",
      minStock: minStock ? Number(minStock) : 0,
      minUnit: minUnit,
    });
    setCode("");
    setName("");
    setMinStock("");
    if (category === "__new__") {
      setCategory(finalCategory);
      setNewCategory("");
    }
    if (subcategory === "__new__") {
      setSubcategory(finalSubcategory);
      setNewSubcategory("");
    }
  }

  return (
    <div className="p-5 max-w-md mx-auto">
      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cet article ?"
          message={`"${confirmDelete.label}" sera retiré définitivement du catalogue.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            onRemove(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-stone-700 mb-3">Ajouter un article</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code article (ex: BOI-004)"
              className="w-36 border border-stone-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l'article"
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
                setNewSubcategory("");
              }}
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Catégorie…</option>
              {existingCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__new__">+ Créer une nouvelle catégorie</option>
            </select>
          </div>
          {category === "__new__" && (
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nom de la nouvelle catégorie"
              className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm"
              autoFocus
            />
          )}

          <div className="flex gap-2">
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={!category}
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-stone-100 disabled:text-stone-400"
            >
              <option value="">Sous-catégorie…</option>
              {subcategoriesForCategory.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="__new__">+ Créer une nouvelle sous-catégorie</option>
            </select>
          </div>
          {subcategory === "__new__" && (
            <input
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              placeholder="Nom de la nouvelle sous-catégorie"
              className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm"
              autoFocus
            />
          )}

          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="Stock min"
              className="w-24 border border-stone-200 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={minUnit}
              onChange={(e) => setMinUnit(e.target.value)}
              className="flex-1 border border-stone-200 rounded-lg px-2 py-2 text-sm bg-white"
            >
              <option value="pièce">Pièce</option>
              <option value="btl">Btl</option>
              <option value="kg">Kg</option>
              <option value="litre">Litre</option>
              <option value="carton">Carton</option>
            </select>
            <button onClick={submit} className="bg-stone-800 text-white px-4 rounded-lg text-sm flex items-center gap-1">
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-xs uppercase tracking-wide text-stone-400 mb-2">Catalogue actuel</h3>
      <div className="space-y-4">
        {Object.entries(tree).map(([cat, subs]) => (
          <div key={cat}>
            <div className="text-sm font-medium text-stone-800 mb-1">{cat}</div>
            {Object.entries(subs).map(([sub, items]) => (
              <div key={sub} className="mb-2">
                <div className="text-xs text-stone-400 mb-1 pl-2">{sub}</div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-stone-200 rounded-lg px-3 py-2 flex items-center justify-between text-sm"
                    >
                      <span className="text-stone-700">
                        {item.code ? `${item.code} · ` : ""}{item.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-stone-400">
                          Min
                          <input
                            type="number"
                            min="0"
                            value={item.minStock}
                            onChange={(e) => onUpdate(item.id, { minStock: Number(e.target.value) })}
                            className="w-12 border border-stone-200 rounded px-1 py-0.5 text-center"
                          />
                          <select
                            value={item.minUnit || "pièce"}
                            onChange={(e) => onUpdate(item.id, { minUnit: e.target.value })}
                            className="border border-stone-200 rounded px-1 py-0.5 text-xs bg-white"
                          >
                            <option value="pièce">Pièce</option>
                            <option value="btl">Btl</option>
                            <option value="kg">Kg</option>
                            <option value="litre">Litre</option>
                            <option value="carton">Carton</option>
                          </select>
                        </div>
                        <button
                          onClick={() => setConfirmDelete({ id: item.id, label: item.name })}
                          className="text-stone-300 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
