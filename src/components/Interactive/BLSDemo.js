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
    color: '#4fc3f7',
    fontSize: '1.5rem',
  },
  section: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#16213e',
    borderRadius: '8px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#81d4fa',
    fontSize: '1.1rem',
  },
  signerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  signerCard: {
    padding: '16px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '1px solid #3a4a6b',
  },
  signerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  signerName: {
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  signerEmoji: {
    fontSize: '24px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef5350',
    cursor: 'pointer',
    fontSize: '18px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '11px',
    color: '#90caf9',
    fontWeight: 'bold',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputReadonly: {
    backgroundColor: '#0a0a15',
    color: '#a5d6a7',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#4fc3f7',
    color: '#000',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    border: '1px solid #4fc3f7',
    color: '#4fc3f7',
  },
  buttonSmall: {
    padding: '8px 16px',
    fontSize: '12px',
  },
  messageInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  signaturesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
  },
  signatureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
  },
  signatureValue: {
    fontFamily: 'monospace',
    color: '#a5d6a7',
    fontSize: '14px',
  },
  aggregateBox: {
    padding: '20px',
    backgroundColor: '#1b5e20',
    borderRadius: '8px',
    textAlign: 'center',
    marginTop: '16px',
    border: '2px solid #4caf50',
  },
  aggregateLabel: {
    fontSize: '12px',
    color: '#a5d6a7',
    marginBottom: '8px',
  },
  aggregateValue: {
    fontSize: '20px',
    fontFamily: 'monospace',
    color: '#fff',
    fontWeight: 'bold',
  },
  comparison: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '16px',
  },
  comparisonBox: {
    padding: '16px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    textAlign: 'center',
  },
  comparisonLabel: {
    fontSize: '12px',
    color: '#90caf9',
    marginBottom: '8px',
  },
  comparisonValue: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  good: {
    color: '#4caf50',
  },
  bad: {
    color: '#f44336',
  },
  arrow: {
    textAlign: 'center',
    fontSize: '32px',
    color: '#4fc3f7',
    padding: '16px 0',
  },
  verifyResult: {
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    marginTop: '16px',
  },
  verifySuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    border: '2px solid #4caf50',
  },
  visualFlow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
  },
  flowRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  flowItem: {
    padding: '8px 16px',
    backgroundColor: '#1e3a5f',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
  flowArrow: {
    color: '#4fc3f7',
    fontSize: '20px',
  },
  infoBox: {
    padding: '12px 16px',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    border: '1px solid #2196f3',
    borderRadius: '8px',
    marginTop: '12px',
    fontSize: '13px',
    color: '#90caf9',
  },
  pointBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid',
  },
  scalarBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#ff9800',
    color: '#ff9800',
  },
  g1PointBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4caf50',
    color: '#4caf50',
  },
  g2PointBadge: {
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    borderColor: '#ce93d8',
    color: '#ce93d8',
  }
};

const PointVisual = ({ value, type, label }) => {
  const color = type === 'G1' ? '#4caf50' : '#ce93d8';
  const bgColor = type === 'G1' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(156, 39, 176, 0.1)';
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      backgroundColor: '#1e1e2e',
      border: `1px solid ${color}`,
      borderRadius: '8px',
      minWidth: '80px'
    }}>
      <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>{label}</div>
      <div style={{ 
        width: '30px', 
        height: '30px', 
        borderRadius: '50%', 
        backgroundColor: bgColor,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: `2px solid ${color}`,
        marginBottom: '4px',
        position: 'relative'
      }}>
        <div style={{ width: '4px', height: '4px', backgroundColor: color, borderRadius: '50%' }} />
        <svg width="24" height="24" viewBox="0 0 24 24" style={{position: 'absolute', opacity: 0.5}}>
          <path d="M2,12 Q6,2 12,12 T22,12" fill="none" stroke={color} strokeWidth="1" />
        </svg>
      </div>
      <div style={{ fontFamily: 'monospace', color: color, fontSize: '12px' }}>
        P({value})
      </div>
    </div>
  );
};

const ScalarVisual = ({ value, label }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#1e1e2e',
    border: '1px solid #ff9800',
    borderRadius: '8px',
    minWidth: '60px'
  }}>
    <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔑</div>
    <div style={{ fontFamily: 'monospace', color: '#ff9800', fontSize: '12px' }}>
      {value}
    </div>
  </div>
);

const EMOJIS = ['👩', '👨', '🧑', '👴', '👵', '🧔', '👱', '🧑‍🦰'];
const NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Henry'];

