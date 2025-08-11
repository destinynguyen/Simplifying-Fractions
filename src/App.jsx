import React, { useState, useEffect } from 'react'
import flexiWave from './Flexi_Wave.svg'

function AreaBox({ rows, cols, filled, label, lineState = 'none', lineCount = 1 }) {
  const total = rows * cols
  const cells = Array.from({ length: total })
  const showLines = lineState !== 'none'
  const lines = showLines ? Array.from({ length: Math.max(0, lineCount) }) : []
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
        {lines.map((_, i) => {
          const topPercent = ((i + 1) * 100) / (lines.length + 1)
          return (
            <div
              key={i}
              className={`line-draw ${lineState}`}
              style={{ top: `${topPercent}%` }}
              aria-hidden="true"
            />
          )
        })}
      </div>
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
  'Click next to multiply our fraction!',
  "Let's multiply the numerator and denominator!",
  "Now, let's simplify the fraction!",
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
    // Reset visuals when step changes
    resetStep2Visuals()

    let multTimer
    let eqTimer
    let prodTimer

    const baseDelay = step === 2 ? 1000 : 0

    if (step === 1 || step === 2) {
      multTimer = setTimeout(() => setShowMultiplier(true), baseDelay + 1000)
      eqTimer = setTimeout(() => setShowEquals(true), baseDelay + 1400)
      prodTimer = setTimeout(() => setShowProduct(true), baseDelay + 1800)
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
  const lineCount = factor - 1

  // Step-aware equation pieces
  const isStep3 = step === 2
  const leftNum = isStep3 ? pNum : f.num
  const leftDen = isStep3 ? pDen : f.den
  const operatorSymbol = isStep3 ? '÷' : '×'
  const resultNum = isStep3 ? f.num : pNum
  const resultDen = isStep3 ? f.den : pDen
  const multiplierAria = isStep3 ? `divided by ${factor} over ${factor}` : `times ${factor} over ${factor}`

  // Line behavior per step
  let lineState = 'none'
  if (step === 1) {
    lineState = showProduct ? 'draw' : 'none'
  } else if (step === 2) {
    lineState = showProduct ? 'erase' : 'present'
  }

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
              <AreaBox
                rows={f.rows}
                cols={f.cols}
                filled={f.filled}
                label={f.label}
                lineState={lineState}
                lineCount={lineCount}
              />
            </div>
            <div className={`fraction-side ${step >= 1 ? 'compact' : ''}`}>
              <div className={`frac-wrap ${showMultiplier ? 'with-mult' : ''}`}>
                <span className="fraction-large" aria-label={`fraction ${leftNum} over ${leftDen}`}>
                  <span className="numerator">{leftNum}</span>
                  <span className="bar" />
                  <span className="denominator">{leftDen}</span>
                </span>
                {(step >= 1) && (
                  <span className={`multiplier appear ${showMultiplier ? 'visible' : ''}`} aria-label={multiplierAria}>
                    {operatorSymbol}
                    <span className="mini-frac">
                      <span className="mini-num">{factor}</span>
                      <span className="bar" />
                      <span className="mini-den">{factor}</span>
                    </span>
                  </span>
                )}
                {(step >= 1) && (
                  <span className={`equals appear ${showEquals ? 'visible' : ''}`} aria-hidden="true">=</span>
                )}
                {(step >= 1) && (
                  <span className={`fraction-large result appear ${showProduct ? 'visible' : ''}`} aria-label={`fraction ${resultNum} over ${resultDen}`}>
                    <span className="numerator">{resultNum}</span>
                    <span className="bar" />
                    <span className="denominator">{resultDen}</span>
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
            <img className="flexi" src={flexiWave} alt="" />
            <div className="bubble">{STEP_MESSAGES[step]}</div>
          </div>
        </div>
      </div>
    </div>
  )
} 