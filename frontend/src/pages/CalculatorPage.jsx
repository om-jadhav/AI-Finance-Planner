import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const inr = (num) => `₹ ${Math.round(num).toLocaleString('en-IN')}`;
const pct = (val, min, max) => ((val - min) / (max - min)) * 100;
const sliderBg = (val, min, max) => {
  const p = pct(val, min, max);
  return `linear-gradient(to right, #1f6f4a 0%, #1f6f4a ${p}%, #d9dce6 ${p}%, #d9dce6 100%)`;
};

const CalculatorPage = () => {
  const navigate = useNavigate();

  // ─── View State ──────────────────────────────────────────
  const [view, setView] = useState('select'); // 'select' | 'sip' | 'swp' | 'emi'

  // ─── SIP State ──────────────────────────────────────────
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipReturn, setSipReturn] = useState(12);
  const [sipYears, setSipYears] = useState(10);
  const [sipResult, setSipResult] = useState(null);
  const [sipChartData, setSipChartData] = useState([]);

  // ─── SWP State ──────────────────────────────────────────
  const [swpMonthly, setSwpMonthly] = useState(10000);
  const [swpReturn, setSwpReturn] = useState(10);
  const [swpYears, setSwpYears] = useState(15);
  const [swpResult, setSwpResult] = useState(null);

  // ─── EMI State ──────────────────────────────────────────
  const [emiLoan, setEmiLoan] = useState(500000);
  const [emiRate, setEmiRate] = useState(8);
  const [emiMonths, setEmiMonths] = useState(60);
  const [emiResult, setEmiResult] = useState(null);

  // ─── Calculations ──────────────────────────────────────

  const calculateSIP = () => {
    const P = sipMonthly;
    const r = sipReturn / 100 / 12;
    const n = sipYears * 12;
    if (P <= 0 || r <= 0 || n <= 0) {
      setSipResult(null);
      setSipChartData([]);
      return;
    }
    const fv = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = P * n;
    setSipResult({ futureValue: fv, invested, returns: fv - invested });

    const data = [];
    for (let y = 1; y <= sipYears; y++) {
      const months = y * 12;
      const investedY = P * months;
      const totalY = P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
      data.push({ year: y, invested: investedY, total: totalY });
    }
    setSipChartData(data);
  };

  const calculateSWP = () => {
    const w = swpMonthly;
    const r = swpReturn / 100 / 12;
    const n = swpYears * 12;
    if (w <= 0 || r <= 0 || n <= 0) {
      setSwpResult(null);
      return;
    }
    const pv = w * (1 - Math.pow(1 + r, -n)) / r * (1 + r);
    setSwpResult({ corpus: pv, totalWithdrawal: w * n });
  };

  const calculateEMI = () => {
    const P = emiLoan;
    const r = emiRate / 100 / 12;
    const n = emiMonths;
    if (P <= 0 || r <= 0 || n <= 0) {
      setEmiResult(null);
      return;
    }
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    setEmiResult({ emi, totalPayment, totalInterest: totalPayment - P });
  };

  useEffect(() => { if (view === 'sip') calculateSIP(); }, [sipMonthly, sipReturn, sipYears, view]);
  useEffect(() => { if (view === 'swp') calculateSWP(); }, [swpMonthly, swpReturn, swpYears, view]);
  useEffect(() => { if (view === 'emi') calculateEMI(); }, [emiLoan, emiRate, emiMonths, view]);

  // ─── Render: Selection ─────────────────────────────────

  const renderSelection = () => (
    <>
      <div className="calc-page-header">
        <div className="page-icon"><i className="fas fa-calculator"></i></div>
        <h1>Financial Calculators</h1>
        <p className="subtitle">Choose a tool to get started — no login required.</p>
      </div>

      <div className="cards-grid">
        <div className="select-card" onClick={() => setView('sip')}>
          <div className="select-card-icon"><i className="fas fa-chart-line"></i></div>
          <div className="card-header">
            <h3>SIP Calculator</h3>
            <span className="badge">Systematic Investment</span>
          </div>
          <p>Plan your monthly investments for future goals.</p>
          <div className="card-cta">Open calculator <i className="fas fa-arrow-right"></i></div>
        </div>

        <div className="select-card" onClick={() => setView('swp')}>
          <div className="select-card-icon"><i className="fas fa-hand-holding-usd"></i></div>
          <div className="card-header">
            <h3>SWP Calculator</h3>
            <span className="badge">Systematic Withdrawal</span>
          </div>
          <p>Find the corpus needed for regular withdrawals.</p>
          <div className="card-cta">Open calculator <i className="fas fa-arrow-right"></i></div>
        </div>

        <div className="select-card" onClick={() => setView('emi')}>
          <div className="select-card-icon"><i className="fas fa-credit-card"></i></div>
          <div className="card-header">
            <h3>EMI Calculator</h3>
            <span className="badge">Loan Installment</span>
          </div>
          <p>Calculate your monthly loan repayment amount.</p>
          <div className="card-cta">Open calculator <i className="fas fa-arrow-right"></i></div>
        </div>
      </div>
    </>
  );

  // ─── Render: SIP ────────────────────────────────────────

  const renderSIP = () => (
    <>
      <button className="btn-back" onClick={() => setView('select')}>
        <i className="fas fa-arrow-left"></i> Back to calculators
      </button>

      <div className="calc-layout">
        <div className="card calc-inputs-card">
          <div className="card-header">
            <h3><i className="fas fa-chart-line"></i> SIP Calculator</h3>
            <span className="badge">Systematic Investment</span>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Monthly Investment</label>
              <span className="slider-value">₹{sipMonthly.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min="500" max="100000" step="500" value={sipMonthly}
              style={{ background: sliderBg(sipMonthly, 500, 100000) }}
              onChange={(e) => setSipMonthly(Number(e.target.value))} />
            <div className="slider-minmax"><span>₹500</span><span>₹1,00,000</span></div>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Expected Return</label>
              <span className="slider-value">{sipReturn}% p.a.</span>
            </div>
            <input type="range" min="1" max="30" step="0.5" value={sipReturn}
              style={{ background: sliderBg(sipReturn, 1, 30) }}
              onChange={(e) => setSipReturn(Number(e.target.value))} />
            <div className="slider-minmax"><span>1%</span><span>30%</span></div>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Tenure</label>
              <span className="slider-value">{sipYears} years</span>
            </div>
            <input type="range" min="1" max="30" step="1" value={sipYears}
              style={{ background: sliderBg(sipYears, 1, 30) }}
              onChange={(e) => setSipYears(Number(e.target.value))} />
            <div className="slider-minmax"><span>1 yr</span><span>30 yrs</span></div>
          </div>
        </div>

        <div className="card result-panel">
          <div className="result-eyebrow"><i className="fas fa-coins"></i> Future Value</div>
          <div className="result-amount">{sipResult ? inr(sipResult.futureValue) : '—'}</div>
          {sipResult && (
            <div className="result-stats">
              <div className="stat">
                <span className="stat-label">Invested Amount</span>
                <span className="stat-value">{inr(sipResult.invested)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Est. Returns</span>
                <span className="stat-value accent">{inr(sipResult.returns)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {sipChartData.length > 0 && (
        <div className="card chart-container">
          <h4>Invested vs Total Value per Year</h4>
          <div className="chart-bars">
            {sipChartData.map((item) => {
              const maxVal = Math.max(...sipChartData.map(d => d.total));
              const invH = (item.invested / maxVal) * 100;
              const totH = (item.total / maxVal) * 100;
              return (
                <div key={item.year} className="bar-group">
                  <div className="bar-wrapper">
                    <div className="bar invested" style={{ height: `${invH}%` }}></div>
                    <div className="bar total" style={{ height: `${totH}%` }}></div>
                  </div>
                  <div className="bar-label">{item.year}y</div>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span><span className="legend-dot invested-dot"></span> Invested</span>
            <span><span className="legend-dot total-dot"></span> Total Value</span>
          </div>
        </div>
      )}
    </>
  );

  // ─── Render: SWP ────────────────────────────────────────

  const renderSWP = () => (
    <>
      <button className="btn-back" onClick={() => setView('select')}>
        <i className="fas fa-arrow-left"></i> Back to calculators
      </button>

      <div className="calc-layout">
        <div className="card calc-inputs-card">
          <div className="card-header">
            <h3><i className="fas fa-hand-holding-usd"></i> SWP Calculator</h3>
            <span className="badge">Systematic Withdrawal</span>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Monthly Withdrawal</label>
              <span className="slider-value">₹{swpMonthly.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min="1000" max="100000" step="500" value={swpMonthly}
              style={{ background: sliderBg(swpMonthly, 1000, 100000) }}
              onChange={(e) => setSwpMonthly(Number(e.target.value))} />
            <div className="slider-minmax"><span>₹1,000</span><span>₹1,00,000</span></div>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Expected Return</label>
              <span className="slider-value">{swpReturn}% p.a.</span>
            </div>
            <input type="range" min="1" max="25" step="0.5" value={swpReturn}
              style={{ background: sliderBg(swpReturn, 1, 25) }}
              onChange={(e) => setSwpReturn(Number(e.target.value))} />
            <div className="slider-minmax"><span>1%</span><span>25%</span></div>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Tenure</label>
              <span className="slider-value">{swpYears} years</span>
            </div>
            <input type="range" min="1" max="30" step="1" value={swpYears}
              style={{ background: sliderBg(swpYears, 1, 30) }}
              onChange={(e) => setSwpYears(Number(e.target.value))} />
            <div className="slider-minmax"><span>1 yr</span><span>30 yrs</span></div>
          </div>
        </div>

        <div className="card result-panel">
          <div className="result-eyebrow"><i className="fas fa-piggy-bank"></i> Required Corpus</div>
          <div className="result-amount">{swpResult ? inr(swpResult.corpus) : '—'}</div>
          {swpResult && (
            <div className="result-stats">
              <div className="stat">
                <span className="stat-label">Total Withdrawn</span>
                <span className="stat-value">{inr(swpResult.totalWithdrawal)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Over</span>
                <span className="stat-value accent">{swpYears} years</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ─── Render: EMI ────────────────────────────────────────

  const renderEMI = () => (
    <>
      <button className="btn-back" onClick={() => setView('select')}>
        <i className="fas fa-arrow-left"></i> Back to calculators
      </button>

      <div className="calc-layout">
        <div className="card calc-inputs-card">
          <div className="card-header">
            <h3><i className="fas fa-credit-card"></i> EMI Calculator</h3>
            <span className="badge">Loan Installment</span>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Loan Amount</label>
              <span className="slider-value">₹{emiLoan.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min="10000" max="5000000" step="10000" value={emiLoan}
              style={{ background: sliderBg(emiLoan, 10000, 5000000) }}
              onChange={(e) => setEmiLoan(Number(e.target.value))} />
            <div className="slider-minmax"><span>₹10,000</span><span>₹50,00,000</span></div>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Interest Rate</label>
              <span className="slider-value">{emiRate}% p.a.</span>
            </div>
            <input type="range" min="1" max="24" step="0.5" value={emiRate}
              style={{ background: sliderBg(emiRate, 1, 24) }}
              onChange={(e) => setEmiRate(Number(e.target.value))} />
            <div className="slider-minmax"><span>1%</span><span>24%</span></div>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Tenure</label>
              <span className="slider-value">{emiMonths} months</span>
            </div>
            <input type="range" min="6" max="360" step="6" value={emiMonths}
              style={{ background: sliderBg(emiMonths, 6, 360) }}
              onChange={(e) => setEmiMonths(Number(e.target.value))} />
            <div className="slider-minmax"><span>6 mo</span><span>360 mo</span></div>
          </div>
        </div>

        <div className="card result-panel">
          <div className="result-eyebrow"><i className="fas fa-wallet"></i> Monthly EMI</div>
          <div className="result-amount">{emiResult ? inr(emiResult.emi) : '—'}</div>
          {emiResult && (
            <div className="result-stats">
              <div className="stat">
                <span className="stat-label">Total Interest</span>
                <span className="stat-value accent">{inr(emiResult.totalInterest)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Payment</span>
                <span className="stat-value">{inr(emiResult.totalPayment)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ─── Main Render ────────────────────────────────────────

  return (
    <div className="calculator-page">
      <style>{`
        /* ─── RESET & BASE ─── */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .calculator-page {
          background: #f4f6fb;
          min-height: 100vh;
          color: #1e1e2f;
          font-family: 'DM Sans', -apple-system, sans-serif;
        }
        .calculator-page h1, .calculator-page h2, .calculator-page h3, .calculator-page h4,
        .calculator-page .nav-logo, .calculator-page .card-header h3,
        .calculator-page .calc-page-header h1, .calculator-page .select-card h3,
        .calculator-page .result-amount {
          font-family: 'DM-sans','Monrope', -apple-system, sans-serif;
        }

        /* ─── SCROLLBAR ─── */
        .calculator-page ::-webkit-scrollbar { width: 6px; }
        .calculator-page ::-webkit-scrollbar-track { background: #eef0f5; }
        .calculator-page ::-webkit-scrollbar-thumb { background: #b7b9cc; border-radius: 12px; }
        .calculator-page ::-webkit-scrollbar-thumb:hover { background: #9a9caf; }

        /* ─── TOP NAV ─── */
        .calc-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 40px;
          background: #ffffff;
          border-bottom: 1px solid #edeff4;
          flex-wrap: wrap;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .calc-nav .nav-logo {
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1e1e2f;
          cursor: pointer;
          font-family: 'DM-sans','Monrope', sans-serif;
        }
        .calc-nav .nav-logo i { color: #1f6f4a; }
        .calc-nav .nav-back {
          background: transparent;
          border: 1px solid #d9dce6;
          color: #1e1e2f;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 40px;
          transition: 0.2s;
        }
        .calc-nav .nav-back:hover { background: #f0effb; border-color: #1f6f4a; }

        /* ─── MAIN CONTENT ─── */
        .calc-main {
          max-width: 980px;
          margin: 0 auto;
          padding: 40px 30px 60px;
        }

        /* ─── PAGE HEADER ─── */
        .calc-page-header { text-align: center; margin-bottom: 36px; }
        .page-icon {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          background: #f0f7f3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .page-icon i { font-size: 24px; color: #1f6f4a; }
        .calc-page-header h1 {
          font-size: 30px;
          font-weight: 700;
        }
        .calc-page-header .subtitle {
          color: #6b6b85;
          margin-top: 6px;
          font-size: 16px;
        }

        /* ─── CARDS GRID (selection) ─── */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .select-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 28px 26px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          border: 1px solid #edeff4;
          transition: 0.2s;
          cursor: pointer;
          text-align: left;
        }
        .select-card:hover { border-color: #1f6f4a; transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.04); }
        .select-card-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: #f0f7f3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .select-card-icon i { font-size: 20px; color: #1f6f4a; }

        /* ─── SHARED CARD ─── */
        .card {
          background: #ffffff;
          border-radius: 24px;
          padding: 26px 28px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          border: 1px solid #edeff4;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 10px;
          flex-wrap: wrap;
        }
        .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM-sans','Monrope', sans-serif;
        }
        .card-header h3 i { color: #1f6f4a; font-size: 18px; }
        .card-header .badge {
          background: #f0f7f3;
          color: #1f6f4a;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 14px;
          border-radius: 40px;
          white-space: nowrap;
        }
        .select-card p { color: #6b6b85; font-size: 14px; margin-top: 4px; }
        .card-cta {
          margin-top: 16px;
          color: #1f6f4a;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-cta i { font-size: 12px; }

        /* ─── BACK BUTTON ─── */
        .btn-back {
          background: transparent;
          border: none;
          color: #1f6f4a;
          font-weight: 600;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 0 0 20px 0;
          transition: 0.2s;
        }
        .btn-back:hover { color: #165a3a; }

        /* ─── CALCULATOR LAYOUT ─── */
        .calc-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
          align-items: start;
        }

        /* ─── SLIDERS ─── */
        .slider-group { margin-bottom: 24px; }
        .slider-group:last-child { margin-bottom: 4px; }
        .slider-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .slider-label-row label {
          font-weight: 500;
          color: #5a5a72;
          font-size: 14px;
        }
        .slider-value {
          background: #f0f7f3;
          color: #1f6f4a;
          font-weight: 600;
          font-size: 13px;
          padding: 3px 12px;
          border-radius: 20px;
        }
        .slider-group input[type="range"] {
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          border-radius: 10px;
          outline: none;
        }
        .slider-group input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #ffffff;
          border: 3px solid #1f6f4a;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(31, 111, 74, 0.3);
        }
        .slider-group input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #ffffff;
          border: 3px solid #1f6f4a;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(31, 111, 74, 0.3);
        }
        .slider-minmax {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          font-size: 11.5px;
          color: #9a9caf;
        }

        /* ─── RESULT PANEL ─── */
        .result-panel {
          background: linear-gradient(160deg, #1f6f4a, #164f36);
          border: none;
          color: #ffffff;
        }
        .result-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          margin-bottom: 8px;
        }
        .result-amount {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 22px;
          line-height: 1.2;
        }
        .result-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.18);
        }
        .stat { display: flex; flex-direction: column; gap: 4px; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.65); }
        .stat-value { font-size: 15px; font-weight: 600; color: #ffffff; }
        .stat-value.accent { color: #a9e6c4; }

        /* ─── CHART ─── */
        .chart-container { margin-top: 24px; overflow-x: auto; }
        .chart-container h4 {
          font-size: 16px;
          margin-bottom: 16px;
          text-align: center;
          font-family: 'Monrope', sans-serif;
        }
        .chart-bars {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 200px;
          gap: 4px;
          padding: 0 4px;
          min-width: max-content;
        }
        .bar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1 0 auto;
          min-width: 26px;
        }
        .bar-wrapper {
          display: flex;
          gap: 3px;
          height: 176px;
          width: 100%;
          justify-content: center;
          align-items: flex-end;
        }
        .bar {
          width: 14px;
          border-radius: 4px 4px 0 0;
          min-height: 2px;
          transition: height 0.2s;
        }
        .bar.invested { background: #4a6cf7; }
        .bar.total { background: #1f6f4a; }
        .bar-label {
          font-size: 11px;
          color: #6b6b85;
          margin-top: 6px;
          white-space: nowrap;
        }
        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 12px;
          font-size: 13px;
          color: #5a5a72;
        }
        .legend-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 4px;
          margin-right: 6px;
        }
        .legend-dot.invested-dot { background: #4a6cf7; }
        .legend-dot.total-dot { background: #1f6f4a; }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 800px) {
          .calc-layout { grid-template-columns: 1fr; }
          .cards-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 700px) {
          .calc-nav { padding: 12px 16px; }
          .calc-main { padding: 24px 16px; }
          .chart-bars { height: 150px; }
          .bar-wrapper { height: 130px; }
          .bar { width: 10px; }
          .bar-group { min-width: 20px; }
          .result-amount { font-size: 28px; }
        }
      `}</style>

      {/* ─── TOP NAV ─── */}
      <nav className="calc-nav">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <i className="fas fa-wallet"></i> FinPlan
        </div>
        <button className="nav-back" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
      </nav>

      {/* ─── MAIN ─── */}
      <div className="calc-main">
        {view === 'select' && renderSelection()}
        {view === 'sip' && renderSIP()}
        {view === 'swp' && renderSWP()}
        {view === 'emi' && renderEMI()}
      </div>
    </div>
  );
};

export default CalculatorPage;