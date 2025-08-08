import React, { useState, useEffect } from 'react'

function AreaBox({ rows, cols, filled, label }) {
  const total = rows * cols
  const cells = Array.from({ length: total })
  return (
    <div className="area-card">
      <div
        className="area-grid"
        style={{
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`
        }}
      >
        {cells.map((_, i) => (
          <div key={i} className={"area-cell" + (i < filled ? " filled" : "")} />
        ))}
      </div>
      <div className="area-label">{label}</div>
    </div>
  )
}

const FRACTIONS = [
  { rows: 1, cols: 2, filled: 1, label: '½', num: 1, den: 2 },
  { rows: 1, cols: 3, filled: 1, label: '⅓', num: 1, den: 3 },
  { rows: 1, cols: 3, filled: 2, label: '⅔', num: 2, den: 3 },
  { rows: 1, cols: 4, filled: 1, label: '¼', num: 1, den: 4 },
  { rows: 1, cols: 4, filled: 3, label: '¾', num: 3, den: 4 }
]

const STEP_MESSAGES = [
  'This is our fraction! Click the forward button to see how to simplify!',
  "Let's multiply the numerator and denominator!",
]

export default function App() {
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [showMultiplier, setShowMultiplier] = useState(false)
  const [showEquals, setShowEquals] = useState(false)
  const [showProduct, setShowProduct] = useState(false)

  const resetStep2Visuals = () => {
    setShowMultiplier(false)
    setShowEquals(false)
    setShowProduct(false)
  }

  useEffect(() => {
    // Reset step visuals when step changes
    resetStep2Visuals()

    let multTimer
    let eqTimer
    let prodTimer

    if (step === 1) {
      multTimer = setTimeout(() => setShowMultiplier(true), 1000)
      eqTimer = setTimeout(() => setShowEquals(true), 1400)
      prodTimer = setTimeout(() => setShowProduct(true), 1800)
    }
    return () => {
      clearTimeout(multTimer)
      clearTimeout(eqTimer)
      clearTimeout(prodTimer)
    }
  }, [step])

  const randomize = () => {
    setIdx((current) => {
      if (FRACTIONS.length <= 1) return 0
      let next = current
      while (next === current) {
        next = Math.floor(Math.random() * FRACTIONS.length)
      }
      return next
    })
    setStep(0)
    resetStep2Visuals()
  }

  const goPrev = () => {
    setStep((s) => {
      const next = Math.max(0, s - 1)
      if (next <= 1) resetStep2Visuals()
      return next
    })
  }
  const goNext = () => {
    setStep((s) => {
      const next = Math.min(STEP_MESSAGES.length - 1, s + 1)
      if (next === 1) resetStep2Visuals()
      return next
    })
  }

  const f = FRACTIONS[idx]
  const factor = f.den === 3 ? 3 : 2
  const pNum = f.num * factor
  const pDen = f.den * factor

  return (
    <div className="page">
      <div className="card">
        <div className="titlebar">
          <h2 className="title">Simplifying Fractions</h2>
          <div className="actions">
            <button className="random-btn" type="button" onClick={randomize}>Random</button>
            <button className="reset-btn" type="button">Reset</button>
          </div>
        </div>

        <div className="interactive-shell">
          <div className="content-row">
            <div className="area-side">
              <AreaBox rows={f.rows} cols={f.cols} filled={f.filled} label={f.label} />
            </div>
            <div className={`fraction-side ${step === 1 ? 'compact' : ''}`}>
              <div className={`frac-wrap ${showMultiplier ? 'with-mult' : ''}`}>
                <span className="fraction-large" aria-label={`fraction ${f.num} over ${f.den}`}>
                  <span className="numerator">{f.num}</span>
                  <span className="bar" />
                  <span className="denominator">{f.den}</span>
                </span>
                {step === 1 && (
                  <span className={`multiplier appear ${showMultiplier ? 'visible' : ''}`} aria-label={`times ${factor} over ${factor}`}>
                    ×
                    <span className="mini-frac">
                      <span className="mini-num">{factor}</span>
                      <span className="bar" />
                      <span className="mini-den">{factor}</span>
                    </span>
                  </span>
                )}
                {step === 1 && (
                  <span className={`equals appear ${showEquals ? 'visible' : ''}`} aria-hidden="true">=</span>
                )}
                {step === 1 && (
                  <span className={`fraction-large result appear ${showProduct ? 'visible' : ''}`} aria-label={`fraction ${pNum} over ${pDen}`}>
                    <span className="numerator">{pNum}</span>
                    <span className="bar" />
                    <span className="denominator">{pDen}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="nav">
            <button className="nav-btn" aria-label="previous" onClick={goPrev}>&lt;</button>
            <button className="nav-btn" aria-label="next" onClick={goNext}>&gt;</button>
          </div>

          <div className="coach">
            <div className="mascot" aria-hidden="true">
              <div className="eyes">
                <span />
                <span />
              </div>
            </div>
            <div className="bubble">{STEP_MESSAGES[step]}</div>
          </div>
        </div>
      </div>
    </div>
  )
} 