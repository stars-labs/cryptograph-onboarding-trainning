import React, { useState, useCallback } from 'react';

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
  let [old_r, r] = [BigInt(a), BigInt(m)];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return Number(((old_s % BigInt(m)) + BigInt(m)) % BigInt(m));
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
    color: '#ce93d8',
    fontSize: '1.5rem',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
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
  inputReadonly: {
    backgroundColor: '#1a1a2e',
    color: '#a5d6a7',
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
    backgroundColor: '#ce93d8',
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
    color: '#e1bee7',
  },
  stepCalc: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#a5d6a7',
    backgroundColor: '#1a1a2e',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '8px',
  },
  arrow: {
    textAlign: 'center',
    color: '#ce93d8',
    fontSize: '24px',
    padding: '8px 0',
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
  caveContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
  },
  cave: {
    width: '100%',
    height: '300px',
    position: 'relative',
  },
  caveEntrance: {
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '40px',
    backgroundColor: '#5d4037',
    borderRadius: '30px 30px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '12px',
  },
  cavePath: {
    position: 'absolute',
    width: '4px',
    backgroundColor: '#795548',
  },
  caveRoom: {
    position: 'absolute',
    width: '50px',
    height: '50px',
    backgroundColor: '#3e2723',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    border: '3px solid #5d4037',
  },
  magicDoor: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 16px',
    backgroundColor: '#7b1fa2',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '12px',
    textAlign: 'center',
  },
  peggy: {
    position: 'absolute',
    width: '30px',
    height: '30px',
    backgroundColor: '#4caf50',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    transition: 'all 0.5s',
    zIndex: 10,
  },
  victor: {
    position: 'absolute',
    top: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '30px',
    height: '30px',
    backgroundColor: '#2196f3',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '16px',
    fontSize: '14px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
  },
  roundCounter: {
    textAlign: 'center',
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
  },
  probability: {
    fontSize: '14px',
    color: '#ffcc80',
    marginTop: '8px',
  },
};

