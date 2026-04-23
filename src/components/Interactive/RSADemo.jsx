import React, { useState, useMemo } from 'react';

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function modPow(base, exp, mod) {
  let result = 1n;
  base = BigInt(base) % BigInt(mod);
  exp = BigInt(exp);
  mod = BigInt(mod);
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return Number(result);
}

function modInverse(a, m) {
  let [old_r, r] = [a, m];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return ((old_s % m) + m) % m;
}

function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

function getExtendedEuclideanTable(e, phi) {
  const rows = [];
  // Row format: { step, r (remainder), q (quotient), t (coeff of e), equation }
  // We are solving: t*e + s*phi = r
  // We only really need to track t (coeff of e) to find d.
  // But tracking r is needed for the algorithm.
  
  let [r_prev, r_curr] = [phi, e];
  let [t_prev, t_curr] = [0, 1]; 
  
  // Initial state (symbolic)
  // phi = 1*phi + 0*e
  // e   = 0*phi + 1*e
  
  let step = 1;
  while (r_curr > 0) {
    const q = Math.floor(r_prev / r_curr);
    const r_next = r_prev % r_curr;
    const t_next = t_prev - q * t_curr;
    
    rows.push({
      step,
      r_prev, r_curr, q, r_next,
      t_prev, t_curr, t_next,
      calc: `${r_prev} = ${q} × ${r_curr} + ${r_next}`
    });
    
    r_prev = r_curr;
    r_curr = r_next;
    t_prev = t_curr;
    t_curr = t_next;
    step++;
  }
  
  return { rows, result: t_prev };
}

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
    color: '#ff9800',
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
  },
  tabActive: {
    backgroundColor: '#16213e',
    color: '#ff9800',
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
    color: '#ffb74d',
    fontSize: '1.1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
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
    color: '#90caf9',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#f44336',
  },
  inputSuccess: {
    borderColor: '#4caf50',
  },
  inputReadonly: {
    backgroundColor: '#1a1a2e',
    color: '#a5d6a7',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ff9800',
    color: '#000',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    border: '1px solid #ff9800',
    color: '#ff9800',
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '1px solid #3a4a6b',
  },
  stepNumber: {
    backgroundColor: '#ff9800',
    color: '#000',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#ffcc80',
  },
  stepCalc: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#a5d6a7',
    backgroundColor: '#1a1a2e',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '8px',
    overflowX: 'auto',
  },
  keyBox: {
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    marginTop: '12px',
  },
  publicKey: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    border: '2px solid #4caf50',
  },
  privateKey: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    border: '2px solid #f44336',
  },
  keyLabel: {
    fontSize: '12px',
    marginBottom: '8px',
  },
  keyValue: {
    fontSize: '18px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  messageBox: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  charBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
    minWidth: '50px',
  },
  charLetter: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff',
  },
  charCode: {
    fontSize: '11px',
    color: '#90caf9',
  },
  arrow: {
    fontSize: '24px',
    color: '#ff9800',
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
  infoBox: {
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    border: '1px solid #ff9800',
    borderRadius: '8px',
    marginTop: '12px',
    fontSize: '13px',
    color: '#ffcc80',
  },
  errorText: {
    color: '#f44336',
    fontSize: '12px',
    marginTop: '4px',
  },
  successText: {
    color: '#4caf50',
    fontSize: '12px',
    marginTop: '4px',
  },
  primeSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
  },
  primeButton: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  primeButtonSelected: {
    backgroundColor: '#ff9800',
    color: '#000',
    borderColor: '#ff9800',
  },
};

