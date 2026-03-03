"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeft,
  HiLocationMarker,
  HiPhone,
  HiIdentification,
  HiOfficeBuilding,
  HiCheckCircle,
  HiXCircle,
  HiChevronLeft,
  HiChevronRight,
  HiHome,
} from "react-icons/hi";
import {
  MdSquareFoot,
  MdMeetingRoom,
  MdKingBed,
  MdStairs,
  MdChair,
} from "react-icons/md";
import { BsGeoAlt, BsGrid3X3 } from "react-icons/bs";
import { TbRulerMeasure } from "react-icons/tb";
import useGetProperty from "@/hooks/property/useGetProperty";
import CostumLoader from "@/components/Loader";
import { useParams } from "react-router-dom";


const IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1400&q=85",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85",
];

/* ─── HELPERS ───────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat("fr-FR").format(n);

const Val = ({ v }) =>
  v === null || v === undefined ? (
    <span className="text-base-content/25 italic text-xs">N/A</span>
  ) : (
    <span>{String(v)}</span>
  );

/* ─── COMPONENT ─────────────────────────────────────── */
export default function PropertyDetail() {
 
    const {id} = useParams()
    const {property, loading, error} = useGetProperty(id)
    const [imgIdx, setImgIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  const prev = () => {
    setDirection(-1);
    setImgIdx((i) => (i - 1 + IMAGES.length) % IMAGES.length);
  };
  const next = () => {
    setDirection(1);
    setImgIdx((i) => (i + 1) % IMAGES.length);
  };
  const goTo = (i) => {
    setDirection(i > imgIdx ? 1 : -1);
    setImgIdx(i);
  };

  // auto-slide
  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, []);

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.65, ease: [0.32, 0.72, 0, 1] } },
    exit: (d) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } }),
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] } },
  });

  /* detail rows parsed from json */
  const details = [
    { label: "Pays", value: property?.country, icon: <BsGeoAlt /> },
    { label: "Région", value: property?.region, icon: <HiLocationMarker /> },
    { label: "Ville", value: property?.city, icon: <HiHome /> },
    { label: "Adresse", value: property?.address, icon: <HiLocationMarker /> },
    { label: "Étage", value: property?.floor, icon: <MdStairs /> },
    { label: "Meublé", value: property?.furnished ? "Oui" : "Non", icon: <MdChair /> },
    { label: "Longitude", value: property?.longitude, icon: <TbRulerMeasure /> },
    { label: "Latitude", value: property?.latitude, icon: <TbRulerMeasure /> },
    { label: "Créé le", value: property?.created_at, icon: <BsGrid3X3 /> },
    { label: "Mis à jour", value: property?.updated_at, icon: <BsGrid3X3 /> },
  ];

  

  console.log(property)


  return (
    <div>

        {loading ? <CostumLoader /> : (
            <div className="min-h-screen bg-background text-foreground font-['Outfit',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,600;0,700;1,500&family=Outfit:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant', serif; }
        .font-body    { font-family: 'Outfit', sans-serif; }
        .gold         { color: #C9935A; }
        .gold-bg      { background: #C9935A; }
        .gold-border  { border-color: #C9935A; }
        .glass {
          background: rgba(var(--b1-rgb, 255 255 255) / 0.06);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #C9935A44; border-radius: 99px; }
      `}</style>

      {/* ══════════════════════════════════════
          HERO — full‑height image carousel
      ══════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] overflow-hidden">

        {/* SLIDES */}
        <AnimatePresence custom={direction} initial={false}>
          <motion.img
            key={imgIdx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            src={IMAGES[imgIdx]}
            alt="property"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />

        {/* TOP BAR */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-7">
          <motion.button
            {...fadeUp(0)}
            onClick={() => (window.location.href = "/properties")}
            className="flex items-center gap-2 glass border border-white/15 text-white/90 text-xs tracking-[0.2em] uppercase px-5 py-3 hover:gold-bg hover:border-transparent hover:text-black transition-all duration-300 font-body"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <HiArrowLeft className="text-base" />
            Retour
          </motion.button>

          <motion.div
            {...fadeUp(0.1)}
            className="glass border border-white/15 text-xs tracking-[0.26em] uppercase px-4 py-3 gold font-body"
          >
            Réf. #{property.id}
          </motion.div>
        </div>

        {/* HERO TEXT — bottom‑left */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-8 md:px-14 pb-10">
          <motion.p {...fadeUp(0.15)} className="gold font-body text-xs tracking-[0.28em] uppercase mb-3">
            Propriété exclusive
          </motion.p>

          <motion.h1
            {...fadeUp(0.25)}
            className="font-display text-white text-5xl md:text-7xl font-bold leading-none mb-4"
          >
            {property.name}
          </motion.h1>

          <motion.div
            {...fadeUp(0.35)}
            className="flex items-center gap-2 text-white/60 text-sm mb-7 font-body"
          >
            <HiLocationMarker className="gold text-base shrink-0" />
            {property.address}, {property.city}, {property.region}
          </motion.div>

          {/* STAT PILLS */}
          <motion.div {...fadeUp(0.45)} className="flex flex-wrap gap-0">
            {[
              { icon: <MdSquareFoot className="text-lg" />, val: `${property.surface} m²`, label: "Surface" },
              { icon: <MdMeetingRoom className="text-lg" />, val: property.rooms, label: "Pièces" },
              { icon: <MdKingBed className="text-lg" />, val: property.bedrooms, label: "Chambres" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 glass border border-white/10 px-5 py-3 mr-[-1px] mb-[-1px] hover:border-[#C9935A]/50 transition-colors"
              >
                <span className="gold">{s.icon}</span>
                <div className="font-body">
                  <div className="text-white text-sm font-medium leading-none">{s.val}</div>
                  <div className="text-white/45 text-[10px] tracking-widest uppercase mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* CAROUSEL CONTROLS */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 glass border border-white/15 text-white/70 hover:text-white p-3 transition-all hover:border-white/40"
        >
          <HiChevronLeft className="text-2xl" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 glass border border-white/15 text-white/70 hover:text-white p-3 transition-all hover:border-white/40"
        >
          <HiChevronRight className="text-2xl" />
        </button>

        {/* DOTS */}
        <div className="absolute bottom-5 right-8 z-20 flex gap-2">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === imgIdx ? "w-6 h-2 gold-bg" : "w-2 h-2 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          THUMBNAIL STRIP
      ══════════════════════════════════════ */}
      <div className="border-b border-base-content/10 overflow-x-auto scrollbar-thin">
        <div className="flex gap-1 p-3 w-max mx-auto">
          {IMAGES.map((src, i) => (
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`relative w-24 h-16 overflow-hidden shrink-0 transition-all duration-300 ${
                i === imgIdx ? "ring-2 ring-[#C9935A] ring-offset-1 ring-offset-base-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN BODY
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">

        {/* ── LEFT ─────────────────────────── */}
        <div>

          {/* DESCRIPTION */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <SectionLabel>Description</SectionLabel>
            <p className="text-base-content/65 leading-relaxed text-[0.97rem] font-body italic">
              {property.description ||
                "Un appartement de prestige niché au cœur de Keur Massar — 400 m² d'espace raffiné, conçu pour ceux qui exigent le meilleur. Architecture soignée, finitions haut de gamme, environnement calme et sécurisé."}
            </p>
          </motion.section>

          {/* DETAILS GRID */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-14"
          >
            <SectionLabel>Détails complets</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-base-content/8">
              {details.map(({ label, value, icon }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="flex items-center justify-between py-4 px-2 hover:bg-base-content/[0.03] transition-colors group"
                >
                  <div className="flex items-center gap-3 text-base-content/45 text-sm font-body">
                    <span className="gold text-base group-hover:scale-110 transition-transform">{icon}</span>
                    <span className="tracking-wide text-xs uppercase">{label}</span>
                  </div>
                  <span className="text-sm font-medium font-body">
                    <Val v={value} />
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* LOCATION MAP PLACEHOLDER */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel>Localisation</SectionLabel>
            <div className="relative h-52 rounded-sm overflow-hidden border border-base-content/10">
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=Keur+Massar,Dakar&zoom=14&size=900x300&style=feature:all|element:geometry|color:0x1a1a2e&style=feature:all|element:labels.text.stroke|color:0x000000&style=feature:all|element:labels.text.fill|color:0xC9935A&key=DEMO`}
                alt="map"
                className="w-full h-full object-cover opacity-0"
              />
              {/* fallback gradient map aesthetic */}
              <div className="absolute inset-0 bg-gradient-to-br from-base-300 to-base-200 flex flex-col items-center justify-center gap-3">
                <HiLocationMarker className="gold text-4xl" />
                <div className="text-center font-body">
                  <p className="text-sm font-medium">{property.address}</p>
                  <p className="text-xs text-base-content/45 mt-0.5">{property.city}, {property.region}, {property.country}</p>
                </div>
                <div className="flex gap-6 mt-2 text-xs text-base-content/35 font-body">
                  <span>Lng: <Val v={property.longitude} /></span>
                  <span>Lat: <Val v={property.latitude} /></span>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ── RIGHT SIDEBAR ─────────────────── */}
        <div className="space-y-5">

          {/* PRICE CARD */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative overflow-hidden border border-[#C9935A]/30 bg-gradient-to-br from-[#C9935A]/10 via-base-100 to-base-100 p-7"
          >
            {/* glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#C9935A]/15 blur-3xl pointer-events-none" />

            <p className="font-body text-[10px] tracking-[0.3em] uppercase gold mb-2">Prix de vente</p>
            <p className="font-display text-4xl font-bold leading-none mb-1">
              {fmt(property.price)}
            </p>
            <p className="font-body text-xs text-base-content/40 mb-6">FCFA · Négociable</p>

            {/* badges */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { label: "Statut", val: property.sold ? "Vendu" : "Dispo", ok: !property.sold },
                { label: "Actif", val: property.is_active ? "Oui" : "Non", ok: !!property.is_active },
                { label: "Meublé", val: property.furnished ? "Oui" : "Non", ok: !!property.furnished },
              ].map(({ label, val, ok }) => (
                <div key={label} className={`flex flex-col items-center py-2.5 border font-body ${ok ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400" : "border-base-content/10 text-base-content/40"}`}>
                  {ok
                    ? <HiCheckCircle className="text-lg mb-0.5" />
                    : <HiXCircle className="text-lg mb-0.5 opacity-40" />
                  }
                  <span className="text-[9px] tracking-widest uppercase">{label}</span>
                  <span className="text-[11px] font-medium mt-0.5">{val}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full gold-bg text-black font-body font-semibold text-xs tracking-[0.2em] uppercase py-4 hover:brightness-110 transition-all duration-200"
            >
              Faire une offre
            </motion.button>
            <button className="w-full mt-2 border border-base-content/15 text-base-content/60 font-body text-xs tracking-[0.15em] uppercase py-3.5 hover:border-[#C9935A]/50 hover:text-[#C9935A] transition-all duration-200">
              Planifier une visite
            </button>
          </motion.div>

          {/* QUICK SPECS */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="border border-base-content/10 p-5"
          >
            <p className="font-body text-[10px] tracking-[0.28em] uppercase gold mb-4">Caractéristiques</p>
            <div className="space-y-3">
              {[
                { icon: <MdSquareFoot />, label: "Surface habitable", val: `${property.surface} m²` },
                { icon: <MdMeetingRoom />, label: "Nombre de pièces", val: property.rooms },
                { icon: <MdKingBed />, label: "Chambres", val: property.bedrooms },
                { icon: <MdStairs />, label: "Étage", val: property.floor },
                { icon: <MdChair />, label: "Meublé", val: property.furnished ? "Oui" : "Non" },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-base-content/8 last:border-0">
                  <div className="flex items-center gap-2.5 text-base-content/50 font-body text-xs">
                    <span className="gold text-base">{icon}</span>
                    {label}
                  </div>
                  <span className="font-body text-sm font-medium"><Val v={val} /></span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AGENCY CARD */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="border border-base-content/10 p-5"
          >
            <p className="font-body text-[10px] tracking-[0.28em] uppercase gold mb-5">Agence</p>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 gold-bg flex items-center justify-center text-black font-display font-bold text-lg shrink-0">
                {property.agency.company_name[0]}
              </div>
              <div>
                <p className="font-display font-semibold text-lg leading-tight">{property.agency.company_name}</p>
                <p className="font-body text-[10px] tracking-widest uppercase text-base-content/40 mt-0.5">Agence immobilière</p>
              </div>
            </div>

            <p className="font-body text-xs leading-relaxed text-base-content/50 mb-5 italic">
              {property.agency.description}
            </p>

            <div className="space-y-3">
              {[
                { icon: <HiPhone />, val: property.agency.phone },
                { icon: <HiLocationMarker />, val: `${property.agency.address}, ${property.agency.city}` },
                { icon: <HiIdentification />, val: property.agency.id_card },
                { icon: <HiOfficeBuilding />, val: `ID Agence: ${property.agency.id}` },
              ].map(({ icon, val }, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-body text-base-content/55">
                  <span className="gold text-sm shrink-0">{icon}</span>
                  {val}
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-5 border border-[#C9935A]/40 text-[#C9935A] font-body font-medium text-xs tracking-[0.15em] uppercase py-3 hover:gold-bg hover:text-black transition-all duration-200"
            >
              Contacter l'agence
            </motion.button>
          </motion.div>

        </div>
      </div>
    </div>
        )}



    </div>
    
  );
}




/* ─── HELPERS ─── */
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-body text-[10px] tracking-[0.3em] uppercase gold whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-[#C9935A]/40 to-transparent" />
    </div>
  );
}