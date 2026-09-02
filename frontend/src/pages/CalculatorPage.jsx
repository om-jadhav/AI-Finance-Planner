import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const inr = (num) => `₹ ${Math.round(num).toLocaleString('en-IN')}`;
const pct = (val, min, max) => ((val - min) / (max - min)) * 100;
const sliderBg = (val, min, max) => {
  const p = pct(val, min, max);
  return `linear-gradient(to right, #1f6f4a 0%, #1f6f4a ${p}%, #d9dce6 ${p}%, #d9dce6 100%)`;
};

// ─── Reusable slider + typeable number field ─────────────
// Lets the value be set either by dragging the range slider
// or by typing directly into the pill next to the label.
const SliderField = ({ label, value, min, max, step, onChange, prefix = '', suffix = '', minLabel, maxLabel, inputWidth = 70 }) => {
  const [text, setText] = useState(String(value));

  // Keep the typed text in sync when the slider (or another control) changes the value.
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = (raw) => {
    let num = parseFloat(raw);
    if (isNaN(num)) num = min;
    num = Math.min(max, Math.max(min, num));
    onChange(num);
    setText(String(num));
  };

  return (
    <div className="slider-group">
      <div className="slider-label-row">
        <label>{label}</label>
        <div className="slider-input-group">
          {prefix && <span className="io-affix">{prefix}</span>}
          <input
            type="number"
            className="slider-number-input"
            style={{ width: inputWidth }}
            value={text}
            step={step}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
          />
          {suffix && <span className="io-affix">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ background: sliderBg(value, min, max) }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-minmax"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  );
};

const CalculatorPage = () => {
  // ─── View State ──────────────────────────────────────────
  const [view, setView] = useState('select'); // 'select' | 'sip' | 'swp' | 'emi'

  // ─── SIP State ──────────────────────────────────────────
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipReturn, setSipReturn] = useState(12);
  const [sipYears, setSipYears] = useState(10);
  const [sipResult, setSipResult] = useState(null);
  const [sipChartData, setSipChartData] = useState([]);

  // ─── SWP State ──────────────────────────────────────────
  const [swpCorpus, setSwpCorpus] = useState(2000000);
  const [swpReturn, setSwpReturn] = useState(10);
  const [swpYears, setSwpYears] = useState(15);
  const [swpMaxWithdrawal, setSwpMaxWithdrawal] = useState(0);
  const [swpWithdrawal, setSwpWithdrawal] = useState(0);
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

  // Maximum monthly withdrawal that exactly exhausts the corpus by the end of the tenure.
  const calculateSWPMax = () => {
    const P = swpCorpus;
    const r = swpReturn / 100 / 12;
    const n = swpYears * 12;
    if (P <= 0 || r <= 0 || n <= 0) {
      setSwpMaxWithdrawal(0);
      return;
    }
    const growth = Math.pow(1 + r, n);
    const maxW = (P * growth * r) / (growth - 1);
    setSwpMaxWithdrawal(maxW);
    setSwpWithdrawal(maxW); // default the withdrawal slider to the max whenever corpus/return/tenure change
  };

  // Corpus remaining at the end of the tenure for whatever withdrawal amount is actually chosen.
  const calculateSWPResult = () => {
    const P = swpCorpus;
    const r = swpReturn / 100 / 12;
    const n = swpYears * 12;
    if (P <= 0 || r <= 0 || n <= 0 || swpWithdrawal < 0) {
      setSwpResult(null);
      return;
    }
    const growth = Math.pow(1 + r, n);
    const remaining = P * growth - swpWithdrawal * ((growth - 1) / r);
    setSwpResult({
      remainingCorpus: Math.max(remaining, 0),
      totalWithdrawal: swpWithdrawal * n,
      depleted: remaining <= P * 0.001,
    });
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
  useEffect(() => { if (view === 'swp') calculateSWPMax(); }, [swpCorpus, swpReturn, swpYears, view]);
  useEffect(() => { if (view === 'swp') calculateSWPResult(); }, [swpWithdrawal, swpCorpus, swpReturn, swpYears, view]);
  useEffect(() => { if (view === 'emi') calculateEMI(); }, [emiLoan, emiRate, emiMonths, view]);

  // ─── Render: Selection ─────────────────────────────────

  const renderSelection = () => (
    <>
      <div className="calc-page-header">
        <div className="page-icon"><i className="fas fa-calculator"></i></div>
        <h1>Financial Calculators</h1>
        <p className="subtitle">Choose a tool to get started</p>
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

          <SliderField
            label="Monthly Investment"
            value={sipMonthly}
            min={500} max={100000} step={500}
            onChange={setSipMonthly}
            prefix="₹" inputWidth={90}
            minLabel="₹500" maxLabel="₹1,00,000"
          />
          <SliderField
            label="Expected Return"
            value={sipReturn}
            min={1} max={30} step={0.5}
            onChange={setSipReturn}
            suffix="%" inputWidth={55}
            minLabel="1%" maxLabel="30%"
          />
          <SliderField
            label="Tenure"
            value={sipYears}
            min={1} max={30} step={1}
            onChange={setSipYears}
            suffix="yrs" inputWidth={55}
            minLabel="1 yr" maxLabel="30 yrs"
          />
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

          <SliderField
            label="Current Corpus"
            value={swpCorpus}
            min={100000} max={20000000} step={50000}
            onChange={setSwpCorpus}
            prefix="₹" inputWidth={110}
            minLabel="₹1,00,000" maxLabel="₹2,00,00,000"
          />
          <SliderField
            label="Expected Return"
            value={swpReturn}
            min={1} max={25} step={0.5}
            onChange={setSwpReturn}
            suffix="%" inputWidth={55}
            minLabel="1%" maxLabel="25%"
          />
          <SliderField
            label="Tenure"
            value={swpYears}
            min={1} max={30} step={1}
            onChange={setSwpYears}
            suffix="yrs" inputWidth={55}
            minLabel="1 yr" maxLabel="30 yrs"
          />

          <div className="max-withdrawal-box">
            <i className="fas fa-circle-info"></i>
            <div>
              <span className="mw-label">Max sustainable monthly withdrawal</span>
              <span className="mw-value">{inr(swpMaxWithdrawal)}</span>
            </div>
          </div>

          <SliderField
            label="Your Monthly Withdrawal"
            value={swpWithdrawal}
            min={0} max={Math.max(Math.round(swpMaxWithdrawal), 1)} step={500}
            onChange={setSwpWithdrawal}
            prefix="₹" inputWidth={90}
            minLabel="₹0" maxLabel={inr(swpMaxWithdrawal)}
          />
        </div>

        <div className="card result-panel">
          <div className="result-eyebrow"><i className="fas fa-piggy-bank"></i> Corpus After Tenure</div>
          <div className="result-amount">{swpResult ? inr(swpResult.remainingCorpus) : '—'}</div>
          {swpResult && (
            <>
              <div className="result-stats">
                <div className="stat">
                  <span className="stat-label">Monthly Withdrawal</span>
                  <span className="stat-value accent">{inr(swpWithdrawal)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Withdrawn</span>
                  <span className="stat-value">{inr(swpResult.totalWithdrawal)}</span>
                </div>
              </div>
              <div className="result-note">
                {swpResult.depleted
                  ? 'At this withdrawal rate, your corpus is fully used up by the end of the tenure.'
                  : "This is what's left in your corpus after withdrawing every month for the full tenure."}
              </div>
            </>
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

          <SliderField
            label="Loan Amount"
            value={emiLoan}
            min={10000} max={5000000} step={10000}
            onChange={setEmiLoan}
            prefix="₹" inputWidth={100}
            minLabel="₹10,000" maxLabel="₹50,00,000"
          />
          <SliderField
            label="Interest Rate"
            value={emiRate}
            min={1} max={24} step={0.5}
            onChange={setEmiRate}
            suffix="%" inputWidth={55}
            minLabel="1%" maxLabel="24%"
          />
          <SliderField
            label="Tenure"
            value={emiMonths}
            min={6} max={360} step={6}
            onChange={setEmiMonths}
            suffix="mo" inputWidth={65}
            minLabel="6 mo" maxLabel="360 mo"
          />
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
    <div className="dashboard-layout">
      <Sidebar active="calculator" />

      <main className="dashboard-main calculator-page">
      <style>{`
        /* ─── RESET & BASE ─── */
        .calculator-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .calculator-page {
          background: #f4f6fb;
          color: #1e1e2f;
          font-family: 'DM Sans', -apple-system, sans-serif;
        }
        .calculator-page h1, .calculator-page h2, .calculator-page h3, .calculator-page h4,
        .calculator-page .nav-logo, .calculator-page .card-header h3,
        .calculator-page .calc-page-header h1, .calculator-page .select-card h3,
        .calculator-page .result-amount {
          font-family: 'DM Sans','Monrope', -apple-system ,sans-serif;
        }

        /* ─── SCROLLBAR ─── */
        .calculator-page ::-webkit-scrollbar { width: 6px; }
        .calculator-page ::-webkit-scrollbar-track { background: #eef0f5; }
        .calculator-page ::-webkit-scrollbar-thumb { background: #b7b9cc; border-radius: 12px; }
        .calculator-page ::-webkit-scrollbar-thumb:hover { background: #9a9caf; }

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
          font-family:'DM Sans', 'Monrope', sans-serif;
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
          gap: 10px;
        }
        .slider-label-row label {
          font-weight: 500;
          color: #5a5a72;
          font-size: 14px;
        }

        /* ─── TYPEABLE VALUE PILL ─── */
        .slider-input-group {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f0f7f3;
          border: 1px solid transparent;
          border-radius: 20px;
          padding: 4px 12px;
          transition: 0.2s;
        }
        .slider-input-group:focus-within {
          border-color: #1f6f4a;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(31, 111, 74, 0.12);
        }
        .slider-input-group .io-affix {
          color: #1f6f4a;
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
        }
        .slider-number-input {
          border: none;
          background: transparent;
          outline: none;
          font-weight: 600;
          font-size: 13px;
          color: #1f6f4a;
          text-align: right;
          font-family: 'DM Sans', sans-serif;
        }
        .slider-number-input::-webkit-outer-spin-button,
        .slider-number-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .slider-number-input[type="number"] {
          -moz-appearance: textfield;
          appearance: textfield;
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

        /* ─── MAX WITHDRAWAL CALLOUT ─── */
        .max-withdrawal-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f0f7f3;
          border: 1px solid #d9ede1;
          border-radius: 14px;
          padding: 12px 16px;
          margin: 4px 0 24px;
        }
        .max-withdrawal-box i { color: #1f6f4a; font-size: 18px; }
        .max-withdrawal-box .mw-label {
          display: block;
          font-size: 12px;
          color: #5a5a72;
        }
        .max-withdrawal-box .mw-value {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: #1f6f4a;
          font-family: 'DM Sans','Monrope', sans-serif;
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
        .result-note {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.18);
          font-size: 12.5px;
          color: rgba(255,255,255,0.75);
          line-height: 1.5;
        }

        /* ─── CHART ─── */
        .chart-container { margin-top: 24px; overflow-x: auto; }
        .chart-container h4 {
          font-size: 16px;
          margin-bottom: 16px;
          text-align: center;
          font-family:'DM Sans', 'Monrope', sans-serif;
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
          .calc-main { padding: 24px 16px; }
          .chart-bars { height: 150px; }
          .bar-wrapper { height: 130px; }
          .bar { width: 10px; }
          .bar-group { min-width: 20px; }
          .result-amount { font-size: 28px; }
        }
      `}</style>

      {/* ─── MAIN ─── */}
      <div className="calc-main">
        {view === 'select' && renderSelection()}
        {view === 'sip' && renderSIP()}
        {view === 'swp' && renderSWP()}
        {view === 'emi' && renderEMI()}
      </div>
      </main>
    </div>
  );
};

export default CalculatorPage;