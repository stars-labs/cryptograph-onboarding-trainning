import React, { useState, useMemo } from 'react';

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    color: '#eee',
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 20px 0',
    color: '#ce93d8',
    fontSize: '1.5rem',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    fontSize: '14px',
  },
  tabActive: {
    backgroundColor: '#16213e',
    color: '#ce93d8',
  },
  tabInactive: {
    backgroundColor: '#0f0f23',
    color: '#666',
  },
  section: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#16213e',
    borderRadius: '8px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#b39ddb',
    fontSize: '1.1rem',
  },
  label: {
    fontSize: '12px',
    color: '#90caf9',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '16px',
    width: '80px',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ce93d8',
    color: '#000',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    border: '1px solid #ce93d8',
    color: '#ce93d8',
  },
  matrixTable: {
    borderCollapse: 'collapse',
    fontFamily: 'monospace',
    fontSize: '14px',
    margin: '0 auto',
  },
  matrixCell: {
    padding: '8px 12px',
    textAlign: 'center',
    border: '1px solid #3a4a6b',
    minWidth: '44px',
    transition: 'all 0.3s ease',
  },
  matrixHeader: {
    padding: '8px 12px',
    textAlign: 'center',
    border: '1px solid #3a4a6b',
    color: '#90caf9',
    fontWeight: 'bold',
    backgroundColor: '#0f0f23',
  },
  matrixLabel: {
    padding: '8px 12px',
    textAlign: 'center',
    border: '1px solid #3a4a6b',
    fontWeight: 'bold',
    backgroundColor: '#0f0f23',
    whiteSpace: 'nowrap',
  },
  matrixInput: {
    width: '50px',
    padding: '6px',
    textAlign: 'center',
    backgroundColor: '#0f0f23',
    border: '1px solid #3a4a6b',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  matrixInputCorrect: {
    borderColor: '#4caf50',
    boxShadow: '0 0 8px rgba(76, 175, 80, 0.3)',
  },
  matrixInputIncorrect: {
    borderColor: '#f44336',
    boxShadow: '0 0 8px rgba(244, 67, 54, 0.3)',
  },
  result: {
    padding: '16px',
    borderRadius: '8px',
    marginTop: '16px',
    textAlign: 'center',
  },
  resultSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    border: '2px solid #4caf50',
  },
  resultFail: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    border: '2px solid #f44336',
  },
  explanation: {
    fontSize: '14px',
    color: '#bbb',
    marginTop: '8px',
    lineHeight: '1.7',
  },
  tooltip: {
    fontSize: '13px',
    color: '#aaa',
    backgroundColor: '#0f0f23',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px dashed #3a4a6b',
    marginTop: '12px',
    lineHeight: '1.6',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    marginLeft: '8px',
  },
  highlight: {
    color: '#ffcc80',
    fontWeight: 'bold',
  },
  constraintRow: {
    padding: '14px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '2px solid #3a4a6b',
    marginBottom: '10px',
    fontFamily: 'monospace',
    fontSize: '13px',
    transition: 'all 0.5s ease',
  },
  dotStep: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    margin: '2px',
    fontFamily: 'monospace',
    fontSize: '13px',
    transition: 'all 0.4s ease',
  },
};

// R1CS correct answers
const CORRECT_A = [
  [0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0],
  [5, 1, 0, 0, 1],
];
const CORRECT_B = [
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [1, 0, 0, 0, 0],
];
const CORRECT_C = [
  [0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1],
  [0, 0, 1, 0, 0],
];

const VAR_NAMES = ['1', 'x', 'y', 'sym₁', 'sym₂'];
const CONSTRAINT_LABELS = ['x × x = sym₁', 'sym₁ × x = sym₂', '(sym₂+x+5) × 1 = y'];

function computeWitness(x) {
  const sym1 = x * x;
  const sym2 = sym1 * x;
  const y = sym2 + x + 5;
  return [1, x, y, sym1, sym2];
}

function dot(vec1, vec2) {
  return vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
}

function emptyMatrix() {
  return [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ];
}