function KeyGenDemo({ p, q, setP, setQ, n, e, d, phi }) {
  const [showSteps, setShowSteps] = useState(false);
  
  const euclideanData = useMemo(() => {
    if (phi <= 0) return { rows: [], result: 0 };
    return getExtendedEuclideanTable(e, phi);
  }, [e, phi]);
  
  const pValid = isPrime(p) && p > 1;
  const qValid = isPrime(q) && q > 1 && q !== p;
  
  const isValid = pValid && qValid && p !== q;
  
  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔢 Step 1: 选择两个素数 p 和 q</h3>
        
        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>素数 p</label>
            <input
              type="number"
              style={{
                ...styles.input,
                ...(pValid ? styles.inputSuccess : styles.inputError)
              }}
              value={p}
              onChange={(e) => setP(parseInt(e.target.value) || 0)}
            />
            {!pValid && <span style={styles.errorText}>必须是素数</span>}
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>素数 q</label>
            <input
              type="number"
              style={{
                ...styles.input,
                ...(qValid ? styles.inputSuccess : styles.inputError)
              }}
              value={q}
              onChange={(e) => setQ(parseInt(e.target.value) || 0)}
            />
            {!qValid && <span style={styles.errorText}>必须是不同的素数</span>}
          </div>
        </div>
        
        <div style={styles.primeSelector}>
          <span style={{ color: '#90caf9', fontSize: '12px', marginRight: '8px' }}>快速选择:</span>
          {SMALL_PRIMES.slice(0, 15).map(prime => (
            <button
              key={prime}
              style={{
                ...styles.primeButton,
                ...(p === prime || q === prime ? styles.primeButtonSelected : {})
              }}
              onClick={() => {
                if (p !== prime && q !== prime) {
                  if (!pValid || p === q) setP(prime);
                  else setQ(prime);
                }
              }}
            >
              {prime}
            </button>
          ))}
        </div>
      </div>
      
      {isValid && (
        <>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🔧 Step 2-4: 计算密钥参数</h3>
            
            <button 
              style={{...styles.button, ...styles.buttonSecondary}}
              onClick={() => setShowSteps(!showSteps)}
            >
              {showSteps ? '隐藏计算过程' : '显示计算过程'}
            </button>
            
            {showSteps && (
              <div style={styles.stepContainer}>
                <div style={styles.step}>
                  <div style={styles.stepNumber}>2</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>计算 n = p × q</div>
                    <div style={styles.stepCalc}>
                      n = {p} × {q} = {n}
                    </div>
                  </div>
                </div>
                
                <div style={styles.step}>
                  <div style={styles.stepNumber}>3</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>计算欧拉函数 φ(n) = (p-1)(q-1)</div>
                    <div style={styles.stepCalc}>
                      φ({n}) = ({p}-1) × ({q}-1) = {p-1} × {q-1} = {phi}
                    </div>
                  </div>
                </div>
                
                <div style={styles.step}>
                  <div style={styles.stepNumber}>4</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>选择公钥指数 e (与 φ(n) 互素)</div>
                    <div style={styles.stepCalc}>
                      e = {e} (gcd({e}, {phi}) = {gcd(e, phi)} = 1 ✓)
                    </div>
                  </div>
                </div>
                
                <div style={styles.step}>
                  <div style={styles.stepNumber}>5</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>计算私钥指数 d (e 的模逆元)</div>
                    <div style={styles.stepCalc}>
                      d × e ≡ 1 (mod φ(n))<br/>
                      d × {e} ≡ 1 (mod {phi})<br/>
                      <div style={{marginTop: '8px', marginBottom: '8px', fontSize: '12px', color: '#ccc'}}>
                        使用扩展欧几里得算法求解:
                      </div>
                      <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: '#ccc'}}>
                          <thead>
                            <tr style={{borderBottom: '1px solid #444', color: '#90caf9'}}>
                              <th style={{textAlign: 'left', padding: '4px'}}>Step</th>
                              <th style={{textAlign: 'left', padding: '4px'}}>r (余数)</th>
                              <th style={{textAlign: 'left', padding: '4px'}}>q (商)</th>
                              <th style={{textAlign: 'left', padding: '4px'}}>t (系数)</th>
                              <th style={{textAlign: 'left', padding: '4px'}}>计算式</th>
                            </tr>
                          </thead>
                          <tbody>
                            {euclideanData && euclideanData.rows.map((row, i) => (
                              <tr key={i} style={{borderBottom: '1px solid #333'}}>
                                <td style={{padding: '4px'}}>{row.step}</td>
                                <td style={{padding: '4px'}}>{row.r_next}</td>
                                <td style={{padding: '4px'}}>{row.q}</td>
                                <td style={{padding: '4px', color: '#ff9800'}}>{row.t_next}</td>
                                <td style={{padding: '4px', fontFamily: 'monospace'}}>{row.calc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <br/>
                      结果: d = {euclideanData ? euclideanData.result : '?'} (mod {phi})<br/>
                      {euclideanData && euclideanData.result < 0 && (
                        <>
                          由于结果为负数，转换为正数: {euclideanData.result} + {phi} = {euclideanData.result + phi}<br/>
                        </>
                      )}
                      最终 d = {d}<br/>
                      验证: {d} × {e} = {d * e} = {phi} × {Math.floor((d * e) / phi)} + {(d * e) % phi} ≡ 1 ✓
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🔑 生成的密钥对</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{...styles.keyBox, ...styles.publicKey}}>
                <div style={styles.keyLabel}>🔓 公钥 (可以公开)</div>
                <div style={styles.keyValue}>(e={e}, n={n})</div>
              </div>
              <div style={{...styles.keyBox, ...styles.privateKey}}>
                <div style={styles.keyLabel}>🔐 私钥 (必须保密!)</div>
                <div style={styles.keyValue}>(d={d}, n={n})</div>
              </div>
            </div>
            
            <div style={styles.infoBox}>
              💡 <strong>安全性来源</strong>: 知道 n={n}，但不知道 p={p} 和 q={q} 的人，
              无法计算出 φ(n)={phi}，也就无法计算私钥 d={d}。
              <br/><br/>
              对于小数字，我们可以直接分解 {n} = {p} × {q}。
              但对于 2048 位的大数，分解是计算上不可行的！
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EncryptDecryptDemo({ n, e, d }) {
  const [message, setMessage] = useState('Hi');
  
  const messageNums = message.split('').map(c => c.charCodeAt(0));
  const encrypted = messageNums.map(m => modPow(m, e, n));
  const decrypted = encrypted.map(c => modPow(c, d, n));
  const decryptedMessage = decrypted.map(code => String.fromCharCode(code)).join('');
  
  const isMessageValid = messageNums.every(m => m < n);
  
  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔑 使用的密钥</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{...styles.keyBox, ...styles.publicKey}}>
            <div style={styles.keyLabel}>公钥</div>
            <div style={styles.keyValue}>(e={e}, n={n})</div>
          </div>
          <div style={{...styles.keyBox, ...styles.privateKey}}>
            <div style={styles.keyLabel}>私钥</div>
            <div style={styles.keyValue}>(d={d}, n={n})</div>
          </div>
        </div>
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>✉️ 输入消息</h3>
        <input
          type="text"
          style={{
            ...styles.input,
            fontSize: '18px',
            padding: '12px',
            ...(isMessageValid ? {} : styles.inputError)
          }}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 10))}
          placeholder="输入消息 (ASCII字符)"
          maxLength={10}
        />
        {!isMessageValid && (
          <span style={styles.errorText}>
            某些字符的 ASCII 码 ≥ n={n}，请使用更简单的字符
          </span>
        )}
      </div>
      
      {message && isMessageValid && (
        <>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🔒 加密过程: C = M^e mod n</h3>
            
            <div style={styles.messageBox}>
              {message.split('').map((char, i) => (
                <React.Fragment key={i}>
                  <div style={styles.charBox}>
                    <div style={styles.charLetter}>{char}</div>
                    <div style={styles.charCode}>ASCII: {messageNums[i]}</div>
                  </div>
                  <div style={styles.arrow}>→</div>
                  <div style={styles.charBox}>
                    <div style={styles.charLetter}>{encrypted[i]}</div>
                    <div style={styles.charCode}>{messageNums[i]}^{e} mod {n}</div>
                  </div>
                  {i < message.length - 1 && <div style={{ width: '20px' }} />}
                </React.Fragment>
              ))}
            </div>
            
            <div style={styles.stepCalc}>
              {message.split('').map((char, i) => (
                <div key={i}>
                  '{char}' → {messageNums[i]}^{e} mod {n} = {encrypted[i]}
                </div>
              ))}
            </div>
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🔓 解密过程: M = C^d mod n</h3>
            
            <div style={styles.messageBox}>
              {encrypted.map((cipher, i) => (
                <React.Fragment key={i}>
                  <div style={styles.charBox}>
                    <div style={styles.charLetter}>{cipher}</div>
                    <div style={styles.charCode}>密文</div>
                  </div>
                  <div style={styles.arrow}>→</div>
                  <div style={styles.charBox}>
                    <div style={styles.charLetter}>{decryptedMessage[i]}</div>
                    <div style={styles.charCode}>{cipher}^{d} mod {n} = {decrypted[i]}</div>
                  </div>
                  {i < encrypted.length - 1 && <div style={{ width: '20px' }} />}
                </React.Fragment>
              ))}
            </div>
            
            <div style={{...styles.result, ...styles.resultSuccess}}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅ 解密成功!</div>
              <div style={{ fontSize: '20px' }}>
                原文: "{message}" → 密文: [{encrypted.join(', ')}] → 解密: "{decryptedMessage}"
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SignVerifyDemo({ n, e, d }) {
  const [message, setMessage] = useState('OK');
  
  const hash = message.split('').reduce((acc, c) => (acc + c.charCodeAt(0)) % n, 0) || 1;
  const signature = modPow(hash, d, n);
  const verified = modPow(signature, e, n);
  const isValid = verified === hash;
  
  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔑 密钥对</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{...styles.keyBox, ...styles.publicKey}}>
            <div style={styles.keyLabel}>公钥 (验证用)</div>
            <div style={styles.keyValue}>(e={e}, n={n})</div>
          </div>
          <div style={{...styles.keyBox, ...styles.privateKey}}>
            <div style={styles.keyLabel}>私钥 (签名用)</div>
            <div style={styles.keyValue}>(d={d}, n={n})</div>
          </div>
        </div>
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>✍️ 签名消息</h3>
        <input
          type="text"
          style={{ ...styles.input, fontSize: '18px', padding: '12px' }}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 20))}
          placeholder="输入要签名的消息"
        />
      </div>
      
      {message && (
        <>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>✏️ 签名过程</h3>
            
            <div style={styles.stepContainer}>
              <div style={styles.step}>
                <div style={styles.stepNumber}>1</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>计算消息哈希</div>
                  <div style={styles.stepCalc}>
                    H("{message}") = {hash} (简化哈希)
                  </div>
                </div>
              </div>
              
              <div style={styles.step}>
                <div style={styles.stepNumber}>2</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>用私钥签名: S = H^d mod n</div>
                  <div style={styles.stepCalc}>
                    S = {hash}^{d} mod {n} = {signature}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{...styles.keyBox, backgroundColor: 'rgba(156, 39, 176, 0.2)', border: '2px solid #9c27b0'}}>
              <div style={styles.keyLabel}>📝 数字签名</div>
              <div style={styles.keyValue}>σ = {signature}</div>
            </div>
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>✅ 验证过程</h3>
            
            <div style={styles.stepContainer}>
              <div style={styles.step}>
                <div style={styles.stepNumber}>1</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>用公钥验证: H' = S^e mod n</div>
                  <div style={styles.stepCalc}>
                    H' = {signature}^{e} mod {n} = {verified}
                  </div>
                </div>
              </div>
              
              <div style={styles.step}>
                <div style={styles.stepNumber}>2</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>比较 H' 和原始哈希 H</div>
                  <div style={styles.stepCalc}>
                    H' = {verified}, H = {hash}<br/>
                    {verified} {isValid ? '=' : '≠'} {hash} → {isValid ? '✓ 相等' : '✗ 不相等'}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{...styles.result, ...styles.resultSuccess}}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {isValid ? '✅ 签名有效!' : '❌ 签名无效!'}
              </div>
              <div>
                只有持有私钥的人才能生成有效签名
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RSADemo() {
  const [activeTab, setActiveTab] = useState('keygen');
  
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  
  const e = useMemo(() => {
    for (const candidate of [65537, 257, 17, 7, 5, 3]) {
      if (candidate < phi && gcd(candidate, phi) === 1) {
        return candidate;
      }
    }
    for (let candidate = 3; candidate < phi; candidate += 2) {
      if (gcd(candidate, phi) === 1) return candidate;
    }
    return 3;
  }, [phi]);
  
  const d = useMemo(() => {
    if (phi <= 1) return 0;
    return modInverse(e, phi);
  }, [e, phi]);
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 RSA 加密算法交互演示</h2>
      
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'keygen' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('keygen')}
        >
          🔑 密钥生成
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'encrypt' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('encrypt')}
        >
          🔒 加密解密
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'sign' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('sign')}
        >
          ✍️ 数字签名
        </button>
      </div>
      
      {activeTab === 'keygen' && <KeyGenDemo p={p} q={q} setP={setP} setQ={setQ} n={n} e={e} d={d} phi={phi} />}
      {activeTab === 'encrypt' && <EncryptDecryptDemo n={n} e={e} d={d} />}
      {activeTab === 'sign' && <SignVerifyDemo n={n} e={e} d={d} />}
    </div>
  );
}
