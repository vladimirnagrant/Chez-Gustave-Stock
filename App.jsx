import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import heic2any from "heic2any";
import Globe3D from "globe.gl";

/* ---------------------------------------------------------
   SUPABASE
   Remplace ces deux valeurs par celles de TON projet Supabase
   (Project Settings > API > Project URL / anon public key)
--------------------------------------------------------- */
const supabase = createClient(
  "https://mkrlqosqccxylgubegmh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rcmxxb3NxY2N4eWxndWJlZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDQ4NjYsImV4cCI6MjA5ODY4MDg2Nn0._rdp2MBa88usfDNnwJjnew0hGn58WB-CSMy0snPu-OA"
);
const ROW_ID = "main";

/* ---------------------------------------------------------
   TOKENS
   ink    #0F1211  fond général (presque noir, chaud)
   panel  #1B1E1C  panneaux / modales
   brown  #8B5E34  accent nom / titres (sur photo N&B)
   sand   #C9A876  accent secondaire (globe, liens)
   cream  #F4EFE7  texte principal
   fog    #9AA39C  texte secondaire
--------------------------------------------------------- */

const HERO_PHOTO =
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1600&auto=format&fit=crop";

const seedPhoto = (seed, w = 1200, h = 1500) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const mkPage = (photos) => ({ id: uid("pg"), photos });

const INITIAL_DATA = {
  profile: {
    prenom: "Vladimir",
    nom: "Nagrant",
    phrase: "Une valise, un billet, et le voyage qui recommence.",
    photoUrl: HERO_PHOTO,
  },
  countries: [
    {
      id: "argentine",
      name: "Argentine",
      lat: -34,
      lon: -64,
      story: "Dix villes, du Nord aride à la Patagonie glacée. Un pays qui se traverse plus qu'il ne se visite.",
      border: [],
      cities: [
        { id: uid("vi"), name: "Buenos Aires", lat: -34.61, lon: -58.38 },
        { id: uid("vi"), name: "Tigre", lat: -34.42, lon: -58.58 },
        { id: uid("vi"), name: "Mar del Plata", lat: -38.0, lon: -57.56 },
        { id: uid("vi"), name: "Salta", lat: -24.78, lon: -65.41 },
        { id: uid("vi"), name: "Cafayate", lat: -26.07, lon: -65.97 },
        { id: uid("vi"), name: "Purmamarca", lat: -23.75, lon: -65.5 },
        { id: uid("vi"), name: "Puerto Madryn", lat: -42.77, lon: -65.04 },
        { id: uid("vi"), name: "Puerto Pirámides", lat: -42.58, lon: -64.28 },
        { id: uid("vi"), name: "El Calafate", lat: -50.34, lon: -72.28 },
        { id: uid("vi"), name: "Perito Moreno", lat: -50.49, lon: -73.05 },
      ],
      pages: [
        mkPage([{ id: "ar1", src: seedPhoto("arg1"), caption: "Buenos Aires, quartier de la Boca", size: "normal" }]),
        mkPage([
          { id: "ar2", src: seedPhoto("arg2"), caption: "", size: "normal" },
          { id: "ar3", src: seedPhoto("arg3"), caption: "Glacier Perito Moreno", size: "tall" },
          { id: "ar4", src: seedPhoto("arg4"), caption: "", size: "normal" },
        ]),
        mkPage([{ id: "ar5", src: seedPhoto("arg5"), caption: "Asado du dimanche", size: "normal" }]),
      ],
    },
    {
      id: "japon",
      name: "Japon",
      lat: 36,
      lon: 138,
      story: "",
      cities: [],
      border: [],
      pages: [
        mkPage([{ id: "jp1", src: seedPhoto("jap1"), caption: "Kyoto, forêt de bambous", size: "normal" }]),
        mkPage([
          { id: "jp2", src: seedPhoto("jap2"), caption: "", size: "normal" },
          { id: "jp3", src: seedPhoto("jap3"), caption: "Shibuya de nuit", size: "wide" },
          { id: "jp4", src: seedPhoto("jap4"), caption: "", size: "normal" },
        ]),
      ],
    },
    {
      id: "italie",
      name: "Italie",
      lat: 42,
      lon: 12,
      story: "",
      cities: [],
      border: [],
      pages: [
        mkPage([
          { id: "it1", src: seedPhoto("ita1"), caption: "Cinque Terre", size: "normal" },
          { id: "it2", src: seedPhoto("ita2"), caption: "", size: "tall" },
        ]),
        mkPage([{ id: "it3", src: seedPhoto("ita3"), caption: "Rome, golden hour", size: "normal" }]),
      ],
    },
    {
      id: "perou",
      name: "Pérou",
      lat: -9,
      lon: -75,
      story: "",
      cities: [],
      border: [],
      pages: [
        mkPage([{ id: "pe1", src: seedPhoto("per1"), caption: "Machu Picchu au lever du jour", size: "normal" }]),
        mkPage([{ id: "pe2", src: seedPhoto("per2"), caption: "", size: "normal" }]),
      ],
    },
    {
      id: "thailande",
      name: "Thaïlande",
      lat: 15,
      lon: 101,
      story: "",
      cities: [],
      border: [],
      pages: [
        mkPage([
          { id: "th1", src: seedPhoto("tha1"), caption: "", size: "normal" },
          { id: "th2", src: seedPhoto("tha2"), caption: "Krabi", size: "wide" },
        ]),
      ],
    },
    {
      id: "portugal",
      name: "Portugal",
      lat: 39,
      lon: -8,
      story: "",
      cities: [],
      border: [],
      pages: [
        mkPage([{ id: "pt1", src: seedPhoto("por1"), caption: "Porto, quartier de Ribeira", size: "normal" }]),
        mkPage([{ id: "pt2", src: seedPhoto("por2"), caption: "", size: "normal" }]),
      ],
    },
  ],
};

const ADMIN_PIN = "3802";

function uid(prefix = "p") {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomMosaicSizes(n) {
  const sizes = new Array(n).fill("normal");
  if (n >= 3 && Math.random() < 0.7) {
    sizes[Math.floor(Math.random() * n)] = Math.random() < 0.5 ? "wide" : "tall";
  }
  return shuffleArray(sizes);
}

// Répartit une liste de photos sur plusieurs pages : certaines en photo seule
// (plus impactant visuellement), d'autres en mosaïque de 3-4, dans un ordre aléatoire.
function autoLayoutPhotos(photos) {
  const pool = shuffleArray(photos);
  const pages = [];
  let i = 0;
  while (i < pool.length) {
    const remaining = pool.length - i;
    let groupSize;
    if (remaining <= 2) {
      groupSize = remaining;
    } else {
      const r = Math.random();
      groupSize = r < 0.3 ? 1 : r < 0.65 ? 3 : 4;
      groupSize = Math.min(groupSize, remaining);
    }
    const group = pool.slice(i, i + groupSize);
    const sizes = groupSize === 1 ? ["normal"] : randomMosaicSizes(groupSize);
    pages.push(mkPage(group.map((p, idx) => ({ ...p, id: uid("ph"), size: sizes[idx] }))));
    i += groupSize;
  }
  return pages;
}

/* Orthographic-ish projection for the abstract globe */
function globeProject(lat, lon, lat0 = 12, lon0 = -20) {
  const toRad = (d) => (d * Math.PI) / 180;
  const φ0 = toRad(lat0), λ0 = toRad(lon0);
  const φ = toRad(lat), λ = toRad(lon);
  const cosc = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ - λ0);
  const x = Math.cos(φ) * Math.sin(λ - λ0);
  const y = Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ - λ0);
  return { x, y, front: cosc > 0 };
}