function parseCell(val) {
  if (val === '' || val === '-') return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

// ==================== Tab 1: 手动构造 ====================
function ManualConstructTab() {
  const [userA, setUserA] = useState(emptyMatrix);
  const [userB, setUserB] = useState(emptyMatrix);
  const [userC, setUserC] = useState(emptyMatrix);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Dummy witness for live feedback (x=3)
  const s = useMemo(() => computeWitness(3), []);

  function updateCell(setter, ri, ci, val) {
    setter(prev => {
      const next = prev.map(r => [...r]);
      next[ri][ci] = val;
      return next;
    });
    setChecked(false);
  }

  function checkMatrix(user, correct) {
    return user.map((row, ri) =>
      row.map((cell, ci) => {
        const v = parseCell(cell);
        return v === null ? null : v === correct[ri][ci];
      })
    );
  }

  const statusA = useMemo(() => (checked || revealed) ? checkMatrix(userA, CORRECT_A) : null, [checked, revealed, userA]);
  const statusB = useMemo(() => (checked || revealed) ? checkMatrix(userB, CORRECT_B) : null, [checked, revealed, userB]);
  const statusC = useMemo(() => (checked || revealed) ? checkMatrix(userC, CORRECT_C) : null, [checked, revealed, userC]);

  function handleReveal() {
    setUserA(CORRECT_A.map(r => [...r].map(String)));
    setUserB(CORRECT_B.map(r => [...r].map(String)));
    setUserC(CORRECT_C.map(r => [...r].map(String)));
    setRevealed(true);
    setChecked(true);
  }

  function handleCheck() {
    setChecked(true);
  }

  function handleReset() {
    setUserA(emptyMatrix());
    setUserB(emptyMatrix());
    setUserC(emptyMatrix());
    setChecked(false);
    setRevealed(false);
  }

  // Live dot product feedback for a given matrix, status row
  function liveDotFeedback(userMatrix, correctMatrix, matName, color) {
    return userMatrix.map((row, ri) => {
      const parsedRow = row.map(c => parseCell(c));
      const allFilled = parsedRow.every(v => v !== null);
      if (!allFilled) return null;
      const dotUser = parsedRow.reduce((sum, v, i) => sum + v * s[i], 0);
      const correctRow = correctMatrix[ri];
      const dotCorrect = correctRow.reduce((sum, v, i) => sum + v * s[i], 0);
      const match = dotUser === dotCorrect;
      return { ri, dotUser, dotCorrect, match };
    }).filter(Boolean);
  }

  const feedbackA = useMemo(() => liveDotFeedback(userA, CORRECT_A, 'A', '#ce93d8'), [userA, s]);
  const feedbackB = useMemo(() => liveDotFeedback(userB, CORRECT_B, 'B', '#90caf9'), [userB, s]);
  const feedbackC = useMemo(() => liveDotFeedback(userC, CORRECT_C, 'C', '#a5d6a7'), [userC, s]);

  function renderMatrix(label, color, userMatrix, setter, statusMatrix) {
    return (
      <div style={{ ...styles.section, border: `1px solid ${color}33` }}>
        <h3 style={{ ...styles.sectionTitle, color }}>矩阵 {label}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.matrixTable}>
            <thead>
              <tr>
                <th style={styles.matrixHeader}>约束</th>
                {VAR_NAMES.map((vn, i) => (
                  <th key={i} style={styles.matrixHeader}>{vn}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userMatrix.map((row, ri) => (
                <tr key={ri}>
                  <td style={{ ...styles.matrixLabel, color, fontSize: '12px' }}>
                    {CONSTRAINT_LABELS[ri]}
                  </td>
                  {row.map((cell, ci) => {
                    const cellStatus = statusMatrix ? statusMatrix[ri][ci] : null;
                    let extraStyle = {};
                    if (cellStatus === true) extraStyle = styles.matrixInputCorrect;
                    else if (cellStatus === false) extraStyle = styles.matrixInputIncorrect;
                    return (
                      <td key={ci} style={{ ...styles.matrixCell, padding: '6px' }}>
                        <input
                          type="number"
                          style={{ ...styles.matrixInput, ...extraStyle }}
                          value={cell}
                          onChange={e => updateCell(setter, ri, ci, e.target.value)}
                          disabled={revealed}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Aggregate live feedback for all 3 matrices
  const allFeedback = [...feedbackA, ...feedbackB, ...feedbackC];
  const anyFilled = allFeedback.length > 0;

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          目标表达式
          <span style={{ ...styles.badge, backgroundColor: '#ce93d8', color: '#000' }}>填写矩阵</span>
        </h3>
        <p style={styles.explanation}>
          将 <code style={{ color: '#ffcc80' }}>x³ + x + 5 = y</code> 拍平后得到 3 个约束：
        </p>
        <div style={{ fontFamily: 'monospace', lineHeight: '2.2', fontSize: '14px', padding: '8px 0' }}>
          {CONSTRAINT_LABELS.map((label, i) => (
            <div key={i}>
              <span style={{ ...styles.badge, backgroundColor: 'rgba(206,147,216,0.2)', color: '#ce93d8' }}>
                约束 {i + 1}
              </span>
              {'  '}{label}
            </div>
          ))}
        </div>
        <div style={styles.tooltip}>
          变量列顺序：<strong style={{ color: '#90caf9' }}>1 &nbsp; x &nbsp; y &nbsp; sym₁ &nbsp; sym₂</strong>。
          每个矩阵行对应一个约束，填入系数使 (A·s) × (B·s) = (C·s) 成立。
          填写时以 x=3 为例实时检验点积。
        </div>
      </div>

      {renderMatrix('A', '#ce93d8', userA, setUserA, statusA)}
      {renderMatrix('B', '#90caf9', userB, setUserB, statusB)}
      {renderMatrix('C', '#a5d6a7', userC, setUserC, statusC)}

      {/* Live dot product feedback */}
      {anyFilled && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>实时点积检验（x = 3）</h3>
          {[
            { feedbacks: feedbackA, label: 'A', color: '#ce93d8' },
            { feedbacks: feedbackB, label: 'B', color: '#90caf9' },
            { feedbacks: feedbackC, label: 'C', color: '#a5d6a7' },
          ].map(({ feedbacks, label, color }) =>
            feedbacks.map(({ ri, dotUser, dotCorrect, match }) => (
              <div
                key={`${label}-${ri}`}
                style={{
                  padding: '8px 12px',
                  marginBottom: '6px',
                  borderRadius: '6px',
                  backgroundColor: match ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                  border: `1px solid ${match ? '#4caf5044' : '#f4433644'}`,
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color, fontWeight: 'bold' }}>{label}[{ri + 1}]·s</span>
                <span style={{ color: '#aaa' }}>=</span>
                <span style={{ color: match ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>{dotUser}</span>
                <span style={{ color: '#555' }}>{match ? '== 正确' : `≠ 期望 ${dotCorrect}`}</span>
                <span>{match ? '✅' : '❌'}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button style={styles.button} onClick={handleCheck}>检查答案</button>
        <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={handleReveal}>
          显示答案
        </button>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary, borderColor: '#666', color: '#666' }}
          onClick={handleReset}
        >
          重置
        </button>
      </div>

      {/* Check result summary */}
      {checked && (
        <div style={{
          ...styles.result,
          ...(
            [statusA, statusB, statusC].every(sm =>
              sm && sm.every(row => row.every(v => v === true))
            ) ? styles.resultSuccess : styles.resultFail
          ),
        }}>
          {[statusA, statusB, statusC].every(sm =>
            sm && sm.every(row => row.every(v => v === true))
          ) ? (
            <span>所有矩阵填写正确！R1CS 约束构造完成。</span>
          ) : (
            <span>部分单元格有误，红色边框标出了错误位置，请继续调整。</span>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== Tab 2: 自动验证 ====================
function AutoVerifyTab() {
  const [xInput, setXInput] = useState('3');
  const [animStep, setAnimStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  const x = parseInt(xInput, 10);
  const validX = !isNaN(x);
  const s = useMemo(() => (validX ? computeWitness(x) : null), [x, validX]);

  const constraints = useMemo(() => {
    if (!s) return [];
    return CORRECT_A.map((_, i) => {
      const aRow = CORRECT_A[i];
      const bRow = CORRECT_B[i];
      const cRow = CORRECT_C[i];
      const as = dot(aRow, s);
      const bs = dot(bRow, s);
      const cs = dot(cRow, s);
      return { aRow, bRow, cRow, as, bs, cs, pass: as * bs === cs };
    });
  }, [s]);

  // Total animation steps: per constraint we animate 5 sub-steps
  // Steps: constraint 0 reveal, constraint 0 dot-A, dot-B, dot-C, result
  //        then constraint 1 ... etc.
  const STEPS_PER = 4; // reveal, dotA, dotB, result
  const totalSteps = constraints.length * STEPS_PER;

  function startAnim() {
    setAnimStep(0);
    setIsAnimating(true);
  }

  React.useEffect(() => {
    if (!isAnimating || animStep < 0) return;
    if (animStep >= totalSteps) {
      setIsAnimating(false);
      return;
    }
    const timer = setTimeout(() => setAnimStep(s => s + 1), 700);
    return () => clearTimeout(timer);
  }, [animStep, isAnimating, totalSteps]);

  React.useEffect(() => {
    setAnimStep(-1);
    setIsAnimating(false);
  }, [x]);

  function constraintPhase(ci) {
    const base = ci * STEPS_PER;
    // Returns how many sub-steps into this constraint have been revealed
    if (animStep < 0) return STEPS_PER; // show everything when idle
    const rel = animStep - base;
    return Math.max(0, Math.min(STEPS_PER, rel));
  }

  function renderDotRow(row, sVec, color, label) {
    return (
      <span>
        <strong style={{ color }}>{label}·s</strong>
        {' = '}
        {row.map((v, i) => (
          <span key={i}>
            {i > 0 && <span style={{ color: '#555' }}> + </span>}
            <span style={{ ...styles.dotStep, backgroundColor: v !== 0 ? 'rgba(255,204,128,0.12)' : 'transparent', color: v !== 0 ? '#ffcc80' : '#555' }}>
              {v}×{sVec[i]}
            </span>
          </span>
        ))}
        {' = '}
        <strong style={{ color }}>{dot(row, sVec)}</strong>
      </span>
    );
  }

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          输入 x 值，自动计算 Witness
          <span style={{ ...styles.badge, backgroundColor: '#90caf9', color: '#000' }}>动态验证</span>
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={styles.label}>x =</label>
            <br />
            <input
              type="number"
              style={{ ...styles.input, marginTop: '4px', fontSize: '18px' }}
              value={xInput}
              onChange={e => { setXInput(e.target.value); setAnimStep(-1); setIsAnimating(false); }}
            />
          </div>
          {s && (
            <div style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#a5d6a7',
              padding: '10px 14px',
              backgroundColor: '#0f0f23',
              borderRadius: '8px',
              lineHeight: '1.8',
            }}>
              <div>s = [<span style={{ color: '#aaa' }}>1</span>, <span style={{ color: '#ffcc80' }}>{s[1]}</span>, <span style={{ color: '#a5d6a7' }}>{s[2]}</span>, <span style={{ color: '#ce93d8' }}>{s[3]}</span>, <span style={{ color: '#ce93d8' }}>{s[4]}</span>]</div>
              <div style={{ fontSize: '12px', color: '#555' }}>1 &nbsp;&nbsp; x &nbsp;&nbsp; y &nbsp; sym₁ sym₂</div>
              <div style={{ marginTop: '4px' }}>
                {x}³ + {x} + 5 = <strong style={{ color: '#ffcc80' }}>{s[2]}</strong>
              </div>
            </div>
          )}
        </div>
        <div style={styles.tooltip}>
          Witness 向量 s 包含所有变量值。验证时将 s 代入 A、B、C 矩阵做点积，检查每行满足 (A·s)×(B·s) = C·s。
        </div>
      </div>

      {s && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button
              style={{ ...styles.button, ...(isAnimating ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
              onClick={startAnim}
              disabled={isAnimating}
            >
              {animStep < 0 ? '▶ 逐步演示验证' : isAnimating ? '验证中...' : '▶ 重新演示'}
            </button>
            {animStep < 0 && (
              <button
                style={{ ...styles.button, ...styles.buttonSecondary, marginLeft: '8px' }}
                onClick={() => setAnimStep(totalSteps)}
              >
                显示全部
              </button>
            )}
          </div>

          {/* Progress bar */}
          {animStep >= 0 && (
            <div style={{ height: '4px', backgroundColor: '#0f0f23', borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: '#ce93d8', borderRadius: '2px', transition: 'width 0.4s ease', width: `${Math.min(100, (animStep / totalSteps) * 100)}%` }} />
            </div>
          )}

          {constraints.map((c, ci) => {
            const phase = constraintPhase(ci);
            const visible = animStep < 0 || animStep >= ci * STEPS_PER;
            if (!visible) return null;

            return (
              <div
                key={ci}
                style={{
                  ...styles.constraintRow,
                  borderColor: phase >= STEPS_PER
                    ? (c.pass ? '#4caf50' : '#f44336')
                    : phase > 0 ? '#ffcc80' : '#3a4a6b',
                  transform: phase > 0 && phase < STEPS_PER ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                {/* Constraint header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: phase >= STEPS_PER ? (c.pass ? '#4caf50' : '#f44336') : '#ce93d8',
                    color: '#000', fontWeight: 'bold', fontSize: '14px', flexShrink: 0,
                  }}>
                    {phase >= STEPS_PER ? (c.pass ? '✓' : '✗') : ci + 1}
                  </span>
                  <strong style={{ color: '#b39ddb' }}>约束 {ci + 1}：</strong>
                  <span style={{ color: '#ddd' }}>{CONSTRAINT_LABELS[ci]}</span>
                </div>

                {/* Dot product rows - revealed by phase */}
                <div style={{ padding: '10px', backgroundColor: '#1a1a2e', borderRadius: '6px', lineHeight: '2.0', fontSize: '13px' }}>
                  {phase >= 1 && (
                    <div style={{ marginBottom: '4px' }}>
                      {renderDotRow(c.aRow, s, '#ce93d8', 'A')}
                    </div>
                  )}
                  {phase >= 2 && (
                    <div style={{ marginBottom: '4px' }}>
                      {renderDotRow(c.bRow, s, '#90caf9', 'B')}
                    </div>
                  )}
                  {phase >= 2 && (
                    <div style={{ marginBottom: '4px' }}>
                      {renderDotRow(c.cRow, s, '#a5d6a7', 'C')}
                    </div>
                  )}
                  {phase >= STEPS_PER && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: c.pass ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
                      border: `1px solid ${c.pass ? '#4caf5055' : '#f4433655'}`,
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{ color: '#ce93d8', fontWeight: 'bold' }}>A·s = {c.as}</span>
                      <span style={{ color: '#666' }}>×</span>
                      <span style={{ color: '#90caf9', fontWeight: 'bold' }}>B·s = {c.bs}</span>
                      <span style={{ color: '#666' }}>=</span>
                      <span style={{ color: '#ffcc80', fontWeight: 'bold' }}>{c.as * c.bs}</span>
                      <span style={{ color: '#666' }}>{c.pass ? '==' : '≠'}</span>
                      <span style={{ color: '#a5d6a7', fontWeight: 'bold' }}>C·s = {c.cs}</span>
                      <span style={{ fontSize: '18px', marginLeft: '4px' }}>{c.pass ? '✅' : '❌'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Final verdict */}
          {animStep >= totalSteps && (
            <div style={{
              ...styles.result,
              ...(constraints.every(c => c.pass) ? styles.resultSuccess : styles.resultFail),
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {constraints.every(c => c.pass) ? '✅ 所有约束满足！' : '❌ 存在不满足的约束'}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                {constraints.every(c => c.pass) ? (
                  <>
                    witness s = [1, {x}, {s[2]}, {s[3]}, {s[4]}] 合法。<br />
                    <span style={{ color: '#a5d6a7' }}>
                      证明者确实知道 x = {x}，使得 {x}³ + {x} + 5 = {s[2]}
                    </span>
                  </>
                ) : (
                  <span>Witness 向量无效，无法通过 R1CS 验证。</span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ==================== Main Component ====================
export default function R1CSMatrixDemo() {
  const [activeTab, setActiveTab] = useState('manual');

  const tabs = [
    { key: 'manual', label: '手动构造' },
    { key: 'auto', label: '自动验证' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>矩阵构造与验证：R1CS 练习台</h2>
      <p style={styles.explanation}>
        针对表达式 <code style={{ color: '#ffcc80' }}>x³ + x + 5 = y</code> 的 R1CS 矩阵（A、B、C）和 Witness 向量验证。
        变量列：<strong style={{ color: '#90caf9' }}>1, x, y, sym₁, sym₂</strong>。
      </p>

      <div style={styles.tabs}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : styles.tabInactive) }}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'manual' && <ManualConstructTab />}
      {activeTab === 'auto' && <AutoVerifyTab />}
    </div>
  );
}
