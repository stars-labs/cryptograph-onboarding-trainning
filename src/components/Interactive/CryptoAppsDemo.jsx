import React, { useState, useEffect, useMemo } from 'react';

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
    color: '#ffd700',
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
    color: '#ffd700',
  },
  tabInactive: {
    backgroundColor: '#0f0f23',
    color: '#666',
  },
  subTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    padding: '8px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
  },
  subTab: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid transparent',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
    color: '#aaa',
  },
  subTabActive: {
    backgroundColor: '#16213e',
    borderColor: '#ffd700',
    color: '#ffd700',
    fontWeight: 'bold',
  },
  section: {
    padding: '16px',
    backgroundColor: '#16213e',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#ffe082',
    fontSize: '1.1rem',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '1px solid #3a4a6b',
    marginBottom: '12px',
    position: 'relative',
  },
  arrow: {
    textAlign: 'center',
    fontSize: '20px',
    color: '#ffd700',
    margin: '-8px 0',
    zIndex: 1,
  },
  label: {
    fontSize: '12px',
    color: '#90caf9',
    fontWeight: 'bold',
  },
  value: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#fff',
    wordBreak: 'break-all',
    backgroundColor: '#1a1a2e',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '4px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ffd700',
    color: '#000',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    marginTop: '8px',
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
    fontFamily: 'monospace',
  },
  tag: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#3a4a6b',
    color: '#fff',
    marginLeft: '8px',
  },
  mnemonicContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '8px',
    marginBottom: '16px',
  },
  word: {
    backgroundColor: '#0f0f23',
    padding: '8px',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '13px',
    border: '1px solid #3a4a6b',
  },
};

// --- Mock Crypto Functions ---
function mockMnemonic() {
  const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'];
  const res = [];
  for (let i = 0; i < 12; i++) {
    res.push(words[Math.floor(Math.random() * words.length)]);
  }
  return res;
}

