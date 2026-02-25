import React, { useState, useMemo, useEffect } from 'react';

// --- Mathematical Helpers ---

function mod(n, m) {
  return ((n % m) + m) % m;
}

// Elliptic Curve Arithmetic on y^2 = x^3 + ax + b (mod p)
// Same small parameters as ECDSA for visualization
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
    if (P.y === 0) return null;
    const num = (3 * P.x * P.x + a);
    let den = 2 * P.y;
    // Modular inverse of den
    let inv = 0;
    for (let i = 1; i < p; i++) {
        if ((den * i) % p === 1) {
            inv = i;
            break;
        }
    }
    lambda = mod(num * inv, p);
  } else {
    if (P.x === Q.x) return null; // Vertical line
    const num = (Q.y - P.y);
    let den = Q.x - P.x;
    let inv = 0;
    den = mod(den, p);
    for (let i = 1; i < p; i++) {
        if ((den * i) % p === 1) {
            inv = i;
            break;
        }
    }
    lambda = mod(num * inv, p);
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

// --- Styles (Reused) ---
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
    color: '#f06292', // Pink for Schnorr
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
    color: '#f06292',
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
    backgroundColor: '#f06292',
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
};

// --- Visualization Component ---
function HashExplanation({ R, P, m, e }) {
  if (!R || !P) return null;
  return (
    <div style={{marginTop: '8px', padding: '10px', backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: '6px', border: '1px solid #ff9800'}}>
      <div style={{fontSize: '12px', color: '#ffcc80', marginBottom: '6px'}}>
        🔍 <strong>详解: Hash(R || P || m)</strong>
      </div>
      <div style={{fontSize: '12px', color: '#ccc', marginBottom: '8px', lineHeight: '1.4'}}>
        "||" 符号代表<strong>拼接 (Concatenation)</strong>。
        <br/>
        为了确保签名的安全性，我们需要把 <strong>随机点 R</strong>、<strong>公钥 P</strong> 和 <strong>消息 m</strong> 绑定在一起。
      </div>
      
      <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace', fontSize: '11px', flexWrap: 'wrap'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
          <div style={{padding: '4px 8px', border: '1px solid #ff9800', borderRadius: '4px', color: '#ff9800', background: 'rgba(255, 152, 0, 0.1)'}}>
            R:({R.x},{R.y})
          </div>
          <span style={{fontSize:'10px', color:'#666'}}>随机承诺</span>
        </div>
        
        <div style={{color: '#888', fontWeight: 'bold'}}>||</div>
        
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
          <div style={{padding: '4px 8px', border: '1px solid #4caf50', borderRadius: '4px', color: '#4caf50', background: 'rgba(76, 175, 80, 0.1)'}}>
            P:({P.x},{P.y})
          </div>
          <span style={{fontSize:'10px', color:'#666'}}>公钥</span>
        </div>
        
        <div style={{color: '#888', fontWeight: 'bold'}}>||</div>
        
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
          <div style={{padding: '4px 8px', border: '1px solid #2196f3', borderRadius: '4px', color: '#2196f3', background: 'rgba(33, 150, 243, 0.1)'}}>
            m:"{m}"
          </div>
          <span style={{fontSize:'10px', color:'#666'}}>消息</span>
        </div>
        
        <div style={{color: '#888'}}>→</div>
        <div style={{padding: '4px', backgroundColor: '#333', borderRadius: '4px', fontSize: '10px'}}>
          哈希函数
        </div>
        <div style={{color: '#888'}}>→</div>
        <div style={{fontWeight: 'bold', color: '#ff9800', fontSize: '14px'}}>
          e = {e}
        </div>
      </div>
    </div>
  );
}

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

