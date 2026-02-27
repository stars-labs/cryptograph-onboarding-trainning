import React, { useState, useMemo, useEffect } from 'react';

// --- Mathematical Helpers ---

function mod(n, m) {
  return ((n % m) + m) % m;
}

function modInverse(a, m) {
  let [old_r, r] = [a, m];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return mod(old_s, m);
}

// Elliptic Curve Arithmetic on y^2 = x^3 + ax + b (mod p)
const CURVE = {
  a: 2,
  b: 2,
  p: 17,
  G: { x: 5, y: 1 },
  n: 19 // Order of G
};

function pointAdd(P, Q, a, p) {
  if (!P) return Q;
  if (!Q) return P;
  
  let lambda;
  if (P.x === Q.x && P.y === Q.y) {
    // Point doubling
    if (P.y === 0) return null;
    const num = (3 * P.x * P.x + a);
    const den = modInverse(2 * P.y, p);
    lambda = mod(num * den, p);
  } else {
    // Point addition
    if (P.x === Q.x) return null; // Vertical line
    const num = (Q.y - P.y);
    const den = modInverse(Q.x - P.x, p);
    lambda = mod(num * den, p);
  }
  
  const x3 = mod(lambda * lambda - P.x - Q.x, p);
  const y3 = mod(lambda * (P.x - x3) - P.y, p);
  return { x: x3, y: y3 };
}

function scalarMult(k, P, a, p) {
  let result = null;
  let addend = P;
  let scalar = k;
  
  while (scalar > 0) {
    if (scalar & 1) {
      result = pointAdd(result, addend, a, p);
    }
    addend = pointAdd(addend, addend, a, p);
    scalar >>= 1;
  }
  return result;
}

function scalarMultSequence(k, P, a, p) {
  const steps = [];
  let acc = null;
  for (let i = 1; i <= k; i++) {
    acc = pointAdd(acc, P, a, p);
    if (acc) {
      steps.push({ i, x: acc.x, y: acc.y });
    } else {
      steps.push({ i, x: '∞', y: '∞' });
    }
  }
  return steps;
}

function findCurvePoints(a, b, p) {
  const points = [];
  for (let x = 0; x < p; x++) {
    const rhs = mod(x * x * x + a * x + b, p);
    for (let y = 0; y < p; y++) {
      if (mod(y * y, p) === rhs) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

// --- Styles ---
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
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  col: {
    flex: 1,
    minWidth: '300px',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#90caf9',
    marginBottom: '4px',
    fontWeight: 'bold',
  },
  value: {
    fontSize: '16px',
    fontFamily: 'monospace',
    color: '#fff',
    backgroundColor: '#0f0f23',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #3a4a6b',
    display: 'inline-block',
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
  button: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#4caf50',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    marginTop: '8px',
  },
  stepCalc: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#a5d6a7',
    backgroundColor: '#0f0f23',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '8px',
    lineHeight: '1.5',
  },
  canvas: {
    width: '100%',
    height: '300px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '1px solid #3a4a6b',
    marginTop: '16px',
  },
  pointLabel: {
    fontSize: '10px',
    fill: '#ccc',
  }
};

// --- Visualization Component ---
function CurveVisualizer({ highlightPoints = [], label = "" }) {
  const { a, b, p } = CURVE;
  const points = useMemo(() => findCurvePoints(a, b, p), [a, b, p]);
  
  const width = 400;
  const height = 300;
  const padding = 30;
  
  const scaleX = (width - 2 * padding) / p;
  const scaleY = (height - 2 * padding) / p;
  
  const toSvgX = (x) => padding + x * scaleX;
  const toSvgY = (y) => height - padding - y * scaleY;
  
  return (
    <div style={{marginTop: '16px'}}>
      <div style={{fontSize: '12px', color: '#888', marginBottom: '4px', textAlign: 'center'}}>
        {label || `曲线: y² ≡ x³ + ${a}x + ${b} (mod ${p})`}
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.canvas}>
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#444" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#444" strokeWidth="1" />
        
        {/* All Curve Points */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={toSvgX(pt.x)}
            cy={toSvgY(pt.y)}
            r="3"
            fill="#333"
          />
        ))}
        
        {/* Highlighted Points */}
        {highlightPoints.map((item, i) => {
           if (!item || !item.point) return null;
           const { point, color, label: ptLabel } = item;
           return (
             <React.Fragment key={`hl-${i}`}>
               <circle
                 cx={toSvgX(point.x)}
                 cy={toSvgY(point.y)}
                 r="6"
                 fill={color || '#f00'}
                 stroke="#fff"
                 strokeWidth="1"
               />
               <text 
                 x={toSvgX(point.x)} 
                 y={toSvgY(point.y) - 10} 
                 textAnchor="middle" 
                 fill={color || '#f00'}
                 fontSize="14"
                 fontWeight="bold"
               >
                 {ptLabel}
               </text>
             </React.Fragment>
           );
        })}
      </svg>
    </div>
  );
}