// Pseudo-Random Number Generator (Mulberry32)
function getSeed(str) {
  let h = 0xdeadbeef;
  for (let i = 0; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  return ((h ^ h >>> 16) >>> 0);
}

function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function mockHash(data, algo) {
  const seed = getSeed(data.toString() + algo);
  const rng = mulberry32(seed);
  
  // Determine byte length
  let bytes = 32; // Default 256-bit
  if (algo.includes('512')) bytes = 64;
  else if (algo.includes('384')) bytes = 48;
  else if (algo.includes('224')) bytes = 28;
  else if (algo.includes('160')) bytes = 20;
  else if (algo.includes('raw') || algo.includes('pub')) bytes = 64; // Uncompressed pubkey
  
  let res = '';
  for (let i = 0; i < bytes; i++) {
    res += Math.floor(rng() * 256).toString(16).padStart(2, '0');
  }
  return res;
}

function mockBase58(hex, alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz') {
  const seed = getSeed(hex + 'b58');
  const rng = mulberry32(seed);
  
  // Base58 is approx 1.37 times byte length
  const len = Math.max(10, Math.ceil(hex.length / 2 * 1.37));
  let res = '';
  for (let i = 0; i < len; i++) {
    res += alphabet[Math.floor(rng() * alphabet.length)];
  }
  return res;
}

function mockBech32(hex, hrp) {
  const b58 = mockBase58(hex).toLowerCase();
  return hrp + '1' + b58.replace(/[^a-z0-9]/g, 'q').slice(0, 50);
}

function mockSS58(hex) {
  const b58 = mockBase58(hex);
  return b58.slice(0, 48);
}

// --- Chain Configurations ---
const CHAINS = {
  BTC: {
    name: 'Bitcoin',
    algo: 'ECDSA (secp256k1)',
    steps: (priv) => {
      const pub = '04' + mockHash(priv, 'pub_secp256k1');
      const sha = mockHash(pub, 'sha256');
      const ripe = mockHash(sha, 'ripemd160');
      const ver = '00' + ripe;
      const cs = mockHash(mockHash(ver, 'sha256'), 'sha256').slice(0, 8);
      const addr = '1' + mockBase58(ver + cs).slice(0, 33);
      return [
        { name: 'Private Key', val: priv, desc: '256-bit random integer' },
        { name: 'Public Key', val: pub, desc: 'ECDSA secp256k1 (Uncompressed)' },
        { name: 'SHA-256 Hash', val: sha, desc: 'Hash of Public Key' },
        { name: 'RIPEMD-160 Hash', val: ripe, desc: 'Hash of SHA-256 result' },
        { name: 'Add Version', val: ver, desc: 'Prefix 0x00 (Mainnet)' },
        { name: 'Checksum', val: cs, desc: 'First 4 bytes of Double SHA-256' },
        { name: 'Base58Check', val: addr, desc: 'Final Address' }
      ];
    }
  },
  ETH: {
    name: 'Ethereum',
    algo: 'ECDSA (secp256k1)',
    steps: (priv) => {
      const pub = mockHash(priv, 'pub_secp256k1_raw'); // No 04 prefix usually for Keccak
      const keccak = mockHash(pub, 'keccak256');
      const last20 = keccak.slice(-40);
      const addr = '0x' + last20;
      return [
        { name: 'Private Key', val: priv, desc: '256-bit random integer' },
        { name: 'Public Key', val: pub, desc: 'ECDSA secp256k1 (Raw points x,y)' },
        { name: 'Keccak-256 Hash', val: keccak, desc: 'Hash of Public Key' },
        { name: 'Last 20 Bytes', val: last20, desc: 'Discard first 12 bytes' },
        { name: 'Hex Encoding', val: addr, desc: 'Add 0x prefix' }
      ];
    }
  },
  SOL: {
    name: 'Solana',
    algo: 'EdDSA (Ed25519)',
    steps: (priv) => {
      const pub = mockHash(priv, 'pub_ed25519'); 
      const addr = mockBase58(pub).slice(0, 44);
      return [
        { name: 'Private Key', val: priv, desc: '256-bit random integer (Seed)' },
        { name: 'Public Key', val: pub, desc: 'Ed25519 Public Key (32 bytes)' },
        { name: 'Base58 Encoding', val: addr, desc: 'Direct Base58 of Public Key' }
      ];
    }
  },
  DOT: {
    name: 'Polkadot',
    algo: 'Sr25519',
    steps: (priv) => {
      const pub = mockHash(priv, 'pub_sr25519');
      const prefix = '00' + pub; // Polkadot prefix 0x00
      const blake = mockHash('SS58PRE' + prefix, 'blake2b512');
      const cs = blake.slice(0, 4); // 2 bytes usually
      const addr = mockSS58(prefix + cs);
      return [
        { name: 'Private Key', val: priv, desc: '256-bit Seed' },
        { name: 'Public Key', val: pub, desc: 'Sr25519 Public Key' },
        { name: 'Add Prefix', val: prefix, desc: 'Network ID (0x00 for Polkadot)' },
        { name: 'Checksum', val: cs, desc: 'Blake2b-512("SS58PRE" + Data)' },
        { name: 'SS58 Encoding', val: addr, desc: 'Base58 of (Prefix + Pub + Checksum)' }
      ];
    }
  },
  TRX: {
    name: 'Tron',
    algo: 'ECDSA (secp256k1)',
    steps: (priv) => {
      const pub = mockHash(priv, 'pub_secp256k1_raw');
      const keccak = mockHash(pub, 'keccak256');
      const last20 = keccak.slice(-40);
      const rawAddr = '41' + last20; // 0x41 prefix
      const cs = mockHash(mockHash(rawAddr, 'sha256'), 'sha256').slice(0, 8);
      const addr = 'T' + mockBase58(rawAddr + cs).slice(0, 33);
      return [
        { name: 'Private Key', val: priv, desc: '256-bit integer' },
        { name: 'Keccak-256', val: last20, desc: 'Last 20 bytes of PubKey Hash' },
        { name: 'Add Prefix', val: rawAddr, desc: '0x41 (Mainnet)' },
        { name: 'Checksum', val: cs, desc: 'Double SHA-256' },
        { name: 'Base58Check', val: addr, desc: 'Final Address (Starts with T)' }
      ];
    }
  },
  ADA: {
    name: 'Cardano',
    algo: 'EdDSA (Ed25519)',
    steps: (priv) => {
      const pub = mockHash(priv, 'pub_ed25519');
      const blake = mockHash(pub, 'blake2b224'); // 28 bytes
      const header = '61' + blake; // Header byte + payload
      const addr = mockBech32(header, 'addr1');
      return [
        { name: 'Private Key', val: priv, desc: 'Root Seed' },
        { name: 'Public Key', val: pub, desc: 'Ed25519 Public Key' },
        { name: 'Blake2b-224', val: blake, desc: 'Hash of Public Key' },
        { name: 'Add Header', val: header, desc: 'Payment Credential + Network Tag' },
        { name: 'Bech32 Encoding', val: addr, desc: 'addr1... (Shelley Format)' }
      ];
    }
  },
  XRP: {
    name: 'Ripple',
    algo: 'ECDSA (secp256k1)',
    steps: (priv) => {
      const pub = '03' + mockHash(priv, 'pub_secp256k1_compressed');
      const sha = mockHash(pub, 'sha256');
      const ripe = mockHash(sha, 'ripemd160');
      const ver = '00' + ripe; // 0x00 for Account ID
      const cs = mockHash(mockHash(ver, 'sha256'), 'sha256').slice(0, 8);
      const addr = 'r' + mockBase58(ver + cs, 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz').slice(0, 33);
      return [
        { name: 'Public Key', val: pub, desc: 'Compressed secp256k1' },
        { name: 'RIPEMD-160', val: ripe, desc: 'Hash(SHA256(Pub))' },
        { name: 'Base58Check', val: addr, desc: 'Using Ripple Alphabet (starts with r)' }
      ];
    }
  },
  APT: {
    name: 'Aptos',
    algo: 'EdDSA (Ed25519)',
    steps: (priv) => {
      const pub = mockHash(priv, 'pub_ed25519');
      const input = pub + '00'; // Append scheme ID (0x00 for single sig)
      const sha3 = mockHash(input, 'sha3_256');
      const addr = '0x' + sha3;
      return [
        { name: 'Public Key', val: pub, desc: 'Ed25519 Public Key' },
        { name: 'Append Scheme', val: input, desc: 'Pub + 0x00 (Single Sig)' },
        { name: 'SHA3-256', val: sha3, desc: 'Hash of Authentication Key' },
        { name: 'Hex Encoding', val: addr, desc: '32-byte Address' }
      ];
    }
  }
};

function ChainDetail({ chainId, privKey }) {
  const config = CHAINS[chainId];
  const steps = useMemo(() => config.steps(privKey), [chainId, privKey]);
  
  return (
    <div style={{animation: 'fadeIn 0.3s'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
        <div style={{fontSize: '18px', fontWeight: 'bold', color: '#fff'}}>
          {config.name} <span style={styles.tag}>{config.algo}</span>
        </div>
        <div style={{fontSize: '12px', color: '#888'}}>
          地址预览: <span style={{color: '#a5d6a7', fontFamily: 'monospace'}}>{steps[steps.length-1].val}</span>
        </div>
      </div>
      
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div style={styles.arrow}>↓</div>}
          <div style={styles.step}>
            <div style={styles.label}>{i+1}. {step.name}</div>
            <div style={styles.value}>{step.val}</div>
            {step.desc && <div style={{fontSize: '11px', color: '#666', marginTop: '2px'}}>{step.desc}</div>}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CryptoAppsDemo() {
  const [activeTab, setActiveTab] = useState('address');
  const [activeChain, setActiveChain] = useState('BTC');
  
  // Single Key for ALL chains
  const [privKey, setPrivKey] = useState('');
  
  // HD Wallet State
  const [mnemonic, setMnemonic] = useState([]);
  const [seed, setSeed] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [path, setPath] = useState("m/44'/0'/0'/0/0");
  const [childKey, setChildKey] = useState('');

  // Transaction State
  const [txData, setTxData] = useState({
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    value: '1.5',
    gas: '21000',
    nonce: '0'
  });
  const [signedTx, setSignedTx] = useState(null);

  // MultiSig State
  const [msOwners, setMsOwners] = useState(['Alice', 'Bob', 'Carol']);
  const [msThreshold, setMsThreshold] = useState(2);
  const [msTx, setMsTx] = useState(null); 
  const [msLogs, setMsLogs] = useState([]);

  // Initialization
  useEffect(() => {
    const pk = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setPrivKey(pk);
    generateMnemonic();
  }, []);

  const generateNewKey = () => {
    const pk = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setPrivKey(pk);
  };

  // ... HD, Tx, MultiSig functions (same as before) ...
  const generateMnemonic = () => {
    const m = mockMnemonic();
    setMnemonic(m);
    const s = mockHash(m.join(' '), 'sha512');
    setSeed(s);
    const mk = 'xprv' + mockBase58(s).slice(0, 100);
    setMasterKey(mk);
    deriveChild(mk, path);
  };
  
  const deriveChild = (mk, p) => {
    const ck = 'xprv' + mockBase58(mk + p).slice(0, 100);
    setChildKey(ck);
  };

  const signTransaction = () => {
    const raw = `RLP([${txData.nonce}, ${txData.gas}, ${txData.to}, ${txData.value}, ...])`;
    const hash = mockHash(raw, 'keccak256');
    const r = mockHash(hash + 'r', 'sha256');
    const s = mockHash(hash + 's', 'sha256');
    const v = '27';
    setSignedTx({ raw, hash, r, s, v });
  };

  const submitMsTx = () => {
    setMsTx({ id: 1, to: '0x123...', value: '10 ETH', confirmations: [] });
    setMsLogs(prev => [...prev, 'Alice 提交了交易 #1']);
  };

  const confirmMsTx = (owner) => {
    if (!msTx || msTx.confirmations.includes(owner)) return;
    const newConfirms = [...msTx.confirmations, owner];
    setMsTx({ ...msTx, confirmations: newConfirms });
    setMsLogs(prev => [...prev, `${owner} 确认了交易 #1 (${newConfirms.length}/${msThreshold})`]);
    if (newConfirms.length >= msThreshold) {
      setMsLogs(prev => [...prev, `✅ 达到阈值 ${msThreshold}，交易 #1 已执行！`]);
    }
  };

  useEffect(() => {
    deriveChild(masterKey, path);
  }, [path]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏦 加密货币应用演示</h2>
      
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'address' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('address')}
        >
          🔑 多链地址生成
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'hd' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('hd')}
        >
          🌳 HD 钱包
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'tx' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('tx')}
        >
          📝 交易签名
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'multisig' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('multisig')}
        >
          🤝 多重签名
        </button>
      </div>

      {activeTab === 'address' && (
        <div style={styles.section}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>通用私钥 (Private Key) - 256 bit</label>
            <div style={{display: 'flex', gap: '8px'}}>
              <input 
                style={styles.input} 
                value={privKey} 
                onChange={(e) => setPrivKey(e.target.value)}
              />
              <button style={{...styles.button, marginTop: 0}} onClick={generateNewKey}>
                🔄 随机生成
              </button>
            </div>
          </div>

          <div style={{marginTop: '20px'}}>
            <div style={styles.subTabs}>
              {Object.keys(CHAINS).map(key => (
                <button
                  key={key}
                  style={{
                    ...styles.subTab,
                    ...(activeChain === key ? styles.subTabActive : {})
                  }}
                  onClick={() => setActiveChain(key)}
                >
                  {CHAINS[key].name}
                </button>
              ))}
            </div>
            
            <ChainDetail chainId={activeChain} privKey={privKey} />
          </div>
        </div>
      )}

      {activeTab === 'hd' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>1. 生成助记词 (BIP-39)</h3>
          <button style={styles.button} onClick={generateMnemonic}>
            🎲 重新生成
          </button>
          
          <div style={{...styles.mnemonicContainer, marginTop: '12px'}}>
            {mnemonic.map((word, i) => (
              <div key={i} style={styles.word}>
                <span style={{color: '#666', fontSize: '10px', display: 'block'}}>{i+1}</span>
                {word}
              </div>
            ))}
          </div>
          
          <div style={styles.arrow}>↓ PBKDF2 (HMAC-SHA512)</div>
          
          <div style={styles.step}>
            <div style={styles.label}>2. 种子 (Seed) - 512 bit</div>
            <div style={styles.value}>{seed.slice(0, 64)}...</div>
          </div>
          
          <div style={styles.arrow}>↓ HMAC-SHA512</div>
          
          <div style={styles.step}>
            <div style={styles.label}>3. 主私钥 (Master Key) - BIP32 Root</div>
            <div style={styles.value}>{masterKey}</div>
          </div>
          
          <div style={styles.arrow}>↓ 路径派生</div>
          
          <div style={styles.step}>
            <div style={styles.label}>4. 子密钥派生</div>
            <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
              <input 
                style={{padding: '8px', borderRadius: '4px', border: '1px solid #3a4a6b', background: '#1a1a2e', color: '#fff'}}
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
              <span style={{fontSize: '12px', color: '#90caf9', alignSelf: 'center'}}>
                (m / purpose' / coin_type' / account' / change / index)
              </span>
            </div>
            <div style={styles.label}>派生的扩展私钥:</div>
            <div style={{...styles.value, color: '#a5d6a7'}}>{childKey}</div>
          </div>
        </div>
      )}

      {activeTab === 'tx' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>构造以太坊交易</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <div style={styles.step}>
              <label style={styles.label}>To Address</label>
              <input 
                style={styles.input} 
                value={txData.to}
                onChange={e => setTxData({...txData, to: e.target.value})}
              />
            </div>
            <div style={styles.step}>
              <label style={styles.label}>Value (ETH)</label>
              <input 
                style={styles.input} 
                value={txData.value}
                onChange={e => setTxData({...txData, value: e.target.value})}
              />
            </div>
            <div style={styles.step}>
              <label style={styles.label}>Gas Limit</label>
              <input 
                style={styles.input} 
                value={txData.gas}
                onChange={e => setTxData({...txData, gas: e.target.value})}
              />
            </div>
            <div style={styles.step}>
              <label style={styles.label}>Nonce</label>
              <input 
                style={styles.input} 
                value={txData.nonce}
                onChange={e => setTxData({...txData, nonce: e.target.value})}
              />
            </div>
          </div>
          
          <button style={styles.button} onClick={signTransaction}>
            ✍️ 签名交易
          </button>
          
          {signedTx && (
            <div style={{marginTop: '20px'}}>
              <div style={styles.arrow}>↓ RLP Encoding</div>
              <div style={styles.step}>
                <div style={styles.label}>Raw Transaction Data</div>
                <div style={styles.value}>{signedTx.raw}</div>
              </div>
              
              <div style={styles.arrow}>↓ Keccak-256</div>
              <div style={styles.step}>
                <div style={styles.label}>Transaction Hash</div>
                <div style={styles.value}>{signedTx.hash}</div>
              </div>
              
              <div style={styles.arrow}>↓ ECDSA Sign</div>
              <div style={{...styles.step, borderColor: '#4caf50'}}>
                <div style={{...styles.label, color: '#4caf50'}}>Transaction Signature</div>
                <div style={styles.value}>
                  r: {signedTx.r}<br/>
                  s: {signedTx.s}<br/>
                  v: {signedTx.v}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'multisig' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>2-of-3 多重签名钱包</h3>
          <div style={{marginBottom: '16px'}}>
            <div style={styles.label}>拥有者: {msOwners.join(', ')}</div>
            <div style={styles.label}>需要签名数: {msThreshold}</div>
          </div>
          
          {!msTx ? (
            <button style={styles.button} onClick={submitMsTx}>
              📝 提交新交易 (由 Alice)
            </button>
          ) : (
            <div style={{padding: '16px', backgroundColor: '#0f0f23', borderRadius: '8px', border: '1px solid #3a4a6b'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{color: '#fff', fontWeight: 'bold'}}>交易 #{msTx.id}</div>
                  <div style={{fontSize: '12px', color: '#ccc'}}>转账 {msTx.value} 到 {msTx.to}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{color: '#ffd700', fontWeight: 'bold'}}>
                    确认数: {msTx.confirmations.length} / {msThreshold}
                  </div>
                  <div style={{fontSize: '12px', color: '#666'}}>
                    {msTx.confirmations.length >= msThreshold ? '✅ 已执行' : '⏳ 等待确认'}
                  </div>
                </div>
              </div>
              
              <div style={{marginTop: '16px', display: 'flex', gap: '8px'}}>
                {msOwners.map(owner => (
                  <button
                    key={owner}
                    style={{
                      ...styles.networkBtn,
                      ...(msTx.confirmations.includes(owner) ? {background: '#4caf50', color: '#fff', borderColor: '#4caf50'} : {}),
                      opacity: msTx.confirmations.length >= msThreshold && !msTx.confirmations.includes(owner) ? 0.5 : 1
                    }}
                    onClick={() => confirmMsTx(owner)}
                    disabled={msTx.confirmations.length >= msThreshold}
                  >
                    {owner} {msTx.confirmations.includes(owner) ? '已签' : '签名'}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div style={{marginTop: '20px', padding: '12px', backgroundColor: '#000', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto'}}>
            <div style={{color: '#666', fontSize: '12px', marginBottom: '4px'}}>日志:</div>
            {msLogs.map((log, i) => (
              <div key={i} style={{fontFamily: 'monospace', fontSize: '12px', color: '#a5d6a7'}}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