// --- Main Component ---
export default function SchnorrDemo() {
  const [activeTab, setActiveTab] = useState('keygen');
  
  // Single Sign State
  const [d, setD] = useState(7);
  const [P, setP] = useState(null);
  const [message, setMessage] = useState('Schnorr!');
  const [k, setK] = useState(10);
  const [signature, setSignature] = useState(null);
  const [verifyMsg, setVerifyMsg] = useState('Schnorr!');
  const [verifySig, setVerifySig] = useState({ s: 0, e: 0, R: null });
  const [verifyInputR, setVerifyInputR] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  // Aggregation State
  const [aggSigners, setAggSigners] = useState([
    { id: 1, d: 3, k: 4, name: 'Alice' },
    { id: 2, d: 5, k: 11, name: 'Bob' },
    { id: 3, d: 2, k: 7, name: 'Carol' }
  ]);
  const [aggResult, setAggResult] = useState(null);

  // Auto-generate P
  useEffect(() => {
    const pub = scalarMult(d, CURVE.G, CURVE.a, CURVE.p);
    setP(pub);
  }, [d]);
  
  const generateNewKey = () => {
    const newD = Math.floor(Math.random() * (CURVE.n - 1)) + 1;
    setD(newD);
  };
  
  const signMessage = () => {
    const R = scalarMult(k, CURVE.G, CURVE.a, CURVE.p);
    let hashVal = 0;
    for (let i = 0; i < message.length; i++) hashVal += message.charCodeAt(i);
    hashVal += R.x + (P ? P.x : 0);
    const e = mod(hashVal, CURVE.n);
    const s = mod(k + e * d, CURVE.n);
    setSignature({ R, s, e, k_used: k });
    setVerifyMsg(message);
    setVerifySig({ s, e, R });
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
    
    if (!R_parsed || !verifySig.s) return;
    
    let hashVal = 0;
    for (let i = 0; i < verifyMsg.length; i++) hashVal += verifyMsg.charCodeAt(i);
    hashVal += R_parsed.x + (P ? P.x : 0);
    const e_calc = mod(hashVal, CURVE.n);
    
    const sG = scalarMult(verifySig.s, CURVE.G, CURVE.a, CURVE.p);
    const eP = scalarMult(e_calc, P, CURVE.a, CURVE.p);
    const RHS = pointAdd(R_parsed, eP, CURVE.a, CURVE.p);
    
    const valid = sG && RHS && sG.x === RHS.x && sG.y === RHS.y;
    setVerificationResult({ e_calc, sG, eP, RHS, valid, R: R_parsed });
  };

  const runAggregation = () => {
    // 1. Calculate P_agg
    let P_agg = null;
    const signersWithP = aggSigners.map(s => {
      const P = scalarMult(s.d, CURVE.G, CURVE.a, CURVE.p);
      P_agg = pointAdd(P_agg, P, CURVE.a, CURVE.p);
      return { ...s, P };
    });

    // 2. Calculate R_agg
    let R_agg = null;
    const signersWithR = signersWithP.map(s => {
      const R = scalarMult(s.k, CURVE.G, CURVE.a, CURVE.p);
      R_agg = pointAdd(R_agg, R, CURVE.a, CURVE.p);
      return { ...s, R };
    });

    // 3. Challenge e = H(R_agg || P_agg || m)
    const msg = "Agg";
    let hashVal = 0;
    for (let i = 0; i < msg.length; i++) hashVal += msg.charCodeAt(i);
    hashVal += R_agg.x + P_agg.x;
    const e = mod(hashVal, CURVE.n);

    // 4. Calculate partial signatures
    let s_agg = 0;
    const signersWithSig = signersWithR.map(s => {
        const sig = mod(s.k + e * s.d, CURVE.n);
        s_agg = mod(s_agg + sig, CURVE.n);
        return { ...s, sig };
    });

    // 5. Verify
    const LHS = scalarMult(s_agg, CURVE.G, CURVE.a, CURVE.p);
    const eP_agg = scalarMult(e, P_agg, CURVE.a, CURVE.p);
    const RHS = pointAdd(R_agg, eP_agg, CURVE.a, CURVE.p);
    const valid = LHS.x === RHS.x && LHS.y === RHS.y;

    setAggResult({
        P_agg, R_agg, e, s_agg, signers: signersWithSig, LHS, RHS, valid
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📐 Schnorr 签名演示</h2>
      
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
        <button
          style={{...styles.tab, ...(activeTab === 'agg' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => { setActiveTab('agg'); runAggregation(); }}
        >
          4. 签名聚合 (MuSig)
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
                <label style={styles.label}>公钥 P = d × G</label>
                <span style={styles.value}>
                  {P ? `(${P.x}, ${P.y})` : 'Computing...'}
                </span>
              </div>
              <div style={styles.stepCalc}>
                与 ECDSA 相同：<br/>
                P = {d} × G = ({P?.x}, {P?.y})
              </div>
            </div>
            <div style={styles.col}>
              <CurveVisualizer 
                highlightPoints={[
                  { point: CURVE.G, color: '#2196f3', label: 'G' },
                  { point: P, color: '#4caf50', label: 'P' }
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
                  <strong>Step 1: 计算 R = kG</strong><br/>
                  R = {signature.k_used} × G = ({signature.R.x}, {signature.R.y})<br/>
                  <br/>
                  <strong>Step 2: 计算挑战 e</strong><br/>
                  e = Hash(R || P || m) % {CURVE.n}<br/>
                  &nbsp;&nbsp;= Hash(...) % {CURVE.n} = <span style={{color:'#ff9800'}}>{signature.e}</span><br/>
                  <HashExplanation R={signature.R} P={P} m={message} e={signature.e} />
                  <br/>
                  <br/>
                  <strong>Step 3: 计算 s</strong><br/>
                  s = k + e·d % n<br/>
                  &nbsp;&nbsp;= {signature.k_used} + {signature.e}·{d} % {CURVE.n}<br/>
                  &nbsp;&nbsp;= <span style={{color:'#e91e63', fontWeight:'bold'}}>{signature.s}</span>
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
                  📝 签名: (R, s) = (({signature.R.x},{signature.R.y}), {signature.s})
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
                  <strong>Step 1: 计算挑战 e</strong><br/>
                  e = Hash(R || P || m) = {verificationResult.e_calc}<br/>
                  <br/>
                  <strong>Step 2: 验证 sG = R + eP</strong><br/>
                  左边 sG = {verifySig.s}G = ({verificationResult.sG?.x}, {verificationResult.sG?.y})<br/>
                  右边 R + eP:<br/>
                  &nbsp;&nbsp;eP = {verificationResult.e_calc}P = ({verificationResult.eP?.x}, {verificationResult.eP?.y})<br/>
                  &nbsp;&nbsp;R + eP = ({verificationResult.RHS?.x}, {verificationResult.RHS?.y})
                  <br/><br/>
                  <strong>结果:</strong><br/>
                  {verificationResult.valid 
                    ? <span style={{color: '#4caf50', fontSize: '16px'}}>✅ 左右相等 (验证通过)</span> 
                    : <span style={{color: '#f44336', fontSize: '16px'}}>❌ 不相等 (验证失败)</span>}
                </div>
              )}
            </div>
            <div style={styles.col}>
              <CurveVisualizer 
                highlightPoints={verificationResult ? [
                  { point: CURVE.G, color: '#2196f3', label: 'G' },
                  { point: P, color: '#4caf50', label: 'P' },
                  { point: verificationResult.R, color: '#ff9800', label: 'R' },
                  { point: verificationResult.sG, color: '#9c27b0', label: 'sG' }
                ] : [
                  { point: CURVE.G, color: '#2196f3', label: 'G' },
                  { point: P, color: '#4caf50', label: 'P' }
                ]} 
                label={verificationResult ? "验证: sG (紫) 是否等于 R+eP" : "准备验证..."}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agg' && aggResult && (
        <div style={styles.section}>
          <div style={styles.row}>
            <div style={styles.col}>
              <h3 style={styles.sectionTitle}>MuSig 签名聚合</h3>
              <div style={styles.stepCalc}>
                <strong>Step 1: 聚合公钥</strong><br/>
                {aggResult.signers.map(s => s.name).join(' + ')}<br/>
                P_agg = Σ P_i = ({aggResult.P_agg.x}, {aggResult.P_agg.y})<br/><br/>
                
                <strong>Step 2: 聚合随机数 R</strong><br/>
                R_agg = Σ R_i = ({aggResult.R_agg.x}, {aggResult.R_agg.y})<br/><br/>
                
                <strong>Step 3: 计算挑战 e</strong><br/>
                e = Hash(R_agg || P_agg || "Agg") = {aggResult.e}<br/>
                <HashExplanation R={aggResult.R_agg} P={aggResult.P_agg} m="Agg" e={aggResult.e} />
                <br/><br/>
                
                <strong>Step 4: 计算部分签名 s_i</strong><br/>
                {aggResult.signers.map(s => (
                    <div key={s.id}>
                        {s.name}: s_{s.id} = {s.k} + {aggResult.e}·{s.d} = {s.sig}
                    </div>
                ))}
                <br/>
                <strong>Step 5: 聚合签名 s_agg</strong><br/>
                s_agg = Σ s_i = <span style={{color:'#e91e63', fontWeight:'bold'}}>{aggResult.s_agg}</span>
              </div>
            </div>
            <div style={styles.col}>
                <CurveVisualizer 
                    highlightPoints={[
                        { point: aggResult.P_agg, color: '#4caf50', label: 'P_agg' },
                        { point: aggResult.R_agg, color: '#ff9800', label: 'R_agg' },
                        { point: aggResult.LHS, color: '#9c27b0', label: 's_agg·G' }
                    ]}
                    label="验证: s_agg·G (紫) = R_agg + e·P_agg"
                />
                <div style={{marginTop:'12px', textAlign:'center'}}>
                    {aggResult.valid 
                        ? <div style={{color:'#4caf50', fontSize:'18px', fontWeight:'bold'}}>✅ 聚合签名有效!</div>
                        : <div style={{color:'#f44336'}}>❌ 聚合验证失败</div>
                    }
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