function SchnorrZKP() {
  const [params, setParams] = useState({ p: 23, g: 5, x: 7 });
  const [protocol, setProtocol] = useState({
    Y: 0,
    r: 0,
    R: 0,
    c: 0,
    s: 0,
    verified: null,
    step: 0,
  });
  
  const updateParam = (key, value) => {
    const num = parseInt(value) || 0;
    setParams(prev => ({ ...prev, [key]: num }));
    setProtocol(prev => ({ ...prev, step: 0, verified: null }));
  };
  
  const startProtocol = () => {
    const Y = modPow(params.g, params.x, params.p);
    const r = Math.floor(Math.random() * (params.p - 2)) + 1;
    const R = modPow(params.g, r, params.p);
    setProtocol({ Y, r, R, c: 0, s: 0, verified: null, step: 1 });
  };
  
  const sendChallenge = () => {
    const c = Math.floor(Math.random() * (params.p - 2)) + 1;
    setProtocol(prev => ({ ...prev, c, step: 2 }));
  };
  
  const computeResponse = () => {
    const { r, c } = protocol;
    const s = (r + c * params.x) % (params.p - 1);
    setProtocol(prev => ({ ...prev, s, step: 3 }));
  };
  
  const verify = () => {
    const { R, c, s, Y } = protocol;
    const left = modPow(params.g, s, params.p);
    const right = (R * modPow(Y, c, params.p)) % params.p;
    setProtocol(prev => ({ ...prev, verified: left === right, step: 4, left, right }));
  };
  
  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚙️ 设置参数</h3>
        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>素数 p</label>
            <input
              type="number"
              style={styles.input}
              value={params.p}
              onChange={(e) => updateParam('p', e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>生成元 g</label>
            <input
              type="number"
              style={styles.input}
              value={params.g}
              onChange={(e) => updateParam('g', e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>私钥 x (保密)</label>
            <input
              type="number"
              style={styles.input}
              value={params.x}
              onChange={(e) => updateParam('x', e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>公钥 Y = g^x mod p</label>
            <input
              type="text"
              style={{...styles.input, ...styles.inputReadonly}}
              value={modPow(params.g, params.x, params.p)}
              readOnly
            />
          </div>
        </div>
        <button style={styles.button} onClick={startProtocol}>
          🚀 开始零知识证明协议
        </button>
      </div>
      
      {protocol.step >= 1 && (
        <div style={styles.stepContainer}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <div style={styles.stepContent}>
              <div style={styles.stepTitle}>Peggy: 生成承诺</div>
              <div>选择随机数 r，计算 R = g^r mod p</div>
              <div style={styles.stepCalc}>
                r = {protocol.r}<br/>
                R = {params.g}^{protocol.r} mod {params.p} = {protocol.R}
              </div>
              <div style={{ marginTop: '8px', color: '#90caf9' }}>
                📤 发送 R = {protocol.R} 给 Victor
              </div>
            </div>
          </div>
          
          {protocol.step === 1 && (
            <button style={{...styles.button, ...styles.buttonSecondary}} onClick={sendChallenge}>
              Victor: 发送随机挑战 →
            </button>
          )}
          
          {protocol.step >= 2 && (
            <>
              <div style={styles.arrow}>↓</div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>2</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>Victor: 发送挑战</div>
                  <div style={styles.stepCalc}>
                    c = {protocol.c}
                  </div>
                  <div style={{ marginTop: '8px', color: '#90caf9' }}>
                    📤 发送 c = {protocol.c} 给 Peggy
                  </div>
                </div>
              </div>
            </>
          )}
          
          {protocol.step === 2 && (
            <button style={{...styles.button, ...styles.buttonSecondary}} onClick={computeResponse}>
              Peggy: 计算响应 →
            </button>
          )}
          
          {protocol.step >= 3 && (
            <>
              <div style={styles.arrow}>↓</div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>3</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>Peggy: 计算响应</div>
                  <div>s = r + c × x mod (p-1)</div>
                  <div style={styles.stepCalc}>
                    s = {protocol.r} + {protocol.c} × {params.x} mod {params.p - 1}<br/>
                    s = {protocol.r + protocol.c * params.x} mod {params.p - 1}<br/>
                    s = {protocol.s}
                  </div>
                  <div style={{ marginTop: '8px', color: '#90caf9' }}>
                    📤 发送 s = {protocol.s} 给 Victor
                  </div>
                </div>
              </div>
            </>
          )}
          
          {protocol.step === 3 && (
            <button style={{...styles.button, ...styles.buttonSecondary}} onClick={verify}>
              Victor: 验证 →
            </button>
          )}
          
          {protocol.step >= 4 && (
            <>
              <div style={styles.arrow}>↓</div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>4</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>Victor: 验证</div>
                  <div>检查 g^s ≟ R × Y^c (mod p)</div>
                  <div style={styles.stepCalc}>
                    左边: g^s = {params.g}^{protocol.s} mod {params.p} = {protocol.left}<br/>
                    右边: R × Y^c = {protocol.R} × {protocol.Y}^{protocol.c} mod {params.p} = {protocol.right}
                  </div>
                </div>
              </div>
              
              <div style={{
                ...styles.result,
                ...(protocol.verified ? styles.resultSuccess : styles.resultFail)
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {protocol.verified ? '✅ 验证通过!' : '❌ 验证失败!'}
                </div>
                <div>
                  Victor 现在相信 Peggy 知道 x，但 Victor 不知道 x 是什么！
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AliBabaCave() {
  const [knowsPassword, setKnowsPassword] = useState(true);
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [peggyPosition, setPeggyPosition] = useState('entrance');
  const [gameState, setGameState] = useState('idle');
  
  const startRound = () => {
    const peggyChoice = Math.random() < 0.5 ? 'A' : 'B';
    setPeggyPosition(peggyChoice);
    setCurrentRound({ peggyChoice, victorCall: null, success: null });
    setGameState('peggyEntered');
  };
  
  const victorCalls = () => {
    const call = Math.random() < 0.5 ? 'A' : 'B';
    const canExit = knowsPassword || currentRound.peggyChoice === call;
    
    setCurrentRound(prev => ({
      ...prev,
      victorCall: call,
      success: canExit
    }));
    
    if (canExit) {
      setPeggyPosition(call + '_exit');
    }
    
    setGameState('victorCalled');
    
    setTimeout(() => {
      setRounds(prev => [...prev, { ...currentRound, victorCall: call, success: canExit }]);
      if (!canExit) {
        setGameState('failed');
      } else {
        setGameState('roundComplete');
      }
    }, 1000);
  };
  
  const resetGame = () => {
    setRounds([]);
    setCurrentRound(null);
    setPeggyPosition('entrance');
    setGameState('idle');
  };
  
  const successRate = rounds.length > 0 
    ? (rounds.filter(r => r.success).length / rounds.length * 100).toFixed(1)
    : 0;
  
  const cheaterProbability = rounds.length > 0
    ? (1 / Math.pow(2, rounds.length) * 100).toFixed(6)
    : 100;
  
  const getPeggyStyle = () => {
    const base = { ...styles.peggy };
    switch (peggyPosition) {
      case 'entrance':
        return { ...base, top: '50px', left: '50%', transform: 'translateX(-50%)' };
      case 'A':
        return { ...base, top: '150px', left: '80px' };
      case 'B':
        return { ...base, top: '150px', right: '80px', left: 'auto' };
      case 'A_exit':
        return { ...base, top: '80px', left: '80px' };
      case 'B_exit':
        return { ...base, top: '80px', right: '80px', left: 'auto' };
      default:
        return base;
    }
  };
  
  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚙️ 设置</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={knowsPassword}
            onChange={(e) => {
              setKnowsPassword(e.target.checked);
              resetGame();
            }}
            style={{ width: '20px', height: '20px' }}
          />
          <span>Peggy 知道魔法门密码</span>
        </label>
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🏔️ 阿里巴巴洞穴</h3>
        
        <div style={styles.caveContainer}>
          <div style={styles.cave}>
            <div style={styles.caveEntrance}>入口</div>
            
            <div style={{...styles.cavePath, height: '60px', top: '40px', left: '50%', transform: 'translateX(-50%)'}} />
            
            <div style={{...styles.cavePath, height: '80px', top: '100px', left: '100px', transform: 'rotate(-30deg)'}} />
            <div style={{...styles.cavePath, height: '80px', top: '100px', right: '100px', transform: 'rotate(30deg)'}} />
            
            <div style={{...styles.caveRoom, top: '140px', left: '60px'}}>A</div>
            <div style={{...styles.caveRoom, top: '140px', right: '60px'}}>B</div>
            
            <div style={{...styles.cavePath, height: '60px', bottom: '80px', left: '100px', transform: 'rotate(30deg)'}} />
            <div style={{...styles.cavePath, height: '60px', bottom: '80px', right: '100px', transform: 'rotate(-30deg)'}} />
            
            <div style={styles.magicDoor}>
              🚪 魔法门<br/>
              <span style={{ fontSize: '10px' }}>(需要密码)</span>
            </div>
            
            <div style={styles.victor}>👁️</div>
            <div style={getPeggyStyle()}>🧙</div>
          </div>
          
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{...styles.legendDot, backgroundColor: '#4caf50'}} />
              <span>Peggy (证明者)</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendDot, backgroundColor: '#2196f3'}} />
              <span>Victor (验证者)</span>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          {gameState === 'idle' && (
            <button style={styles.button} onClick={startRound}>
              🎮 开始新一轮
            </button>
          )}
          
          {gameState === 'peggyEntered' && (
            <div>
              <p>Peggy 进入了路径 <strong>{currentRound?.peggyChoice}</strong></p>
              <p style={{ color: '#90caf9' }}>Victor 看不到她选择了哪条路...</p>
              <button style={styles.button} onClick={victorCalls}>
                🎲 Victor 随机喊出口
              </button>
            </div>
          )}
          
          {gameState === 'victorCalled' && (
            <p style={{ color: '#ffcc80' }}>
              Victor 喊: "从 <strong>{currentRound?.victorCall}</strong> 出来!"
            </p>
          )}
          
          {gameState === 'roundComplete' && (
            <div>
              <p style={{ color: '#4caf50' }}>✅ Peggy 成功从 {currentRound?.victorCall} 出来了!</p>
              <button style={styles.button} onClick={startRound}>
                继续下一轮
              </button>
            </div>
          )}
          
          {gameState === 'failed' && (
            <div>
              <p style={{ color: '#f44336' }}>
                ❌ Peggy 无法从 {currentRound?.victorCall} 出来!<br/>
                她被困住了 (她不知道密码)
              </p>
              <button style={styles.button} onClick={resetGame}>
                🔄 重新开始
              </button>
            </div>
          )}
        </div>
        
        <div style={styles.roundCounter}>
          <strong>已完成 {rounds.length} 轮</strong>
          {rounds.length > 0 && (
            <>
              <div>成功率: {successRate}%</div>
              <div style={styles.probability}>
                骗子成功通过 {rounds.length} 轮的概率: {cheaterProbability}%
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ZKProofDemo() {
  const [activeTab, setActiveTab] = useState('cave');
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 零知识证明交互演示</h2>
      
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'cave' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('cave')}
        >
          🏔️ 阿里巴巴洞穴
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'schnorr' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('schnorr')}
        >
          📐 Schnorr 协议
        </button>
      </div>
      
      {activeTab === 'cave' && <AliBabaCave />}
      {activeTab === 'schnorr' && <SchnorrZKP />}
    </div>
  );
}
