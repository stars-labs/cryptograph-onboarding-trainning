import React, { useState, useMemo } from 'react';

// ==================== Math Helpers ====================

// Lagrange interpolation: given points [{x, y}, ...], return polynomial coefficients [a0, a1, a2, ...]
// such that p(x) = a0 + a1*x + a2*x^2 + ...
function lagrangeInterpolate(points) {
  const n = points.length;
  // result coefficients
  let result = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const xi = points[i].x;
    const yi = points[i].y;

    // Build the basis polynomial L_i(x)
    // L_i(x) = product over j!=i of (x - x_j) / (x_i - x_j)
    let basisCoeffs = [1]; // start with polynomial "1"

    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const xj = points[j].x;
      const denom = xi - xj;
      // multiply basisCoeffs by (x - xj) / denom
      // (x - xj) as polynomial: [-xj, 1]
      const newBasis = new Array(basisCoeffs.length + 1).fill(0);
      for (let k = 0; k < basisCoeffs.length; k++) {
        newBasis[k] += basisCoeffs[k] * (-xj) / denom;
        newBasis[k + 1] += basisCoeffs[k] / denom;
      }
      basisCoeffs = newBasis;
    }

    // add yi * L_i to result
    for (let k = 0; k < basisCoeffs.length; k++) {
      result[k] += yi * basisCoeffs[k];
    }
  }

  // round near-integer values to avoid floating point noise
  return result.map(c => Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : parseFloat(c.toFixed(6)));
}

// Evaluate polynomial [a0, a1, a2, ...] at point t
function evalPoly(coeffs, t) {
  return coeffs.reduce((sum, c, i) => sum + c * Math.pow(t, i), 0);
}

// Multiply two polynomials
function multiplyPolys(p1, p2) {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] += p1[i] * p2[j];
    }
  }
  return result.map(c => Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : parseFloat(c.toFixed(6)));
}

// Subtract polynomials (p1 - p2)
function subtractPolys(p1, p2) {
  const len = Math.max(p1.length, p2.length);
  const result = new Array(len).fill(0);
  for (let i = 0; i < p1.length; i++) result[i] += p1[i];
  for (let i = 0; i < p2.length; i++) result[i] -= p2[i];
  return result.map(c => Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : parseFloat(c.toFixed(6)));
}

// Polynomial division: returns quotient of dividend / divisor
function dividePoly(dividend, divisor) {
  let rem = [...dividend];
  const quotient = new Array(Math.max(0, rem.length - divisor.length + 1)).fill(0);

  for (let i = quotient.length - 1; i >= 0; i--) {
    const coeff = rem[i + divisor.length - 1] / divisor[divisor.length - 1];
    quotient[i] = coeff;
    for (let j = 0; j < divisor.length; j++) {
      rem[i + j] -= coeff * divisor[j];
    }
  }

  return quotient.map(c => Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : parseFloat(c.toFixed(6)));
}

// Format polynomial as string, e.g. "2 + 3t - t²"
function formatPoly(coeffs, varName = 't') {
  const terms = [];
  coeffs.forEach((c, i) => {
    if (Math.abs(c) < 1e-9) return;
    const absC = Math.abs(c);
    const sign = c < 0 ? '-' : '+';
    let term = '';
    if (i === 0) term = String(absC % 1 === 0 ? absC : absC.toFixed(3));
    else if (i === 1) term = `${absC === 1 ? '' : (absC % 1 === 0 ? absC : absC.toFixed(3))}${varName}`;
    else term = `${absC === 1 ? '' : (absC % 1 === 0 ? absC : absC.toFixed(3))}${varName}${i > 1 ? String(i).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('') : ''}`;
    terms.push({ sign: terms.length === 0 && c > 0 ? '' : sign, term });
  });
  if (terms.length === 0) return '0';
  return terms.map(({ sign, term }) => sign ? `${sign} ${term}` : term).join(' ');
}

// ==================== R1CS data ====================

const A_MAT = [
  [0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0],
  [5, 1, 0, 0, 1],
];
const B_MAT = [
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [1, 0, 0, 0, 0],
];
const C_MAT = [
  [0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1],
  [0, 0, 1, 0, 0],
];
const varNames = ['1', 'x', 'y', 'sym1', 'sym2'];
const POINTS_T = [1, 2, 3]; // evaluation domain

function computeWitness(x) {
  const sym1 = x * x;
  const sym2 = sym1 * x;
  const y = sym2 + x + 5;
  return [1, x, y, sym1, sym2];
}