export default function TravelJournal() {
  const [data, setData] = useState(INITIAL_DATA);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("home"); // home | journal
  const [activeCountryId, setActiveCountryId] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditCover, setShowEditCover] = useState(false);
  const [editingTileCountryId, setEditingTileCountryId] = useState(null);

  const touchStartX = useRef(null);
  const saveTimer = useRef(null);
  const indexRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: row, error } = await supabase
          .from("travel_data")
          .select("data")
          .eq("id", ROW_ID)
          .maybeSingle();
        if (error) throw error;
        if (row && row.data) {
          setData(row.data);
        } else {
          // Rien en base : on initialise avec les données de démarrage
          await supabase.from("travel_data").insert({ id: ROW_ID, data: INITIAL_DATA });
        }
      } catch (e) {
        console.error("Erreur de chargement Supabase", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("travel_data")
          .upsert({ id: ROW_ID, data, updated_at: new Date().toISOString() });
        if (error) throw error;
      } catch (e) {
        console.error("Erreur de sauvegarde Supabase", e);
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [data, loaded]);

  const activeCountry = data.countries.find((c) => c.id === activeCountryId) || null;
  const pages = activeCountry?.pages || [];
  const currentPage = pages[pageIndex];

  const scrollToIndex = () => {
    indexRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openCountry = (id) => {
    setActiveCountryId(id);
    setPageIndex(-1);
    setView("journal");
  };

  const closeJournal = () => {
    setView("home");
    setActiveCountryId(null);
    setZoomedPhoto(null);
  };

  const nextPage = useCallback(() => {
    setPageIndex((i) => Math.min(i + 1, Math.max(pages.length - 1, 0)));
  }, [pages.length]);

  const prevPage = useCallback(() => {
    setPageIndex((i) => Math.max(i - 1, -1));
  }, []);

  useEffect(() => {
    if (view !== "journal") return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "Escape") (zoomedPhoto ? setZoomedPhoto(null) : closeJournal());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, nextPage, prevPage, zoomedPhoto]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null || zoomedPhoto) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 55) prevPage();
    else if (delta < -55) nextPage();
    touchStartX.current = null;
  };

  const checkPin = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setShowPinModal(false); setPinInput(""); setPinError(false);
    } else setPinError(true);
  };

  const addPhotoToPage = (countryId, targetPageId, photo) => {
    setData((d) => ({
      ...d,
      countries: d.countries.map((c) => {
        if (c.id !== countryId) return c;
        if (targetPageId === "__new__") {
          return { ...c, pages: [...c.pages, mkPage([{ ...photo, id: uid("ph") }])] };
        }
        return {
          ...c,
          pages: c.pages.map((pg) =>
            pg.id === targetPageId ? { ...pg, photos: [...pg.photos, { ...photo, id: uid("ph") }] } : pg
          ),
        };
      }),
    }));
  };

  const addBulkPages = (countryId, newPages) => {
    setData((d) => ({
      ...d,
      countries: d.countries.map((c) => (c.id === countryId ? { ...c, pages: [...c.pages, ...newPages] } : c)),
    }));
  };

  const updatePhoto = (countryId, photoId, patch) => {
    setData((d) => ({
      ...d,
      countries: d.countries.map((c) =>
        c.id !== countryId ? c : {
          ...c,
          pages: c.pages.map((pg) => ({
            ...pg,
            photos: pg.photos.map((p) => (p.id === photoId ? { ...p, ...patch } : p)),
          })),
        }
      ),
    }));
  };

  const deletePhoto = (countryId, photoId) => {
    setData((d) => ({
      ...d,
      countries: d.countries.map((c) =>
        c.id !== countryId ? c : {
          ...c,
          pages: c.pages
            .map((pg) => ({ ...pg, photos: pg.photos.filter((p) => p.id !== photoId) }))
            .filter((pg) => pg.photos.length > 0),
        }
      ),
    }));
    setPageIndex((i) => Math.max(0, Math.min(i, (activeCountry?.pages.length || 1) - 2)));
  };

  const addCountry = (country) => {
    setData((d) => ({ ...d, countries: [...d.countries, { ...country, id: uid("c"), story: "", cities: [], border: [], tileImage: "", pages: [] }] }));
  };

  const deleteCountry = (countryId) => {
    setData((d) => ({ ...d, countries: d.countries.filter((c) => c.id !== countryId) }));
  };

  const updateProfile = (patch) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }));

  const updateCountryCover = (countryId, patch) => {
    setData((d) => ({
      ...d,
      countries: d.countries.map((c) => (c.id === countryId ? { ...c, ...patch } : c)),
    }));
  };

  const updateCountryTile = (countryId, tileImage) => {
    setData((d) => ({
      ...d,
      countries: d.countries.map((c) => (c.id === countryId ? { ...c, tileImage } : c)),
    }));
  };

  const totalPhotos = data.countries.reduce((n, c) => n + c.pages.reduce((m, pg) => m + pg.photos.length, 0), 0);

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Yellowtail&family=Anton&family=Kaushan+Script&family=Work+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin:0; }
        .thumb-btn { cursor:pointer; border:none; padding:0; background:none; }
        ::selection { background:#8B5E3455; }
        @keyframes dashspin { to { stroke-dashoffset: -200; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px);} to {opacity:1; transform:translateY(0);} }
        @keyframes bob { 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(6px);} }
        @keyframes heroPhotoIn { from { opacity: 0; transform: scale(1.09); filter: blur(14px) grayscale(100%) contrast(1.05) brightness(0.75); } to { opacity: 0.85; transform: scale(1); filter: blur(0px) grayscale(100%) contrast(1.05) brightness(0.75); } }
        @keyframes heroNameIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .hero-photo-in { animation: heroPhotoIn 6.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hero-name-in { opacity: 0; animation: heroNameIn 2.4s ease-out 2.2s both; }
        .hero-name-in-delay { animation-delay: 2.9s; }
        .hero-phrase-delay { animation-delay: 3.6s; }
        .hero-cta-delay { animation-delay: 4.3s; }
        @media (prefers-reduced-motion: reduce) {
          .globe-line, .cta-bob, .hero-photo-in, .hero-name-in { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      {view === "home" && (
        <>
          <Hero profile={data.profile} onStart={scrollToIndex} />
          <IndexSection
            ref={indexRef}
            countries={data.countries}
            onSelect={openCountry}
            isAdmin={isAdmin}
            onDelete={(id, name) => {
              if (window.confirm(`Supprimer ${name} et toutes ses photos ?`)) deleteCountry(id);
            }}
            onEditTile={(id) => setEditingTileCountryId(id)}
          />
        </>
      )}

      {view === "journal" && activeCountry && (
        <Journal
          country={activeCountry}
          pages={pages}
          pageIndex={pageIndex}
          currentPage={currentPage}
          onClose={closeJournal}
          onBackIndex={() => { setView("home"); setActiveCountryId(null); setTimeout(scrollToIndex, 50); }}
          onNext={nextPage}
          onPrev={prevPage}
          onJump={setPageIndex}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          zoomedPhoto={zoomedPhoto}
          setZoomedPhoto={setZoomedPhoto}
          isAdmin={isAdmin}
          onEditPhoto={setEditingPhoto}
          onDeletePhoto={(pid) => deletePhoto(activeCountry.id, pid)}
          onRequestAddPhoto={() => setShowAddPhoto(true)}
          onRequestBulkUpload={() => setShowBulkUpload(true)}
          onEditCover={() => setShowEditCover(true)}
        />
      )}

      <button
        aria-label="Espace administrateur"
        onClick={() => (isAdmin ? setIsAdmin(false) : setShowPinModal(true))}
        style={styles.adminFab}
        title={isAdmin ? "Quitter le mode admin" : "Mode admin"}
      >
        {isAdmin ? "🔓" : "🔒"}
      </button>

      {isAdmin && view === "home" && (
        <div style={styles.adminHomeBar}>
          <button style={styles.smallGhostBtn} onClick={() => setShowAddCountry(true)}>+ Pays</button>
          <button style={styles.smallGhostBtn} onClick={() => setShowEditProfile(true)}>✎ Profil</button>
        </div>
      )}

      {showPinModal && (
        <Modal onClose={() => { setShowPinModal(false); setPinInput(""); setPinError(false); }}>
          <h3 style={styles.modalTitle}>Code administrateur</h3>
          <input type="password" inputMode="numeric" value={pinInput}
            onChange={(e) => setPinInput(e.target.value)} style={styles.input}
            placeholder="Code à 4 chiffres" autoFocus />
          {pinError && <p style={{ color: "#C9A876", fontSize: 13, margin: "6px 0 0" }}>Code incorrect.</p>}
          <button style={styles.primaryBtn} onClick={checkPin}>Valider</button>
        </Modal>
      )}

      {showAddPhoto && activeCountry && (
        <PhotoFormModal
          title={`Ajouter une photo — ${activeCountry.name}`}
          pages={activeCountry.pages}
          onClose={() => setShowAddPhoto(false)}
          onSubmit={({ pageId, ...photo }) => { addPhotoToPage(activeCountry.id, pageId, photo); setShowAddPhoto(false); }}
        />
      )}

      {showBulkUpload && activeCountry && (
        <BulkUploadModal
          countryName={activeCountry.name}
          onClose={() => setShowBulkUpload(false)}
          onDone={(newPages) => { addBulkPages(activeCountry.id, newPages); }}
        />
      )}

      {editingPhoto && (
        <PhotoFormModal
          title="Modifier la photo"
          initial={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSubmit={(patch) => { updatePhoto(activeCountry.id, editingPhoto.id, patch); setEditingPhoto(null); }}
        />
      )}

      {showAddCountry && (
        <CountryFormModal onClose={() => setShowAddCountry(false)}
          onSubmit={(c) => { addCountry(c); setShowAddCountry(false); }} />
      )}

      {showEditProfile && (
        <ProfileFormModal profile={data.profile} onClose={() => setShowEditProfile(false)}
          onSubmit={(patch) => { updateProfile(patch); setShowEditProfile(false); }} />
      )}

      {showEditCover && activeCountry && (
        <CoverEditModal
          country={activeCountry}
          onClose={() => setShowEditCover(false)}
          onSubmit={(patch) => { updateCountryCover(activeCountry.id, patch); setShowEditCover(false); }}
        />
      )}

      {editingTileCountryId && (
        <TileImageModal
          country={data.countries.find((c) => c.id === editingTileCountryId)}
          onClose={() => setEditingTileCountryId(null)}
          onSubmit={(url) => { updateCountryTile(editingTileCountryId, url); setEditingTileCountryId(null); }}
        />
      )}
    </div>
  );
}

/* ---------------- HERO ---------------- */
function createSoftReverb(ctx, duration = 2.2, decay = 3.2) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

function makeNoiseBuffer(ctx, duration) {
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function playIntroSting() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    // Bus de sortie avec une réverbe légère, pour un rendu chaleureux mais clair
    const dry = ctx.createGain(); dry.gain.value = 0.95;
    const wet = ctx.createGain(); wet.gain.value = 0.3;
    const reverb = createSoftReverb(ctx, 1.8, 2.8);
    const bus = ctx.createGain();
    bus.connect(dry).connect(ctx.destination);
    bus.connect(wet).connect(reverb).connect(ctx.destination);

    // Un carillon clair et chaleureux, façon "bienvenue"
    const chimeNote = (freq, start, peak) => {
      const partials = [1, 2, 3];
      partials.forEach((mult, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq * mult;
        const gain = ctx.createGain();
        const p = peak / (i + 1.5);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(p, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0005, start + 1.5 - i * 0.15);
        osc.connect(gain).connect(bus);
        osc.start(start);
        osc.stop(start + 1.6);
      });
    };

    // Petite montée joyeuse, façon accueil : Do - Mi - Sol - Do (aigu)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => chimeNote(freq, now + i * 0.15, 0.24));

    setTimeout(() => ctx.close(), 2600);
  } catch (e) {
    console.error("Son non disponible", e);
  }
}

function Hero({ profile, onStart }) {
  const handleStart = () => {
    playIntroSting();
    onStart();
  };
  return (
    <header style={styles.hero}>
      <div style={styles.heroPhotoWrap}>
        <img src={profile.photoUrl} alt="" style={styles.heroPhoto} className="hero-photo-in" draggable={false} />
        <div style={styles.heroOverlay} />
      </div>
      <div style={styles.heroInner}>
        <h1 style={styles.heroName}>
          <span style={styles.heroFirst} className="hero-name-in">{profile.prenom}</span>
          <span style={styles.heroLast} className="hero-name-in hero-name-in-delay">{profile.nom}</span>
        </h1>
        <p style={styles.heroPhrase} className="hero-name-in hero-phrase-delay">{profile.phrase}</p>
        <div className="hero-name-in hero-cta-delay">
          <button className="cta-bob" style={styles.ctaBtn} onClick={handleStart}>
            Mon monde commence ici
            <span style={{ display: "block", marginTop: 6 }}>↓</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- 3D INTERACTIVE GLOBE ---------------- */
function Globe({ countries, onSelect }) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = Math.min(width, 380);

    const globe = Globe3D()(containerRef.current)
      .width(width)
      .height(height)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
      .atmosphereColor("#C9A876")
      .atmosphereAltitude(0.18)
      .pointsData([])
      .pointLat("lat")
      .pointLng("lon")
      .pointColor(() => "#F4B740")
      .pointAltitude(0.02)
      .pointRadius(0.55)
      .labelsData([])
      .labelLat("lat")
      .labelLng("lon")
      .labelText("name")
      .labelSize(1.3)
      .labelColor(() => "#F4EFE7")
      .labelDotRadius(0.4)
      .labelResolution(2)
      .onPointClick((pt) => pt && onSelectRef.current(pt.id))
      .onLabelClick((pt) => pt && onSelectRef.current(pt.id));

    // Rotation automatique douce, qui s'arrête dès que l'utilisateur touche
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.6;
    globe.controls().enableZoom = true;
    globe.controls().minDistance = 180;
    globe.controls().maxDistance = 500;
    const stopAuto = () => { globe.controls().autoRotate = false; };
    containerRef.current.addEventListener("pointerdown", stopAuto);

    globeRef.current = globe;

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      globe.width(w).height(Math.min(w, 380));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeEventListener("pointerdown", stopAuto);
      globeRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  // Met à jour les points quand la liste de pays change
  useEffect(() => {
    if (!globeRef.current) return;
    const pts = countries.map((c) => ({ id: c.id, name: c.name, lat: c.lat, lon: c.lon }));
    globeRef.current.pointsData(pts).labelsData(pts);
  }, [countries]);

  return <div ref={containerRef} style={styles.globe3d} />;
}

/* ---------------- INDEX SECTION ---------------- */
const IndexSection = React.forwardRef(({ countries, onSelect, isAdmin, onDelete, onEditTile }, ref) => {
  return (
    <section ref={ref} style={styles.indexSection}>
      <div style={styles.globeWrap}>
        <Globe countries={countries} onSelect={onSelect} />
      </div>
      <p style={styles.indexEyebrow}>Index des destinations</p>
      <div style={styles.tileGrid}>
        {countries.map((c) => {
          const photoCount = c.pages.reduce((n, pg) => n + pg.photos.length, 0);
          return (
            <div key={c.id} style={styles.tile}>
              <button style={styles.tileBtn} onClick={() => onSelect(c.id)} aria-label={c.name}>
                {c.tileImage ? (
                  <img src={c.tileImage} alt="" style={styles.tileImg} />
                ) : (
                  <div style={styles.tileFallback} />
                )}
                <div style={styles.tileOverlay} />
                <span style={styles.tileName}>{c.name}</span>
                <span style={styles.tileCount}>{photoCount}</span>
              </button>
              {isAdmin && (
                <div style={styles.tileAdminBar}>
                  <button style={styles.tileIconBtn} onClick={() => onEditTile(c.id)} title="Changer l'image">✎</button>
                  <button style={styles.tileIconBtn} onClick={() => onDelete(c.id, c.name)} title="Supprimer">🗑</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});

/* ---------------- JOURNAL ---------------- */
function Journal({
  country, pages, pageIndex, currentPage, onClose, onBackIndex, onNext, onPrev, onJump,
  onTouchStart, onTouchEnd, zoomedPhoto, setZoomedPhoto, isAdmin, onEditPhoto, onDeletePhoto, onRequestAddPhoto, onRequestBulkUpload, onEditCover,
}) {
  const isCover = pageIndex === -1;
  const totalWithCover = pages.length + 1;
  const displayIndex = pageIndex + 1; // cover = 0

  return (
    <div style={styles.journalOverlay} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <JournalTopBar country={country} onBackIndex={onBackIndex}
        pageIndex={displayIndex} total={totalWithCover} isCover={isCover} />

      <div style={styles.journalPage}>
        {isCover ? (
          <CoverPage country={country} isAdmin={isAdmin} onEdit={onEditCover} />
        ) : pages.length === 0 ? (
          <div style={{ textAlign: "center" }}>
            <p style={styles.emptyState}>Aucune photo pour l'instant. {isAdmin ? "Ajoutez-en une." : ""}</p>
            {isAdmin && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <button style={styles.addPhotoBtn} onClick={onRequestAddPhoto}>+ Ajouter une photo</button>
                <button style={styles.addPhotoBtn} onClick={onRequestBulkUpload}>+ Plusieurs photos</button>
              </div>
            )}
          </div>
        ) : currentPage.photos.length === 1 ? (
          <SinglePhoto photo={currentPage.photos[0]} isAdmin={isAdmin} onEdit={onEditPhoto} onDelete={onDeletePhoto} />
        ) : (
          <MosaicPage photos={currentPage.photos} isAdmin={isAdmin} onEdit={onEditPhoto}
            onDelete={onDeletePhoto} onZoom={setZoomedPhoto} />
        )}
      </div>

      <button style={{ ...styles.pageArrow, left: 4 }} onClick={onPrev} disabled={pageIndex === -1} aria-label="Page précédente">‹</button>
      <button style={{ ...styles.pageArrow, right: 4 }} onClick={onNext} disabled={pageIndex === Math.max(pages.length - 1, 0)} aria-label="Page suivante">›</button>

      <div style={styles.pageDots}>
        <button onClick={() => onJump(-1)}
          style={{ ...styles.pageDot, background: isCover ? "#C9A876" : "#4a463f" }} aria-label="Page de couverture" />
        {pages.map((pg, i) => (
          <button key={pg.id} onClick={() => onJump(i)}
            style={{ ...styles.pageDot, background: i === pageIndex ? "#C9A876" : "#4a463f" }} aria-label={`Page ${i + 1}`} />
        ))}
      </div>

      {isAdmin && !isCover && (
        <div style={styles.floatingBtnGroup}>
          <button style={styles.addPhotoFloating} onClick={onRequestBulkUpload}>+ Plusieurs</button>
          <button style={styles.addPhotoFloating} onClick={onRequestAddPhoto}>+ Photo</button>
        </div>
      )}

      {zoomedPhoto && (
        <div style={styles.zoomOverlay} onClick={() => setZoomedPhoto(null)}>
          <img src={zoomedPhoto.src} alt={zoomedPhoto.caption || ""} style={styles.zoomImg} />
          {zoomedPhoto.caption && <p style={styles.lightboxCaption}>{zoomedPhoto.caption}</p>}
        </div>
      )}
    </div>
  );
}

function JournalTopBar({ country, onBackIndex, pageIndex, total, isCover }) {
  return (
    <div style={styles.journalTopBar}>
      <button style={styles.backBtn} onClick={onBackIndex}>← Retour par pays</button>
      <span style={styles.journalCounter}>
        {country.name.toUpperCase()} · {isCover ? "Carte" : `${pageIndex}/${total - 1}`}
      </span>
    </div>
  );
}

/* ---------------- COVER PAGE ---------------- */
function CoverPage({ country, isAdmin, onEdit }) {
  const hasCities = country.cities && country.cities.length > 0;
  const hasBorder = country.border && country.border.length > 0;
  return (
    <div style={styles.coverWrap}>
      <h2 style={styles.coverTitle}>{country.name}</h2>

      {(hasCities || hasBorder) && <CountryMap cities={country.cities || []} border={country.border || []} />}

      {country.story ? (
        <p style={styles.coverStory}>{country.story}</p>
      ) : (
        <p style={{ ...styles.coverStory, color: "#5b5f58" }}>
          {isAdmin ? "Aucune histoire écrite pour l'instant." : ""}
        </p>
      )}

      {isAdmin && (
        <button style={styles.editCoverBtn} onClick={onEdit}>✎ Modifier la page pays</button>
      )}
    </div>
  );
}

function resolveLabelAngles(anglesDeg, minGap = 22) {
  const n = anglesDeg.length;
  if (n < 2) return [...anglesDeg];
  const order = anglesDeg.map((_, i) => i).sort((a, b) => anglesDeg[a] - anglesDeg[b]);
  let sorted = order.map((i) => anglesDeg[i]);
  for (let iter = 0; iter < 60; iter++) {
    let moved = false;
    for (let k = 0; k < n; k++) {
      const j = (k + 1) % n;
      let gap = sorted[j] - sorted[k];
      if (j === 0) gap += 360;
      if (gap < minGap) {
        const shift = (minGap - gap) / 2;
        sorted[k] -= shift;
        sorted[j] += shift;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const result = new Array(n);
  order.forEach((originalIndex, k) => { result[originalIndex] = sorted[k]; });
  return result;
}

function truncateName(name, max = 13) {
  return name.length > max ? name.slice(0, max - 1) + "…" : name;
}

function CountryMap({ cities, border }) {
  const W = 320, H = 320, PAD = 78;

  // Normalise: ancien format = liste plate de points (une seule île),
  // nouveau format = liste d'îles, chacune une liste de points.
  const rings = (() => {
    if (!border || border.length === 0) return [];
    return typeof border[0].lat === "number" ? [border] : border;
  })();
  const hasBorder = rings.length > 0;
  const allBorderPts = rings.flat();

  // Le cadrage prend en compte la frontière (toutes les îles) ET les villes,
  // pour ne rien couper même si une ville est plus excentrée que le tracé.
  const framePts = [...allBorderPts, ...cities];
  const latSource = framePts.map((p) => p.lat);
  const lonSource = framePts.map((p) => p.lon);
  const minLat = Math.min(...latSource), maxLat = Math.max(...latSource);
  const minLon = Math.min(...lonSource), maxLon = Math.max(...lonSource);
  const spanLat = maxLat - minLat || 1;
  const spanLon = maxLon - minLon || 1;

  const project = (lat, lon) => ({
    x: PAD + ((lon - minLon) / spanLon) * (W - PAD * 2),
    y: PAD + ((maxLat - lat) / spanLat) * (H - PAD * 2),
  });

  const points = cities.map((c) => ({ ...c, ...project(c.lat, c.lon) }));
  const borderPaths = rings.map((ring) =>
    ring.map((p, i) => { const pt = project(p.lat, p.lon); return `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`; }).join(" ") + " Z"
  );

  const centerX = W / 2, centerY = H / 2;
  const labelRadius = W / 2 - 42;

  const rawAngles = points.map((p) => Math.atan2(p.y - centerY, p.x - centerX) * (180 / Math.PI));
  const finalAngles = resolveLabelAngles(rawAngles);

  return (
    <div style={styles.countryMapWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={styles.countryMapSvg}>
        {hasBorder && borderPaths.map((d, i) => (
          <path key={i} d={d} fill="#C9A87622" stroke="#F4EFE7" strokeWidth="1.2" strokeLinejoin="round" />
        ))}
        {points.map((p, i) => {
          const rad = (finalAngles[i] * Math.PI) / 180;
          const ux = Math.cos(rad), uy = Math.sin(rad);
          const lx = centerX + ux * labelRadius;
          const ly = centerY + uy * labelRadius;
          const anchor = ux > 0.2 ? "start" : ux < -0.2 ? "end" : "middle";
          return (
            <g key={p.id}>
              <line x1={p.x} y1={p.y} x2={lx} y2={ly} stroke="#C9A87699" strokeWidth="0.8" strokeDasharray="1.5 3" />
              <circle cx={p.x} cy={p.y} r="3.5" fill="#C9A876" />
              <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
                fill="#D9D2C4" fontSize="9" fontFamily="'JetBrains Mono', monospace">
                {truncateName(p.name)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SinglePhoto({ photo, isAdmin, onEdit, onDelete }) {
  return (
    <div style={styles.singleWrap}>
      <img src={photo.src} alt={photo.caption || ""} style={styles.singleImg} />
      {photo.caption && <p style={styles.singleCaption}>{photo.caption}</p>}
      {isAdmin && (
        <div style={styles.thumbAdminBarStatic}>
          <button style={styles.iconBtn} onClick={() => onEdit(photo)} title="Modifier">✎</button>
          <button style={styles.iconBtn} onClick={() => onDelete(photo.id)} title="Supprimer">🗑</button>
        </div>
      )}
    </div>
  );
}

function mosaicSpan(size) {
  switch (size) {
    case "wide": return { gridColumn: "span 2" };
    case "tall": return { gridRow: "span 2" };
    case "big": return { gridColumn: "span 2", gridRow: "span 2" };
    default: return {};
  }
}

function MosaicPage({ photos, isAdmin, onEdit, onDelete, onZoom }) {
  return (
    <div style={styles.mosaic}>
      {photos.map((p) => (
        <div key={p.id} style={{ ...styles.mosaicItem, ...mosaicSpan(p.size) }}>
          <button className="thumb-btn" style={styles.mosaicBtn} onClick={() => onZoom(p)}>
            <img src={p.src} alt={p.caption || ""} style={styles.mosaicImg} loading="lazy" />
            {p.caption && <span style={styles.mosaicCaption}>{p.caption}</span>}
          </button>
          {isAdmin && (
            <div style={styles.thumbAdminBar}>
              <button style={styles.iconBtn} onClick={() => onEdit(p)} title="Modifier">✎</button>
              <button style={styles.iconBtn} onClick={() => onDelete(p.id)} title="Supprimer">🗑</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- MODALS ---------------- */
function Modal({ children, onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {children}
        <button style={styles.modalClose} onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}

async function compressImage(file, maxDim = 1600, quality = 0.82) {
  let workingBlob = file;
  const isHeic = (file.type && /hei[cf]/i.test(file.type)) || /\.hei[cf]$/i.test(file.name || "");
  if (isHeic) {
    try {
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      workingBlob = Array.isArray(converted) ? converted[0] : converted;
    } catch (e) {
      console.error("Échec de conversion HEIC", e);
      throw new Error("Photo HEIC non convertible");
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(workingBlob);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else { width = Math.round(width * (maxDim / height)); height = maxDim; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Échec de compression"))), "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image illisible")); };
    img.src = url;
  });
}

async function uploadToStorage(fileOrBlob, filename) {
  const rawName = filename || fileOrBlob.name || "photo.jpg";
  const dotIndex = rawName.lastIndexOf(".");
  const ext = dotIndex > -1 ? rawName.slice(dotIndex + 1).toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg" : "jpg";
  const safeExt = ext.length <= 5 ? ext : "jpg";
  const path = `${uid("img")}.${safeExt}`;
  const { error: uploadErr } = await supabase.storage.from("Photos").upload(path, fileOrBlob, {
    cacheControl: "3600",
    upsert: false,
    contentType: fileOrBlob.type || "image/jpeg",
  });
  if (uploadErr) throw uploadErr;
  const { data: pub } = supabase.storage.from("Photos").getPublicUrl(path);
  return pub.publicUrl;
}

/* ---------------- IMAGE CROPPER ---------------- */
function ImageCropper({ file, aspect = 4 / 5, onCancel, onConfirm }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [loadError, setLoadError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef(null);
  const frameRef = useRef(null);
  const FRAME_W = 280;
  const FRAME_H = Math.round(FRAME_W / aspect);

  useEffect(() => {
    setLoadError(false);
    setNatural({ w: 0, h: 0 });
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const img = new Image();
    const timeout = setTimeout(() => setLoadError(true), 15000); // évite un blocage infini sur mobile
    img.onload = () => { clearTimeout(timeout); setNatural({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { clearTimeout(timeout); setLoadError(true); };
    img.src = url;
    return () => { clearTimeout(timeout); URL.revokeObjectURL(url); };
  }, [file]);

  if (loadError) {
    return (
      <div style={{ ...styles.modalOverlay, zIndex: 90 }}>
        <div style={styles.modalCard}>
          <p style={{ color: "#E8785A" }}>
            Impossible de charger cette photo (fichier trop volumineux ou format non supporté, ex : HEIC).
            Essaie une autre photo, ou convertis-la en JPEG.
          </p>
          <button style={styles.modalClose} onClick={onCancel}>Fermer</button>
        </div>
      </div>
    );
  }

  if (!imgUrl || !natural.w) {
    return (
      <div style={{ ...styles.modalOverlay, zIndex: 90 }}>
        <div style={styles.modalCard}>
          <p style={{ color: "#9AA39C" }}>Chargement de l'image…</p>
          <button style={styles.modalClose} onClick={onCancel}>Annuler</button>
        </div>
      </div>
    );
  }

  const baseScale = Math.max(FRAME_W / natural.w, FRAME_H / natural.h);
  const scale = baseScale * zoom;
  const dispW = natural.w * scale;
  const dispH = natural.h * scale;
  const maxOffX = Math.max(0, (dispW - FRAME_W) / 2);
  const maxOffY = Math.max(0, (dispH - FRAME_H) / 2);
  const clampedX = Math.max(-maxOffX, Math.min(maxOffX, offset.x));
  const clampedY = Math.max(-maxOffY, Math.min(maxOffY, offset.y));

  const onPointerDown = (e) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, offX: clampedX, offY: clampedY };
    e.target.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset({ x: dragState.current.offX + dx, y: dragState.current.offY + dy });
  };
  const onPointerUp = () => { dragState.current = null; };

  const confirmCrop = () => {
    const outW = 1000;
    const outH = Math.round(outW / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const topLeftX = (FRAME_W - dispW) / 2 + clampedX;
      const topLeftY = (FRAME_H - dispH) / 2 + clampedY;
      const sx = Math.max(0, (0 - topLeftX) / scale);
      const sy = Math.max(0, (0 - topLeftY) / scale);
      const sw = Math.min(natural.w - sx, FRAME_W / scale);
      const sh = Math.min(natural.h - sy, FRAME_H / scale);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      canvas.toBlob((blob) => onConfirm(blob), "image/jpeg", 0.9);
    };
    img.src = imgUrl;
  };

  return (
    <div style={{ ...styles.modalOverlay, zIndex: 90 }}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Recadrer la photo</h3>
        <div
          ref={frameRef}
          style={{ width: FRAME_W, height: FRAME_H, margin: "0 auto", overflow: "hidden", position: "relative", borderRadius: 10, background: "#000", touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <img
            src={imgUrl}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              width: dispW,
              height: dispH,
              left: (FRAME_W - dispW) / 2 + clampedX,
              top: (FRAME_H - dispH) / 2 + clampedY,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>
        <label style={styles.label}>Zoom</label>
        <input type="range" min="1" max="3" step="0.05" value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ width: "100%" }} />
        <p style={{ fontSize: 12, color: "#9AA39C", marginTop: 4 }}>Fais glisser l'image pour la repositionner.</p>
        <button style={styles.primaryBtn} onClick={confirmCrop}>Valider le cadrage</button>
        <button style={styles.modalClose} onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}

function BulkUploadModal({ countryName, onClose, onDone }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [failedItems, setFailedItems] = useState([]);
  const [succeeded, setSucceeded] = useState(null);

  const onPickFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
    setFailedItems([]);
    setSucceeded(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setFailedItems([]);
    setSucceeded(null);
    setProgress({ done: 0, total: files.length });
    const uploaded = [];
    const failed = [];
    for (const file of files) {
      try {
        const toUpload = await compressImage(file);
        const url = await uploadToStorage(toUpload, file.name);
        uploaded.push({ src: url, caption: "" });
      } catch (e) {
        console.error("Échec upload", file.name, e);
        failed.push({ name: file.name, reason: e?.message || "erreur inconnue" });
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setFailedItems(failed);
    setUploading(false);
    setSucceeded(uploaded.length);
    if (uploaded.length > 0) {
      const newPages = autoLayoutPhotos(uploaded);
      onDone(newPages);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3 style={styles.modalTitle}>Plusieurs photos — {countryName}</h3>
      <label style={styles.label}>Choisis toutes tes photos d'un coup</label>
      <input type="file" accept="image/*" multiple style={styles.input} onChange={onPickFiles} disabled={uploading} />
      {files.length > 0 && !uploading && succeeded === null && (
        <p style={{ fontSize: 12, color: "#9AA39C", marginTop: 6 }}>{files.length} photo{files.length > 1 ? "s" : ""} sélectionnée{files.length > 1 ? "s" : ""}</p>
      )}
      <p style={{ fontSize: 11, color: "#9AA39C", marginTop: 8 }}>
        Elles seront réparties automatiquement sur plusieurs pages — certaines en photo seule, d'autres en mosaïque — dans un agencement un peu aléatoire pour un résultat varié. Tu pourras tout modifier ensuite (déplacer, changer le format, supprimer).
      </p>
      {uploading && (
        <p style={{ fontSize: 12, color: "#9AA39C", marginTop: 8 }}>Envoi {progress.done}/{progress.total}…</p>
      )}
      {!uploading && succeeded !== null && (
        <p style={{ fontSize: 13, color: failedItems.length === 0 ? "#7EB876" : "#C9A876", marginTop: 8, fontWeight: 600 }}>
          ✓ {succeeded} photo{succeeded > 1 ? "s" : ""} ajoutée{succeeded > 1 ? "s" : ""} avec succès{failedItems.length > 0 ? `, ${failedItems.length} échec${failedItems.length > 1 ? "s" : ""}` : ""}.
        </p>
      )}
      {!uploading && failedItems.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 12, color: "#E8785A", margin: 0 }}>
            Détail des échecs :
          </p>
          <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
            {failedItems.map((f, i) => (
              <li key={i} style={{ fontSize: 11, color: "#E8785A99" }}>{f.name} — {f.reason}</li>
            ))}
          </ul>
        </div>
      )}
      {succeeded === null ? (
        <button style={styles.primaryBtn} disabled={files.length === 0 || uploading} onClick={handleUpload}>
          {uploading ? "Envoi en cours…" : `Envoyer ${files.length || ""} photo${files.length > 1 ? "s" : ""}`}
        </button>
      ) : (
        <button style={styles.primaryBtn} onClick={onClose}>Terminé, fermer</button>
      )}
    </Modal>
  );
}

function PhotoFormModal({ title, initial, pages, onClose, onSubmit }) {
  const [src, setSrc] = useState(initial?.src || "");
  const [caption, setCaption] = useState(initial?.caption || "");
  const [size, setSize] = useState(initial?.size || "normal");
  const [pageId, setPageId] = useState("__new__");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [preparing, setPreparing] = useState(false);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");
    setPreparing(true);
    try {
      const prepared = await compressImage(file, 2000, 0.85);
      setPendingFile(prepared);
    } catch (err) {
      console.error(err);
      setUploadError("Impossible de préparer cette photo (format non supporté ?). Essaie une autre photo.");
    } finally {
      setPreparing(false);
    }
  };

  const onCropConfirm = async (blob) => {
    setPendingFile(null);
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadToStorage(blob, "photo.jpg");
      setSrc(url);
    } catch (err) {
      console.error("Erreur d'upload", err);
      setUploadError("Échec de l'envoi. Vérifie que le bucket 'Photos' existe, est public, et autorise l'upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
    {pendingFile && (
      <ImageCropper file={pendingFile} aspect={4 / 5} onCancel={() => setPendingFile(null)} onConfirm={onCropConfirm} />
    )}
    <Modal onClose={onClose}>
      <h3 style={styles.modalTitle}>{title}</h3>

      <label style={styles.label}>Depuis ta galerie</label>
      <input type="file" accept="image/*" style={styles.input} onChange={onPickFile} disabled={uploading || preparing} />
      {preparing && <p style={{ fontSize: 12, color: "#9AA39C", margin: "6px 0 0" }}>Préparation de la photo…</p>}
      {uploading && <p style={{ fontSize: 12, color: "#9AA39C", margin: "6px 0 0" }}>Envoi en cours…</p>}
      {uploadError && <p style={{ fontSize: 12, color: "#E8785A", margin: "6px 0 0" }}>{uploadError}</p>}
      {src && !uploading && (
        <img src={src} alt="Aperçu" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, marginTop: 10 }} />
      )}

      <label style={styles.label}>...ou colle une URL d'image</label>
      <input style={styles.input} value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://..." />
      <label style={styles.label}>Description (optionnelle)</label>
      <input style={styles.input} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ex : Coucher de soleil à Porto" />
      {pages && (
        <>
          <label style={styles.label}>Page</label>
          <select style={styles.input} value={pageId} onChange={(e) => setPageId(e.target.value)}>
            <option value="__new__">Nouvelle page</option>
            {pages.map((pg, i) => (
              <option key={pg.id} value={pg.id}>Page {i + 1} ({pg.photos.length} photo{pg.photos.length > 1 ? "s" : ""})</option>
            ))}
          </select>
        </>
      )}
      <label style={styles.label}>Format si la page a plusieurs photos</label>
      <select style={styles.input} value={size} onChange={(e) => setSize(e.target.value)}>
        <option value="normal">Normal</option>
        <option value="wide">Large (2 colonnes)</option>
        <option value="tall">Haute (2 lignes)</option>
        <option value="big">Grande (2×2)</option>
      </select>
      <button style={styles.primaryBtn} disabled={!src || uploading}
        onClick={() => onSubmit(pages ? { src, caption, size, pageId } : { src, caption, size })}>
        Enregistrer
      </button>
    </Modal>
    </>
  );
}

function CountryFormModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleCreate = async () => {
    setResolving(true);
    setNotFound(false);
    const coords = await geocodeCity(name);
    setResolving(false);
    if (!coords) {
      setNotFound(true);
      return;
    }
    onSubmit({ name, lat: coords.lat, lon: coords.lon });
  };

  return (
    <Modal onClose={onClose}>
      <h3 style={styles.modalTitle}>Nouveau pays</h3>
      <label style={styles.label}>Nom</label>
      <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Islande" />
      <p style={{ fontSize: 11, color: "#9AA39C", marginTop: 4 }}>
        Les coordonnées sont trouvées automatiquement à partir du nom.
      </p>
      {notFound && (
        <p style={{ fontSize: 12, color: "#E8785A", marginTop: 6 }}>
          Pays introuvable, vérifie l'orthographe.
        </p>
      )}
      <button style={styles.primaryBtn} disabled={!name || resolving} onClick={handleCreate}>
        {resolving ? "Recherche…" : "Créer ce pays"}
      </button>
    </Modal>
  );
}

function ProfileFormModal({ profile, onClose, onSubmit }) {
  const [prenom, setPrenom] = useState(profile.prenom);
  const [nom, setNom] = useState(profile.nom);
  const [phrase, setPhrase] = useState(profile.phrase);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [preparing, setPreparing] = useState(false);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");
    setPreparing(true);
    try {
      const prepared = await compressImage(file, 2000, 0.85);
      setPendingFile(prepared);
    } catch (err) {
      console.error(err);
      setUploadError("Impossible de préparer cette photo (format non supporté ?). Essaie une autre photo.");
    } finally {
      setPreparing(false);
    }
  };

  const onCropConfirm = async (blob) => {
    setPendingFile(null);
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadToStorage(blob, "profil.jpg");
      setPhotoUrl(url);
    } catch (err) {
      console.error("Erreur d'upload", err);
      setUploadError("Échec de l'envoi. Vérifie que le bucket 'Photos' existe, est public, et autorise l'upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
    {pendingFile && (
      <ImageCropper file={pendingFile} aspect={16 / 9} onCancel={() => setPendingFile(null)} onConfirm={onCropConfirm} />
    )}
    <Modal onClose={onClose}>
      <h3 style={styles.modalTitle}>Modifier le profil</h3>
      <label style={styles.label}>Prénom</label>
      <input style={styles.input} value={prenom} onChange={(e) => setPrenom(e.target.value)} />
      <label style={styles.label}>Nom</label>
      <input style={styles.input} value={nom} onChange={(e) => setNom(e.target.value)} />
      <label style={styles.label}>Phrase</label>
      <input style={styles.input} value={phrase} onChange={(e) => setPhrase(e.target.value)} />

      <label style={styles.label}>Photo de fond — depuis ta galerie</label>
      <input type="file" accept="image/*" style={styles.input} onChange={onPickFile} disabled={uploading || preparing} />
      {preparing && <p style={{ fontSize: 12, color: "#9AA39C", margin: "6px 0 0" }}>Préparation de la photo…</p>}
      {uploading && <p style={{ fontSize: 12, color: "#9AA39C", margin: "6px 0 0" }}>Envoi en cours…</p>}
      {uploadError && <p style={{ fontSize: 12, color: "#E8785A", margin: "6px 0 0" }}>{uploadError}</p>}
      {photoUrl && !uploading && (
        <img src={photoUrl} alt="Aperçu" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, marginTop: 10, filter: "grayscale(100%)" }} />
      )}

      <label style={styles.label}>...ou colle une URL d'image</label>
      <input style={styles.input} value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
      <button style={styles.primaryBtn} disabled={uploading} onClick={() => onSubmit({ prenom, nom, phrase, photoUrl })}>Enregistrer</button>
    </Modal>
    </>
  );
}

async function geocodeCity(name) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    const results = await res.json();
    if (results && results[0]) {
      return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
    }
  } catch (e) {
    console.error("Erreur de géocodage pour", name, e);
  }
  return null;
}

function extractAllRings(geojson, maxRings = 25) {
  if (!geojson) return [];
  if (geojson.type === "Polygon") return [geojson.coordinates[0]];
  if (geojson.type === "MultiPolygon") {
    // Garde les plus grandes masses de terre (une île avec beaucoup de points de contour
    // est une île significative) ; les centaines de petits îlots n'ajoutent rien à la lecture
    // de la carte mais peuvent faire planter le rendu (ex : Grèce, Philippines, Indonésie).
    const rings = geojson.coordinates.map((poly) => poly[0]).filter(Boolean);
    return rings.sort((a, b) => b.length - a.length).slice(0, maxRings);
  }
  return [];
}

function decimateRing(ring, maxPoints = 300) {
  if (ring.length <= maxPoints) return ring;
  const step = Math.ceil(ring.length / maxPoints);
  return ring.filter((_, i) => i % step === 0);
}

async function fetchCountryBorder(name) {
  const tryFetch = async (url) => {
    const res = await fetch(url);
    const results = await res.json();
    return results && results[0] ? extractAllRings(results[0].geojson) : [];
  };
  try {
    // 1) On cherche d'abord un vrai pays (évite qu'un nom de pays tombe sur un lieu homonyme)
    const countryUrl = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&polygon_threshold=0.01&limit=1&featureType=country&q=${encodeURIComponent(name)}`;
    let rings = await tryFetch(countryUrl);

    // 2) Si ce n'est pas un pays (île, région, ville — ex : Kimolos, Majorque), recherche libre
    if (rings.length === 0) {
      const generalUrl = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&polygon_threshold=0.005&limit=1&q=${encodeURIComponent(name)}`;
      rings = await tryFetch(generalUrl);
    }

    return rings
      .filter((r) => r && r.length > 0)
      .map((ring) => decimateRing(ring).map(([lon, lat]) => ({ lat, lon })));
  } catch (e) {
    console.error("Erreur de récupération de frontière pour", name, e);
  }
  return [];
}

function TileImageModal({ country, onClose, onSubmit }) {
  const [src, setSrc] = useState(country?.tileImage || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [preparing, setPreparing] = useState(false);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");
    setPreparing(true);
    try {
      const prepared = await compressImage(file, 1600, 0.85);
      setPendingFile(prepared);
    } catch (err) {
      console.error(err);
      setUploadError("Impossible de préparer cette photo (format non supporté ?). Essaie une autre photo.");
    } finally {
      setPreparing(false);
    }
  };

  const onCropConfirm = async (blob) => {
    setPendingFile(null);
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadToStorage(blob, "tuile.jpg");
      setSrc(url);
    } catch (err) {
      console.error(err);
      setUploadError("Échec de l'envoi. Réessaie.");
    } finally {
      setUploading(false);
    }
  };

  if (!country) return null;

  return (
    <>
      {pendingFile && (
        <ImageCropper file={pendingFile} aspect={3 / 4} onCancel={() => setPendingFile(null)} onConfirm={onCropConfirm} />
      )}
      <Modal onClose={onClose}>
        <h3 style={styles.modalTitle}>Image de la tuile — {country.name}</h3>
        <label style={styles.label}>Depuis ta galerie</label>
        <input type="file" accept="image/*" style={styles.input} onChange={onPickFile} disabled={uploading || preparing} />
        {preparing && <p style={{ fontSize: 12, color: "#9AA39C", margin: "6px 0 0" }}>Préparation de la photo…</p>}
        {uploading && <p style={{ fontSize: 12, color: "#9AA39C", margin: "6px 0 0" }}>Envoi en cours…</p>}
        {uploadError && <p style={{ fontSize: 12, color: "#E8785A", margin: "6px 0 0" }}>{uploadError}</p>}
        {src && !uploading && (
          <img src={src} alt="Aperçu" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginTop: 10 }} />
        )}
        <label style={styles.label}>...ou colle une URL d'image</label>
        <input style={styles.input} value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://..." />
        <button style={styles.primaryBtn} disabled={uploading} onClick={() => onSubmit(src)}>Enregistrer</button>
      </Modal>
    </>
  );
}

function CoverEditModal({ country, onClose, onSubmit }) {
  const [story, setStory] = useState(country.story || "");
  const [citiesText, setCitiesText] = useState((country.cities || []).map((c) => c.name).join("\n"));
  const [resolving, setResolving] = useState(false);
  const [failedNames, setFailedNames] = useState([]);
  const [refreshBorder, setRefreshBorder] = useState(false);

  const handleSubmit = async () => {
    const names = citiesText.split("\n").map((n) => n.trim()).filter(Boolean);
    setResolving(true);
    setFailedNames([]);
    const existing = country.cities || [];
    const resolved = [];
    const failed = [];
    for (const name of names) {
      const already = existing.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (already) {
        resolved.push(already);
        continue;
      }
      const coords = await geocodeCity(name);
      if (coords) {
        resolved.push({ id: uid("vi"), name, lat: coords.lat, lon: coords.lon });
      } else {
        failed.push(name);
      }
      await new Promise((r) => setTimeout(r, 350)); // reste courtois envers le service gratuit
    }
    setResolving(false);
    if (failed.length > 0) {
      setFailedNames(failed);
      return; // laisse la personne corriger l'orthographe avant d'enregistrer
    }
    let border = country.border;
    if (!border || border.length === 0 || refreshBorder) {
      setResolving(true);
      border = await fetchCountryBorder(country.name);
      setResolving(false);
    }
    onSubmit({ story, cities: resolved, border });
  };

  return (
    <Modal onClose={onClose}>
      <h3 style={styles.modalTitle}>Page pays — {country.name}</h3>
      <label style={styles.label}>Histoire / description</label>
      <textarea style={{ ...styles.input, minHeight: 90, resize: "vertical" }} value={story}
        onChange={(e) => setStory(e.target.value)} placeholder="Ce que tu veux raconter sur ce pays..." />
      <label style={styles.label}>Villes visitées (une par ligne, juste le nom)</label>
      <textarea style={{ ...styles.input, minHeight: 140, resize: "vertical" }}
        value={citiesText} onChange={(e) => setCitiesText(e.target.value)}
        placeholder={"Buenos Aires\nSalta\nEl Calafate"} />
      <p style={{ fontSize: 11, color: "#9AA39C", marginTop: 4 }}>
        Les coordonnées sont trouvées automatiquement à partir du nom de la ville.
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 12, color: "#9AA39C" }}>
        <input type="checkbox" checked={refreshBorder} onChange={(e) => setRefreshBorder(e.target.checked)} />
        Recalculer la frontière (utile si elle est incomplète, ex : pays avec plusieurs îles)
      </label>
      {failedNames.length > 0 && (
        <p style={{ fontSize: 12, color: "#E8785A", marginTop: 6 }}>
          Introuvable : {failedNames.join(", ")}. Vérifie l'orthographe (ajoute le pays si le nom est ambigu, ex : "Salta, Argentine").
        </p>
      )}
      <button style={styles.primaryBtn} disabled={resolving} onClick={handleSubmit}>
        {resolving ? "Recherche des coordonnées…" : "Enregistrer"}
      </button>
    </Modal>
  );
}

/* ---------------- STYLES ---------------- */
const FONT_DISPLAY = "'Anton', sans-serif";
const FONT_SCRIPT = "'Kaushan Script', cursive";
const FONT_SIGNATURE = "'Alex Brush', cursive";
const FONT_BODY = "'Work Sans', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const styles = {
  app: { background: "#0F1211", color: "#F4EFE7", minHeight: "100vh", fontFamily: FONT_BODY },

  hero: { position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  heroPhotoWrap: { position: "absolute", inset: 0, overflow: "hidden" },
  heroPhoto: { width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%) contrast(1.05) brightness(0.75)" },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, transparent 0%, #0F1211aa 75%, #0F1211 100%)" },
  heroInner: { position: "relative", zIndex: 1, textAlign: "center", padding: "0 10px", width: "100%" },
  heroName: { margin: 0, lineHeight: 0.88, width: "100%" },
  heroFirst: {
    display: "block", fontFamily: "'Yellowtail', cursive", fontWeight: 400,
    fontSize: "clamp(46px, 16vw, 100px)",
    backgroundImage: "linear-gradient(120deg, #1a1108, #7a5a1f)",
    WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
    letterSpacing: 0.5,
  },
  heroLast: {
    display: "block", fontFamily: "Arial, sans-serif", fontWeight: 700,
    fontSize: "clamp(48px, 15vw, 110px)",
    backgroundImage: "linear-gradient(90deg, #F4B740, #F07B2A)",
    WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
    letterSpacing: -1, marginTop: -6, width: "100%", textTransform: "uppercase",
  },
  heroPhrase: { fontFamily: "'Work Sans', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: 1, textTransform: "uppercase", color: "#3B4CCB", marginTop: 22, maxWidth: 340, marginLeft: "auto", marginRight: "auto" },
  ctaBtn: {
    marginTop: 34, background: "none", border: "none", color: "#4C8C4C", fontFamily: FONT_DISPLAY,
    fontSize: 16, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
    borderBottom: "1px solid #4C8C4C88", paddingBottom: 4, animation: "bob 2.4s ease-in-out infinite",
  },

  indexSection: { padding: "56px 24px 90px", maxWidth: 520, margin: "0 auto" },
  globeWrap: { display: "flex", justifyContent: "center", marginBottom: 30 },
  globeSvg: { width: 220, height: 220 },
  globe3d: { width: "100%", minHeight: 300, display: "flex", justifyContent: "center", cursor: "grab", touchAction: "none" },
  indexEyebrow: { fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#9AA39C", textAlign: "center", margin: "0 0 18px" },

  tileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 10,
  },
  tile: { position: "relative", aspectRatio: "3 / 4", borderRadius: 12, overflow: "hidden" },
  tileBtn: { width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", position: "relative", display: "block" },
  tileImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  tileFallback: { width: "100%", height: "100%", background: "linear-gradient(160deg, #16273A, #0F1211)" },
  tileOverlay: { position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, #0B0D0Cee)" },
  tileName: {
    position: "absolute", left: 10, right: 10, bottom: 10, textAlign: "left",
    fontFamily: FONT_DISPLAY, fontWeight: 400, textTransform: "uppercase",
    color: "#F4EFE7", fontSize: "clamp(16px, 4.5vw, 20px)", letterSpacing: 0.5, lineHeight: 1.05,
  },
  tileCount: {
    position: "absolute", top: 8, right: 10, fontFamily: FONT_MONO, fontSize: 11,
    color: "#F4EFE7cc", background: "#0000004d", padding: "2px 6px", borderRadius: 6,
  },
  tileAdminBar: { position: "absolute", top: 6, left: 6, display: "flex", gap: 4 },
  tileIconBtn: { width: 26, height: 26, borderRadius: 7, border: "none", background: "#0F1211cc", color: "#F4EFE7", cursor: "pointer", fontSize: 12 },

  journalOverlay: { position: "fixed", inset: 0, background: "#0F1211", zIndex: 30, display: "flex", flexDirection: "column" },
  journalTopBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px" },
  backBtn: { fontFamily: FONT_MONO, fontSize: 12, background: "none", border: "none", color: "#C9A876", cursor: "pointer", padding: 0 },
  journalCounter: { fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: "#9AA39C" },

  journalPage: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },

  coverWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px", textAlign: "center", maxWidth: 360 },
  coverTitle: { fontFamily: "'Anton', sans-serif", fontSize: 34, textTransform: "uppercase", color: "#C9A876", margin: "0 0 18px" },
  coverStory: { fontFamily: "'Kaushan Script', cursive", fontSize: 19, color: "#D9D2C4", lineHeight: 1.5, marginTop: 20 },
  countryMapWrap: { width: "100%", maxWidth: 300, overflow: "hidden", display: "flex", justifyContent: "center" },
  countryMapSvg: { width: "100%", maxWidth: 300, height: "auto" },
  editCoverBtn: {
    marginTop: 26, background: "none", border: "1px solid #33352f", color: "#9AA39C",
    borderRadius: 10, padding: "9px 14px", fontSize: 12, cursor: "pointer",
  },

  singleWrap: { position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  singleImg: { maxWidth: "94vw", maxHeight: "78vh", objectFit: "contain", borderRadius: 4 },
  singleCaption: { fontFamily: FONT_SCRIPT, marginTop: 14, color: "#D9D2C4", fontSize: 20, padding: "0 24px", textAlign: "center" },
  thumbAdminBarStatic: { position: "absolute", top: 10, right: 10, display: "flex", gap: 6 },

  mosaic: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, gridAutoFlow: "dense", width: "100%", height: "100%", padding: "0 10px" },
  mosaicItem: { position: "relative", borderRadius: 8, overflow: "hidden", minHeight: 140 },
  mosaicBtn: { width: "100%", height: "100%", display: "block" },
  mosaicImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  mosaicCaption: { position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 10px 8px", background: "linear-gradient(transparent, #0F1211dd)", fontFamily: FONT_SCRIPT, fontSize: 16, textAlign: "left", color: "#F4EFE7" },
  thumbAdminBar: { position: "absolute", top: 6, right: 6, display: "flex", gap: 4 },
  iconBtn: { width: 28, height: 28, borderRadius: 8, border: "none", background: "#0F1211cc", color: "#F4EFE7", cursor: "pointer", fontSize: 13 },

  pageArrow: { position: "absolute", top: "50%", transform: "translateY(-50%)", fontSize: 32, background: "none", border: "none", color: "#F4EFE799", cursor: "pointer", padding: 8, zIndex: 2 },
  pageDots: { display: "flex", justifyContent: "center", gap: 6, padding: "10px 0 20px" },
  pageDot: { width: 6, height: 6, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer" },

  addPhotoBtn: { margin: "12px 24px 4px", fontFamily: FONT_BODY, fontSize: 13, color: "#0F1211", background: "#C9A876", border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontWeight: 600 },
  addPhotoFloating: { fontFamily: FONT_BODY, fontSize: 13, color: "#0F1211", background: "#C9A876", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontWeight: 600 },
  floatingBtnGroup: { position: "absolute", bottom: 60, right: 16, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" },
  emptyState: { padding: "8px 24px", color: "#9AA39C" },

  zoomOverlay: { position: "fixed", inset: 0, background: "#0B0D0Cf5", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  zoomImg: { maxWidth: "94vw", maxHeight: "82vh", objectFit: "contain", borderRadius: 4 },
  lightboxCaption: { fontFamily: FONT_SCRIPT, marginTop: 14, color: "#D9D2C4", fontSize: 20, padding: "0 24px", textAlign: "center" },

  adminFab: { position: "fixed", bottom: 18, right: 18, width: 44, height: 44, borderRadius: "50%", background: "#1B1E1C", border: "1px solid #2a2b27", fontSize: 18, cursor: "pointer", zIndex: 40 },
  adminHomeBar: { position: "fixed", bottom: 18, left: 18, display: "flex", gap: 8, zIndex: 40 },
  smallGhostBtn: { fontFamily: FONT_BODY, fontSize: 12, background: "#1B1E1C", color: "#F4EFE7", border: "1px solid #2a2b27", borderRadius: 10, padding: "9px 12px", cursor: "pointer" },

  modalOverlay: { position: "fixed", inset: 0, background: "#0B0D0Ccc", zIndex: 70, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  modalCard: { background: "#1B1E1C", width: "100%", maxWidth: 480, borderRadius: "18px 18px 0 0", padding: "22px 20px 28px", border: "1px solid #2a2b27", borderBottom: "none" },
  modalTitle: { fontFamily: FONT_DISPLAY, fontSize: 20, margin: "0 0 14px" },
  label: { display: "block", fontFamily: FONT_MONO, fontSize: 11, color: "#9AA39C", margin: "12px 0 6px" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #33352f", background: "#0F1211", color: "#F4EFE7", fontFamily: FONT_BODY, fontSize: 14 },
  primaryBtn: { width: "100%", marginTop: 18, padding: "12px", borderRadius: 10, border: "none", background: "#C9A876", color: "#0F1211", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  modalClose: { width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, border: "1px solid #33352f", background: "none", color: "#9AA39C", fontSize: 13, cursor: "pointer" },
};
