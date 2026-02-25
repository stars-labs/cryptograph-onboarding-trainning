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

// Twisted Edwards Curve: ax^2 + y^2 = 1 + dx^2y^2 (mod p)
// Ed25519 uses a=-1. Here we use a=1 for simplicity x^2 + y^2 = 1 + dx^2y^2
const CURVE = {
  p: 17,
  d: 2,
  B: { x: 5, y: 12 }, // Base point
  L: 19 // Order of B
};

// Edwards Point Addition
// x3 = (x1y2 + y1x2) / (1 + dx1x2y1y2)
// y3 = (y1y2 - x1x2) / (1 - dx1x2y1y2)  (for a=1)
function pointAdd(P, Q, d, p) {
  if (!P) return Q;
  if (!Q) return P;
  
  const x1 = P.x, y1 = P.y;
  const x2 = Q.x, y2 = Q.y;
  
  const dx1x2y1y2 = mod(d * x1 * x2 * y1 * y2, p);
  
  const numX = mod(x1 * y2 + y1 * x2, p);
  const denX = mod(1 + dx1x2y1y2, p);
  
  const numY = mod(y1 * y2 - x1 * x2, p); // a=1
  const denY = mod(1 - dx1x2y1y2, p);
  
  if (denX === 0 || denY === 0) return null; // Should not happen for complete formulae
  
  const x3 = mod(numX * modInverse(denX, p), p);
  const y3 = mod(numY * modInverse(denY, p), p);
  
  return { x: x3, y: y3 };
}

function scalarMult(k, P, d, p) {
  let result = null; // Identity is (0, 1) for Edwards
  let addend = P;
  let scalar = k;
  
  // Identity element for Edwards curve is (0, 1)
  // But our pointAdd handles null as identity.
  // Ideally we should use {x:0, y:1} as identity.
  
  // Let's stick to null as "zero point" logic for simplicity,
  // or use proper Edwards identity (0, 1).
  // pointAdd(P, null) returns P.
  // pointAdd(P, (0,1)) -> let's check formula.
  // x = (x*1 + y*0)/(1+0) = x. y = (y*1 - x*0)/(1-0) = y. Correct.
  
  while (scalar > 0) {
    if (scalar & 1) {
      result = result ? pointAdd(result, addend, d, p) : addend;
    }
    addend = pointAdd(addend, addend, d, p);
    scalar >>= 1;
  }
  return result || { x: 0, y: 1 };
}

function findCurvePoints(d, p) {
  const points = [];
  for (let x = 0; x < p; x++) {
    // y^2 = (1 - x^2) / (1 - dx^2)
    const num = mod(1 - x * x, p);
    const den = mod(1 - d * x * x, p);
    
    if (den === 0) continue;
    
    const y2 = mod(num * modInverse(den, p), p);
    
    for (let y = 0; y < p; y++) {
      if (mod(y * y, p) === y2) {
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
    color: '#00e5ff',
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
    color: '#00e5ff',
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
    backgroundColor: '#00e5ff',
    color: '#000',
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
};

function CurveVisualizer({ highlightPoints = [], label = "" }) {
  const { d, p } = CURVE;
  const points = useMemo(() => findCurvePoints(d, p), [d, p]);
  
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
        {label || `Edwards 曲线: x² + y² ≡ 1 + ${d}x²y² (mod ${p})`}
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.canvas}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#444" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#444" strokeWidth="1" />
        
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={toSvgX(pt.x)}
            cy={toSvgY(pt.y)}
            r="3"
            fill="#333"
          />
        ))}
        
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

