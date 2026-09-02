import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [score, setScore] = useState(0);
  const heroRef = useRef(null);
  const targetScore = 78;

  // Single orchestrated reveal: count the health score up on first load
  useEffect(() => {
    let raf;
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(eased * targetScore));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scoreCircumference = 2 * Math.PI * 54;
  const scoreOffset = scoreCircumference * (1 - score / 100);

  const calculators = [
    {
      icon: 'fa-chart-line',
      title: 'SIP Calculator',
      desc: 'Estimate how your regular investments could grow over time.',
    },
    {
      icon: 'fa-arrow-trend-down',
      title: 'SWP Calculator',
      desc: 'Estimate your regular withdrawals and understand how long your investment corpus may last.',
    },
    {
      icon: 'fa-money-check-alt',
      title: 'EMI Calculator',
      desc: 'Calculate your monthly loan payment based on the loan amount, interest rate, and tenure.',
    },
  ];

  return (
    <div className="homepage">
      <style>{`
        /* ─── RESET & BASE ─── */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .homepage {
          background: #f4f6fb;
          min-height: 100vh;
          color: #1e1e2f;
          font-family: 'DM Sans', -apple-system, sans-serif;
          overflow-x: hidden;
        }
        .homepage h1, .homepage h2, .homepage h3, .homepage h4,
        .homepage .nav-logo, .homepage .brand, .homepage .feature-card h4,
        .homepage .calculator-card h4, .homepage .footer-brand,
        .homepage .footer-col h5 {
          font-family: 'DM Sans', 'Monrope', -apple-system, sans-serif;
        }

        /* ─── SCROLLBAR ─── */
        .homepage ::-webkit-scrollbar { width: 6px; }
        .homepage ::-webkit-scrollbar-track { background: #eef0f5; }
        .homepage ::-webkit-scrollbar-thumb { background: #b7b9cc; border-radius: 12px; }
        .homepage ::-webkit-scrollbar-thumb:hover { background: #9a9caf; }

        /* ─── LANDING NAV ─── */
        .landing-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 40px;
          background: #ffffff;
          border-bottom: 1px solid #edeff4;
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .landing-nav .nav-logo {
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1e1e2f;
          font-family: 'DM Sans', 'Monrope', -apple-system, sans-serif;
        }
        .landing-nav .nav-logo i { color: #1f6f4a; }
        .landing-nav .nav-links {
          display: flex;
          gap: 28px;
          font-weight: 500;
          color: #5a5a72;
        }
        .landing-nav .nav-links a {
          cursor: pointer;
          transition: 0.2s;
          text-decoration: none;
          color: inherit;
        }
        .landing-nav .nav-links a:hover { color: #1f6f4a; }
        .landing-nav .nav-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .nav-toggle {
          display: none;
          background: transparent;
          border: none;
          font-size: 20px;
          color: #1e1e2f;
          cursor: pointer;
        }
        .btn-outline {
          background: transparent;
          border: 1px solid #d9dce6;
          padding: 8px 20px;
          border-radius: 40px;
          font-weight: 600;
          color: #1e1e2f;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-outline:hover { background: #f0effb; border-color: #1f6f4a; }
        .btn-primary {
          background: #1f6f4a;
          border: none;
          padding: 8px 24px;
          border-radius: 40px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 12px rgba(31, 111, 74, 0.25);
        }
        .btn-primary:hover { background: #165a3a; transform: translateY(-2px); }

        /* ─── MOBILE NAV DROPDOWN ─── */
        .mobile-nav {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: #ffffff;
          border-bottom: 1px solid #edeff4;
          padding: 8px 20px 16px;
        }
        .mobile-nav.open { display: flex; }
        .mobile-nav a, .mobile-nav button {
          text-decoration: none;
          color: #1e1e2f;
          font-weight: 500;
          padding: 10px 4px;
          background: none;
          border: none;
          text-align: left;
          font-size: 15px;
          cursor: pointer;
        }

        /* ─── MAIN CONTENT ─── */
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 30px 60px;
        }

        /* ─── HERO ─── */
        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 48px;
          align-items: center;
          padding: 50px 0 30px;
        }
        .hero-copy h1 {
          font-size: 52px;
          font-weight: 700;
          letter-spacing: -1.5px;
          line-height: 1.1;
          background: linear-gradient(135deg, #1e1e2f, #1f6f4a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'DM Sans','Monrope', sans-serif;
        }
        .hero-copy p {
          color: #6b6b85;
          font-size: 19px;
          max-width: 480px;
          margin: 16px 0 28px;
        }
        .btn-hero {
          background: #1f6f4a;
          border: none;
          padding: 16px 44px;
          border-radius: 60px;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 8px 24px rgba(31, 111, 74, 0.35);
        }
        .btn-hero:hover { background: #165a3a; transform: scale(1.02); }
        .btn-hero i { margin-left: 10px; }
        .hero-tagline {
          margin-top: 18px;
          color: #1f6f4a;
          font-weight: 600;
          font-size: 15px;
        }

        /* ─── HERO VISUAL ─── */
        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-blob {
          position: absolute;
          width: 115%;
          height: 115%;
          z-index: 0;
        }

        /* ─── FINANCIAL HEALTH CARD ─── */
        .health-card {
          position: relative;
          z-index: 1;
          background: #ffffff;
          border-radius: 24px;
          padding: 28px 30px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 12px 34px rgba(30, 30, 47, 0.08);
          border: 1px solid #edeff4;
        }
        .health-card .health-eyebrow {
          font-size: 12px;
          font-weight: 600;
          color: #9a9caf;
          margin-bottom: 6px;
        }
        .health-card h3 {
          font-size: 17px;
          margin-bottom: 16px;
          font-family:'DM Sans', 'Monrope', sans-serif;
        }
        .health-score-row {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 18px;
        }
        .score-ring-wrap { position: relative; width: 84px; height: 84px; flex-shrink: 0; }
        .score-ring-wrap svg { transform: rotate(-90deg); width: 84px; height: 84px; }
        .score-ring-track { fill: none; stroke: #edeff4; stroke-width: 10; }
        .score-ring-fill { fill: none; stroke: #1f6f4a; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 0.1s linear; }
        .score-ring-number {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
          color: #1f6f4a;
          font-family: 'DM Sans','Monrope', sans-serif;
        }
        .score-label-block .score-out-of { color: #9a9caf; font-size: 13px; }
        .score-label-block .score-status {
          display: inline-block;
          margin-top: 4px;
          background: #f0f7f3;
          color: #1f6f4a;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
        }
        .health-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #edeff4;
        }
        .health-metrics-grid .metric {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .health-metrics-grid .metric-label {
          font-size: 12.5px;
          color: #9a9caf;
        }
        .health-metrics-grid .metric-value {
          font-size: 14px;
          font-weight: 600;
          color: #1e1e2f;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .health-metrics-grid .metric-value i { font-size: 12px; }
        .health-metrics-grid .metric-value.up i { color: #2ecc71; }
        .health-metrics-grid .metric-value.good i { color: #1f6f4a; }

        /* ─── FEATURES GRID ─── */
        .features-section { margin: 64px 0; text-align: center; }
        .features-section h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 36px;
          font-family: 'DM Sans','Monrope', sans-serif;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .feature-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 30px 20px;
          text-align: center;
          border: 1px solid #edeff4;
          transition: 0.2s;
        }
        .feature-card:hover { border-color: #1f6f4a; transform: translateY(-4px); }
        .feature-card .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: #f0f7f3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .feature-card .feature-icon i { font-size: 22px; color: #1f6f4a; }
        .feature-card h4 { font-size: 17px; margin-bottom: 8px; font-family: 'Monrope', sans-serif; }
        .feature-card p { color: #6b6b85; font-size: 14px; line-height: 1.5; }

        /* ─── ASSESSMENT SECTION ─── */
        .assessment-section {
          background: #ffffff;
          border: 1px solid #edeff4;
          border-radius: 28px;
          margin: 64px 0;
          padding: 48px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 40px;
          align-items: center;
        }
        .assessment-copy h2 {
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 10px;
          font-family: 'DM Sans','Monrope', sans-serif;
        }
        .assessment-copy > p.lead {
          color: #6b6b85;
          font-size: 16.5px;
          margin-bottom: 18px;
          max-width: 460px;
        }
        .assessment-copy ul {
          list-style: none;
          margin-bottom: 24px;
        }
        .assessment-copy ul li {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          color: #5a5a72;
          font-size: 14.5px;
          margin-bottom: 10px;
          max-width: 460px;
        }
        .assessment-copy ul li i { color: #1f6f4a; margin-top: 3px; flex-shrink: 0; }
        .assessment-note {
          margin-top: 14px;
          font-size: 13px;
          color: #9a9caf;
        }
        .assessment-visual {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ─── CALCULATORS SECTION ─── */
        .calculators-section { margin: 64px 0; text-align: center; }
        .calculators-section h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          font-family:'DM Sans', 'Monrope', sans-serif;
        }
        .calculators-section > p {
          color: #6b6b85;
          margin-bottom: 32px;
        }
        .calculators-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        .calculator-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 30px 24px;
          border: 1px solid #edeff4;
          text-align: left;
          transition: 0.2s;
          cursor: pointer;
        }
        .calculator-card:hover { border-color: #1f6f4a; transform: translateY(-4px); }
        .calculator-card .calc-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: #f0f7f3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .calculator-card .calc-icon i { font-size: 20px; color: #1f6f4a; }
        .calculator-card h4 { font-size: 18px; margin-bottom: 8px; font-family: 'Monrope', sans-serif; }
        .calculator-card p { color: #6b6b85; font-size: 14px; line-height: 1.5; }

        /* ─── FINAL CTA ─── */
        .cta-banner {
          background: linear-gradient(135deg, #1f6f4a, #164f36);
          border-radius: 28px;
          padding: 56px 30px;
          margin: 64px 0 16px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-banner h2 {
          color: #fff;
          font-size: 30px;
          font-family:'DM Sans', 'Monrope', sans-serif;
          margin-bottom: 18px;
          position: relative;
        }
        .cta-banner .cta-steps {
          list-style: none;
          color: rgba(255,255,255,0.9);
          font-size: 16px;
          margin-bottom: 28px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px 22px;
          position: relative;
        }
        .cta-banner .cta-steps li { display: flex; align-items: center; gap: 8px; }
        .cta-banner .cta-steps i { font-size: 13px; color: #b7e6cb; }
        .cta-banner .btn-hero {
          background: #ffffff;
          color: #1f6f4a;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          position: relative;
        }
        .cta-banner .btn-hero:hover { background: #f0f7f3; }
        .cta-banner .cta-footnote {
          margin-top: 16px;
          color: rgba(255,255,255,0.7);
          font-size: 13.5px;
          position: relative;
        }

        /* ─── FOOTER ─── */
        .footer {
          margin-top: 60px;
          padding-top: 48px;
          border-top: 1px solid #edeff4;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }
        .footer-brand {
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .footer-brand i { color: #1f6f4a; }
        .footer-grid .footer-about p {
          color: #6b6b85;
          font-size: 14px;
          max-width: 280px;
          line-height: 1.6;
        }
        .footer-col h5 {
          font-size: 14px;
          margin-bottom: 14px;
          color: #1e1e2f;
        }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col ul a {
          color: #6b6b85;
          text-decoration: none;
          font-size: 14px;
          transition: 0.2s;
        }
        .footer-col ul a:hover { color: #1f6f4a; }
        .footer-disclaimer {
          background: #f8fbf9;
          border: 1px solid #edeff4;
          border-radius: 14px;
          padding: 16px 20px;
          color: #6b6b85;
          font-size: 12.5px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .footer-disclaimer strong { color: #5a5a72; }
        .footer-bottom {
          text-align: center;
          color: #9a9caf;
          font-size: 13px;
          padding: 20px 0 12px;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-copy p { max-width: none; }
          .hero-visual { order: -1; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .calculators-grid { grid-template-columns: 1fr; }
          .assessment-section { grid-template-columns: 1fr; text-align: center; padding: 36px 24px; }
          .assessment-copy ul { text-align: left; }
          .assessment-copy > p.lead, .assessment-copy ul li { max-width: none; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .landing-nav .nav-links, .landing-nav .nav-actions .btn-outline { display: none; }
          .nav-toggle { display: block; }
          .main-content { padding: 24px 16px; }
        }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; }
          .hero-copy h1 { font-size: 36px; }
          .cta-banner .cta-steps { flex-direction: column; gap: 8px; }
        }
      `}</style>

      {/* ─── TOP NAV ─── */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <i className="fas fa-wallet"></i> FinPlan
        </div>
        <div className="nav-links">
          <a href="#top">Home</a>
          <a href="#features">Features</a>
          <a href="#calculators">Calculators</a>
        </div>
        <div className="nav-actions">
          <button className="btn-outline" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/register')}>Sign Up</button>
          <button className="nav-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            <i className={`fas ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>
      <div className={`mobile-nav${menuOpen ? ' open' : ''}`}>
        <a href="#top" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#calculators" onClick={() => setMenuOpen(false)}>Calculators</a>
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}>Sign Up</button>
      </div>

      {/* ─── MAIN ─── */}
      <div className="main-content" id="top" ref={heroRef}>
        {/* Hero */}
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>Plan your money.<br />Build your future.</h1>
            <p>A simple way to understand your finances, set goals, and plan your financial future.</p>
            <button className="btn-hero" onClick={() => navigate('/register')}>
              Start Planning <i className="fas fa-arrow-right"></i>
            </button>
            <div className="hero-tagline">Your finances, simplified.</div>
          </div>

          <div className="hero-visual">
            <svg className="hero-blob" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e6f3ec" />
                  <stop offset="100%" stopColor="#d6ede1" />
                </linearGradient>
              </defs>
              <path fill="url(#blobGrad)">
                <animate
                  attributeName="d"
                  dur="14s"
                  repeatCount="indefinite"
                  values="M144,-160C186,-140,216,-96,232,-46C248,4,250,60,226,104C202,148,152,180,100,196C48,212,-6,212,-56,194C-106,176,-152,140,-176,92C-200,44,-202,-16,-182,-64C-162,-112,-120,-148,-74,-170C-28,-192,22,-200,66,-190C110,-180,102,-180,144,-160Z;
                          M158,-176C202,-148,222,-92,224,-38C226,16,208,66,178,108C148,150,106,184,56,198C6,212,-52,206,-96,180C-140,154,-170,108,-186,58C-202,8,-204,-46,-182,-92C-160,-138,-114,-176,-64,-198C-14,-220,42,-226,88,-208C134,-190,114,-204,158,-176Z;
                          M144,-160C186,-140,216,-96,232,-46C248,4,250,60,226,104C202,148,152,180,100,196C48,212,-6,212,-56,194C-106,176,-152,140,-176,92C-200,44,-202,-16,-182,-64C-162,-112,-120,-148,-74,-170C-28,-192,22,-200,66,-190C110,-180,102,-180,144,-160Z"
                />
              </path>
              <g transform="translate(200,200)">
                <path d="M-110,60 L-60,10 L-20,40 L40,-40 L110,-90" fill="none" stroke="#1f6f4a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                <circle cx="110" cy="-90" r="8" fill="#1f6f4a" opacity="0.6" />
              </g>
            </svg>

            <div className="health-card">
              <div className="health-eyebrow">Example</div>
              <h3>Financial Health</h3>
              <div className="health-score-row">
                <div className="score-ring-wrap">
                  <svg viewBox="0 0 120 120">
                    <circle className="score-ring-track" cx="60" cy="60" r="54" />
                    <circle
                      className="score-ring-fill"
                      cx="60" cy="60" r="54"
                      strokeDasharray={scoreCircumference}
                      strokeDashoffset={scoreOffset}
                    />
                  </svg>
                  <div className="score-ring-number">{score}</div>
                </div>
                <div className="score-label-block">
                  <div className="score-out-of">out of 100</div>
                  <span className="score-status">Good Financial Health</span>
                </div>
              </div>
              <div className="health-metrics-grid">
                <div className="metric">
                  <span className="metric-label">Savings</span>
                  <span className="metric-value up"><i className="fas fa-arrow-up"></i> 24%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Goals</span>
                  <span className="metric-value good"><i className="fas fa-bullseye"></i> 3 / 5</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Budget</span>
                  <span className="metric-value good"><i className="fas fa-check-circle"></i> On Track</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Investments</span>
                  <span className="metric-value up"><i className="fas fa-arrow-up"></i> Growing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="features-section" id="features">
          <h2>Everything you need to plan better</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-bullseye"></i></div>
              <h4>Set Financial Goals</h4>
              <p>Turn your dreams into achievable financial goals and track your progress over time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-wallet"></i></div>
              <h4>Manage Your Budget</h4>
              <p>Understand where your money goes and create a budget that works for you.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-chart-pie"></i></div>
              <h4>Plan Your Investments</h4>
              <p>Explore different investment options and understand how your money can grow over time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-shield-alt"></i></div>
              <h4>Build Financial Security</h4>
              <p>Plan for emergencies, manage debt, and work toward a stronger financial future.</p>
            </div>
          </div>
        </div>

        {/* Financial Health Assessment */}
        <div className="assessment-section">
          <div className="assessment-copy">
            <h2>Not sure where to start?</h2>
            <p className="lead">Take a quick assessment to understand your financial health.</p>
            <ul>
              <li><i className="fas fa-check-circle"></i> Answer a few simple questions about your income, savings, expenses, and financial goals.</li>
              <li><i className="fas fa-check-circle"></i> Get a simple overview of your financial health and discover areas you can improve.</li>
            </ul>
            <button className="btn-primary" onClick={() => navigate('/assessment')}>
              Check My Financial Health <i className="fas fa-arrow-right"></i>
            </button>
            <div className="assessment-note">Takes approximately 2 minutes.</div>
          </div>
          <div className="assessment-visual">
            <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="90" cy="90" r="78" fill="#f8fbf9" />
              <circle cx="90" cy="90" r="66" fill="none" stroke="#e6ede9" strokeWidth="14" />
              <circle
                cx="90" cy="90" r="66" fill="none" stroke="#1f6f4a" strokeWidth="14"
                strokeDasharray={2 * Math.PI * 66}
                strokeDashoffset={2 * Math.PI * 66 * 0.28}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
              <g fontFamily="Monrope, sans-serif">
                <text x="90" y="84" textAnchor="middle" fontSize="26" fontWeight="700" fill="#1f6f4a">2 min</text>
                <text x="90" y="104" textAnchor="middle" fontSize="12" fill="#9a9caf">quick check</text>
              </g>
              <circle cx="90" cy="24" r="6" fill="#1f6f4a" />
            </svg>
          </div>
        </div>

        {/* Calculators */}
        <div className="calculators-section" id="calculators">
          <h2>Make better financial decisions with simple calculators</h2>
          <p>Explore easy-to-use calculators to estimate your investments and loan payments.</p>
          <div className="calculators-grid">
            {calculators.map((calc) => (
              <div className="calculator-card" key={calc.title} onClick={() => navigate('/calculators')}>
                <div className="calc-icon"><i className={`fas ${calc.icon}`}></i></div>
                <h4>{calc.title}</h4>
                <p>{calc.desc}</p>
              </div>
            ))}
          </div>
          <button className="btn-outline" onClick={() => navigate('/calculators')}>
            Explore All Calculators <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        {/* Final CTA */}
        <div className="cta-banner">
          <h2>Your financial future starts with a plan.</h2>
          <ul className="cta-steps">
            <li><i className="fas fa-check"></i> Understand your money</li>
            <li><i className="fas fa-check"></i> Set your goals</li>
            <li><i className="fas fa-check"></i> Build better financial habits</li>
          </ul>
          <button className="btn-hero" onClick={() => navigate('/register')}>
            Start Your Financial Journey <i className="fas fa-arrow-right"></i>
          </button>
          <div className="cta-footnote">It's simple, organized, and built around your goals.</div>
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-grid">
            <div className="footer-about">
              <div className="footer-brand"><i className="fas fa-wallet"></i> FinPlan</div>
              <p>Your simple companion for smarter financial planning.</p>
            </div>
            <div className="footer-col">
              <h5>Product</h5>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#assessment" onClick={(e) => { e.preventDefault(); navigate('/assessment'); }}>Financial Health</a></li>
                <li><a href="#goals" onClick={(e) => { e.preventDefault(); navigate('/goals'); }}>Goals</a></li>
                <li><a href="#calculators">Calculators</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Account</h5>
              <ul>
                <li><a href="#login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a></li>
                <li><a href="#signup" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Sign Up</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-disclaimer">
            <strong>Disclaimer:</strong> FinPlan is an educational and financial planning tool. Information provided on this platform is for educational purposes and should not be considered professional financial, investment, tax, or legal advice.
          </div>
          <div className="footer-bottom">© 2026 FinPlan. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;