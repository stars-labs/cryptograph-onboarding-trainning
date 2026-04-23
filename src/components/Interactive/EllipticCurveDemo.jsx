import React, { useState, useMemo, useEffect } from 'react';

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
    color: '#4caf50',
    fontSize: '1.3rem',
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
    color: '#4caf50',
  },
  tabInactive: {
    backgroundColor: '#0f0f23',
    color: '#666',
  },
  section: {
    padding: '16px',
    backgroundColor: '#16213e',
    borderRadius: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    color: '#4caf50',
    fontWeight: 'bold',
  },
  input: {
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  },
  canvas: {
    width: '100%',
    height: '400px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '1px solid #3a4a6b',
  },
  equation: {
    textAlign: 'center',
    fontSize: '18px',
    fontFamily: 'monospace',
    padding: '12px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
    marginBottom: '16px',
    color: '#a5d6a7',
  },
  infoBox: {
    padding: '12px 16px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid #4caf50',
    borderRadius: '8px',
    marginTop: '16px',
    fontSize: '13px',
    color: '#a5d6a7',
  },
  pointsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
    gap: '8px',
    marginTop: '16px',
    maxHeight: '150px',
    overflowY: 'auto',
  },
  point: {
    padding: '6px 8px',
    backgroundColor: '#0f0f23',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    textAlign: 'center',
    border: '1px solid #3a4a6b',
  },
  result: {
    padding: '16px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '2px solid #4caf50',
    marginTop: '16px',
  },
  resultLabel: {
    fontSize: '12px',
    color: '#4caf50',
    marginBottom: '8px',
  },
  resultValue: {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: '#a5d6a7',
  },
  step: {
    padding: '12px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
    marginBottom: '8px',
    borderLeft: '3px solid #4caf50',
  },
  stepTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: '4px',
  },
  stepCalc: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#90caf9',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
};

function modInverse(a, p) {
  a = ((a % p) + p) % p;
  let [old_r, r] = [a, p];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return ((old_s % p) + p) % p;
}

function isQuadraticResidue(n, p) {
  if (n === 0) return true;
  return modPow(n, (p - 1) / 2, p) === 1;
}