// Build QAP polynomials: returns { Av, Bv, Cv } each as array of poly-coefficient-arrays (one per variable)
function buildQAP() {
  const numVars = 5;
  const Av = [], Bv = [], Cv = [];
  for (let col = 0; col < numVars; col++) {
    const ptsA = POINTS_T.map((t, i) => ({ x: t, y: A_MAT[i][col] }));
    const ptsB = POINTS_T.map((t, i) => ({ x: t, y: B_MAT[i][col] }));
    const ptsC = POINTS_T.map((t, i) => ({ x: t, y: C_MAT[i][col] }));
    Av.push(lagrangeInterpolate(ptsA));
    Bv.push(lagrangeInterpolate(ptsB));
    Cv.push(lagrangeInterpolate(ptsC));
  }
  return { Av, Bv, Cv };
}

// Z(t) = (t-1)(t-2)(t-3)
const Z_POLY = multiplyPolys(multiplyPolys([-1, 1], [-2, 1]), [-3, 1]);

// ==================== Styles ====================

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
    color: '#42a5f5',
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
    color: '#42a5f5',
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
    color: '#90caf9',
    fontSize: '1.1rem',
  },
  label: {
    fontSize: '12px',
    color: '#42a5f5',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  },
  matrixTable: {
    borderCollapse: 'collapse',
    fontFamily: 'monospace',
    fontSize: '14px',
  },
  matrixCell: {
    padding: '7px 12px',
    textAlign: 'center',
    border: '1px solid #3a4a6b',
    minWidth: '40px',
  },
  matrixHeader: {
    padding: '7px 12px',
    textAlign: 'center',
    border: '1px solid #3a4a6b',
    color: '#90caf9',
    fontWeight: 'bold',
    backgroundColor: '#0f0f23',
  },
  polyBox: {
    fontFamily: 'monospace',
    fontSize: '15px',
    padding: '12px 16px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '1px solid #3a4a6b',
    marginTop: '8px',
    lineHeight: '2',
  },
  highlight: {
    color: '#ffcc80',
    fontWeight: 'bold',
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
  evalRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
    marginTop: '8px',
    fontFamily: 'monospace',
    fontSize: '14px',
  },
  evalChip: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
};

// ==================== Tab 0: Intuition (drag points to see curve) ====================

