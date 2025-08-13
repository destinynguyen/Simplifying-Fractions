import React, { useState, useEffect } from 'react'
import flexiWave from './Flexi_Wave.svg'
import flexiIdea from './Flexi_Idea.svg'
import flexiStars from './Flexi_Stars.svg'
import flexiTeacher from './Flexi_Teacher (1).svg'

function AreaBox({ rows, cols, filled, label, lineState = 'none', lineCount = 1, additionalLines = 0 }) {
  const total = rows * cols
  const cells = Array.from({ length: total })
  const showLines = lineState !== 'none'
  const totalLines = showLines ? Math.max(0, lineCount + (additionalLines || 0)) : 0
  const lines = Array.from({ length: totalLines })
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
  'Click next to multiply the fraction!',
  "Let's multiply the numerator and denominator!",
  'Choose the correct match!',
  "Now, let's simplify the fraction!",
]

export default function App() {
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [showMultiplier, setShowMultiplier] = useState(false)
  const [showEquals, setShowEquals] = useState(false)
  const [showProduct, setShowProduct] = useState(false)
  const [animCycle, setAnimCycle] = useState(0)
  const [introActive, setIntroActive] = useState(false)
  const [introShifted, setIntroShifted] = useState(false)
  const [introAreaShown, setIntroAreaShown] = useState(false)
  const [introAreaMsg, setIntroAreaMsg] = useState(false)
  const [introNextPrompt, setIntroNextPrompt] = useState(false)
  const [extraLineCount, setExtraLineCount] = useState(0)
  const [step2Options, setStep2Options] = useState([])
  const [step2CorrectChosen, setStep2CorrectChosen] = useState(false)
  const [step2WrongIdx, setStep2WrongIdx] = useState(-1)
  const [step2ChosenLines, setStep2ChosenLines] = useState(1)

  // Reset transient show states; keep extraLineCount so lines persist into step 3
  const resetShowStates = () => {
    setShowMultiplier(false)
    setShowEquals(false)
    setShowProduct(false)
  }

  useEffect(() => {
    // step 0: show message for 1s, animate fraction to position, then reveal area and brief area-model message
    let msgTimer
    let areaTimer
    let areaMsgTimer
    if (step === 0) {
      setIntroActive(true)
      setIntroShifted(true)
      setIntroAreaShown(false)
      setIntroAreaMsg(false)
      setIntroNextPrompt(false)
      msgTimer = setTimeout(() => {
        setIntroActive(false)
        setIntroShifted(false) // triggers CSS transition to final position
        areaTimer = setTimeout(() => {
          setIntroAreaShown(true)
          setIntroAreaMsg(true)
          areaMsgTimer = setTimeout(() => { setIntroAreaMsg(false); setIntroNextPrompt(true); }, 1500)
        }, 450)
      }, 1500)
    } else {
      setIntroActive(false)
      setIntroShifted(false)
      setIntroAreaShown(true)
      setIntroAreaMsg(false)
      setIntroNextPrompt(false)
    }
    return () => {
      clearTimeout(msgTimer)
      clearTimeout(areaTimer)
      clearTimeout(areaMsgTimer)
    }
  }, [step])

  useEffect(() => {
    // Reset visuals when step changes or when a reset occurs on the same step
    resetShowStates()

    let multTimer
    let eqTimer
    let prodTimer

    const baseDelay = step === 3 ? 1000 : 0

    if (step === 1 || step === 3) {
      multTimer = setTimeout(() => setShowMultiplier(true), baseDelay + 1000)
      eqTimer = setTimeout(() => setShowEquals(true), baseDelay + 1400)
      prodTimer = setTimeout(() => setShowProduct(true), baseDelay + 1800)
    } else if (step === 2) {
      // Interstitial page: keep product visible immediately
      multTimer = setTimeout(() => setShowMultiplier(true), 0)
      eqTimer = setTimeout(() => setShowEquals(true), 0)
      prodTimer = setTimeout(() => setShowProduct(true), 0)
      // Build choices
      setStep2CorrectChosen(false)
      setStep2WrongIdx(-1)
      buildStep2Choices()
    }
    return () => {
      clearTimeout(multTimer)
      clearTimeout(eqTimer)
      clearTimeout(prodTimer)
    }
  }, [step, animCycle])

  const handleReset = () => {
    // Reset only the current step's visuals and restart its timers
    resetShowStates()
    setExtraLineCount(0)
    setStep2CorrectChosen(false)
    setStep2WrongIdx(-1)
    setStep2ChosenLines(1)
    setAnimCycle((c) => c + 1)
    if (step === 0) {
      setIntroActive(true)
      setIntroShifted(true)
      setIntroAreaShown(false)
      setIntroAreaMsg(false)
      setIntroNextPrompt(false)
      setTimeout(() => {
        setIntroActive(false)
        setIntroShifted(false)
        setTimeout(() => {
          setIntroAreaShown(true)
          setIntroAreaMsg(true)
          setTimeout(() => { setIntroAreaMsg(false); setIntroNextPrompt(true); }, 1500)
        }, 450)
      }, 1500)
    }
  }

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
    resetShowStates()
    setExtraLineCount(0)
    setStep2CorrectChosen(false)
    setStep2WrongIdx(-1)
    setStep2ChosenLines(1)
    setIntroActive(true)
    setIntroShifted(true)
    setIntroAreaShown(false)
    setIntroAreaMsg(false)
    setIntroNextPrompt(false)
    setTimeout(() => {
      setIntroActive(false)
      setIntroShifted(false)
      setTimeout(() => {
        setIntroAreaShown(true)
        setIntroAreaMsg(true)
        setTimeout(() => { setIntroAreaMsg(false); setIntroNextPrompt(true); }, 1500)
      }, 450)
    }, 1500)
  }

  const goPrev = () => {
    setStep((s) => {
      const next = Math.max(0, s - 1)
      if (next <= 1) resetShowStates()
      return next
    })
  }
  const goNext = () => {
    setStep((s) => {
      const next = Math.min(STEP_MESSAGES.length - 1, s + 1)
      if (next === 1) resetShowStates()
      return next
    })
  }

  const f = FRACTIONS[idx]
  const baseFactor = f.den === 3 ? 3 : 2
  const maxExtra = Math.max(0, 6 - baseFactor)
  const factor = step >= 1 ? baseFactor + extraLineCount : baseFactor
  const pNum = f.num * factor
  const pDen = f.den * factor
  const lineCount = factor - 1

  // Step-aware equation pieces
  const isStep3 = step === 3
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
  } else if (step === 3) {
    lineState = showProduct ? 'erase' : 'present'
  } else if (step === 2) {
    lineState = 'none'
  }

  const coachImg = step === 3 && showProduct ? flexiTeacher : step === 3 ? flexiStars : step === 1 ? flexiIdea : flexiWave
  const coachClass = step === 3 ? (showProduct ? 'flexi flexi-teacher' : 'flexi flexi-big') : 'flexi'
  const bubbleClass = step === 3 ? `bubble bubble-left-more ${showProduct ? 'bubble-down' : ''}` : step === 1 ? 'bubble bubble-step1-down' : 'bubble'

  const introMsg1 = 'Here is our fraction!'
  const introMsg2 = "And here is the fraction's area model!"
  const step3FinalMsg = 'Multiply and simplify, and you\u2019ll return to the fraction you started with!'
  const step1NextMsg = 'Add another line or click next to simplify!'

  let bubbleText
  if (step === 0) {
    if (introActive) bubbleText = introMsg1
    else if (introAreaMsg) bubbleText = introMsg2
    else if (introNextPrompt) bubbleText = STEP_MESSAGES[0]
    else bubbleText = introMsg1
  } else if (step === 1 && showProduct) {
    bubbleText = step1NextMsg
  } else if (step === 3 && showProduct) {
    bubbleText = step3FinalMsg
  } else {
    bubbleText = STEP_MESSAGES[step]
  }

  const addLine = () => setExtraLineCount((c) => Math.min(maxExtra, c + 1))

  // Build three options for step 2: one correct (lines present with lineCount), two wrong
  const buildStep2Choices = () => {
    // Correct option: SAME fraction, with horizontal lines to match factor
    const randomLines = () => Math.max(1, Math.min(3, Math.floor(Math.random() * 3) + 1))
    const correct = { isCorrect: true, f, lineState: 'present', lineCount: randomLines() }
    // Wrong options: DIFFERENT fractions (with horizontal lines too)
    const poolIdxs = FRACTIONS.map((_, i) => i).filter((i) => i !== idx)
    // shuffle pool
    for (let i = poolIdxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[poolIdxs[i], poolIdxs[j]] = [poolIdxs[j], poolIdxs[i]]
    }
    const wrong1F = FRACTIONS[poolIdxs[0]]
    const wrong2F = FRACTIONS[poolIdxs[1] || poolIdxs[0]]
    const wrong1 = { isCorrect: false, f: wrong1F, lineState: 'present', lineCount: randomLines() }
    const wrong2 = { isCorrect: false, f: wrong2F, lineState: 'present', lineCount: randomLines() }
    const arr = [correct, wrong1, wrong2]
    // shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setStep2Options(arr)
  }

  const handleChoose = (opt, idx) => {
    if (opt.isCorrect) {
      setStep2CorrectChosen(true)
      setStep2WrongIdx(-1)
      setStep2ChosenLines(opt.lineCount || 1)
    } else {
      setStep2WrongIdx(idx)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="titlebar">
          <h2 className="title">Simplifying Fractions</h2>
          <div className="actions">
            <button className="random-btn" type="button" onClick={randomize}>Random</button>
            <button className="reset-btn" type="button" onClick={handleReset}>Reset</button>
          </div>
        </div>

        <div className="interactive-shell">
          <div className={`content-row ${step === 1 ? 'step1-up' : ''} ${step === 2 ? 'step2-top' : ''}`}>
            <div className={`area-side ${step === 0 && !introAreaShown ? 'intro-hide' : ''}`}>
              {step === 1 && showProduct && (
                <div className="toolbox">
                  <button className="tool-btn" type="button" onClick={addLine} disabled={extraLineCount >= maxExtra}>Add line</button>
                </div>
              )}
              <AreaBox
                rows={f.rows}
                cols={f.cols}
                filled={f.filled}
                label={f.label}
                lineState={lineState}
                lineCount={lineCount}
                additionalLines={0}
              />
            </div>
            {step !== 2 && (
              <div className={`fraction-side ${step >= 1 ? 'compact' : ''} ${step === 0 && introShifted ? 'intro-left' : ''}`}>
                <div className={`frac-wrap ${showMultiplier ? 'with-mult' : ''}`}>
                  <span className="fraction-large" aria-label={`fraction ${leftNum} over ${leftDen}`}>
                    <span className="numerator">{leftNum}</span>
                    <span className="bar" />
                    <span className="denominator">{leftDen}</span>
                  </span>
                  {(step >= 1) && (
                    <span className={`multiplier appear ${showMultiplier ? 'visible' : ''}`} aria-label={multiplierAria}>
                      {operatorSymbol}
                      <span className={`mini-frac ${showMultiplier ? 'glow' : ''}`}>
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
            )}
          </div>

          {step === 2 && !step2CorrectChosen && (
            <div className="choices">
              {step2Options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className={`choice ${step2WrongIdx === i ? 'wrong' : ''}`}
                  onClick={() => handleChoose(opt, i)}
                >
                  <AreaBox
                    rows={(opt.f || f).rows}
                    cols={(opt.f || f).cols}
                    filled={(opt.f || f).filled}
                    label={(opt.f || f).label}
                    lineState={opt.lineState}
                    lineCount={opt.lineCount}
                  />
                </button>
              ))}
            </div>
          )}

          {step === 2 && step2CorrectChosen && (
            <div className="compare-row">
              <AreaBox rows={f.rows} cols={f.cols} filled={f.filled} label={f.label} lineState={'none'} lineCount={lineCount} />
              <AreaBox rows={f.rows} cols={f.cols} filled={f.filled} label={f.label} lineState={'present'} lineCount={step2ChosenLines} />
            </div>
          )}

          <div className="nav">
            <button className="nav-btn" aria-label="previous" onClick={goPrev}>&lt;</button>
            <button className="nav-btn" aria-label="next" onClick={goNext}>&gt;</button>
          </div>

          <div className="coach">
            <img className={coachClass} src={coachImg} alt="" />
            <div className={bubbleClass}>{bubbleText}</div>
          </div>
        </div>
      </div>
    </div>
  )
} 