function modPow(base, exp, mod) {
  let result = 1;
  base = ((base % mod) + mod) % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

function tonelliShanks(n, p) {
  if (n === 0) return 0;
  if (!isQuadraticResidue(n, p)) return null;
  
  if (p % 4 === 3) {
    return modPow(n, (p + 1) / 4, p);
  }
  
  let q = p - 1;
  let s = 0;
  while (q % 2 === 0) {
    q /= 2;
    s++;
  }
  
  let z = 2;
  while (isQuadraticResidue(z, p)) {
    z++;
  }
  
  let m = s;
  let c = modPow(z, q, p);
  let t = modPow(n, q, p);
  let r = modPow(n, (q + 1) / 2, p);
  
  while (true) {
    if (t === 0) return 0;
    if (t === 1) return r;
    
    let i = 1;
    let temp = (t * t) % p;
    while (temp !== 1) {
      temp = (temp * temp) % p;
      i++;
    }
    
    let b = c;
    for (let j = 0; j < m - i - 1; j++) {
      b = (b * b) % p;
    }
    
    m = i;
    c = (b * b) % p;
    t = (t * c) % p;
    r = (r * b) % p;
  }
}

function findCurvePoints(a, b, p) {
  const points = [];
  for (let x = 0; x < p; x++) {
    const rhs = (((x * x * x) % p) + ((a * x) % p + p) % p + ((b % p) + p) % p) % p;
    const y = tonelliShanks(rhs, p);
    if (y !== null) {
      points.push([x, y]);
      if (y !== 0 && y !== p - y) {
        points.push([x, p - y]);
      }
    }
  }
  return points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

function generateContinuousCurvePath(a, b, xMin, xMax, step = 0.05) {
  const upperPoints = [];
  const lowerPoints = [];
  
  for (let x = xMin; x <= xMax; x += step) {
    const rhs = x * x * x + a * x + b;
    if (rhs >= 0) {
      const y = Math.sqrt(rhs);
      upperPoints.push({ x, y });
      lowerPoints.push({ x, y: -y });
    }
  }
  
  return { upperPoints, lowerPoints };
}

function ContinuousCurveDemo({ a, b, setA, setB }) {
  const discriminant = 4 * a * a * a + 27 * b * b;
  const isValid = discriminant !== 0;
  
  const { upperPoints, lowerPoints } = useMemo(() => 
    generateContinuousCurvePath(a, b, -3, 4), [a, b]);
  
  const width = 500;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const scale = 40;
  
  const toSvgX = (x) => cx + x * scale;
  const toSvgY = (y) => cy - y * scale;
  
  const upperPath = upperPoints.length > 0 
    ? `M ${upperPoints.map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' L ')}`
    : '';
  const lowerPath = lowerPoints.length > 0
    ? `M ${lowerPoints.map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' L ')}`
    : '';
  
  return (
    <div>
      <div style={styles.equation}>
        y² = x³ + {a}x + {b}
      </div>
      
      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>参数 a</label>
          <input
            type="range"
            min="-5"
            max="5"
            value={a}
            onChange={(e) => setA(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <span style={{ textAlign: 'center' }}>{a}</span>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>参数 b</label>
          <input
            type="range"
            min="-5"
            max="10"
            value={b}
            onChange={(e) => setB(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <span style={{ textAlign: 'center' }}>{b}</span>
        </div>
      </div>
      
      <svg width={width} height={height} style={styles.canvas}>
        <line x1="0" y1={cy} x2={width} y2={cy} stroke="#444" strokeWidth="1" />
        <line x1={cx} y1="0" x2={cx} y2={height} stroke="#444" strokeWidth="1" />
        
        {[-3, -2, -1, 1, 2, 3, 4].map(v => (
          <React.Fragment key={v}>
            <line x1={toSvgX(v)} y1={cy - 5} x2={toSvgX(v)} y2={cy + 5} stroke="#555" strokeWidth="1" />
            <text x={toSvgX(v)} y={cy + 18} fill="#666" fontSize="10" textAnchor="middle">{v}</text>
          </React.Fragment>
        ))}
        {[-4, -3, -2, -1, 1, 2, 3, 4].map(v => (
          <React.Fragment key={v}>
            <line x1={cx - 5} y1={toSvgY(v)} x2={cx + 5} y2={toSvgY(v)} stroke="#555" strokeWidth="1" />
            <text x={cx - 15} y={toSvgY(v) + 4} fill="#666" fontSize="10" textAnchor="middle">{v}</text>
          </React.Fragment>
        ))}
        
        <path d={upperPath} fill="none" stroke="#4caf50" strokeWidth="2.5" />
        <path d={lowerPath} fill="none" stroke="#4caf50" strokeWidth="2.5" />
        
        <text x={width - 15} y={cy - 8} fill="#666" fontSize="12">x</text>
        <text x={cx + 8} y="18" fill="#666" fontSize="12">y</text>
      </svg>
      
      {!isValid && (
        <div style={{ ...styles.infoBox, borderColor: '#f44336', color: '#ffcdd2' }}>
          ⚠️ 4a³ + 27b² = {discriminant} = 0，曲线不光滑（有奇点）
        </div>
      )}
      
      <div style={styles.infoBox}>
        💡 <strong>secp256k1</strong> (比特币/以太坊): a=0, b=7，即 y² = x³ + 7
      </div>
    </div>
  );
}

function FiniteFieldDemo({ a, b }) {
  const [p, setP] = useState(23);
  
  const points = useMemo(() => findCurvePoints(a, b, p), [a, b, p]);
  
  const width = 500;
  const height = 400;
  const padding = 30;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  const scaleX = graphWidth / p;
  const scaleY = graphHeight / p;
  
  const toSvgX = (x) => padding + x * scaleX;
  const toSvgY = (y) => height - padding - y * scaleY;
  
  return (
    <div>
      <div style={styles.equation}>
        y² ≡ x³ + {a}x + {b} (mod {p})
      </div>
      
      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>a = {a}</label>
          <span style={{ fontSize: '11px', color: '#888' }}>从实数域继承</span>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>b = {b}</label>
          <span style={{ fontSize: '11px', color: '#888' }}>从实数域继承</span>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>p (素数)</label>
          <input
            type="number"
            style={styles.input}
            value={p}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 2;
              setP(Math.max(2, Math.min(67, val)));
            }}
            min="2"
            max="67"
          />
        </div>
      </div>
      
      <svg width={width} height={height} style={styles.canvas}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#444" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#444" strokeWidth="1" />
        
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={toSvgX(x)}
            cy={toSvgY(y)}
            r="6"
            fill="#4caf50"
          />
        ))}
        
        <line 
          x1={padding} 
          y1={toSvgY(p / 2)} 
          x2={width - padding} 
          y2={toSvgY(p / 2)} 
          stroke="#ff5722" 
          strokeWidth="1" 
          strokeDasharray="6,3" 
        />
        
        <text x={width - padding + 5} y={height - padding + 15} fill="#666" fontSize="11">x</text>
        <text x={padding - 5} y={padding - 5} fill="#666" fontSize="11">y</text>
        <text x={padding - 5} y={height - padding + 15} fill="#666" fontSize="10">0</text>
        <text x={width - padding - 5} y={height - padding + 15} fill="#666" fontSize="10">{p}</text>
        <text x={padding - 15} y={padding + 10} fill="#666" fontSize="10">{p}</text>
      </svg>
      
      <div style={styles.infoBox}>
        找到 <strong>{points.length}</strong> 个点 (不含无穷远点 O)
        <br />
        <span style={{ fontSize: '11px', color: '#888' }}>
          橙色虚线: y = p/2 (对称轴) — 有限域中点关于此线对称
        </span>
      </div>
      
      <div style={styles.pointsGrid}>
        {points.map(([x, y], i) => (
          <div key={i} style={styles.point}>
            ({x}, {y})
          </div>
        ))}
      </div>
    </div>
  );
}

function FinitePointAdditionDemo({ a, b }) {
  const [p] = useState(17);
  const [x1, setX1] = useState(0);
  const [y1, setY1] = useState(0);
  const [x2, setX2] = useState(0);
  const [y2, setY2] = useState(0);
  
  const points = useMemo(() => findCurvePoints(a, b, p), [a, b, p]);
  
  const { upperPoints: bgCurveUpper, lowerPoints: bgCurveLower } = useMemo(() => 
    generateContinuousCurvePath(a, b, -0.5, p + 0.5, 0.1), [a, b, p]);
  
  useEffect(() => {
    if (points.length >= 2) {
      setX1(points[0][0]);
      setY1(points[0][1]);
      setX2(points[1][0]);
      setY2(points[1][1]);
    } else if (points.length === 1) {
      setX1(points[0][0]);
      setY1(points[0][1]);
      setX2(points[0][0]);
      setY2(points[0][1]);
    }
  }, [points]);
  
  const isP1Valid = points.some(([x, y]) => x === x1 && y === y1);
  const isP2Valid = points.some(([x, y]) => x === x2 && y === y2);
  
  const result = useMemo(() => {
    if (!isP1Valid || !isP2Valid) return null;
    
    if (x1 === x2 && (y1 + y2) % p === 0) {
      return { isInfinity: true };
    }
    
    let lambda;
    if (x1 === x2 && y1 === y2) {
      const num = (3 * x1 * x1 + a) % p;
      const denom = (2 * y1) % p;
      if (denom === 0) return { isInfinity: true };
      lambda = (num * modInverse(denom, p)) % p;
    } else {
      const num = ((y2 - y1) % p + p) % p;
      const denom = ((x2 - x1) % p + p) % p;
      lambda = (num * modInverse(denom, p)) % p;
    }
    
    const x3 = ((lambda * lambda - x1 - x2) % p + p) % p;
    const y3 = ((lambda * (x1 - x3) - y1) % p + p) % p;
    
    return { x: x3, y: y3, lambda };
  }, [x1, y1, x2, y2, a, p, isP1Valid, isP2Valid]);
  
  const width = 500;
  const height = 400;
  const padding = 30;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  const scaleX = graphWidth / p;
  const scaleY = graphHeight / p;
  
  const toSvgX = (x) => padding + x * scaleX;
  const toSvgY = (y) => height - padding - y * scaleY;
  
  const bgCurveUpperPath = bgCurveUpper.length > 0
    ? `M ${bgCurveUpper.filter(pt => pt.x >= -0.5 && pt.x <= p + 0.5 && pt.y >= 0 && pt.y <= p).map(pt => `${toSvgX(pt.x)},${toSvgY(pt.y)}`).join(' L ')}`
    : '';
  const bgCurveLowerPath = bgCurveLower.length > 0
    ? `M ${bgCurveLower.filter(pt => pt.x >= -0.5 && pt.x <= p + 0.5 && pt.y >= -p && pt.y <= 0).map(pt => `${toSvgX(pt.x)},${toSvgY(pt.y)}`).join(' L ')}`
    : '';
  
  return (
    <div>
      <div style={styles.equation}>
        y² ≡ x³ + {a}x + {b} (mod {p})
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', backgroundColor: '#0f0f23', borderRadius: '8px', border: '2px solid #2196f3' }}>
          <div style={{ fontSize: '12px', color: '#2196f3', marginBottom: '8px' }}>点 P</div>
          <select
            style={{ ...styles.input, cursor: 'pointer' }}
            value={`${x1},${y1}`}
            onChange={(e) => {
              const [x, y] = e.target.value.split(',').map(Number);
              setX1(x);
              setY1(y);
            }}
          >
            {points.map(([x, y], i) => (
              <option key={i} value={`${x},${y}`}>({x}, {y})</option>
            ))}
          </select>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#90caf9' }}>
            P = ({x1}, {y1})
          </div>
        </div>
        
        <div style={{ padding: '12px', backgroundColor: '#0f0f23', borderRadius: '8px', border: '2px solid #ff9800' }}>
          <div style={{ fontSize: '12px', color: '#ff9800', marginBottom: '8px' }}>点 Q</div>
          <select
            style={{ ...styles.input, cursor: 'pointer' }}
            value={`${x2},${y2}`}
            onChange={(e) => {
              const [x, y] = e.target.value.split(',').map(Number);
              setX2(x);
              setY2(y);
            }}
          >
            {points.map(([x, y], i) => (
              <option key={i} value={`${x},${y}`}>({x}, {y})</option>
            ))}
          </select>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#ffcc80' }}>
            Q = ({x2}, {y2})
          </div>
        </div>
      </div>
      
      <svg width={width} height={height} style={styles.canvas}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#444" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#444" strokeWidth="1" />
        
        <path d={bgCurveUpperPath} fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
        <path d={bgCurveLowerPath} fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
        
        {isP1Valid && isP2Valid && (
          <line
            x1={toSvgX(x1)}
            y1={toSvgY(y1)}
            x2={toSvgX(x2)}
            y2={toSvgY(y2)}
            stroke="#9c27b0"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
        )}
        
        {result && !result.isInfinity && (
          <>
            <line
              x1={toSvgX(result.x)}
              y1={toSvgY(result.y)}
              x2={toSvgX(result.x)}
              y2={toSvgY(p - result.y)}
              stroke="#e91e63"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <circle
              cx={toSvgX(result.x)}
              cy={toSvgY(p - result.y)}
              r="7"
              fill="none"
              stroke="#e91e63"
              strokeWidth="2"
            />
            <text x={toSvgX(result.x) + 10} y={toSvgY(p - result.y) + 4} fill="#e91e63" fontSize="11">R (翻转前)</text>
          </>
        )}
        
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={toSvgX(x)}
            cy={toSvgY(y)}
            r="5"
            fill="#333"
          />
        ))}
        
        {isP1Valid && (
          <circle
            cx={toSvgX(x1)}
            cy={toSvgY(y1)}
            r="10"
            fill="#2196f3"
          />
        )}
        {isP2Valid && (
          <circle
            cx={toSvgX(x2)}
            cy={toSvgY(y2)}
            r="10"
            fill="#ff9800"
          />
        )}
        {result && !result.isInfinity && (
          <circle
            cx={toSvgX(result.x)}
            cy={toSvgY(result.y)}
            r="10"
            fill="#4caf50"
          />
        )}
        
        {isP1Valid && <text x={toSvgX(x1) + 12} y={toSvgY(y1) + 4} fill="#2196f3" fontSize="13" fontWeight="bold">P</text>}
        {isP2Valid && <text x={toSvgX(x2) + 12} y={toSvgY(y2) + 4} fill="#ff9800" fontSize="13" fontWeight="bold">Q</text>}
        {result && !result.isInfinity && (
          <text x={toSvgX(result.x) + 12} y={toSvgY(result.y) + 4} fill="#4caf50" fontSize="13" fontWeight="bold">P+Q</text>
        )}
      </svg>
      
      {result && (
        <div style={styles.result}>
          <div style={styles.resultLabel}>计算结果: P + Q</div>
          <div style={styles.resultValue}>
            {result.isInfinity 
              ? 'O (无穷远点)' 
              : `(${result.x}, ${result.y})`}
          </div>
          
          {!result.isInfinity && (
            <div style={{ marginTop: '12px' }}>
              <div style={styles.step}>
                <div style={styles.stepTitle}>Step 1: 计算斜率 λ</div>
                <div style={styles.stepCalc}>
                  λ = ({y2} - {y1}) / ({x2} - {x1}) mod {p} = {result.lambda}
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepTitle}>Step 2: 计算 x₃</div>
                <div style={styles.stepCalc}>
                  x₃ = λ² - x₁ - x₂ = {result.lambda}² - {x1} - {x2} ≡ {result.x} (mod {p})
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepTitle}>Step 3: 计算 y₃</div>
                <div style={styles.stepCalc}>
                  y₃ = λ(x₁ - x₃) - y₁ = {result.lambda}({x1} - {result.x}) - {y1} ≡ {result.y} (mod {p})
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div style={styles.infoBox}>
        💡 <strong>可视化说明</strong>:
        <br />
        <span style={{ color: '#9c27b0' }}>■</span> 紫色虚线: 连接 P 和 Q 的直线
        <br />
        <span style={{ color: '#e91e63' }}>○</span> 粉色圆圈 R: 直线与曲线的"交点"（翻转前）
        <br />
        <span style={{ color: '#4caf50' }}>●</span> 绿色点 P+Q: R 关于对称轴翻转后的结果
      </div>
    </div>
  );
}