function IntuitionTab() {
  const [y1, setY1] = useState(1);
  const [y2, setY2] = useState(0);
  const [y3, setY3] = useState(1);
  const [mode, setMode] = useState(3); // 2 or 3 points

  const points = mode === 2
    ? [{ x: 1, y: y1 }, { x: 3, y: y3 }]
    : [{ x: 1, y: y1 }, { x: 2, y: y2 }, { x: 3, y: y3 }];
  const coeffs = useMemo(() => lagrangeInterpolate(points), [y1, y2, y3, mode]);

  // SVG viewport
  const W = 520, H = 320;
  const PAD_L = 44, PAD_R = 20, PAD_T = 20, PAD_B = 36;
  const xMin = 0, xMax = 4;
  const yMin = -3, yMax = 5;
  const xToPx = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * (W - PAD_L - PAD_R);
  const yToPx = (y) => H - PAD_B - ((y - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  // Generate smooth curve samples
  const samples = [];
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const xv = xMin + ((xMax - xMin) * i) / N;
    const yv = evalPoly(coeffs, xv);
    samples.push([xToPx(xv), yToPx(yv)]);
  }
  const pathD = samples.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

  const degreeLabel = mode === 2 ? '1 次（直线）' : '2 次（抛物线）';

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>点 → 曲线直觉</h3>
        <p style={styles.explanation}>
          Lagrange 插值只做一件事：<strong style={{ color: '#ffcc80' }}>给几个点，画一条穿过它们的唯一曲线</strong>。
          先不用看公式，拖动下面的滑块改变点的高度，看曲线怎么变化。
        </p>

        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <button
            style={{
              ...styles.tab,
              ...(mode === 2 ? styles.tabActive : styles.tabInactive),
              borderRadius: '6px',
            }}
            onClick={() => setMode(2)}
          >
            2 个点 → 一条直线
          </button>
          <button
            style={{
              ...styles.tab,
              ...(mode === 3 ? styles.tabActive : styles.tabInactive),
              borderRadius: '6px',
            }}
            onClick={() => setMode(3)}
          >
            3 个点 → 一条抛物线
          </button>
        </div>

        <div style={{ backgroundColor: '#0f0f23', borderRadius: '8px', padding: '12px' }}>
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            style={{ maxWidth: '560px', display: 'block', margin: '0 auto' }}
            aria-label="interpolation plot"
          >
            {/* vertical gridlines for t=1,2,3 */}
            {[1, 2, 3].map(t => (
              <line
                key={`v${t}`}
                x1={xToPx(t)} y1={PAD_T}
                x2={xToPx(t)} y2={H - PAD_B}
                stroke="#2a3a5b" strokeWidth="1" strokeDasharray="4,4"
              />
            ))}
            {/* horizontal y=0 axis */}
            <line
              x1={PAD_L} y1={yToPx(0)}
              x2={W - PAD_R} y2={yToPx(0)}
              stroke="#3a4a6b" strokeWidth="1"
            />
            {/* y-axis */}
            <line
              x1={PAD_L} y1={PAD_T}
              x2={PAD_L} y2={H - PAD_B}
              stroke="#3a4a6b" strokeWidth="1"
            />
            {/* x-axis labels */}
            {[0, 1, 2, 3, 4].map(t => (
              <text key={`xl${t}`} x={xToPx(t)} y={H - PAD_B + 18} fill="#888" fontSize="12" textAnchor="middle">{t}</text>
            ))}
            {/* y-axis labels */}
            {[-2, 0, 2, 4].map(y => (
              <g key={`yl${y}`}>
                <line x1={PAD_L - 4} y1={yToPx(y)} x2={PAD_L} y2={yToPx(y)} stroke="#3a4a6b" strokeWidth="1" />
                <text x={PAD_L - 8} y={yToPx(y) + 4} fill="#888" fontSize="12" textAnchor="end">{y}</text>
              </g>
            ))}
            {/* curve */}
            <path d={pathD} fill="none" stroke="#42a5f5" strokeWidth="2.5" />
            {/* points */}
            {points.map(({ x, y }, i) => (
              <g key={`pt${i}`}>
                <circle cx={xToPx(x)} cy={yToPx(y)} r="8" fill="#ffcc80" stroke="#fff" strokeWidth="2" />
                <text x={xToPx(x)} y={yToPx(y) - 14} fill="#ffcc80" fontSize="12" textAnchor="middle" fontWeight="bold">
                  ({x}, {y})
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div style={{ marginTop: '16px' }}>
          {[
            { t: 1, val: y1, setter: setY1, show: true },
            { t: 2, val: y2, setter: setY2, show: mode === 3 },
            { t: 3, val: y3, setter: setY3, show: true },
          ].filter(r => r.show).map(({ t, val, setter }) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ ...styles.label, minWidth: '64px' }}>点 t={t}</span>
              <input
                type="range"
                min="-3"
                max="5"
                step="0.5"
                value={val}
                onChange={e => setter(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: '#ffcc80' }}
              />
              <span style={{
                ...styles.evalChip,
                backgroundColor: 'rgba(255,204,128,0.15)',
                color: '#ffcc80',
                minWidth: '64px',
                textAlign: 'center',
              }}>
                y = {val}
              </span>
            </div>
          ))}
        </div>

        <div style={{ ...styles.polyBox, marginTop: '14px' }}>
          <div style={{ color: '#90caf9', marginBottom: '4px' }}>
            当前的 {points.length} 个点对应的唯一 {degreeLabel}：
          </div>
          <div style={{ color: '#a5d6a7' }}>
            <strong>{formatPoly(coeffs)}</strong>
          </div>
        </div>

        <div style={styles.tooltip}>
          关键体会：拖动滑块时曲线跟着变，但<strong style={{ color: '#ffcc80' }}>永远精确穿过</strong>你设定的点。
          这就是 Lagrange 插值做的事 —— 公式只是"怎么算"的细节，你只要相信"这样的曲线存在且唯一"即可。
          <br /><br />
          <strong>把 n 个点喂给 Lagrange，一定吐出唯一一条 n−1 次多项式曲线。</strong>
          后面"拉格朗日插值"标签页里看到的吓人公式，就是在做这件事。
        </div>
      </div>
    </div>
  );
}

// ==================== Tab 1: Lagrange Interpolation ====================

