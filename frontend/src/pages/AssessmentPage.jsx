import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Quiz data ────────────────────────────────────────────
// Each option carries points; the sum across 5 questions maxes out at 100.
const QUESTIONS = [
  {
    id: 'savings',
    icon: 'fa-piggy-bank',
    question: 'How would you describe your monthly savings habit?',
    options: [
      { label: 'I save more than 20% of my income', points: 25 },
      { label: 'I save 10–20% of my income', points: 18 },
      { label: 'I save something, but irregularly', points: 10 },
      { label: "I don't save currently", points: 2 },
    ],
  },
  {
    id: 'emergency',
    icon: 'fa-shield-alt',
    question: 'Do you have an emergency fund set aside?',
    options: [
      { label: 'Yes, 6+ months of expenses covered', points: 20 },
      { label: 'Yes, 1–3 months covered', points: 12 },
      { label: "A little saved, but not enough", points: 6 },
      { label: 'No emergency fund yet', points: 0 },
    ],
  },
  {
    id: 'debt',
    icon: 'fa-file-invoice-dollar',
    question: 'How would you describe your current debt situation?',
    options: [
      { label: "I don't have any debt", points: 20 },
      { label: 'Manageable debt, paid on time', points: 14 },
      { label: 'Some debt, occasionally stressful', points: 8 },
      { label: 'High debt, difficult to manage', points: 2 },
    ],
  },
  {
    id: 'budget',
    icon: 'fa-wallet',
    question: 'Do you track your monthly budget?',
    options: [
      { label: 'Yes, consistently', points: 15 },
      { label: 'Sometimes', points: 9 },
      { label: 'Rarely', points: 4 },
      { label: 'Never', points: 0 },
    ],
  },
  {
    id: 'investing',
    icon: 'fa-chart-line',
    question: 'Are you investing toward long-term goals like retirement?',
    options: [
      { label: 'Yes, regularly', points: 20 },
      { label: 'Occasionally', points: 12 },
      { label: 'Just started', points: 6 },
      { label: 'Not yet', points: 0 },
    ],
  },
];

// Score bands, each with its own tip and a gradient that shifts
// green → amber → red as the score drops.
const BANDS = [
  {
    min: 80,
    label: 'Excellent Financial Health',
    tip: "You're in great shape. Keep up the habits that got you here and consider stretching your investment goals further.",
    from: '#1f6f4a',
    to: '#164f36',
  },
  {
    min: 60,
    label: 'Good Financial Health',
    tip: 'A solid foundation. A few small changes — like building a bigger emergency fund — could push you into excellent territory.',
    from: '#2f7d5c',
    to: '#1d5940',
  },
  {
    min: 40,
    label: 'Needs Attention',
    tip: "There's room to strengthen your finances. Start with one habit at a time — budgeting is usually the easiest place to begin.",
    from: '#c97a2b',
    to: '#8f5518',
  },
  {
    min: 0,
    label: 'At Risk',
    tip: "It's a good time to build a plan. Small, consistent steps — even saving a little each month — can turn this around.",
    from: '#c94444',
    to: '#8f2e2e',
  },
];