// --- Main Component ---
export default function ECDSADemo() {
  const [activeTab, setActiveTab] = useState('keygen');
  
  // State
  const [d, setD] = useState(7);
  const [Q, setQ] = useState(null);
  
  const [message, setMessage] = useState('Hello');
  const [k, setK] = useState(10);
  const [signature, setSignature] = useState(null); // {r, s, R, z}
  
  const [verifyMsg, setVerifyMsg] = useState('Hello');
  const [verifySig, setVerifySig] = useState({ r: 0, s: 0 });
  const [verificationResult, setVerificationResult] = useState(null); // {w, u1, u2, P, valid}
  const keygenSteps = useMemo(() => scalarMultSequence(d, CURVE.G, CURVE.a, CURVE.p), [d]);
  const signSteps = useMemo(
    () => (signature ? scalarMultSequence(signature.k_used, CURVE.G, CURVE.a, CURVE.p) : []),
    [signature]
  );

  // Auto-generate Q when d changes
  useEffect(() => {
    const pub = scalarMult(d, CURVE.G, CURVE.a, CURVE.p);
    setQ(pub);
  }, [d]);
  
  // Handlers
  const generateNewKey = () => {
    const newD = Math.floor(Math.random() * (CURVE.n - 1)) + 1;
    setD(newD);
  };
  
  const signMessage = () => {
    // 1. Hash
    let hashSum = 0;
    for (let i = 0; i < message.length; i++) {
      hashSum += message.charCodeAt(i);
    }
    const z = hashSum % CURVE.n; // Simple hash
    
    // 2. k (use current k state)
    
    // 3. R = k*G
    const R = scalarMult(k, CURVE.G, CURVE.a, CURVE.p);
    
    // 4. r = R.x mod n
    const r = mod(R.x, CURVE.n);
    
    // 5. s = k^-1 (z + r*d) mod n
    const kInv = modInverse(k, CURVE.n);
    const sum = z + r * d;
    const product = kInv * sum;
    const s = mod(product, CURVE.n);
    
    setSignature({ r, s, R, z, k_used: k, hashSum, kInv, sum, product });
    
    // Pre-fill verify tab
    setVerifyMsg(message);
    setVerifySig({ r, s });
    setVerificationResult(null); // Reset verification
  };
  
  const verifySignature = () => {
    const { r, s } = verifySig;
    if (!r || !s) return;
    
    // 1. z
    let hashSum = 0;
    for (let i = 0; i < verifyMsg.length; i++) {
      hashSum += verifyMsg.charCodeAt(i);
    }
    const z = hashSum % CURVE.n;
    
    // 2. w = s^-1
    const w = modInverse(s, CURVE.n);
    
    // 3. u1 = z*w, u2 = r*w
    const u1Raw = z * w;
    const u2Raw = r * w;
    const u1 = mod(u1Raw, CURVE.n);
    const u2 = mod(u2Raw, CURVE.n);
    
    // 4. P = u1*G + u2*Q
    const P1 = scalarMult(u1, CURVE.G, CURVE.a, CURVE.p);
    const P2 = scalarMult(u2, Q, CURVE.a, CURVE.p);
    const P = pointAdd(P1, P2, CURVE.a, CURVE.p);
    
    const valid = P && mod(P.x, CURVE.n) === parseInt(r);
    
    setVerificationResult({ hashSum, z, w, u1Raw, u2Raw, u1, u2, P1, P2, P, valid });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 ECDSA 签名演示</h2>
      
      {/* Parameters Info */}
      <div style={{marginBottom: '16px', fontSize: '13px', color: '#aaa'}}>
        参数: p={CURVE.p}, a={CURVE.a}, b={CURVE.b}, G=({CURVE.G.x},{CURVE.G.y}), n={CURVE.n}
      </div>

      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'keygen' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('keygen')}
        >
          1. 密钥生成
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'sign' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('sign')}
        >
          2. 签名生成
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'verify' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('verify')}
        >
          3. 签名验证
        </button>
      </div>

      {activeTab === 'keygen' && (
        <div style={styles.section}>
          <div style={styles.row}>
            <div style={styles.col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>私钥 d (随机整数)</label>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <span style={styles.value}>{d}</span>
                  <button 
                    style={{...styles.button, padding: '4px 8px', fontSize: '12px', marginTop: 0}}
                    onClick={generateNewKey}
                  >
                    🎲 随机生成
                  </button>
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>公钥 Q = d × G</label>
                <span style={styles.value}>
                  {Q ? `(${Q.x}, ${Q.y})` : 'Computing...'}
                </span>
              </div>
              <div style={styles.stepCalc}>
                G = ({CURVE.G.x}, {CURVE.G.y})<br/>
                Q = {d} × G = ({Q?.x}, {Q?.y})
              </div>
              <div style={{fontSize: '12px', color: '#9ca3af', marginTop: '6px'}}>
                注：点乘是“重复点加法”，不是坐标相乘
              </div>
              <details style={{marginTop: '10px', fontSize: '12px', color: '#cbd5f5'}}>
                <summary style={{cursor: 'pointer'}}>展开点乘过程（逐次相加）</summary>
                <div style={{marginTop: '6px', lineHeight: '1.7', color: '#e2e8f0'}}>
                  {keygenSteps.map(step => (
                    <div key={step.i}>
                      {step.i}G = ({step.x}, {step.y})
                    </div>
                  ))}
                </div>
              </details>
            </div>
            <div style={styles.col}>
              <CurveVisualizer 
                highlightPoints={[
                  { point: CURVE.G, color: '#2196f3', label: 'G' },
                  { point: Q, color: '#4caf50', label: 'Q' }
                ]} 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sign' && (
        <div style={styles.section}>
          <div style={styles.row}>
            <div style={styles.col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>消息 m</label>
                <input 
                  style={styles.input} 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>随机数 k (1 ~ {CURVE.n-1})</label>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input 
                    type="range" min="1" max={CURVE.n-1} 
                    value={k} 
                    onChange={e => setK(parseInt(e.target.value))}
                    style={{flex: 1}}
                  />
                  <span style={styles.value}>{k}</span>
                </div>
              </div>
              <button style={styles.button} onClick={signMessage}>✍️ 生成签名</button>
              
              {signature && (
                <div style={styles.stepCalc}>
                  <strong>Step 1: 哈希</strong><br/>
                  hash("{message}") = 字符编码求和 = {signature.hashSum}<br/>
                  z = {signature.hashSum} % {CURVE.n} = {signature.z}<br/>
                  <br/>
                  <strong>Step 2: 计算 R = kG</strong><br/>
                  R = {signature.k_used} × G = ({signature.R.x}, {signature.R.y})<br/>
                  <details style={{marginTop: '6px', fontSize: '12px', color: '#cbd5f5'}}>
                    <summary style={{cursor: 'pointer'}}>展开 k×G 的逐次相加过程</summary>
                    <div style={{marginTop: '6px', lineHeight: '1.7', color: '#e2e8f0'}}>
                      {signSteps.map(step => (
                        <div key={step.i}>
                          {step.i}G = ({step.x}, {step.y})
                        </div>
                      ))}
                    </div>
                  </details>
                  <br/>
                  <strong>Step 3: 计算 r, s</strong><br/>
                  r = R.x % n = {signature.R.x} % {CURVE.n} = <span style={{color:'#ff9800', fontWeight:'bold'}}>{signature.r}</span><br/>
                  <br/>
                  k⁻¹ = {signature.k_used}⁻¹ mod {CURVE.n} = {signature.kInv}<br/>
                  z + r·d = {signature.z} + {signature.r}·{d} = {signature.sum}<br/>
                  k⁻¹ × (z + r·d) = {signature.kInv} × {signature.sum} = {signature.product}<br/>
                  s = {signature.product} % {CURVE.n} = <span style={{color:'#e91e63', fontWeight:'bold'}}>{signature.s}</span>
                </div>
              )}
            </div>
            <div style={styles.col}>
              <CurveVisualizer 
                highlightPoints={signature ? [
                  { point: CURVE.G, color: '#2196f3', label: 'G' },
                  { point: signature.R, color: '#ff9800', label: 'R' }
                ] : [{ point: CURVE.G, color: '#2196f3', label: 'G' }]} 
                label={signature ? `R = ${signature.k_used}G` : ''}
              />
              {signature && (
                <div style={{marginTop: '12px', textAlign: 'center', padding: '10px', border: '1px solid #4caf50', borderRadius: '4px'}}>
                  📝 签名结果: ({signature.r}, {signature.s})
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verify' && (
        <div style={styles.section}>
           <div style={styles.row}>
            <div style={styles.col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>消息 m</label>
                <input 
                  style={styles.input} 
                  value={verifyMsg} 
                  onChange={e => setVerifyMsg(e.target.value)} 
                />
              </div>
              <div style={{display: 'flex', gap: '8px'}}>
                <div style={{flex: 1}}>
                  <label style={styles.label}>签名 r</label>
                  <input 
                    type="number" style={styles.input} 
                    value={verifySig.r} 
                    onChange={e => setVerifySig({...verifySig, r: parseInt(e.target.value)})}
                  />
                </div>
                <div style={{flex: 1}}>
                  <label style={styles.label}>签名 s</label>
                  <input 
                    type="number" style={styles.input} 
                    value={verifySig.s} 
                    onChange={e => setVerifySig({...verifySig, s: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <button style={styles.button} onClick={verifySignature}>✅ 验证签名</button>
              
              {verificationResult && (
                <div style={styles.stepCalc}>
                  <strong>计算过程:</strong><br/>
                  hash("{verifyMsg}") = 字符编码求和 = {verificationResult.hashSum}<br/>
                  z = {verificationResult.hashSum} % {CURVE.n} = {verificationResult.z}<br/>
                  <br/>
                  w = s⁻¹ = {verifySig.s}⁻¹ mod {CURVE.n} = {verificationResult.w}<br/>
                  u₁ = z·w = {verificationResult.z} × {verificationResult.w} = {verificationResult.u1Raw}<br/>
                  u₁ = {verificationResult.u1Raw} % {CURVE.n} = {verificationResult.u1}<br/>
                  u₂ = r·w = {verifySig.r} × {verificationResult.w} = {verificationResult.u2Raw}<br/>
                  u₂ = {verificationResult.u2Raw} % {CURVE.n} = {verificationResult.u2}<br/>
                  <br/>
                  <strong>恢复点 P:</strong><br/>
                  P = u₁G + u₂Q<br/>
                  &nbsp;&nbsp;= {verificationResult.u1}G + {verificationResult.u2}Q<br/>
                  &nbsp;&nbsp;= ({verificationResult.P1?.x},{verificationResult.P1?.y}) + ({verificationResult.P2?.x},{verificationResult.P2?.y})<br/>
                  &nbsp;&nbsp;= ({verificationResult.P?.x}, {verificationResult.P?.y})
                  <br/><br/>
                  <strong>验证:</strong><br/>
                  P.x = {verificationResult.P?.x}<br/>
                  r = {verifySig.r}<br/>
                  {verificationResult.valid 
                    ? <span style={{color: '#4caf50', fontSize: '16px'}}>✅ {verificationResult.P?.x} == {verifySig.r} (验证通过)</span> 
                    : <span style={{color: '#f44336', fontSize: '16px'}}>❌ {verificationResult.P?.x} != {verifySig.r} (验证失败)</span>}
                </div>
              )}
            </div>
            <div style={styles.col}>
              <CurveVisualizer 
                highlightPoints={verificationResult && verificationResult.P ? [
                  { point: CURVE.G, color: '#2196f3', label: 'G' },
                  { point: Q, color: '#4caf50', label: 'Q' },
                  { point: verificationResult.P, color: '#9c27b0', label: 'P' }
                ] : [
                  { point: CURVE.G, color: '#2196f3', label: 'G' },
                  { point: Q, color: '#4caf50', label: 'Q' }
                ]} 
                label={verificationResult ? "验证点 P = u₁G + u₂Q" : "准备验证..."}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
