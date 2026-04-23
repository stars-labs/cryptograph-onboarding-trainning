import React, { useState, useMemo, useEffect, useCallback } from 'react';

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
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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
  buttonSmall: {
    padding: '6px 14px',
    fontSize: '12px',
  },
  gate: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    fontWeight: 'bold',
    fontSize: '20px',
    border: '3px solid',
    margin: '4px',
    transition: 'all 0.5s ease',
  },
  gateMul: {
    backgroundColor: 'rgba(206, 147, 216, 0.2)',
    borderColor: '#ce93d8',
    color: '#ce93d8',
  },
  gateAdd: {
    backgroundColor: 'rgba(144, 202, 249, 0.2)',
    borderColor: '#90caf9',
    color: '#90caf9',
  },
  gateHighlight: {
    boxShadow: '0 0 20px rgba(206, 147, 216, 0.6)',
    transform: 'scale(1.15)',
  },
  wire: {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#a5d6a7',
    padding: '6px 10px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
    display: 'inline-block',
    margin: '2px',
    transition: 'all 0.3s ease',
  },
  wireHighlight: {
    backgroundColor: '#2a2a4e',
    color: '#ffcc80',
    boxShadow: '0 0 10px rgba(255, 204, 128, 0.3)',
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
  matrixCellHighlight: {
    backgroundColor: 'rgba(255, 204, 128, 0.15)',
    boxShadow: 'inset 0 0 8px rgba(255, 204, 128, 0.2)',
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
  arrow: {
    textAlign: 'center',
    color: '#ce93d8',
    fontSize: '20px',
    padding: '6px 0',
  },
  flowRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '4px',
    minHeight: '64px',
    transition: 'opacity 0.5s ease',
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
  progressBar: {
    height: '4px',
    backgroundColor: '#0f0f23',
    borderRadius: '2px',
    marginTop: '12px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ce93d8',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
};

// Flatten x^3 + x + 5 = y into gates
// Witness vector: s = [1, x, y, sym1, sym2]
function computeWitness(x) {
  const sym1 = x * x;
  const sym2 = sym1 * x;
  const y = sym2 + x + 5;
  return [1, x, y, sym1, sym2];
}

const varNames = ['1', 'x', 'y', 'sym1', 'sym2'];

// R1CS matrices
const A = [
  [0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0],
  [5, 1, 0, 0, 1],
];
const B = [
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [1, 0, 0, 0, 0],
];
const C_mat = [
  [0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1],
  [0, 0, 1, 0, 0],
];

const constraintLabels = [
  'x × x = sym1',
  'sym1 × x = sym2',
  '(sym2 + x + 5) × 1 = y',
];

const constraintExplanations = [
  '第一个乘法门：计算 x 的平方',
  '第二个乘法门：将 x² 再乘以 x 得到 x³',
  '合并约束：把加法"折叠"进去，乘以 1 来强制等式成立',
];

function dot(vec1, vec2) {
  return vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
}

// ==================== Circuit Tab ====================
function CircuitTab({ x }) {
  const [animStep, setAnimStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  const sym1 = x * x;
  const sym2 = sym1 * x;
  const y = sym2 + x + 5;

  const startAnimation = useCallback(() => {
    setAnimStep(0);
    setIsAnimating(true);
  }, []);

  useEffect(() => {
    if (!isAnimating || animStep < 0) return;
    if (animStep > 3) {
      setIsAnimating(false);
      return;
    }
    const timer = setTimeout(() => setAnimStep(s => s + 1), 1200);
    return () => clearTimeout(timer);
  }, [animStep, isAnimating]);

  // Reset animation when x changes
  useEffect(() => {
    setAnimStep(-1);
    setIsAnimating(false);
  }, [x]);

  const isActive = (step) => animStep === -1 || animStep === step;
  const isPast = (step) => animStep === -1 || animStep >= step;

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          算术电路：x³ + x + 5 = y
          <span style={{...styles.badge, backgroundColor: '#ce93d8', color: '#000'}}>可视化</span>
        </h3>
        <p style={styles.explanation}>
          将计算 <code style={{ color: '#ffcc80' }}>x³ + x + 5</code> "拍平"(flatten) 为只含基本运算的门操作。
          每个<span style={{ color: '#ce93d8' }}>乘法门</span>将变成一个 R1CS 约束，
          <span style={{ color: '#90caf9' }}>加法</span>可以被"免费"合并。
        </p>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <button
            style={{
              ...styles.button,
              ...(isAnimating ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
            }}
            onClick={startAnimation}
            disabled={isAnimating}
          >
            {animStep === -1 ? '▶ 逐步演示电路构建' : isAnimating ? '演示中...' : '▶ 重新演示'}
          </button>
        </div>

        {animStep !== -1 && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${Math.min(100, (animStep / 3) * 100)}%` }} />
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          {/* Gate 1: x * x = sym1 */}
          <div style={{
            ...styles.flowRow,
            opacity: isPast(0) ? 1 : 0.2,
          }}>
            <span style={{
              ...styles.wire,
              ...(isActive(0) ? styles.wireHighlight : {}),
            }}>x = {x}</span>
            <span style={{ color: '#666', fontSize: '18px' }}>──▶</span>
            <span style={{
              ...styles.gate,
              ...styles.gateMul,
              ...(isActive(0) ? styles.gateHighlight : {}),
            }}>×</span>
            <span style={{ color: '#666', fontSize: '18px' }}>◀──</span>
            <span style={{
              ...styles.wire,
              ...(isActive(0) ? styles.wireHighlight : {}),
            }}>x = {x}</span>
            <span style={{ color: '#666', fontSize: '18px' }}>──▶</span>
            <span style={{
              ...styles.wire,
              ...(isActive(0) ? styles.wireHighlight : {}),
            }}>sym1 = {sym1}</span>
          </div>
          {isActive(0) && animStep >= 0 && (
            <div style={styles.tooltip}>
              💡 <strong>第 1 步</strong>：先计算 x × x = {x} × {x} = {sym1}，存为中间变量 sym1
            </div>
          )}

          <div style={styles.arrow}>↓</div>

          {/* Gate 2: sym1 * x = sym2 */}
          <div style={{
            ...styles.flowRow,
            opacity: isPast(1) ? 1 : 0.2,
          }}>
            <span style={{
              ...styles.wire,
              ...(isActive(1) ? styles.wireHighlight : {}),
            }}>sym1 = {sym1}</span>
            <span style={{ color: '#666', fontSize: '18px' }}>──▶</span>
            <span style={{
              ...styles.gate,
              ...styles.gateMul,
              ...(isActive(1) ? styles.gateHighlight : {}),
            }}>×</span>
            <span style={{ color: '#666', fontSize: '18px' }}>◀──</span>
            <span style={{
              ...styles.wire,
              ...(isActive(1) ? styles.wireHighlight : {}),
            }}>x = {x}</span>
            <span style={{ color: '#666', fontSize: '18px' }}>──▶</span>
            <span style={{
              ...styles.wire,
              ...(isActive(1) ? styles.wireHighlight : {}),
            }}>sym2 = {sym2}</span>
          </div>
          {isActive(1) && animStep >= 1 && (
            <div style={styles.tooltip}>
              💡 <strong>第 2 步</strong>：sym1 × x = {sym1} × {x} = {sym2}，现在 sym2 = x³
            </div>
          )}

          <div style={styles.arrow}>↓</div>

          {/* Gate 3: sym2 + x + 5 = y */}
          <div style={{
            ...styles.flowRow,
            opacity: isPast(2) ? 1 : 0.2,
          }}>
            <span style={{
              ...styles.wire,
              ...(isActive(2) ? styles.wireHighlight : {}),
            }}>sym2 = {sym2}</span>
            <span style={{ color: '#666', fontSize: '18px' }}>──▶</span>
            <span style={{
              ...styles.gate,
              ...styles.gateAdd,
              ...(isActive(2) ? { ...styles.gateHighlight, boxShadow: '0 0 20px rgba(144, 202, 249, 0.6)' } : {}),
            }}>+</span>
            <span style={{ color: '#666', fontSize: '18px' }}>◀──</span>
            <span style={{
              ...styles.wire,
              ...(isActive(2) ? styles.wireHighlight : {}),
            }}>x={x}, 5</span>
            <span style={{ color: '#666', fontSize: '18px' }}>──▶</span>
            <span style={{
              ...styles.wire,
              ...(isActive(2) ? styles.wireHighlight : {}),
            }}>y = {y}</span>
          </div>
          {isActive(2) && animStep >= 2 && (
            <div style={styles.tooltip}>
              💡 <strong>第 3 步</strong>：加法操作 sym2 + x + 5 = {sym2} + {x} + 5 = {y}。
              加法是"免费"的，会被折叠进 R1CS 约束中。
            </div>
          )}
        </div>

        {/* Summary */}
        {(animStep === -1 || animStep >= 3) && (
          <div style={{
            ...styles.section,
            marginTop: '16px',
            backgroundColor: '#0f0f23',
            border: '1px solid #3a4a6b',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#ce93d8', fontWeight: 'bold' }}>
              拍平结果汇总：
            </p>
            <div style={{ fontFamily: 'monospace', lineHeight: '2.2', fontSize: '14px' }}>
              <div>
                <span style={{
                  ...styles.badge,
                  backgroundColor: 'rgba(206, 147, 216, 0.3)',
                  color: '#ce93d8',
                }}>乘法门 1</span>{' '}
                sym1 = x × x = {x} × {x} = <span style={styles.highlight}>{sym1}</span>
              </div>
              <div>
                <span style={{
                  ...styles.badge,
                  backgroundColor: 'rgba(206, 147, 216, 0.3)',
                  color: '#ce93d8',
                }}>乘法门 2</span>{' '}
                sym2 = sym1 × x = {sym1} × {x} = <span style={styles.highlight}>{sym2}</span>
              </div>
              <div>
                <span style={{
                  ...styles.badge,
                  backgroundColor: 'rgba(144, 202, 249, 0.3)',
                  color: '#90caf9',
                }}>加法合并</span>{' '}
                y = sym2 + x + 5 = {sym2} + {x} + 5 = <span style={styles.highlight}>{y}</span>
              </div>
            </div>
            <div style={styles.tooltip}>
              🎯 总结：2 个乘法门 + 1 个合并约束 = <strong>3 个 R1CS 约束</strong>。
              加法被"免费"吸收进约束的系数向量中。
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Matrix Tab ====================
function MatrixTab({ x }) {
  const s = computeWitness(x);
  const [highlightRow, setHighlightRow] = useState(-1);
  const [showDotProduct, setShowDotProduct] = useState(false);

  return (
    <div>
      {/* Witness vector */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          Witness 向量 s
          <span style={{...styles.badge, backgroundColor: '#a5d6a7', color: '#000'}}>全部变量</span>
        </h3>
        <p style={styles.explanation}>
          witness 包含电路中<strong>所有变量的赋值</strong>：常数 1、输入 x、输出 y、以及中间变量。
          可以把它理解为电路在某个具体输入下的"执行快照"。
        </p>
        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table style={styles.matrixTable}>
            <thead>
              <tr>
                {varNames.map((name, i) => (
                  <th key={i} style={{
                    ...styles.matrixHeader,
                    color: i === 0 ? '#aaa' : i === 1 ? '#ffcc80' : i === 2 ? '#a5d6a7' : '#ce93d8',
                  }}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {s.map((val, i) => (
                  <td key={i} style={{
                    ...styles.matrixCell,
                    color: i === 0 ? '#aaa' : '#a5d6a7',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}>{val}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.tooltip}>
          💡 第一个元素固定为 <strong>1</strong>，用于在约束中引入常数项（比如 "+5"）
        </div>
      </div>

      {/* Toggle for dot product */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <button
          style={{
            ...styles.button,
            ...(showDotProduct ? {} : styles.buttonSecondary),
          }}
          onClick={() => setShowDotProduct(!showDotProduct)}
        >
          {showDotProduct ? '隐藏' : '显示'} 所有点积计算
        </button>
      </div>

      {/* A, B, C matrices */}
      {[
        { name: 'A', matrix: A, color: '#ce93d8', desc: '左输入', emoji: '🅰️' },
        { name: 'B', matrix: B, color: '#90caf9', desc: '右输入', emoji: '🅱️' },
        { name: 'C', matrix: C_mat, color: '#a5d6a7', desc: '输出', emoji: '🅲' },
      ].map(({ name, matrix, color, desc, emoji }) => (
        <div key={name} style={styles.section}>
          <h3 style={{...styles.sectionTitle, color}}>
            {emoji} 矩阵 {name}（{desc}）
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.matrixTable}>
              <thead>
                <tr>
                  <th style={styles.matrixHeader}>约束</th>
                  {varNames.map((vn, i) => (
                    <th key={i} style={styles.matrixHeader}>{vn}</th>
                  ))}
                  <th style={{...styles.matrixHeader, color, backgroundColor: 'rgba(255,255,255,0.03)'}}>
                    {name}·s
                  </th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, ri) => {
                  const dotVal = dot(row, s);
                  const isHighlighted = highlightRow === ri;
                  return (
                    <tr
                      key={ri}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHighlightRow(ri)}
                      onMouseLeave={() => setHighlightRow(-1)}
                    >
                      <td style={{
                        ...styles.matrixLabel,
                        color,
                        fontSize: '12px',
                        ...(isHighlighted ? { backgroundColor: 'rgba(255,255,255,0.05)' } : {}),
                      }}>
                        {constraintLabels[ri]}
                      </td>
                      {row.map((val, ci) => (
                        <td
                          key={ci}
                          style={{
                            ...styles.matrixCell,
                            color: val !== 0 ? color : '#444',
                            fontWeight: val !== 0 ? 'bold' : 'normal',
                            fontSize: val !== 0 ? '16px' : '14px',
                            ...(isHighlighted && val !== 0 ? styles.matrixCellHighlight : {}),
                          }}
                        >
                          {val}
                        </td>
                      ))}
                      <td style={{
                        ...styles.matrixCell,
                        color,
                        fontWeight: 'bold',
                        fontSize: '16px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      }}>
                        {dotVal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dot product detail - show all when button clicked, or highlight row on hover */}
          {showDotProduct && (
            <div style={{...styles.tooltip, marginTop: '12px'}}>
              <strong style={{ color }}>点积计算过程：</strong>
              <div style={{ marginTop: '8px' }}>
                {matrix.map((row, ri) => (
                  <div key={ri} style={{ 
                    padding: '6px 0',
                    borderBottom: ri < matrix.length - 1 ? '1px solid #3a4a6b' : 'none',
                    backgroundColor: highlightRow === ri ? 'rgba(255,204,128,0.1)' : 'transparent',
                    borderRadius: '4px',
                    paddingLeft: '8px'
                  }}>
                    <span style={{ color, fontWeight: 'bold' }}>{name}[{ri + 1}]·s = </span>
                    {row.map((val, i) => (
                      <span key={i}>
                        {i > 0 && ' + '}
                        <span style={{ 
                          color: val !== 0 ? '#ffcc80' : '#555',
                          fontWeight: val !== 0 ? 'bold' : 'normal'
                        }}>
                          {val}×{s[i]}
                        </span>
                      </span>
                    ))}
                    <span style={{ color: '#666' }}> = </span>
                    <span style={{ color, fontWeight: 'bold' }}>
                      {dot(row, s)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={styles.tooltip}>
        💡 <strong>提示</strong>：点击上方按钮查看完整的点积计算过程。
        矩阵中高亮的非零元素表示该约束"选择"的变量。
      </div>
    </div>
  );
}

// ==================== Verify Tab ====================
function VerifyTab({ x }) {
  const s = computeWitness(x);
  const [verifyStep, setVerifyStep] = useState(-1);
  const [isVerifying, setIsVerifying] = useState(false);

  const checks = A.map((_, i) => {
    const as = dot(A[i], s);
    const bs = dot(B[i], s);
    const cs = dot(C_mat[i], s);
    return { as, bs, cs, product: as * bs, pass: as * bs === cs };
  });

  const allPass = checks.every(c => c.pass);

  const startVerify = useCallback(() => {
    setVerifyStep(0);
    setIsVerifying(true);
  }, []);

  useEffect(() => {
    if (!isVerifying || verifyStep < 0) return;
    if (verifyStep >= checks.length) {
      setIsVerifying(false);
      return;
    }
    const timer = setTimeout(() => setVerifyStep(s => s + 1), 1500);
    return () => clearTimeout(timer);
  }, [verifyStep, isVerifying, checks.length]);

  useEffect(() => {
    setVerifyStep(-1);
    setIsVerifying(false);
  }, [x]);

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          逐个验证 R1CS 约束
          <span style={{...styles.badge, backgroundColor: '#ffcc80', color: '#000'}}>核心步骤</span>
        </h3>
        <p style={styles.explanation}>
          对每个约束检查公式：<code style={{ color: '#ffcc80' }}>(A·s) × (B·s) = (C·s)</code>。
          如果所有约束都满足，说明 witness 是合法的！
        </p>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <button
            style={{
              ...styles.button,
              ...(isVerifying ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
            }}
            onClick={startVerify}
            disabled={isVerifying}
          >
            {verifyStep === -1 ? '▶ 逐步验证约束' : isVerifying ? '验证中...' : '▶ 重新验证'}
          </button>
          {verifyStep === -1 && (
            <button
              style={{...styles.button, ...styles.buttonSecondary, marginLeft: '8px'}}
              onClick={() => setVerifyStep(checks.length)}
            >
              显示全部结果
            </button>
          )}
        </div>

        {verifyStep >= 0 && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${Math.min(100, (verifyStep / checks.length) * 100)}%` }} />
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          {checks.map((check, i) => {
            const isVisible = verifyStep === -1 || verifyStep > i || (verifyStep === i && isVerifying);
            const isActive = verifyStep === i;
            const isRevealed = verifyStep > i || verifyStep >= checks.length;

            if (verifyStep >= 0 && verifyStep <= i && !isActive) return null;

            return (
              <div
                key={i}
                style={{
                  ...styles.constraintRow,
                  borderColor: isRevealed
                    ? (check.pass ? '#4caf50' : '#f44336')
                    : isActive ? '#ffcc80' : '#3a4a6b',
                  opacity: isVisible ? 1 : 0,
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isRevealed
                      ? (check.pass ? '#4caf50' : '#f44336')
                      : '#ce93d8',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}>
                    {isRevealed ? (check.pass ? '✓' : '✗') : (i + 1)}
                  </span>
                  <strong style={{ color: '#b39ddb' }}>约束 {i + 1}：</strong>
                  <span style={{ color: '#ddd' }}>{constraintLabels[i]}</span>
                </div>

                <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '10px' }}>
                  {constraintExplanations[i]}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  padding: '10px',
                  backgroundColor: '#1a1a2e',
                  borderRadius: '6px',
                }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(206, 147, 216, 0.15)',
                    color: '#ce93d8',
                  }}>
                    A·s = {check.as}
                  </span>
                  <span style={{ color: '#666', fontSize: '18px' }}>×</span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(144, 202, 249, 0.15)',
                    color: '#90caf9',
                  }}>
                    B·s = {check.bs}
                  </span>
                  <span style={{ color: '#666', fontSize: '18px' }}>=</span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 204, 128, 0.15)',
                    color: '#ffcc80',
                    fontWeight: 'bold',
                  }}>
                    {check.product}
                  </span>
                  <span style={{ color: '#666', fontSize: '18px' }}>
                    {check.pass ? '==' : '≠'}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(165, 214, 167, 0.15)',
                    color: '#a5d6a7',
                  }}>
                    C·s = {check.cs}
                  </span>
                  <span style={{ fontSize: '22px', marginLeft: '4px' }}>
                    {isRevealed ? (check.pass ? '✅' : '❌') : '⏳'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final result */}
        {(verifyStep >= checks.length) && (
          <div style={{
            ...styles.result,
            ...(allPass ? styles.resultSuccess : styles.resultFail),
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>
              {allPass ? '✅ 所有约束满足！' : '❌ 存在不满足的约束'}
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
              {allPass ? (
                <>
                  witness 向量 s = [{s.join(', ')}] 是合法的。<br/>
                  <span style={{ color: '#a5d6a7' }}>
                    这意味着证明者确实知道一个 x（= {x}），使得 x³ + x + 5 = {s[2]}
                  </span>
                </>
              ) : (
                'witness 向量不满足 R1CS 约束，说明赋值有误或 witness 被篡改。'
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tamper experiment */}
      <TamperExperiment x={x} />
    </div>
  );
}

// ==================== Tamper Experiment ====================
function TamperExperiment({ x }) {
  const [tamperIdx, setTamperIdx] = useState(-1);
  const [tamperVal, setTamperVal] = useState('');

  const realS = computeWitness(x);
  const tamperedS = [...realS];
  if (tamperIdx >= 0 && tamperIdx < tamperedS.length && tamperVal !== '') {
    tamperedS[tamperIdx] = parseInt(tamperVal) || 0;
  }

  const isTampered = tamperIdx >= 0 && tamperVal !== '' && tamperedS[tamperIdx] !== realS[tamperIdx];

  const tamperedChecks = isTampered
    ? A.map((_, i) => {
        const as = dot(A[i], tamperedS);
        const bs = dot(B[i], tamperedS);
        const cs = dot(C_mat[i], tamperedS);
        return { as, bs, cs, product: as * bs, pass: as * bs === cs };
      })
    : null;

  return (
    <div style={{...styles.section, border: '1px dashed #f44336'}}>
      <h3 style={{...styles.sectionTitle, color: '#f44336'}}>
        🧪 实验：篡改 witness
      </h3>
      <p style={styles.explanation}>
        试试修改 witness 中的某个值，看看约束还能满足吗？这说明了为什么 ZKP 系统是安全的——
        假的 witness 无法通过验证。
      </p>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
        <select
          style={{
            ...styles.input,
            width: '120px',
            cursor: 'pointer',
          }}
          value={tamperIdx}
          onChange={(e) => {
            setTamperIdx(parseInt(e.target.value));
            setTamperVal('');
          }}
        >
          <option value={-1}>选择变量</option>
          {varNames.map((name, i) => (
            <option key={i} value={i}>{name} (当前值: {realS[i]})</option>
          ))}
        </select>

        {tamperIdx >= 0 && (
          <>
            <span style={{ color: '#aaa' }}>改为</span>
            <input
              type="number"
              style={styles.input}
              placeholder="新值"
              value={tamperVal}
              onChange={(e) => setTamperVal(e.target.value)}
            />
          </>
        )}
      </div>

      {isTampered && tamperedChecks && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>
            篡改后的 witness: [{tamperedS.join(', ')}]
          </div>
          {tamperedChecks.map((check, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              marginBottom: '4px',
              borderRadius: '6px',
              backgroundColor: check.pass ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              border: `1px solid ${check.pass ? '#4caf5044' : '#f4433644'}`,
              fontFamily: 'monospace',
              fontSize: '13px',
            }}>
              约束 {i + 1}: {check.as} × {check.bs} = {check.product} {check.pass ? '==' : '≠'} {check.cs}
              {' '}{check.pass ? '✅' : '❌'}
            </div>
          ))}
          <div style={{
            ...styles.result,
            ...(tamperedChecks.every(c => c.pass) ? styles.resultSuccess : styles.resultFail),
            padding: '12px',
          }}>
            {tamperedChecks.every(c => c.pass)
              ? '居然还满足？（可能只是巧合改对了）'
              : `💥 篡改被检测到！${tamperedChecks.filter(c => !c.pass).length} 个约束不满足`}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Main Component ====================
export default function R1CSDemo() {
  const [x, setX] = useState(3);
  const [activeTab, setActiveTab] = useState('circuit');

  const s = useMemo(() => computeWitness(x), [x]);

  const tabItems = [
    { key: 'circuit', label: '⚡ 电路可视化', desc: '看看计算如何变成门电路' },
    { key: 'matrix', label: '📊 R1CS 矩阵', desc: '约束的矩阵表示' },
    { key: 'verify', label: '✓ 约束验证', desc: '验证 witness 是否合法' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔧 R1CS 与算术电路交互演示</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚙️ 输入参数</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>x 的值</label>
            <input
              type="number"
              style={{...styles.input, fontSize: '18px'}}
              value={x}
              onChange={(e) => setX(parseInt(e.target.value) || 0)}
            />
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#a5d6a7',
            padding: '8px 14px',
            backgroundColor: '#0f0f23',
            borderRadius: '8px',
          }}>
            {x}³ + {x} + 5 = <strong style={{ color: '#ffcc80', fontSize: '18px' }}>{s[2]}</strong>
          </div>
        </div>
        <div style={styles.tooltip}>
          💡 修改 x 的值，观察电路、矩阵和约束如何随之变化。试试 x = 3（经典例子，y = 35）
        </div>
      </div>

      <div style={styles.tabs}>
        {tabItems.map(({ key, label, desc }) => (
          <button
            key={key}
            style={{
              ...styles.tab,
              ...(activeTab === key ? styles.tabActive : styles.tabInactive),
            }}
            onClick={() => setActiveTab(key)}
            title={desc}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'circuit' && <CircuitTab x={x} />}
      {activeTab === 'matrix' && <MatrixTab x={x} />}
      {activeTab === 'verify' && <VerifyTab x={x} />}
    </div>
  );
}