const getBand = (score) => BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('quiz'); // 'quiz' | 'result'
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  const totalQuestions = QUESTIONS.length;
  const progress = step === 'result' ? 100 : (current / totalQuestions) * 100;

  const selectOption = (option) => {
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);

    if (current + 1 < totalQuestions) {
      setCurrent(current + 1);
    } else {
      const total = nextAnswers.reduce((sum, a) => sum + a.points, 0);
      setScore(total);
      setStep('result');
    }
  };

  const goBack = () => {
    if (current === 0) return;
    setAnswers(answers.slice(0, -1));
    setCurrent(current - 1);
  };

  const restart = () => {
    setAnswers([]);
    setCurrent(0);
    setScore(0);
    setAnimatedScore(0);
    setStep('quiz');
  };

  // Animate the score ring up when results appear
  useEffect(() => {
    if (step !== 'result') return;
    let raf;
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, score]);

  const ringCircumference = 2 * Math.PI * 70;
  const ringOffset = ringCircumference * (1 - animatedScore / 100);
  const band = getBand(score);
  const question = QUESTIONS[current];

  return (
    <div className="assess-page">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .assess-page {
          background: #f4f6fb;
          min-height: 100vh;
          color: #1e1e2f;
          font-family: 'DM Sans', -apple-system, sans-serif;
        }
        .assess-page h1, .assess-page h2, .assess-page h3,
        .assess-page .nav-logo, .assess-page .band-label {
          font-family: 'Monrope', -apple-system, sans-serif;
        }

        /* ─── NAV ─── */
        .assess-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 40px;
          background: #ffffff;
          border-bottom: 1px solid #edeff4;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .assess-nav .nav-logo {
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1e1e2f;
          cursor: pointer;
        }
        .assess-nav .nav-logo i { color: #1f6f4a; }
        .assess-nav .nav-back {
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
        .assess-nav .nav-back:hover { background: #f0effb; border-color: #1f6f4a; }

        /* ─── MAIN ─── */
        .assess-main {
          max-width: 640px;
          margin: 0 auto;
          padding: 44px 24px 60px;
        }

        /* ─── PROGRESS ─── */
        .progress-track {
          width: 100%;
          height: 6px;
          background: #edeff4;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1f6f4a, #3a9b6a);
          border-radius: 20px;
          transition: width 0.3s ease;
        }
        .progress-label {
          text-align: right;
          font-size: 12.5px;
          color: #9a9caf;
          margin-bottom: 28px;
        }

        /* ─── QUESTION CARD ─── */
        .question-card {
          background: #ffffff;
          border: 1px solid #edeff4;
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .question-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: #f0f7f3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .question-icon i { font-size: 20px; color: #1f6f4a; }
        .question-card h2 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 24px;
          line-height: 1.35;
        }
        .options-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .option-btn {
          text-align: left;
          background: #f8fbf9;
          border: 1px solid #edeff4;
          border-radius: 16px;
          padding: 16px 18px;
          font-size: 15px;
          font-weight: 500;
          color: #1e1e2f;
          cursor: pointer;
          transition: 0.15s;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .option-btn:hover { border-color: #1f6f4a; background: #f0f7f3; transform: translateX(2px); }
        .option-btn i { color: #1f6f4a; font-size: 13px; opacity: 0; transition: 0.15s; }
        .option-btn:hover i { opacity: 1; }

        .quiz-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }
        .btn-text-back {
          background: none;
          border: none;
          color: #6b6b85;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 4px;
          visibility: hidden;
        }
        .btn-text-back.visible { visibility: visible; }
        .btn-text-back:hover { color: #1f6f4a; }

        /* ─── RESULT ─── */
        .result-card {
          background: linear-gradient(160deg, #1f6f4a, #164f36);
          border-radius: 28px;
          padding: 44px 34px;
          text-align: center;
          color: #ffffff;
        }
        .ring-wrap { position: relative; width: 160px; height: 160px; margin: 0 auto 20px; }
        .ring-wrap svg { transform: rotate(-90deg); width: 160px; height: 160px; }
        .ring-track { fill: none; stroke: rgba(255,255,255,0.18); stroke-width: 12; }
        .ring-fill { fill: none; stroke: #ffffff; stroke-width: 12; stroke-linecap: round; }
        .ring-number {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .ring-number .big { font-size: 36px; font-weight: 700; font-family: 'Monrope', sans-serif; line-height: 1; }
        .ring-number .small { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 4px; }
        .band-label {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          padding: 6px 18px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 16px;
        }
        .result-card .band-tip {
          color: rgba(255,255,255,0.88);
          font-size: 15px;
          max-width: 440px;
          margin: 0 auto 28px;
          line-height: 1.6;
        }
        .result-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 300px;
          margin: 0 auto;
        }
        .btn-result-primary {
          background: #ffffff;
          color: #1f6f4a;
          border: none;
          padding: 14px 24px;
          border-radius: 40px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-result-primary:hover { background: #f0f7f3; transform: translateY(-2px); }
        .btn-result-secondary {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.4);
          padding: 12px 24px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-result-secondary:hover { background: rgba(255,255,255,0.1); }
        .retake-link {
          margin-top: 20px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          cursor: pointer;
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .assess-main { padding: 28px 16px 48px; }
          .question-card { padding: 28px 22px; }
          .result-card { padding: 34px 22px; }
        }
      `}</style>

      <nav className="assess-nav">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <i className="fas fa-wallet"></i> FinPlan
        </div>
        <button className="nav-back" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
      </nav>

      <div className="assess-main">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-label">
          {step === 'quiz' ? `Question ${current + 1} of ${totalQuestions}` : 'Complete'}
        </div>

        {step === 'quiz' && (
          <div className="question-card">
            <div className="question-icon"><i className={`fas ${question.icon}`}></i></div>
            <h2>{question.question}</h2>
            <div className="options-list">
              {question.options.map((opt) => (
                <button key={opt.label} className="option-btn" onClick={() => selectOption(opt)}>
                  {opt.label}
                  <i className="fas fa-arrow-right"></i>
                </button>
              ))}
            </div>
            <div className="quiz-nav-row">
              <button className={`btn-text-back${current > 0 ? ' visible' : ''}`} onClick={goBack}>
                <i className="fas fa-arrow-left"></i> Previous question
              </button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div
            className="result-card"
            style={{ background: `linear-gradient(160deg, ${band.from}, ${band.to})` }}
          >
            <div className="ring-wrap">
              <svg viewBox="0 0 160 160">
                <circle className="ring-track" cx="80" cy="80" r="70" />
                <circle
                  className="ring-fill"
                  cx="80" cy="80" r="70"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="ring-number">
                <span className="big">{animatedScore}</span>
                <span className="small">out of 100</span>
              </div>
            </div>
            <div className="band-label">{band.label}</div>
            <p className="band-tip">{band.tip}</p>
            <div className="result-actions">
              <button
                className="btn-result-primary"
                style={{ color: band.from }}
                onClick={() => navigate('/register')}
              >
                Create account for detailed plan
              </button>
              <button className="btn-result-secondary" onClick={() => navigate('/calculators')}>
                Explore Calculators
              </button>
            </div>
            <button className="retake-link" onClick={restart}>Retake the assessment</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;