export default function EdDSADemo() {
  const [activeTab, setActiveTab] = useState('keygen');
  
  const [privKey, setPrivKey] = useState(9); // "Seed" (simplified)
  const [A, setA] = useState(null); // Public key
  
  const [message, setMessage] = useState('EdDSA');
  const [signature, setSignature] = useState(null); // {R, S, r}
  
  const [verifyMsg, setVerifyMsg] = useState('EdDSA');
  const [verifySig, setVerifySig] = useState({ S: 0, R: null });
  const [verifyInputR, setVerifyInputR] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  // Key Generation
  useEffect(() => {
    // In real EdDSA: H(privKey) -> (a, prefix)
    // Simplified: a = privKey, prefix = privKey + 100
    const a = privKey; 
    const pub = scalarMult(a, CURVE.B, CURVE.d, CURVE.p);
    setA(pub);
  }, [privKey]);
  
  const generateNewKey = () => {
    const newK = Math.floor(Math.random() * (CURVE.L - 1)) + 1;
    setPrivKey(newK);
  };
  
  const signMessage = () => {
    // 1. Deterministic r = Hash(prefix + message)
    // Simplified: hash of (privKey + msg)
    let hashVal = 0;
    const input = privKey + message;
    for (let i = 0; i < input.length; i++) hashVal += input.charCodeAt(i);
    const r = mod(hashVal, CURVE.L);
    
    // 2. R = r * B
    const R = scalarMult(r, CURVE.B, CURVE.d, CURVE.p);
    
    // 3. k = Hash(R + A + m)
    let kHash = 0;
    const kInput = `${R.x},${R.y}` + `${A.x},${A.y}` + message;
    for (let i = 0; i < kInput.length; i++) kHash += kInput.charCodeAt(i);
    const k = mod(kHash, CURVE.L);
    
    // 4. S = (r + k * a) mod L
    const S = mod(r + k * privKey, CURVE.L);
    
    setSignature({ R, S, r, k });
    
    setVerifyMsg(message);
    setVerifySig({ S, R });
    setVerifyInputR(R ? `(${R.x}, ${R.y})` : '');
    setVerificationResult(null);
  };
  
  const verifySignature = () => {
    let R_parsed = verifySig.R;
    try {
        if (!R_parsed) {
            const parts = verifyInputR.replace(/[()]/g, '').split(',');
            if (parts.length === 2) {
                R_parsed = { x: parseInt(parts[0]), y: parseInt(parts[1]) };
            }
        }
    } catch(e) {}
    
    if (!R_parsed || !verifySig.S) return;
    
    // 1. k = Hash(R + A + m)
    let kHash = 0;
    const kInput = `${R_parsed.x},${R_parsed.y}` + `${A.x},${A.y}` + verifyMsg;
    for (let i = 0; i < kInput.length; i++) kHash += kInput.charCodeAt(i);
    const k = mod(kHash, CURVE.L);
    
    // 2. Check SB == R + kA
    const LHS = scalarMult(verifySig.S, CURVE.B, CURVE.d, CURVE.p);
    
    const kA = scalarMult(k, A, CURVE.d, CURVE.p);
    const RHS = pointAdd(R_parsed, kA, CURVE.d, CURVE.p);
    
    const valid = LHS.x === RHS.x && LHS.y === RHS.y;
    
    setVerificationResult({ k, LHS, RHS, valid });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🌪️ EdDSA 签名演示 (Edwards 曲线)</h2>
      
      <div style={{marginBottom: '16px', fontSize: '13px', color: '#aaa'}}>
        参数: p={CURVE.p}, d={CURVE.d} (Twisted Edwards), B=({CURVE.B.x},{CURVE.B.y}), Order={CURVE.L}
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
                <label style={styles.label}>私钥种子 (简化)</label>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <span style={styles.value}>{privKey}</span>
                  <button 
                    style={{...styles.button, padding: '4px 8px', fontSize: '12px', marginTop: 0}}
                    onClick={generateNewKey}
                  >
                    🎲 随机
                  </button>
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>公钥 A = s × B</label>
                <span style={styles.value}>
                  {A ? `(${A.x}, ${A.y})` : '...'}
                </span>
              </div>
              <div style={styles.stepCalc}>
                EdDSA 使用 Twisted Edwards 曲线。<br/>
                密钥生成类似于 Schnorr，但标量 s 是从私钥哈希确定的。<br/>
                A = {privKey} × B = ({A?.x}, {A?.y})
              </div>
            </div>
            <div style={styles.col}>
              <CurveVisualizer 
                highlightPoints={[
                  { point: CURVE.B, color: '#2196f3', label: 'B' },
                  { point: A, color: '#4caf50', label: 'A' }
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
              <button style={styles.button} onClick={signMessage}>✍️ 生成确定性签名</button>
              
              {signature && (
                <div style={styles.stepCalc}>
                  <strong>Step 1: 确定性随机数 r</strong><br/>
                  r = Hash(seed + m) % L = <span style={{color:'#ff9800'}}>{signature.r}</span><br/>
                  (EdDSA 不需要真的随机数生成器！)<br/>
                  <br/>
                  <strong>Step 2: 计算 R = rB</strong><br/>
                  R = {signature.r} × B = ({signature.R.x}, {signature.R.y})<br/>
                  <br/>
                  <strong>Step 3: 计算挑战 k</strong><br/>
                  k = Hash(R || A || m) % L = {signature.k}<br/>
                  <br/>
                  <strong>Step 4: 计算 S</strong><br/>
                  S = (r + k × s) % L<br/>
                  &nbsp;&nbsp;= ({signature.r} + {signature.k} × {privKey}) % {CURVE.L}<br/>
                  &nbsp;&nbsp;= <span style={{color:'#e91e63', fontWeight:'bold'}}>{signature.S}</span>
                </div>
              )}
            </div>
            <div style={styles.col}>
              <CurveVisualizer 
                highlightPoints={signature ? [
                  { point: CURVE.B, color: '#2196f3', label: 'B' },
                  { point: signature.R, color: '#ff9800', label: 'R' }
                ] : [{ point: CURVE.B, color: '#2196f3', label: 'B' }]} 
                label={signature ? `承诺 R = ${signature.r}B` : ''}
              />
              {signature && (
                <div style={{marginTop: '12px', textAlign: 'center', padding: '10px', border: '1px solid #4caf50', borderRadius: '4px'}}>
                  📝 签名: (R, S) = (({signature.R.x},{signature.R.y}), {signature.S})
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
                  <label style={styles.label}>签名 R (点)</label>
                  <input 
                    type="text" style={styles.input} 
                    value={verifyInputR} 
                    onChange={e => setVerifyInputR(e.target.value)}
                    placeholder="(x, y)"
                  />
                </div>
                <div style={{flex: 1}}>
                  <label style={styles.label}>签名 S</label>
                  <input 
                    type="number" style={styles.input} 
                    value={verifySig.S} 
                    onChange={e => setVerifySig({...verifySig, S: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <button style={styles.button} onClick={verifySignature}>✅ 验证签名</button>
              
              {verificationResult && (
                <div style={styles.stepCalc}>
                  <strong>验证方程: 8SB = 8R + 8kA</strong><br/>
                  (此处忽略 cofactor 8，简化为 SB = R + kA)<br/>
                  <br/>
                  <strong>计算:</strong><br/>
                  左边 SB = {verifySig.S}B = ({verificationResult.LHS?.x}, {verificationResult.LHS?.y})<br/>
                  右边 R + kA = ({verificationResult.RHS?.x}, {verificationResult.RHS?.y})<br/>
                  <br/>
                  <strong>结果:</strong><br/>
                  {verificationResult.valid 
                    ? <span style={{color: '#4caf50', fontSize: '16px'}}>✅ 相等 (验证通过)</span> 
                    : <span style={{color: '#f44336', fontSize: '16px'}}>❌ 不相等 (验证失败)</span>}
                </div>
              )}
            </div>
            <div style={styles.col}>
              <CurveVisualizer 
                highlightPoints={verificationResult ? [
                  { point: CURVE.B, color: '#2196f3', label: 'B' },
                  { point: A, color: '#4caf50', label: 'A' },
                  { point: verificationResult.LHS, color: '#9c27b0', label: 'SB' }
                ] : [
                  { point: CURVE.B, color: '#2196f3', label: 'B' },
                  { point: A, color: '#4caf50', label: 'A' }
                ]} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
