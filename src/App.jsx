import { useState, useEffect, useRef } from "react";
import profileImg from "./assets/profile.jpg";
import { Analytics } from "@vercel/analytics/next"

const COLORS = {
  ink: "#000000",
  ink2: "#070707",
  panel: "#0A0A0A",
  panelLine: "rgba(255,255,255,0.12)",
  cream: "#EAEAEA",
  slate: "#8A8A8A",
  coral: "#9CA3AF",
  mint: "#C7C7C7",
  name1: "#7C3AED",
  name2: "#3B82F6",
};

/* ── Starfield Canvas ── */
function Starfield() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let stars = [], shootingStars = [], t = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      initStars();
    }
    function initStars() {
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.25,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      }));
    }
    function maybeSpawnShooting() {
      if (Math.random() < 0.012 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * canvas.width * 0.6,
          y: Math.random() * canvas.height * 0.3,
          len: Math.random() * 80 + 60,
          speed: Math.random() * 6 + 8,
          angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
          life: 1,
        });
      }
    }
    function animate() {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`;
        ctx.fill();
      }
      maybeSpawnShooting();
      shootingStars.forEach((s) => {
        const dx = Math.cos(s.angle) * s.speed;
        const dy = Math.sin(s.angle) * s.speed;
        s.x += dx; s.y += dy; s.life -= 0.018;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - dx * (s.len / s.speed), s.y - dy * (s.len / s.speed));
        grad.addColorStop(0, `rgba(255,255,255,${Math.max(0, s.life)})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - dx * (s.len / s.speed), s.y - dy * (s.len / s.speed));
        ctx.stroke();
      });
      shootingStars = shootingStars.filter((s) => s.life > 0 && s.y < canvas.height && s.x < canvas.width);
      animId = requestAnimationFrame(animate);
    }
    resize();
    animate();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

/* ── Reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Frame card ── */
function Frame({ label, children, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "#0A0A0A",
        borderRadius: 14,
        ...style,
      }}
    >
      {label && (
        <span
          style={{
            position: "absolute",
            top: -11,
            left: 18,
            background: "#000",
            padding: "0 8px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: COLORS.mint,
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

/* ── Eyebrow ── */
function Eyebrow({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: COLORS.mint, marginBottom: 14 }}>
      <span style={{ width: 40, height: 1, background: COLORS.mint, opacity: 0.5, display: "inline-block" }} />
      {children}
    </div>
  );
}

/* ── Nav ── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "About", n: "01", href: "#about" },
    { label: "Education", n: "02", href: "#education" },
    { label: "Projects", n: "03", href: "#projects" },
    { label: "Internships", n: "04", href: "#internships" },
    { label: "Skills", n: "05", href: "#skills" },
    { label: "Contact", n: "06", href: "#contact" },
  ];

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "22px 32px",
        background: scrolled ? "rgba(11,17,32,0.92)" : "rgba(11,17,32,0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
        transition: "border-color .3s ease, background .3s ease",
      }}
    >
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: COLORS.cream, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 8 }}>
        <PulseDot /> # manoj @dev
      </div>
      <div style={{ display: "flex", gap: 32, fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: COLORS.slate }}>
        {links.map((l) => (
          <a
            key={l.n}
            href={l.href}
            style={{ color: COLORS.slate, textDecoration: "none", transition: "color .25s ease" }}
            onMouseEnter={e => e.target.style.color = "#fff"}
            onMouseLeave={e => e.target.style.color = COLORS.slate}
          >
            <span style={{ color: COLORS.slate, marginRight: 6, opacity: 0.7 }}>{l.n}</span>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function PulseDot() {
  return (
    <span
      style={{
        width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "inline-block",
        animation: "pulse 2.4s infinite",
      }}
    />
  );
}

/* ── Hero ── */
function Hero() {
  const chips = [
    {
      text: "<UI ready/>",
      color: COLORS.mint,
      top: "18%",
      right: "20%",
      delay: "0s",
    },
      {
      text: "git init",
      color: COLORS.slate,
      top: "27%",
      right: "54%",
      delay: "1.2s",
    },
    {
      text: "npm run dev",
      color: COLORS.slate,
      top: "97%",
      right: "0%",
      delay: "1.2s",
    },
    {
      text: "// react.js",
      color: COLORS.coral,
      bottom: "6%",
      right: "42%",
      delay: "2s",
    },
  ];

  return (
    <section
      className="hero-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "60px",
        paddingTop: 90,
        paddingBottom: 60,
        position: "relative",
        flexWrap: "wrap",
      }}
    >
      {chips.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            padding: "8px 14px",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            background: "#0A0A0A",
            color: c.color,
            top: c.top,
            right: c.right,
            bottom: c.bottom,
            animation: `float 6s ease-in-out ${c.delay} infinite`,
          }}
        >
          {c.text}
        </div>
      ))}

      {/* LEFT SIDE */}
      <div style={{ flex: 1, minWidth: "320px" }}>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 13,
            color: COLORS.mint,
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
            animation: "fadeUp .7s ease .1s both",
          }}
        >
          <span
            style={{
              width: 40,
              height: 1,
              background: COLORS.mint,
              opacity: 0.5,
              display: "inline-block",
            }}
          />
          FRONTEND DEVELOPER · VISAKHAPATNAM
        </div>

        <h1
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(48px,9vw,104px)",
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
            animation: "fadeUp .8s ease .25s both",
          }}
        >
          Manoj
          <br />
          <span
            style={{
              background: "linear-gradient(120deg,#7C3AED,#3B82F6)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 0 28px rgba(124,58,237,0.35))",
            }}
          >
            Gathram
          </span>
        </h1>

        <div
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 500,
            fontSize: "clamp(20px,3vw,30px)",
            color: COLORS.slate,
            marginTop: 18,
            animation: "fadeUp .8s ease .4s both",
          }}
        >
          Building{" "}
          <span style={{ color: COLORS.cream }}>
            interactive, responsive
          </span>{" "}
          web experiences
        </div>

        <p
          style={{
            maxWidth: 560,
            marginTop: 24,
            color: COLORS.slate,
            fontSize: 16,
            lineHeight: 1.7,
            animation: "fadeUp .8s ease .55s both",
          }}
        >
          Computer Science Engineering student crafting clean,
          component-driven interfaces with React.js and Tailwind CSS —
          focused on real-time interactivity, responsive design, and
          smooth user experience.
        </p>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
            flexWrap: "wrap",
            animation: "fadeUp .8s ease .7s both",
          }}
        >
          <a
            href="#projects"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 13,
              padding: "13px 24px",
              borderRadius: 8,
              background: "#fff",
              color: "#000",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View Projects →
          </a>

          <a
            href="#contact"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 13,
              padding: "13px 24px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.02)",
              color: COLORS.cream,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Get in Touch
          </a>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minWidth: "320px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "380px",
            height: "380px",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              inset: "-30px",
              background:
                "radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          <img
            src={profileImg}
            alt="Manoj Gathram"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12%",
              border: "3px solid rgba(255,255,255,0.15)",
              boxShadow:
                "0 0 35px rgba(124,58,237,0.3), 0 0 60px rgba(59,130,246,0.25)",
              position: "relative",
              zIndex: 2,
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ── About ── */
function About() {
  return (
    <section id="about" style={{ padding: "120px 0" }}>
      <Reveal>
        <div style={{ marginBottom: 56 }}>
          <Eyebrow>01 — ABOUT</Eyebrow>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-0.01em" }}>Personal Details</h2>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "start" }}>
        <Reveal delay={0.1}>
          <div>
            <p style={{ color: COLORS.slate, lineHeight: 1.8, fontSize: 16, marginBottom: 18 }}>
              I'm a <strong style={{ color: COLORS.cream }}>Computer Science Engineering</strong> student based in Visakhapatnam, passionate about turning ideas into <strong style={{ color: COLORS.cream }}>polished, functional interfaces</strong>. My work centers on React.js, JavaScript frameworks, and Tailwind CSS — with an eye for responsive layouts and UI that feels effortless to use.
            </p>
            <p style={{ color: COLORS.slate, lineHeight: 1.8, fontSize: 16 }}>
              From quiz platforms with real-time scoring to ride-booking interfaces, I enjoy building products that are technically solid and genuinely pleasant to interact with.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <Frame label="profile.json" style={{ padding: 28, marginTop: 8 }}>
            {[
              ["LOCATION", "Visakhapatnam, AP"],
              ["DOB", "June 12, 2004"],
              ["GENDER", "Male"],
              ["PHONE", "+91 90149 93875"],
              ["EMAIL", "manoj.developer41@gmail.com"],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none", fontSize: 14 }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", color: COLORS.slate, fontSize: 12.5 }}>{k}</span>
                <span style={{ color: COLORS.cream, fontWeight: 500, textAlign: "right", fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </Frame>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Animated Education Card ── */
function EduCard({ item, index }) {
  const [ref, visible] = useReveal();
  const [hovered, setHovered] = useState(false);

  const accentColors = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B"];
  const accent = accentColors[index % accentColors.length];

  const icons = ["▣", "▤", "▥", "▦"];

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
        transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
        position: "relative",
        border: `1px solid ${hovered ? accent : "rgba(255,255,255,0.12)"}`,
        background: "#0A0A0A",
        borderRadius: 16,
        padding: "28px 32px",
        overflow: "hidden",
        cursor: "default",
        boxShadow: hovered ? `0 0 32px ${accent}22` : "none",
        transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s, border-color .3s ease, box-shadow .3s ease`,
      }}
    >
      {/* Glow orb behind card */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}33, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity .4s ease",
        pointerEvents: "none",
      }} />

      {/* Animated corner accent shape */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 60, height: 60,
        borderTop: `2px solid ${accent}`,
        borderRight: `2px solid ${accent}`,
        borderTopRightRadius: 16,
        opacity: hovered ? 0.8 : 0.25,
        transition: "opacity .3s ease",
        pointerEvents: "none",
      }} />

      {/* Animated bottom-left accent */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        width: 40, height: 40,
        borderBottom: `2px solid ${accent}`,
        borderLeft: `2px solid ${accent}`,
        borderBottomLeftRadius: 16,
        opacity: hovered ? 0.6 : 0.15,
        transition: "opacity .3s ease",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        {/* Icon bubble */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${accent}18`,
          border: `1px solid ${accent}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
          transform: hovered ? "scale(1.1) rotate(6deg)" : "scale(1) rotate(0deg)",
          transition: "transform .3s ease",
        }}>
          {icons[index % icons.length]}
        </div>

        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: accent, display: "block", marginBottom: 5 }}>
            {item.period}
          </span>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 19, fontWeight: 600, marginBottom: 4, color: COLORS.cream }}>
            {item.title}
          </div>
          <div style={{ color: COLORS.slate, fontSize: 14, lineHeight: 1.6 }}>{item.sub}</div>
        </div>
      </div>

      {item.score && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{
            fontFamily: "JetBrains Mono, monospace", fontSize: 12,
            color: COLORS.cream, background: `${accent}18`,
            border: `1px solid ${accent}55`,
            padding: "4px 12px", borderRadius: 6,
          }}>
            {item.score}
          </span>
          {/* Score bar animation */}
          <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: visible ? item.barWidth : "0%",
              background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
              borderRadius: 4,
              transition: `width 1.2s ease ${index * 0.15 + 0.5}s`,
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Education ── */
function Education() {
  const items = [
    { period: "2022 — PRESENT", title: "B.Tech — Computer Science & Engineering", sub: "Visakha Institute of Engineering and Technology, Visakhapatnam", score: "7.5 CGPA", barWidth: "75%" },
    { period: "2022", title: "Class XII", sub: "Andhra Pradesh Board of Intermediate Education", score: "61.6%", barWidth: "62%" },
    { period: "2020", title: "Class X", sub: "Andhra Pradesh Board of Secondary Education", score: "80%", barWidth: "80%" },
    { period: "CERTIFICATION", title: "Legacy Responsive Web Design", sub: "Certification Course — Responsive layout fundamentals", score: null, barWidth: "0%" },
  ];

  return (
    <section id="education" style={{ padding: "120px 0" }}>
      <Reveal>
        <div style={{ marginBottom: 56 }}>
          <Eyebrow>02 — BACKGROUND</Eyebrow>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-0.01em" }}>Education</h2>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {items.map((item, i) => (
          <EduCard key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ── Project Card ── */
function ProjectCard({ label, name, badge, period, desc, features, stack, link, delay = 0 }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Reveal delay={delay} style={{ marginBottom: 28 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          border: `1px solid ${hovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)"}`,
          background: "#0A0A0A",
          borderRadius: 14,
          padding: 32,
          overflow: "hidden",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "transform .35s ease, border-color .35s ease",
        }}
      >
        <span style={{ position: "absolute", top: -11, left: 18, background: "#000", padding: "0 8px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: COLORS.mint, letterSpacing: "0.5px" }}>
          {label}
        </span>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 26, fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
            {name}
            {badge && (
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", color: "#fff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", padding: "4px 10px", borderRadius: 20, animation: "livepulse 2.2s infinite" }}>
                ● LIVE
              </span>
            )}
          </div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: COLORS.slate, paddingTop: 6 }}>{period}</div>
        </div>

        <p style={{ color: COLORS.slate, lineHeight: 1.75, fontSize: 15, margin: "16px 0 20px" }} dangerouslySetInnerHTML={{ __html: desc }} />

        {features && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
            {features.map((f, i) => (
              <div key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: COLORS.cream, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, padding: "9px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: COLORS.mint }}>▹</span> {f}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {stack.map((s) => (
            <span key={s} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, padding: "5px 11px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: COLORS.cream, border: "1px solid rgba(255,255,255,0.18)" }}>
              {s}
            </span>
          ))}
        </div>

        {link && (
          <div>
            <a href={link.href} target="_blank" rel="noopener" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, color: COLORS.coral, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {link.label}
            </a>
          </div>
        )}
      </div>
    </Reveal>
  );
}

/* ── Projects ── */
function Projects() {
  return (
    <section id="projects" style={{ padding: "120px 0" }}>
      <Reveal>
        <div style={{ marginBottom: 56 }}>
          <Eyebrow>03 — SELECTED WORK</Eyebrow>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-0.01em" }}>Projects</h2>
        </div>
      </Reveal>

      <ProjectCard
        label="rideonow.tsx"
        name="RideOnow"
        badge={true}
        period="rideonow.com"
        desc={`A <strong style="color:#EAEAEA">hotel booking web application</strong> built for riders, currently live in production. Worked as <strong style="color:#EAEAEA">frontend developer</strong>, building the booking flow, listings, and responsive UI from the ground up — focused on clean navigation and mobile-first usability across devices.`}
        stack={["React.js", "HTML", "CSS", "Tailwind CSS"]}
        link={{ href: "https://rideonow.com", label: "↗ rideonow.com" }}
        delay={0.1}
      />

      <ProjectCard
        label="vquizz.tsx"
        name="VQuizz"
        period="SEP 2025 — FEB 2026"
        desc={`A <strong style="color:#EAEAEA">college quiz application</strong> built for students to take exams reliably and fairly — with <strong style="color:#EAEAEA">tab-switch detection and anti-cheating safeguards</strong> ensuring zero malfunctions during live tests. Built with <strong style="color:#EAEAEA">React.js</strong> and a component-based architecture for scalability, it features real-time question rendering, instant feedback, and category-based quizzes in a responsive Tailwind CSS layout. REST APIs power question delivery, deployed on Vercel.`}
        features={["Tab-switch detection", "Anti-cheating safeguards", "Real-time score tracking", "Timer-based system", "Instant answer feedback", "Category-based quizzes"]}
        stack={["React.js", "JavaScript", "Tailwind CSS", "REST API", "Figma"]}
        link={{ href: "https://vquiz.vercel.app", label: "↗ Vquiz.vercel.app" }}
        delay={0.2}
      />

      <ProjectCard
        label="vconnect.tsx"
        name="VConnect"
        period="College ERP System"
        desc={`A full-scale <strong style="color:#EAEAEA">ERP system for college</strong> connecting every stakeholder into one community — with dedicated dashboards and role-based access for the <strong style="color:#EAEAEA">library, accountant, students, staff, HODs, principal, and TPOs</strong>. Designed to centralize academic and administrative operations into a single, unified platform.`}
        features={["Library dashboard", "Accountant access", "Student portal", "Staff & HOD dashboards", "Principal overview", "TPO access"]}
        stack={["React.js", "JavaScript", "Tailwind CSS", "Role-Based Access"]}
        delay={0.3}
        link={{ href: "/", label: "↗ Deployed on Vercel" }}
      />
    </section>
  );
}

/* ── Internships ── */
function Internships() {
  const items = [
    { period: "APR 25 — JUN 12, 2026", title: "Frontend Intern — GVMC", sub: "Greater Visakhapatnam Municipal Corporation (Government Organization), Vizag" },
    { period: "MAY 1 — JUL 1, 2026", title: "Digital Image Processing (DIP)", sub: "NIT Warangal" },
    { period: "MAY 25 — JUN 25, 2026", title: "Web Developer Intern", sub: "Zidio Development" },
  ];

  return (
    <section id="internships" style={{ padding: "120px 0" }}>
      <Reveal>
        <div style={{ marginBottom: 56 }}>
          <Eyebrow>04 — EXPERIENCE</Eyebrow>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-0.01em" }}>Internships</h2>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div style={{ position: "relative", paddingLeft: 32, borderLeft: "1px solid rgba(255,255,255,0.12)" }}>
          {items.map((item, i) => (
            <div key={i} style={{ position: "relative", paddingBottom: i < items.length - 1 ? 44 : 0 }}>
              <div style={{ position: "absolute", left: -37, top: 4, width: 12, height: 12, borderRadius: "50%", background: "#000", border: `2px solid ${i % 2 === 0 ? COLORS.coral : COLORS.mint}` }} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: i % 2 === 0 ? COLORS.mint : COLORS.coral, display: "block", marginBottom: 6 }}>{item.period}</span>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 21, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
              <div style={{ color: COLORS.slate, fontSize: 14.5, lineHeight: 1.6 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ── Skills ── */
function Skills() {
  const skills = ["React.js", "JavaScript", "Front End Development", "GitHub", "Responsive Web Design", "Web UI Designing", "Mobile UI Design", "HTML5", "Tailwind CSS", "UI Development", "Web Application Development", "Figma", "REST APIs"];
  const langs = [["English", "READ / WRITE"], ["Hindi", "SPOKEN"], ["Telugu", "READ / WRITE"]];

  return (
    <section id="skills" style={{ padding: "120px 0" }}>
      <Reveal>
        <div style={{ marginBottom: 56 }}>
          <Eyebrow>05 — TOOLKIT</Eyebrow>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-0.01em" }}>Skills & Languages</h2>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 40 }}>
        <Reveal delay={0.1}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {skills.map((s) => (
              <SkillPill key={s}>{s}</SkillPill>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <Frame label="languages.json" style={{ padding: 24 }}>
            {langs.map(([name, tag], i, arr) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                <span style={{ fontWeight: 600, fontFamily: "Space Grotesk, sans-serif", fontSize: 15 }}>{name}</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: COLORS.mint }}>{tag}</span>
              </div>
            ))}
          </Frame>
        </Reveal>
      </div>
    </section>
  );
}

function SkillPill({ children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "JetBrains Mono, monospace", fontSize: 13, padding: "10px 16px",
        border: `1px solid ${hovered ? "#fff" : "rgba(255,255,255,0.12)"}`,
        borderRadius: 8, color: COLORS.cream, background: hovered ? "rgba(255,255,255,0.06)" : "#0A0A0A",
        cursor: "default",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "border-color .25s ease, transform .25s ease, background .25s ease",
      }}
    >
      {children}
    </span>
  );
}

/* ── Contact ── */
function Contact() {
  const cards = [
    { label: "PHONE", value: "+91 90149 93875", href: "tel:+919014993875", icon: <svg viewBox="0 0 24 24" fill="none" stroke="#EAEAEA" strokeWidth="2" width={20} height={20}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg> },
    { label: "EMAIL", value: "manoj.developer41@gmail.com", href: "mailto:manoj.developer41@gmail.com", icon: <svg viewBox="0 0 24 24" fill="none" stroke="#EAEAEA" strokeWidth="2" width={20} height={20}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg> },
    { label: "LOCATION", value: "Visakhapatnam, India", href: null, icon: <svg viewBox="0 0 24 24" fill="none" stroke="#EAEAEA" strokeWidth="2" width={20} height={20}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
  ];

  return (
    <section id="contact" style={{ padding: "120px 0", textAlign: "center" }}>
      <Reveal>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: COLORS.mint, marginBottom: 14 }}>
            <span style={{ width: 40, height: 1, background: COLORS.mint, opacity: 0.5, display: "inline-block" }} />
            06 — CONNECT
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-0.01em" }}>Let's build something</h2>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <p style={{ color: COLORS.slate, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Open to internships and frontend development opportunities. Reach out — I'd love to talk about your next project.
        </p>
      </Reveal>

      <Reveal delay={0.2}>
        <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          {cards.map(({ label, value, href, icon }) => {
            const inner = (
              <Frame style={{ padding: "22px 28px", minWidth: 220, textAlign: "left", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: COLORS.slate, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: COLORS.cream }}>{value}</div>
                </div>
              </Frame>
            );
            return href
              ? <a key={label} href={href} style={{ textDecoration: "none", color: "inherit" }}>{inner}</a>
              : <div key={label}>{inner}</div>;
          })}
        </div>
      </Reveal>
    </section>
  );
}

/* ── App ── */
export default function App() {
  return (
    <div style={{ background: "#000", color: "#EAEAEA", fontFamily: "Inter, sans-serif", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes pulse { 0%{ box-shadow:0 0 0 0 rgba(255,255,255,0.4); } 70%{ box-shadow:0 0 0 8px rgba(255,255,255,0); } 100%{ box-shadow:0 0 0 0 rgba(255,255,255,0); } }
        @keyframes fadeUp { from{ opacity:0; transform:translateY(18px);} to{ opacity:1; transform:translateY(0);} }
        @keyframes float { 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-12px);} }
        @keyframes livepulse { 0%,100%{ opacity:1; } 50%{ opacity:0.55; } }
        @media (max-width:900px) { .float-chip { display: none !important; } }
        @media (max-width:860px) {
          .about-grid { grid-template-columns: 1fr !important; }
          .edu-grid { grid-template-columns: 1fr !important; }
          .skills-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width:720px) {
          .navlinks { display: none !important; }
          .feat-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <Starfield />

      {/* Ambient overlays */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.05), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.04), transparent 45%)", pointerEvents: "none", zIndex: 0 }} />

      <Nav />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        <Hero />
        <About />

        {/* Education with grid class for responsive */}
        <section id="education" style={{ padding: "120px 0" }}>
          <Reveal>
            <div style={{ marginBottom: 56 }}>
              <Eyebrow>02 — BACKGROUND</Eyebrow>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-0.01em" }}>Education</h2>
            </div>
          </Reveal>
          <div className="edu-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { period: "2022 — PRESENT", title: "B.Tech — Computer Science & Engineering", sub: "Visakha Institute of Engineering and Technology, Visakhapatnam", score: "7.5 CGPA", barWidth: "75%" },
              { period: "2022", title: "Class XII", sub: "Andhra Pradesh Board of Intermediate Education", score: "61.6%", barWidth: "62%" },
              { period: "2020", title: "Class X", sub: "Andhra Pradesh Board of Secondary Education", score: "80%", barWidth: "80%" },
              { period: "CERTIFICATION", title: "Legacy Responsive Web Design", sub: "Certification Course — Responsive layout fundamentals", score: null, barWidth: "0%" },
            ].map((item, i) => <EduCard key={i} item={item} index={i} />)}
          </div>
        </section>

        <Projects />
        <Internships />
        <Skills />
        <Contact />

        <footer style={{ textAlign: "center", padding: "40px 0", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: COLORS.slate, borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 60 }}>
          Designed & built by Manoj Gathram <span style={{ color: COLORS.coral }}>·</span> 2026
        </footer>
      </div>
    </div>
  );
}