function ModuloVisualizationDemo({ a, b }) {
  const [p] = useState(17);
  
  const points = useMemo(() => findCurvePoints(a, b, p), [a, b, p]);
  
  // Calculate which "k-curves" the points lie on
  const kValues = useMemo(() => {
    const kSet = new Set();
    points.forEach(([x, y]) => {
      const rhs = x * x * x + a * x + b;
      const k = (y * y - rhs) / p;
      // Because floating point, round it
      kSet.add(Math.round(k));
    });
    return Array.from(kSet).sort((a, b) => a - b);
  }, [points, a, b, p]);

  const width = 500;
  const height = 400;
  const padding = 40; // More padding for axis labels
  
  // Scale to fit the box [0, p] nicely
  // We want to show a bit more than [0, p] to show continuity
  const xMin = -5;
  const xMax = p + 5;
  const yMin = -5;
  const yMax = p + 5;
  
  const scaleX = (width - 2 * padding) / (xMax - xMin);
  const scaleY = (height - 2 * padding) / (yMax - yMin);
  
  const toSvgX = (x) => padding + (x - xMin) * scaleX;
  const toSvgY = (y) => height - padding - (y - yMin) * scaleY;

  return (
    <div>
      <div style={styles.equation}>
        y² = x³ + {a}x + {b} + k·{p}
      </div>
      
      <svg width={width} height={height} style={styles.canvas}>
        <defs>
          <clipPath id="chart-area">
            <rect x={padding} y={padding} width={width - 2 * padding} height={height - 2 * padding} />
          </clipPath>
        </defs>
        
        {/* Axes */}
        <line x1={padding} y1={toSvgY(0)} x2={width - padding} y2={toSvgY(0)} stroke="#444" strokeWidth="1" />
        <line x1={toSvgX(0)} y1={padding} x2={toSvgX(0)} y2={height - padding} stroke="#444" strokeWidth="1" />
        
        {/* The Finite Field Box [0, p] x [0, p] */}
        <rect 
          x={toSvgX(0)} 
          y={toSvgY(p)} 
          width={toSvgX(p) - toSvgX(0)} 
          height={toSvgY(0) - toSvgY(p)} 
          fill="rgba(33, 150, 243, 0.1)" 
          stroke="#2196f3" 
          strokeWidth="1" 
          strokeDasharray="4,4"
        />
        <text x={toSvgX(p) + 5} y={toSvgY(p/2)} fill="#2196f3" fontSize="12">p={p}</text>
        <text x={toSvgX(p/2)} y={toSvgY(0) + 15} fill="#2196f3" fontSize="12">p={p}</text>

        {/* Curves */}
        <g clipPath="url(#chart-area)">
          {kValues.map(k => {
            // Generate path for this specific k
            // We reuse generateContinuousCurvePath with modified b -> b + k*p
            const { upperPoints, lowerPoints } = generateContinuousCurvePath(a, b + k * p, xMin, xMax, 0.1);
            
            const upperPath = upperPoints.length > 0
              ? `M ${upperPoints.map(pt => `${toSvgX(pt.x)},${toSvgY(pt.y)}`).join(' L ')}`
              : '';
            const lowerPath = lowerPoints.length > 0
              ? `M ${lowerPoints.map(pt => `${toSvgX(pt.x)},${toSvgY(pt.y)}`).join(' L ')}`
              : '';
              
            return (
              <React.Fragment key={k}>
                <path d={upperPath} fill="none" stroke="#5c6bc0" strokeWidth="1" opacity="0.4" />
                <path d={lowerPath} fill="none" stroke="#5c6bc0" strokeWidth="1" opacity="0.4" />
              </React.Fragment>
            );
          })}
        </g>

        {/* Points */}
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={toSvgX(x)}
            cy={toSvgY(y)}
            r="4"
            fill="#ffeb3b"
            stroke="#000"
            strokeWidth="1"
          />
        ))}
      </svg>
      
      <div style={styles.infoBox}>
        💡 <strong>从实数到有限域的联系</strong>:
        <br />
        有限域中的点 (黄色) 并不是随机分布的。
        <br />
        它们实际上是<strong>一族连续曲线</strong> (蓝色线条) 与<strong>整数格点</strong>的交点。
        <br />
        每一条曲线都满足方程: <span style={{fontFamily: 'monospace'}}>y² = x³ + {a}x + {b} + k·{p}</span> (k为整数)
      </div>
    </div>
  );
}