function LagrangeTab() {
  const [matrix, setMatrix] = useState('A');
  const [colIdx, setColIdx] = useState(1);

  const matMap = { A: A_MAT, B: B_MAT, C: C_MAT };
  const colMap = { A: '#42a5f5', B: '#ce93d8', C: '#a5d6a7' };

  const selectedMat = matMap[matrix];
  const color = colMap[matrix];

  const columnValues = POINTS_T.map((t, i) => ({ t, val: selectedMat[i][colIdx] }));
  const points = columnValues.map(({ t, val }) => ({ x: t, y: val }));
  const coeffs = useMemo(() => lagrangeInterpolate(points), [matrix, colIdx]);

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>从矩阵列到多项式</h3>
        <p style={styles.explanation}>
          QAP 的核心思想：将 R1CS 矩阵的每一<strong>列</strong>作为在点 t=1,2,3 处的函数值，
          通过拉格朗日插值求出经过这些点的多项式。
          每个变量对应三个矩阵各一个多项式：u_i(t)、v_i(t)、w_i(t)。
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
          <div>
            <div style={styles.label}>选择矩阵</div>
            <select
              style={{ ...styles.select, marginTop: '4px', color }}
              value={matrix}
              onChange={e => setMatrix(e.target.value)}
            >
              <option value="A">矩阵 A（左输入）</option>
              <option value="B">矩阵 B（右输入）</option>
              <option value="C">矩阵 C（输出）</option>
            </select>
          </div>
          <div>
            <div style={styles.label}>选择变量列</div>
            <select
              style={{ ...styles.select, marginTop: '4px' }}
              value={colIdx}
              onChange={e => setColIdx(parseInt(e.target.value))}
            >
              {varNames.map((name, i) => (
                <option key={i} value={i}>列 {i}: {name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          第一步：读取评估点
          <span style={{ ...styles.badge, backgroundColor: color, color: '#000' }}>{matrix} 矩阵</span>
        </h3>
        <p style={styles.explanation}>
          变量 <strong style={{ color }}>{varNames[colIdx]}</strong> 在矩阵 {matrix} 中，
          分别在约束 1、2、3（对应 t=1,2,3）处的系数为：
        </p>

        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table style={styles.matrixTable}>
            <thead>
              <tr>
                <th style={styles.matrixHeader}>约束行 / t 值</th>
                {varNames.map((name, i) => (
                  <th
                    key={i}
                    style={{
                      ...styles.matrixHeader,
                      color: i === colIdx ? color : '#90caf9',
                      backgroundColor: i === colIdx ? 'rgba(66,165,245,0.1)' : '#0f0f23',
                    }}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedMat.map((row, ri) => (
                <tr key={ri}>
                  <td style={{ ...styles.matrixCell, color: '#ffcc80', backgroundColor: '#0f0f23', fontWeight: 'bold' }}>
                    约束 {ri + 1}（t={POINTS_T[ri]}）
                  </td>
                  {row.map((val, ci) => (
                    <td
                      key={ci}
                      style={{
                        ...styles.matrixCell,
                        color: ci === colIdx ? (val !== 0 ? color : '#555') : (val !== 0 ? '#ddd' : '#444'),
                        fontWeight: ci === colIdx ? 'bold' : 'normal',
                        fontSize: ci === colIdx ? '16px' : '14px',
                        backgroundColor: ci === colIdx ? 'rgba(66,165,245,0.08)' : 'transparent',
                      }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.tooltip}>
          高亮列（{varNames[colIdx]}）的值为：
          {columnValues.map(({ t, val }) => (
            <span key={t}>
              {' '}f({t}) = <strong style={{ color }}>{val}</strong>
              {t < 3 ? '，' : ''}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>第二步：拉格朗日插值公式</h3>
        <p style={styles.explanation}>
          已知三点 (1, {columnValues[0].val})、(2, {columnValues[1].val})、(3, {columnValues[2].val})，
          构造次数 &le; 2 的多项式，令 L(t) = &sum; y_i &middot; l_i(t)，其中：
        </p>

        <div style={styles.polyBox}>
          {POINTS_T.map((ti, i) => {
            const others = POINTS_T.filter(t => t !== ti);
            const denom = others.reduce((acc, t) => acc * (ti - t), 1);
            return (
              <div key={i} style={{ marginBottom: '6px' }}>
                <span style={{ color: '#90caf9' }}>l_{i + 1}(t)</span>
                {' = '}
                <span style={{ color: '#ddd' }}>
                  {others.map(t => `(t - ${t})`).join(' · ')} / {denom}
                </span>
                {columnValues[i].val !== 0 && (
                  <span style={{ color: '#aaa' }}>
                    {'  ——  '}y_{i + 1} = <span style={{ color }}>{columnValues[i].val}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ ...styles.polyBox, marginTop: '12px' }}>
          <div style={{ color: '#90caf9', marginBottom: '4px' }}>插值结果多项式系数 [a₀, a₁, a₂]：</div>
          <div>
            [{coeffs.map((c, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <span style={{ color: '#ffcc80' }}>{c}</span>
              </span>
            ))}]
          </div>
          <div style={{ marginTop: '8px', color: '#a5d6a7' }}>
            即：<strong>{formatPoly(coeffs)}</strong>
          </div>
        </div>

        <div style={styles.tooltip}>
          验证：将 t=1,2,3 代入确认结果 —{' '}
          {POINTS_T.map((t, i) => (
            <span key={t}>
              f({t}) = <strong style={{ color }}>{parseFloat(evalPoly(coeffs, t).toFixed(4))}</strong>
              {i < 2 ? '，' : ''}
            </span>
          ))}
          （应分别等于 {columnValues.map(cv => cv.val).join(', ')}）
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>第三步：所有变量的多项式汇总</h3>
        <p style={styles.explanation}>
          矩阵 {matrix} 的每一列都对应一个多项式 u_i(t)，共 {varNames.length} 个：
        </p>
        <div style={styles.polyBox}>
          {varNames.map((name, ci) => {
            const pts = POINTS_T.map((t, ri) => ({ x: t, y: selectedMat[ri][ci] }));
            const c = lagrangeInterpolate(pts);
            const isSelected = ci === colIdx;
            return (
              <div
                key={ci}
                style={{
                  marginBottom: '6px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? 'rgba(66,165,245,0.1)' : 'transparent',
                  border: isSelected ? `1px solid ${color}44` : '1px solid transparent',
                }}
              >
                <span style={{ color: isSelected ? color : '#90caf9' }}>
                  {matrix.toLowerCase()}_{ci}(t) [{name}]
                </span>
                {' = '}
                <span style={{ color: isSelected ? '#fff' : '#bbb' }}>
                  {formatPoly(c)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== Tab 2: Polynomial Visualization ====================

function PolyVisTab({ x }) {
  const [tVal, setTVal] = useState(2.0);
  const witness = useMemo(() => computeWitness(x), [x]);
  const { Av, Bv, Cv } = useMemo(() => buildQAP(), []);

  // Compute summed polynomials A(t) = sum s_i * u_i(t), etc.
  const polyA = useMemo(() => {
    let sum = [0];
    Av.forEach((poly, i) => {
      const scaled = poly.map(c => c * witness[i]);
      sum = subtractPolys(
        [...sum, ...new Array(Math.max(0, scaled.length - sum.length)).fill(0)].map((v, idx) => v + (scaled[idx] || 0)),
        [0]
      );
    });
    return sum;
  }, [witness]);

  const polyB = useMemo(() => {
    let sum = [0];
    Bv.forEach((poly, i) => {
      const scaled = poly.map(c => c * witness[i]);
      sum = subtractPolys(
        [...sum, ...new Array(Math.max(0, scaled.length - sum.length)).fill(0)].map((v, idx) => v + (scaled[idx] || 0)),
        [0]
      );
    });
    return sum;
  }, [witness]);

  const polyC = useMemo(() => {
    let sum = [0];
    Cv.forEach((poly, i) => {
      const scaled = poly.map(c => c * witness[i]);
      sum = subtractPolys(
        [...sum, ...new Array(Math.max(0, scaled.length - sum.length)).fill(0)].map((v, idx) => v + (scaled[idx] || 0)),
        [0]
      );
    });
    return sum;
  }, [witness]);

  const At = parseFloat(evalPoly(polyA, tVal).toFixed(6));
  const Bt = parseFloat(evalPoly(polyB, tVal).toFixed(6));
  const Ct = parseFloat(evalPoly(polyC, tVal).toFixed(6));
  const ABmC = parseFloat((At * Bt - Ct).toFixed(6));
  const Zt = parseFloat(evalPoly(Z_POLY, tVal).toFixed(6));

  const isIntPoint = POINTS_T.includes(Math.round(tVal)) && Math.abs(tVal - Math.round(tVal)) < 0.05;
  const nearZero = (v) => Math.abs(v) < 0.01;

  // Display rows for each integer point
  const tablePoints = [1, 2, 3];

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>累加多项式</h3>
        <p style={styles.explanation}>
          利用 witness s = [{witness.join(', ')}] 将各变量多项式加权求和，得到：
          <br />A(t) = &sum; s_i &middot; u_i(t)，B(t) = &sum; s_i &middot; v_i(t)，C(t) = &sum; s_i &middot; w_i(t)
        </p>
        <div style={styles.polyBox}>
          <div>
            <span style={{ color: '#42a5f5' }}>A(t)</span>
            {' = '}<span style={{ color: '#ddd' }}>{formatPoly(polyA)}</span>
          </div>
          <div>
            <span style={{ color: '#ce93d8' }}>B(t)</span>
            {' = '}<span style={{ color: '#ddd' }}>{formatPoly(polyB)}</span>
          </div>
          <div>
            <span style={{ color: '#a5d6a7' }}>C(t)</span>
            {' = '}<span style={{ color: '#ddd' }}>{formatPoly(polyC)}</span>
          </div>
          <div style={{ marginTop: '8px', borderTop: '1px solid #3a4a6b', paddingTop: '8px' }}>
            <span style={{ color: '#ffcc80' }}>Z(t)</span>
            {' = '}<span style={{ color: '#ddd' }}>{formatPoly(Z_POLY)}</span>
            <span style={{ color: '#888', marginLeft: '8px', fontSize: '12px' }}>（靶多项式，t=1,2,3时为零）</span>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>在整数点处验证</h3>
        <p style={styles.explanation}>
          在 t=1,2,3 处，A(t)·B(t) - C(t) 应恒为零（因为每点对应一个 R1CS 约束）：
        </p>
        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table style={styles.matrixTable}>
            <thead>
              <tr>
                <th style={styles.matrixHeader}>t</th>
                <th style={{ ...styles.matrixHeader, color: '#42a5f5' }}>A(t)</th>
                <th style={{ ...styles.matrixHeader, color: '#ce93d8' }}>B(t)</th>
                <th style={{ ...styles.matrixHeader, color: '#a5d6a7' }}>C(t)</th>
                <th style={{ ...styles.matrixHeader, color: '#ffcc80' }}>A·B</th>
                <th style={styles.matrixHeader}>A·B - C</th>
                <th style={{ ...styles.matrixHeader, color: '#ef9a9a' }}>Z(t)</th>
              </tr>
            </thead>
            <tbody>
              {tablePoints.map(tp => {
                const a = parseFloat(evalPoly(polyA, tp).toFixed(4));
                const b = parseFloat(evalPoly(polyB, tp).toFixed(4));
                const c = parseFloat(evalPoly(polyC, tp).toFixed(4));
                const ab = parseFloat((a * b).toFixed(4));
                const abmc = parseFloat((ab - c).toFixed(4));
                const zt = parseFloat(evalPoly(Z_POLY, tp).toFixed(4));
                const isZero = nearZero(abmc);
                return (
                  <tr key={tp}>
                    <td style={{ ...styles.matrixCell, color: '#ffcc80', fontWeight: 'bold' }}>{tp}</td>
                    <td style={{ ...styles.matrixCell, color: '#42a5f5' }}>{a}</td>
                    <td style={{ ...styles.matrixCell, color: '#ce93d8' }}>{b}</td>
                    <td style={{ ...styles.matrixCell, color: '#a5d6a7' }}>{c}</td>
                    <td style={{ ...styles.matrixCell, color: '#ffcc80' }}>{ab}</td>
                    <td style={{
                      ...styles.matrixCell,
                      color: isZero ? '#4caf50' : '#f44336',
                      fontWeight: 'bold',
                    }}>
                      {abmc} {isZero ? '✓' : '✗'}
                    </td>
                    <td style={{ ...styles.matrixCell, color: '#ef9a9a' }}>{zt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={styles.tooltip}>
          A(t)·B(t) - C(t) 在 t=1,2,3 处均为零，说明 Z(t) 整除 A(t)·B(t) - C(t)。
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>滑动 t 值实时查看</h3>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={styles.label}>t = {tVal.toFixed(2)}</span>
            <input
              type="range"
              min="0"
              max="4"
              step="0.05"
              value={tVal}
              onChange={e => setTVal(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#42a5f5' }}
            />
          </div>
          {isIntPoint && (
            <div style={{ ...styles.badge, backgroundColor: '#42a5f5', color: '#000', marginTop: '6px', display: 'inline-block' }}>
              整数点 t = {Math.round(tVal)}
            </div>
          )}
        </div>

        <div style={styles.evalRow}>
          <span style={{ ...styles.evalChip, backgroundColor: 'rgba(66,165,245,0.15)', color: '#42a5f5' }}>
            A({tVal.toFixed(2)}) = {At}
          </span>
          <span style={{ ...styles.evalChip, backgroundColor: 'rgba(206,147,216,0.15)', color: '#ce93d8' }}>
            B({tVal.toFixed(2)}) = {Bt}
          </span>
          <span style={{ ...styles.evalChip, backgroundColor: 'rgba(165,214,167,0.15)', color: '#a5d6a7' }}>
            C({tVal.toFixed(2)}) = {Ct}
          </span>
        </div>

        <div style={{ ...styles.evalRow, marginTop: '8px' }}>
          <span style={{ color: '#aaa' }}>A·B - C =</span>
          <span style={{
            ...styles.evalChip,
            backgroundColor: nearZero(ABmC) ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
            color: nearZero(ABmC) ? '#4caf50' : '#f44336',
          }}>
            {ABmC}
          </span>
          <span style={{ color: '#888', margin: '0 4px' }}>|</span>
          <span style={{ color: '#aaa' }}>Z(t) =</span>
          <span style={{ ...styles.evalChip, backgroundColor: 'rgba(239,154,154,0.15)', color: '#ef9a9a' }}>
            {Zt}
          </span>
          {isIntPoint && nearZero(ABmC) && (
            <span style={{ color: '#4caf50', fontSize: '12px' }}>（整数点，两者均趋近 0）</span>
          )}
        </div>

        <div style={styles.tooltip}>
          拖动滑块时观察：在 t=1,2,3 处 A·B-C 为零；在其他点不为零，但 Z(t) 也不为零，
          整除关系 (A·B-C) = H·Z 始终成立。
        </div>
      </div>
    </div>
  );
}

// ==================== Tab 3: Divisibility Check ====================

function DivisionTab({ x }) {
  const witness = useMemo(() => computeWitness(x), [x]);
  const { Av, Bv, Cv } = useMemo(() => buildQAP(), []);

  const [checkT, setCheckT] = useState(7);

  const sumPoly = (polys, weights) => {
    let sum = [0];
    polys.forEach((poly, i) => {
      const w = weights[i];
      poly.forEach((c, k) => {
        while (sum.length <= k) sum.push(0);
        sum[k] += c * w;
      });
    });
    return sum.map(c => Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : parseFloat(c.toFixed(6)));
  };

  const polyA = useMemo(() => sumPoly(Av, witness), [witness]);
  const polyB = useMemo(() => sumPoly(Bv, witness), [witness]);
  const polyC = useMemo(() => sumPoly(Cv, witness), [witness]);

  const polyAB = useMemo(() => multiplyPolys(polyA, polyB), [polyA, polyB]);
  const polyABmC = useMemo(() => subtractPolys(polyAB, polyC), [polyAB, polyC]);
  const polyH = useMemo(() => dividePoly(polyABmC, Z_POLY), [polyABmC]);
  const polyHZ = useMemo(() => multiplyPolys(polyH, Z_POLY), [polyH]);

  // Verify at random point
  const lhs = parseFloat(evalPoly(polyABmC, checkT).toFixed(6));
  const rhs = parseFloat(evalPoly(polyHZ, checkT).toFixed(6));
  const verified = Math.abs(lhs - rhs) < 0.001;

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>整除关系：(A·B - C) = H · Z</h3>
        <p style={styles.explanation}>
          QAP 可满足性的核心证明：多项式 A(t)·B(t) - C(t) 能被靶多项式 Z(t) 整除，
          商多项式为 H(t)。验证者只需检查 A·B - C = H·Z 在随机点成立即可（概率论保证正确性）。
        </p>
        <div style={{ ...styles.polyBox }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#42a5f5' }}>A(t)</span>
            {' = '}{formatPoly(polyA)}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#ce93d8' }}>B(t)</span>
            {' = '}{formatPoly(polyB)}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#a5d6a7' }}>C(t)</span>
            {' = '}{formatPoly(polyC)}
          </div>
          <div style={{ borderTop: '1px solid #3a4a6b', paddingTop: '8px', marginTop: '8px' }}>
            <span style={{ color: '#ffcc80' }}>A(t)·B(t)</span>
            {' = '}{formatPoly(polyAB)}
          </div>
          <div>
            <span style={{ color: '#ffcc80' }}>A·B - C</span>
            {' = '}{formatPoly(polyABmC)}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>多项式除法</h3>
        <p style={styles.explanation}>
          (A·B - C) / Z(t) 得到商多项式 H(t)，余数应为零（整除）：
        </p>
        <div style={styles.polyBox}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#ef9a9a' }}>Z(t)</span>
            {' = '}{formatPoly(Z_POLY)}
          </div>
          <div style={{ borderTop: '1px solid #3a4a6b', paddingTop: '8px', marginTop: '8px', color: '#a5d6a7' }}>
            <span style={{ color: '#80cbc4' }}>H(t)</span>
            {' = (A·B - C) / Z = '}
            <strong>{formatPoly(polyH)}</strong>
          </div>
          <div style={{ marginTop: '6px', color: '#aaa', fontSize: '13px' }}>
            H(t) 系数：[{polyH.map((c, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <span style={{ color: '#80cbc4' }}>{c}</span>
              </span>
            ))}]
          </div>
        </div>

        <div style={styles.tooltip}>
          Z(t) = (t-1)(t-2)(t-3) 是次数 3 的多项式，A·B-C 是次数 4 的多项式，
          所以商 H(t) 是次数 1 的多项式（一次式）。
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>在整数点处 t=1,2,3 的行为</h3>
        <p style={styles.explanation}>
          在评估点 t=1,2,3，分子 A·B-C 和 Z(t) 同时为零，
          但商 H(t) 在这些点有确定的值：
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.matrixTable}>
            <thead>
              <tr>
                <th style={styles.matrixHeader}>t</th>
                <th style={{ ...styles.matrixHeader, color: '#ffcc80' }}>A·B-C</th>
                <th style={{ ...styles.matrixHeader, color: '#ef9a9a' }}>Z(t)</th>
                <th style={{ ...styles.matrixHeader, color: '#80cbc4' }}>H(t)</th>
                <th style={styles.matrixHeader}>H(t)·Z(t)</th>
                <th style={styles.matrixHeader}>验证</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map(tp => {
                const num = parseFloat(evalPoly(polyABmC, tp).toFixed(4));
                const zt = parseFloat(evalPoly(Z_POLY, tp).toFixed(4));
                const ht = parseFloat(evalPoly(polyH, tp).toFixed(4));
                const htz = parseFloat((ht * zt).toFixed(4));
                const ok = nearZero(num - htz);
                return (
                  <tr key={tp}>
                    <td style={{ ...styles.matrixCell, color: '#ffcc80', fontWeight: 'bold' }}>{tp}</td>
                    <td style={{ ...styles.matrixCell, color: nearZero(num) ? '#4caf50' : '#f44336' }}>{num}</td>
                    <td style={{ ...styles.matrixCell, color: nearZero(zt) ? '#4caf50' : '#ef9a9a' }}>{zt}</td>
                    <td style={{ ...styles.matrixCell, color: '#80cbc4' }}>{ht}</td>
                    <td style={{ ...styles.matrixCell, color: '#ddd' }}>{htz}</td>
                    <td style={{ ...styles.matrixCell, color: ok ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                      {ok ? '✓' : '✗'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>随机点验证</h3>
        <p style={styles.explanation}>
          验证者选择随机点 t，检查 A(t)·B(t) - C(t) = H(t)·Z(t) 是否成立。
          若作弊者伪造了 H，在随机点被发现的概率极高（Schwartz-Zippel 引理）。
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={styles.label}>随机验证点 t =</span>
          <input
            type="number"
            style={{ ...styles.input, width: '80px', textAlign: 'center' }}
            value={checkT}
            onChange={e => setCheckT(parseFloat(e.target.value) || 7)}
          />
        </div>

        <div style={styles.evalRow}>
          <span style={{ color: '#aaa' }}>LHS = A·B - C =</span>
          <span style={{ ...styles.evalChip, backgroundColor: 'rgba(255,204,128,0.15)', color: '#ffcc80' }}>
            {lhs}
          </span>
          <span style={{ color: '#aaa', margin: '0 4px' }}>|</span>
          <span style={{ color: '#aaa' }}>RHS = H·Z =</span>
          <span style={{ ...styles.evalChip, backgroundColor: 'rgba(128,203,196,0.15)', color: '#80cbc4' }}>
            {rhs}
          </span>
        </div>

        <div style={{
          ...styles.result,
          ...(verified ? styles.resultSuccess : styles.resultFail),
          marginTop: '12px',
        }}>
          {verified
            ? `在 t = ${checkT} 处：A·B - C = H·Z = ${lhs}，验证通过！`
            : `在 t = ${checkT} 处：A·B - C (${lhs}) ≠ H·Z (${rhs})，验证失败`}
        </div>

        <div style={styles.tooltip}>
          QAP 方案的简洁性：验证者无需重新执行所有约束，
          只需在一个随机点检查一个多项式等式即可，验证复杂度为 O(1)！
        </div>
      </div>
    </div>
  );
}

function nearZero(v) {
  return Math.abs(v) < 0.01;
}

// ==================== Main Component ====================

export default function QAPDemo() {
  const [x, setX] = useState(3);
  const [activeTab, setActiveTab] = useState('intuition');

  const witness = useMemo(() => computeWitness(x), [x]);

  const tabs = [
    { key: 'intuition', label: '点→曲线直觉' },
    { key: 'lagrange', label: '拉格朗日插值' },
    { key: 'polyvis', label: '多项式可视化' },
    { key: 'division', label: '整除检查' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>QAP 二次算术程序交互演示</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>输入参数</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={styles.label}>x 的值</div>
            <input
              type="number"
              style={{ ...styles.input, width: '80px', textAlign: 'center', marginTop: '4px' }}
              value={x}
              onChange={e => setX(parseInt(e.target.value) || 0)}
            />
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '15px',
            color: '#a5d6a7',
            padding: '8px 14px',
            backgroundColor: '#0f0f23',
            borderRadius: '8px',
          }}>
            x³ + x + 5 = <strong style={{ color: '#ffcc80', fontSize: '17px' }}>{witness[2]}</strong>
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#aaa',
            padding: '8px 14px',
            backgroundColor: '#0f0f23',
            borderRadius: '8px',
          }}>
            witness s = [{witness.join(', ')}]
          </div>
        </div>
        <div style={styles.tooltip}>
          R1CS 约束数量：3，变量数：5（1, x, y, sym1, sym2）。
          评估域：t = 1, 2, 3（对应三个约束）。
        </div>
      </div>

      <div style={styles.tabs}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            style={{
              ...styles.tab,
              ...(activeTab === key ? styles.tabActive : styles.tabInactive),
            }}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'intuition' && <IntuitionTab />}
      {activeTab === 'lagrange' && <LagrangeTab />}
      {activeTab === 'polyvis' && <PolyVisTab x={x} />}
      {activeTab === 'division' && <DivisionTab x={x} />}
    </div>
  );
}
