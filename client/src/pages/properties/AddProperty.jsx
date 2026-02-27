import { useState, useEffect } from "react";

// ─── Mock / replace with your actual API calls ───────────────────────────────
// import { fetchDevises, createProperty } from "@/api/properties";

const PROPERTY_TYPES = [
  { id: 1, label: "Appartement" },
  { id: 2, label: "Maison" },
  { id: 3, label: "Villa" },
  { id: 4, label: "Bureau" },
  { id: 5, label: "Terrain" },
  { id: 6, label: "Commerce" },
];

const COUNTRIES = [
  "Sénégal", "Côte d'Ivoire", "Mali", "Guinée", "Cameroun",
  "Maroc", "Algérie", "Tunisie", "France", "Autre",
];

// ─────────────────────────────────────────────────────────────────────────────

const initialForm = {
  // agency_id: "",        // handled externally — inject from auth context
  property_type_id: "",
  devise_id: "",
  name: "",
  description: "",
  surface: "",
  rooms: "",
  bedrooms: "",
  floor: "",
  funished: false,
  price: "",
  country: "",
  region: "",
  city: "",
  address: "",
  longitude: "",
  latitude: "",
  sold: false,
  is_active: true,
};

export default function AddProperty({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [devises, setDevises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // multi-step: 1 = infos, 2 = localisation, 3 = details
  const [errors, setErrors] = useState({});

  // ── Fetch devises ────────────────────────────────────────────────────────
  useEffect(() => {
    // Replace with your real API call:
    // fetchDevises().then(setDevises);
    setDevises([
      { id: 1, code: "XOF", label: "Franc CFA (BCEAO)" },
      { id: 2, code: "XAF", label: "Franc CFA (BEAC)" },
      { id: 3, code: "EUR", label: "Euro" },
      { id: 4, code: "USD", label: "Dollar américain" },
      { id: 5, code: "MAD", label: "Dirham marocain" },
    ]);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.property_type_id) e.property_type_id = "Obligatoire";
    if (!form.devise_id) e.devise_id = "Obligatoire";
    if (!form.name.trim()) e.name = "Obligatoire";
    if (!form.price) e.price = "Obligatoire";
    if (!form.country) e.country = "Obligatoire";
    if (!form.city.trim()) e.city = "Obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setStep(1); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        // agency_id: currentUser.agency_id,  // inject from your auth context
        surface: form.surface ? Number(form.surface) : null,
        rooms: form.rooms ? Number(form.rooms) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        floor: form.floor ? Number(form.floor) : null,
        price: Number(form.price),
        longitude: form.longitude ? Number(form.longitude) : null,
        latitude: form.latitude ? Number(form.latitude) : null,
        funished: form.funished ? 1 : 0,
        sold: form.sold ? 1 : 0,
        is_active: form.is_active ? 1 : 0,
      };
      // Replace with your real API call:
      // await createProperty(payload);
      if (onSubmit) await onSubmit(payload);
      alert("Bien ajouté avec succès !");
      setForm(initialForm);
      setStep(1);
    } catch (err) {
      alert("Erreur lors de l'ajout : " + (err.message ?? "inconnue"));
    } finally {
      setLoading(false);
    }
  };

  // ── Step labels ───────────────────────────────────────────────────────────
  const steps = [
    { n: 1, label: "Informations générales" },
    { n: 2, label: "Localisation" },
    { n: 3, label: "Détails & statut" },
  ];

  // ── Shared input classes ──────────────────────────────────────────────────
  const inputCls = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${
      errors[field]
        ? "border-red-400 dark:border-red-500"
        : "border-zinc-200 dark:border-zinc-700"
    }`;

  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Ajouter un bien
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Remplissez les informations pour publier une nouvelle annonce.
          </p>
        </div>

        {/* ── Step indicator ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => setStep(s.n)}
                className={`flex items-center gap-2 group transition`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition
                    ${step === s.n
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900"
                      : step > s.n
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                    }`}
                >
                  {step > s.n ? "✓" : s.n}
                </span>
                <span
                  className={`text-xs font-medium hidden sm:block transition
                    ${step === s.n ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}`}
                >
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-1 transition ${step > s.n ? "bg-emerald-400" : "bg-zinc-200 dark:bg-zinc-700"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Card ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">

            {/* ══ STEP 1 — Informations générales ══════════════════════════ */}
            {step === 1 && (
              <div className="p-6 space-y-5">
                <SectionTitle>Type & identification</SectionTitle>

                {/* Type de bien */}
                <div>
                  <label className={labelCls}>Type de bien <Req /></label>
                  <select
                    value={form.property_type_id}
                    onChange={(e) => set("property_type_id", e.target.value)}
                    className={inputCls("property_type_id")}
                  >
                    <option value="">— Choisir un type —</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <ErrMsg msg={errors.property_type_id} />
                </div>

                {/* Nom */}
                <div>
                  <label className={labelCls}>Titre de l'annonce <Req /></label>
                  <input
                    type="text"
                    placeholder="Ex: Villa F5 avec piscine à Almadies"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={inputCls("name")}
                  />
                  <ErrMsg msg={errors.name} />
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez le bien en détail..."
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    className={inputCls("description") + " resize-none"}
                  />
                </div>

                <SectionTitle>Prix</SectionTitle>

                <div className="grid grid-cols-2 gap-4">
                  {/* Prix */}
                  <div>
                    <label className={labelCls}>Prix <Req /></label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      className={inputCls("price")}
                    />
                    <ErrMsg msg={errors.price} />
                  </div>

                  {/* Devise */}
                  <div>
                    <label className={labelCls}>Devise <Req /></label>
                    <select
                      value={form.devise_id}
                      onChange={(e) => set("devise_id", e.target.value)}
                      className={inputCls("devise_id")}
                    >
                      <option value="">— Devise —</option>
                      {devises.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} – {d.label}
                        </option>
                      ))}
                    </select>
                    <ErrMsg msg={errors.devise_id} />
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 2 — Localisation ════════════════════════════════════ */}
            {step === 2 && (
              <div className="p-6 space-y-5">
                <SectionTitle>Localisation</SectionTitle>

                {/* Pays */}
                <div>
                  <label className={labelCls}>Pays <Req /></label>
                  <select
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className={inputCls("country")}
                  >
                    <option value="">— Choisir un pays —</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ErrMsg msg={errors.country} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Région */}
                  <div>
                    <label className={labelCls}>Région</label>
                    <input
                      type="text"
                      placeholder="Ex: Dakar"
                      value={form.region}
                      onChange={(e) => set("region", e.target.value)}
                      className={inputCls("region")}
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className={labelCls}>Ville <Req /></label>
                    <input
                      type="text"
                      placeholder="Ex: Dakar"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className={inputCls("city")}
                    />
                    <ErrMsg msg={errors.city} />
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <label className={labelCls}>Adresse</label>
                  <input
                    type="text"
                    placeholder="Rue, quartier..."
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    className={inputCls("address")}
                  />
                </div>

                <SectionTitle>Coordonnées GPS</SectionTitle>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 14.6937"
                      value={form.latitude}
                      onChange={(e) => set("latitude", e.target.value)}
                      className={inputCls("latitude")}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: -17.4441"
                      value={form.longitude}
                      onChange={(e) => set("longitude", e.target.value)}
                      className={inputCls("longitude")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 3 — Détails & statut ════════════════════════════════ */}
            {step === 3 && (
              <div className="p-6 space-y-5">
                <SectionTitle>Caractéristiques</SectionTitle>

                <div className="grid grid-cols-2 gap-4">
                  {/* Surface */}
                  <div>
                    <label className={labelCls}>Surface (m²)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ex: 120"
                      value={form.surface}
                      onChange={(e) => set("surface", e.target.value)}
                      className={inputCls("surface")}
                    />
                  </div>

                  {/* Étage */}
                  <div>
                    <label className={labelCls}>Étage</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ex: 2"
                      value={form.floor}
                      onChange={(e) => set("floor", e.target.value)}
                      className={inputCls("floor")}
                    />
                  </div>

                  {/* Pièces */}
                  <div>
                    <label className={labelCls}>Nb de pièces</label>
                    <select
                      value={form.rooms}
                      onChange={(e) => set("rooms", e.target.value)}
                      className={inputCls("rooms")}
                    >
                      <option value="">—</option>
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                        <option key={n} value={n}>{n} pièce{n > 1 ? "s" : ""}</option>
                      ))}
                      <option value="11">11+</option>
                    </select>
                  </div>

                  {/* Chambres */}
                  <div>
                    <label className={labelCls}>Nb de chambres</label>
                    <select
                      value={form.bedrooms}
                      onChange={(e) => set("bedrooms", e.target.value)}
                      className={inputCls("bedrooms")}
                    >
                      <option value="">—</option>
                      {[1,2,3,4,5,6,7,8].map((n) => (
                        <option key={n} value={n}>{n} chambre{n > 1 ? "s" : ""}</option>
                      ))}
                      <option value="9">9+</option>
                    </select>
                  </div>
                </div>

                <SectionTitle>Statut du bien</SectionTitle>

                <div className="space-y-3">
                  <Toggle
                    label="Meublé"
                    description="Le bien est proposé avec mobilier"
                    checked={form.funished}
                    onChange={(v) => set("funished", v)}
                    color="indigo"
                  />
                  <Toggle
                    label="Vendu / Loué"
                    description="Marquer ce bien comme déjà vendu ou loué"
                    checked={form.sold}
                    onChange={(v) => set("sold", v)}
                    color="amber"
                  />
                  <Toggle
                    label="Annonce active"
                    description="Rendre cette annonce visible sur le site"
                    checked={form.is_active}
                    onChange={(v) => set("is_active", v)}
                    color="emerald"
                  />
                </div>

                {/* agency_id — géré par le parent / auth context */}
                {/* <input type="hidden" name="agency_id" value={currentUser.agency_id} /> */}
              </div>
            )}

            {/* ── Footer navigation ─────────────────────────────────────── */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition"
              >
                ← Précédent
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition disabled:opacity-60 flex items-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  )}
                  {loading ? "Enregistrement..." : "Publier le bien"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 pt-1">
      {children}
    </h3>
  );
}

function Req() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

function ErrMsg({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

function Toggle({ label, description, checked, onChange, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
  };
  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      <div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{description}</p>
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? colors[color] : "bg-zinc-200 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}