function RealPointAdditionDemo({ a, b, setA, setB }) {
  const [x1, setX1] = useState(-1.5);
  const [y1Sign, setY1Sign] = useState(1);
  const [x2, setX2] = useState(0.5);
  const [y2Sign, setY2Sign] = useState(1);

  const { upperPoints, lowerPoints } = useMemo(() => 
    generateContinuousCurvePath(a, b, -4, 4, 0.05), [a, b]);

  const width = 500;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const scale = 40;
  
  const toSvgX = (x) => cx + x * scale;
  const toSvgY = (y) => cy - y * scale;

  const getY = (x) => {
    const rhs = x * x * x + a * x + b;
    if (rhs < 0) return null;
    return Math.sqrt(rhs);
  };

  const y1Abs = getY(x1);
  const y2Abs = getY(x2);
  
  const p1Valid = y1Abs !== null;
  const p2Valid = y2Abs !== null;
  
  const y1 = p1Valid ? y1Abs * y1Sign : 0;
  const y2 = p2Valid ? y2Abs * y2Sign : 0;

  const result = useMemo(() => {
    if (!p1Valid || !p2Valid) return null;
    
    // Check if P == -Q (vertical line)
    if (Math.abs(x1 - x2) < 0.001 && Math.abs(y1 + y2) < 0.001) {
      return { isInfinity: true };
    }

    let lambda;
    if (Math.abs(x1 - x2) < 0.001) {
      // Tangent
      if (Math.abs(y1) < 0.001) return { isInfinity: true };
      lambda = (3 * x1 * x1 + a) / (2 * y1);
    } else {
      lambda = (y2 - y1) / (x2 - x1);
    }

    const x3 = lambda * lambda - x1 - x2;
    const y3 = lambda * (x1 - x3) - y1;
    // Standard formula gives P+Q directly.
    // So P+Q = (x3, y3).
    // The intersection point R lies on the line, so R = (x3, -y3).
    
    return { x: x3, y: y3, lambda, rx: x3, ry: -y3 };
  }, [x1, y1, x2, y2, a, b, p1Valid, p2Valid]);

  const upperPath = upperPoints.length > 0 
    ? `M ${upperPoints.map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' L ')}`
    : '';
  const lowerPath = lowerPoints.length > 0
    ? `M ${lowerPoints.map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' L ')}`
    : '';

  // Line extension for visualization
  const linePoints = useMemo(() => {
    if (!result || result.isInfinity) return null;
    // Line through P(x1,y1) and Q(x2,y2) (or tangent)
    // y - y1 = lambda * (x - x1) => y = lambda * (x - x1) + y1
    const xMin = -4;
    const xMax = 4;
    const yMin = result.lambda * (xMin - x1) + y1;
    const yMax = result.lambda * (xMax - x1) + y1;
    return { x1: xMin, y1: yMin, x2: xMax, y2: yMax };
  }, [x1, y1, result]);

  return (
    <div>
      <div style={styles.equation}>
        y² = x³ + {a}x + {b} (实数域)
      </div>
      
      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>点 P x坐标: {x1}</label>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={x1}
            onChange={(e) => setX1(parseFloat(e.target.value))}
          />
          <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
            <label style={{fontSize: '12px', color: '#ccc'}}>
              <input 
                type="radio" 
                name="y1Sign" 
                checked={y1Sign === 1} 
                onChange={() => setY1Sign(1)} 
              /> y &gt; 0
            </label>
            <label style={{fontSize: '12px', color: '#ccc'}}>
              <input 
                type="radio" 
                name="y1Sign" 
                checked={y1Sign === -1} 
                onChange={() => setY1Sign(-1)} 
              /> y &lt; 0
            </label>
          </div>
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>点 Q x坐标: {x2}</label>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={x2}
            onChange={(e) => setX2(parseFloat(e.target.value))}
          />
          <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
            <label style={{fontSize: '12px', color: '#ccc'}}>
              <input 
                type="radio" 
                name="y2Sign" 
                checked={y2Sign === 1} 
                onChange={() => setY2Sign(1)} 
              /> y &gt; 0
            </label>
            <label style={{fontSize: '12px', color: '#ccc'}}>
              <input 
                type="radio" 
                name="y2Sign" 
                checked={y2Sign === -1} 
                onChange={() => setY2Sign(-1)} 
              /> y &lt; 0
            </label>
          </div>
        </div>
      </div>

      <svg width={width} height={height} style={styles.canvas}>
        <line x1="0" y1={cy} x2={width} y2={cy} stroke="#444" strokeWidth="1" />
        <line x1={cx} y1="0" x2={cx} y2={height} stroke="#444" strokeWidth="1" />
        
        <path d={upperPath} fill="none" stroke="#4caf50" strokeWidth="2" />
        <path d={lowerPath} fill="none" stroke="#4caf50" strokeWidth="2" />
        
        {linePoints && (
          <line 
            x1={toSvgX(linePoints.x1)} 
            y1={toSvgY(linePoints.y1)} 
            x2={toSvgX(linePoints.x2)} 
            y2={toSvgY(linePoints.y2)} 
            stroke="#9c27b0" 
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
        )}
        
        {result && !result.isInfinity && (
          <>
            <line 
              x1={toSvgX(result.rx)} 
              y1={toSvgY(result.ry)} 
              x2={toSvgX(result.x)} 
              y2={toSvgY(result.y)} 
              stroke="#e91e63" 
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <circle cx={toSvgX(result.rx)} cy={toSvgY(result.ry)} r="5" fill="#e91e63" />
            <text x={toSvgX(result.rx) + 8} y={toSvgY(result.ry)} fill="#e91e63" fontSize="12">R</text>
            
            <circle cx={toSvgX(result.x)} cy={toSvgY(result.y)} r="6" fill="#4caf50" />
            <text x={toSvgX(result.x) + 8} y={toSvgY(result.y)} fill="#4caf50" fontSize="12" fontWeight="bold">P+Q</text>
          </>
        )}
        
        {p1Valid && (
          <>
            <circle cx={toSvgX(x1)} cy={toSvgY(y1)} r="5" fill="#2196f3" />
            <text x={toSvgX(x1) - 15} y={toSvgY(y1) - 10} fill="#2196f3" fontSize="12" fontWeight="bold">P</text>
          </>
        )}
        
        {p2Valid && (
          <>
            <circle cx={toSvgX(x2)} cy={toSvgY(y2)} r="5" fill="#ff9800" />
            <text x={toSvgX(x2) - 15} y={toSvgY(y2) - 10} fill="#ff9800" fontSize="12" fontWeight="bold">Q</text>
          </>
        )}
      </svg>
      
      <div style={styles.infoBox}>
        💡 <strong>几何意义</strong>: 
        <br/>
        1. 连接 P 和 Q 画直线，交曲线于点 R (粉色点)
        <br/>
        2. 将 R 关于 x 轴对称，得到 P+Q (绿色点)
        <br/>
        3. 公式: P + Q + R = 0 (无穷远点)
      </div>
    </div>
  );
}