export default function BLSDemo() {
  const [signers, setSigners] = useState([
    { id: 1, name: 'Alice', emoji: '👩', sk: 3, enabled: true },
    { id: 2, name: 'Bob', emoji: '👨', sk: 5, enabled: true },
    { id: 3, name: 'Carol', emoji: '🧑', sk: 7, enabled: true },
  ]);
  const [message, setMessage] = useState('Hello BLS!');
  const [G2, setG2] = useState(2);
  const [showVerification, setShowVerification] = useState(false);
  
  const hashMessage = (msg) => {
    let hash = 0;
    for (let i = 0; i < msg.length; i++) {
      hash = ((hash << 5) - hash) + msg.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 20) + 1;
  };
  
  const H = useMemo(() => hashMessage(message), [message]);
  
  const signersWithData = useMemo(() => {
    return signers.map(s => ({
      ...s,
      pk: s.sk * G2,
      sig: s.sk * H,
    }));
  }, [signers, G2, H]);
  
  const enabledSigners = signersWithData.filter(s => s.enabled);
  
  const aggregatedSig = enabledSigners.reduce((sum, s) => sum + s.sig, 0);
  const aggregatedPk = enabledSigners.reduce((sum, s) => sum + s.pk, 0);
  
  const traditionalSize = enabledSigners.length * 48;
  const blsSize = 48;
  const compressionRatio = traditionalSize / blsSize;
  
  const verifyLeft = aggregatedSig * G2;
  const verifyRight = H * aggregatedPk;
  const isValid = verifyLeft === verifyRight;
  
  const addSigner = () => {
    const nextId = Math.max(...signers.map(s => s.id), 0) + 1;
    const idx = (nextId - 1) % NAMES.length;
    setSigners([...signers, {
      id: nextId,
      name: NAMES[idx],
      emoji: EMOJIS[idx],
      sk: Math.floor(Math.random() * 10) + 1,
      enabled: true,
    }]);
  };
  
  const removeSigner = (id) => {
    setSigners(signers.filter(s => s.id !== id));
  };
  
  const toggleSigner = (id) => {
    setSigners(signers.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };
  
  const updateSk = (id, value) => {
    const sk = parseInt(value) || 1;
    setSigners(signers.map(s => s.id === id ? { ...s, sk } : s));
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✨ BLS 签名聚合交互演示</h2>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚙️ 基础参数</h3>
        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>G₂ 基点</label>
            <input
              type="number"
              style={styles.input}
              value={G2}
              onChange={(e) => setG2(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>H(消息) = </label>
            <input
              type="text"
              style={{...styles.input, ...styles.inputReadonly}}
              value={H}
              readOnly
            />
          </div>
        </div>
        
        <div style={{ marginTop: '12px' }}>
          <label style={styles.label}>消息</label>
          <input
            type="text"
            style={styles.messageInput}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入要签名的消息..."
          />
        </div>
      </div>
      
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ ...styles.sectionTitle, margin: 0 }}>👥 签名者 ({enabledSigners.length} 人参与)</h3>
          <button 
            style={{...styles.button, ...styles.buttonSmall}}
            onClick={addSigner}
          >
            + 添加签名者
          </button>
        </div>
        
        <div style={styles.signerList}>
          {signersWithData.map(signer => (
            <div 
              key={signer.id} 
              style={{
                ...styles.signerCard,
                opacity: signer.enabled ? 1 : 0.5,
                borderColor: signer.enabled ? '#4caf50' : '#666',
              }}
            >
              <div style={styles.signerHeader}>
                <div style={styles.signerName}>
                  <span style={styles.signerEmoji}>{signer.emoji}</span>
                  <span>{signer.name}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={signer.enabled}
                      onChange={() => toggleSigner(signer.id)}
                    />
                    <span style={{ fontSize: '12px', color: '#90caf9' }}>参与签名</span>
                  </label>
                </div>
                {signers.length > 1 && (
                  <button style={styles.deleteBtn} onClick={() => removeSigner(signer.id)}>
                    ×
                  </button>
                )}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>私钥 sk (标量)</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <input
                      type="number"
                      style={{...styles.input, width: '80px'}}
                      value={signer.sk}
                      onChange={(e) => updateSk(signer.id, e.target.value)}
                      min="1"
                    />
                    <ScalarVisual value={signer.sk} label="Scalar" />
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>公钥 pk = sk × G₂ (点)</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <PointVisual value={signer.pk} type="G2" label="Point G₂" />
                    <div style={{fontSize: '12px', color: '#666'}}>
                      = {signer.sk} × G₂
                    </div>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>签名 σ = sk × H (点)</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <PointVisual value={signer.sig} type="G1" label="Point G₁" />
                    <div style={{fontSize: '12px', color: '#666'}}>
                       = {signer.sk} × H
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔗 签名聚合 (点加法)</h3>
        
        <div style={styles.infoBox}>
          <strong>注意：</strong> 这里的 "+" 不是普通数字相加，而是椭圆曲线上的<strong>点加法</strong>。<br/>
          几何上，P + Q = R 意味着这三个点在一条直线上。
        </div>

        <div style={styles.visualFlow}>
          <div style={styles.flowRow}>
            {enabledSigners.map((s, i) => (
              <React.Fragment key={s.id}>
                <PointVisual value={s.sig} type="G1" label={`σ${i+1}`} />
                {i < enabledSigners.length - 1 && <span style={styles.flowArrow}>+</span>}
              </React.Fragment>
            ))}
          </div>
          
          <div style={styles.flowArrow}>↓ (点加法)</div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', border: '1px solid #4caf50'}}>
            <PointVisual value={aggregatedSig} type="G1" label="σ_agg" />
            <div style={{color: '#a5d6a7', fontSize: '14px'}}>
              = 聚合签名 (新的曲线点)
            </div>
          </div>
        </div>
        
        <div style={styles.visualFlow}>
          <div style={styles.flowRow}>
            {enabledSigners.map((s, i) => (
              <React.Fragment key={s.id}>
                <PointVisual value={s.pk} type="G2" label={`pk${i+1}`} />
                {i < enabledSigners.length - 1 && <span style={styles.flowArrow}>+</span>}
              </React.Fragment>
            ))}
          </div>
          
          <div style={styles.flowArrow}>↓ (点加法)</div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(156, 39, 176, 0.1)', borderRadius: '8px', border: '1px solid #ce93d8'}}>
            <PointVisual value={aggregatedPk} type="G2" label="pk_agg" />
            <div style={{color: '#ce93d8', fontSize: '14px'}}>
              = 聚合公钥 (新的曲线点)
            </div>
          </div>
        </div>
        
        <div style={styles.comparison}>
          <div style={styles.comparisonBox}>
            <div style={styles.comparisonLabel}>传统方式存储</div>
            <div style={{...styles.comparisonValue, ...styles.bad}}>
              {enabledSigners.length} × 48 = {traditionalSize} B
            </div>
          </div>
          <div style={styles.comparisonBox}>
            <div style={styles.comparisonLabel}>BLS 聚合存储</div>
            <div style={{...styles.comparisonValue, ...styles.good}}>
              48 B
            </div>
          </div>
        </div>
        
        <div style={styles.infoBox}>
          💡 压缩率: <strong>{compressionRatio.toFixed(0)}×</strong> — 
          {enabledSigners.length} 个签名压缩成 1 个！
        </div>
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>✅ 验证聚合签名</h3>
        
        <button 
          style={{...styles.button, ...styles.buttonSecondary}}
          onClick={() => setShowVerification(!showVerification)}
        >
          {showVerification ? '隐藏验证过程' : '显示验证过程'}
        </button>
        
        {showVerification && (
          <>
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#0f0f23', borderRadius: '8px' }}>
              <p style={{ marginBottom: '12px' }}>
                验证等式: <code>e(σ_agg, G₂) = e(H, pk_agg)</code>
              </p>
              <p style={{ marginBottom: '8px', fontFamily: 'monospace' }}>
                简化计算 (用乘法模拟配对):
              </p>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '2' }}>
                左边: σ_agg × G₂ = {aggregatedSig} × {G2} = <span style={styles.good}>{verifyLeft}</span><br/>
                右边: H × pk_agg = {H} × {aggregatedPk} = <span style={styles.good}>{verifyRight}</span>
              </div>
            </div>
            
            <div style={{
              ...styles.verifyResult,
              ...styles.verifySuccess,
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {isValid ? '✅ 验证通过!' : '❌ 验证失败!'}
              </div>
              <div>
                {verifyLeft} = {verifyRight} → {isValid ? '相等' : '不相等'}
              </div>
              <div style={{ marginTop: '12px', fontSize: '14px', color: '#a5d6a7' }}>
                验证者只需 1 次验证，就确认了 {enabledSigners.length} 人都签了名！
              </div>
            </div>
          </>
        )}
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📊 以太坊 2.0 规模模拟</h3>
        <div style={styles.grid}>
          {[100, 1000, 10000, 300000].map(count => (
            <div key={count} style={styles.comparisonBox}>
              <div style={styles.comparisonLabel}>{count.toLocaleString()} 验证者</div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '12px', color: '#f44336' }}>
                  传统: {(count * 48 / 1024).toFixed(1)} KB
                </div>
                <div style={{ fontSize: '12px', color: '#4caf50' }}>
                  BLS: 48 B
                </div>
                <div style={{ fontSize: '14px', color: '#ffcc80', marginTop: '4px' }}>
                  压缩 {count}×
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