function PointAdditionDemo({ a, b, setA, setB }) {
  const [mode, setMode] = useState('real');

  return (
    <div>
      <div style={{marginBottom: '16px', display: 'flex', gap: '8px', justifyContent: 'center'}}>
        <button
          style={{...styles.button, backgroundColor: mode === 'real' ? '#2196f3' : '#0f0f23', border: '1px solid #2196f3', color: mode === 'real' ? '#fff' : '#2196f3'}}
          onClick={() => setMode('real')}
        >
          🔴 实数域 (几何直观)
        </button>
        <button
          style={{...styles.button, backgroundColor: mode === 'finite' ? '#9c27b0' : '#0f0f23', border: '1px solid #9c27b0', color: mode === 'finite' ? '#fff' : '#9c27b0'}}
          onClick={() => setMode('finite')}
        >
          🔵 有限域 (加密应用)
        </button>
      </div>
      
      {mode === 'real' ? (
        <RealPointAdditionDemo a={a} b={b} setA={setA} setB={setB} />
      ) : (
        <FinitePointAdditionDemo a={a} b={b} />
      )}
    </div>
  );
}

export default function EllipticCurveDemo() {
  const [activeTab, setActiveTab] = useState('continuous');
  const [a, setA] = useState(0);
  const [b, setB] = useState(7);
  
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📈 椭圆曲线交互演示</h3>
      
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'continuous' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('continuous')}
        >
          实数域曲线
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'modulo' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('modulo')}
        >
          从实数到有限域
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'finite' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('finite')}
        >
          有限域曲线
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'addition' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('addition')}
        >
          点加法
        </button>
      </div>
      
      <div style={styles.section}>
        {activeTab === 'continuous' && <ContinuousCurveDemo a={a} b={b} setA={setA} setB={setB} />}
        {activeTab === 'modulo' && <ModuloVisualizationDemo a={a} b={b} />}
        {activeTab === 'finite' && <FiniteFieldDemo a={a} b={b} />}
        {activeTab === 'addition' && <PointAdditionDemo a={a} b={b} setA={setA} setB={setB} />}
      </div>
    </div>
  );
}
