import React, { useState, useEffect } from 'react';

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
    fontSize: '1.3rem',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#90caf9',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  hashResult: {
    padding: '16px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '2px solid #4fc3f7',
    marginTop: '16px',
  },
  hashLabel: {
    fontSize: '12px',
    color: '#90caf9',
    marginBottom: '8px',
  },
  hashValue: {
    fontFamily: 'monospace',
    fontSize: '14px',
    wordBreak: 'break-all',
    color: '#a5d6a7',
    lineHeight: '1.6',
  },
  comparison: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#16213e',
    borderRadius: '8px',
  },
  comparisonTitle: {
    color: '#ffb74d',
    fontSize: '1rem',
    marginBottom: '12px',
  },
  comparisonItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
  },
  comparisonInput: {
    fontWeight: 'bold',
    color: '#fff',
  },
  comparisonHash: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#a5d6a7',
    wordBreak: 'break-all',
  },
  highlight: {
    backgroundColor: '#ff5722',
    padding: '0 2px',
    borderRadius: '2px',
  },
  infoBox: {
    padding: '12px 16px',
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    border: '1px solid #4fc3f7',
    borderRadius: '8px',
    marginTop: '16px',
    fontSize: '13px',
    color: '#b3e5fc',
  },
  presetButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '12px',
  },
  presetButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#16213e',
    color: '#90caf9',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
};

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function SHA256Demo() {
  const [input, setInput] = useState('Hello');
  const [hash, setHash] = useState('');
  const [comparisons, setComparisons] = useState([]);
  
  const presets = ['Hello', 'Hello!', 'hello', 'Hell0'];
  
  useEffect(() => {
    sha256(input).then(setHash);
  }, [input]);
  
  useEffect(() => {
    Promise.all(presets.map(async (text) => ({
      input: text,
      hash: await sha256(text),
    }))).then(setComparisons);
  }, []);
  
  const findDiffIndex = (hash1, hash2) => {
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) return i;
    }
    return -1;
  };
  
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔒 SHA-256 哈希计算器</h3>
      
      <div style={styles.inputGroup}>
        <label style={styles.label}>输入任意文本:</label>
        <input
          type="text"
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要哈希的内容..."
        />
        
        <div style={styles.presetButtons}>
          <span style={{ color: '#666', fontSize: '12px', alignSelf: 'center' }}>快速测试:</span>
          {presets.map((text) => (
            <button
              key={text}
              style={{
                ...styles.presetButton,
                ...(input === text ? { borderColor: '#4fc3f7', backgroundColor: '#1a3a4a' } : {}),
              }}
              onClick={() => setInput(text)}
            >
              "{text}"
            </button>
          ))}
        </div>
      </div>
      
      <div style={styles.hashResult}>
        <div style={styles.hashLabel}>SHA-256 哈希值 (64个十六进制字符 = 256 bits):</div>
        <div style={styles.hashValue}>{hash}</div>
      </div>
      
      <div style={styles.infoBox}>
        💡 <strong>雪崩效应</strong>: 改变一个字符，哈希值会完全不同。尝试把 "Hello" 改成 "Hello!" 或 "hello"
      </div>
      
      <div style={styles.comparison}>
        <h4 style={styles.comparisonTitle}>📊 对比不同输入的哈希值</h4>
        {comparisons.map((item, i) => (
          <div key={i} style={styles.comparisonItem}>
            <div style={styles.comparisonInput}>"{item.input}"</div>
            <div style={styles.comparisonHash}>
              {item.hash.split('').map((char, j) => {
                const diffIdx = i > 0 ? findDiffIndex(comparisons[0].hash, item.hash) : -1;
                const isDiff = i > 0 && j === diffIdx;
                return (
                  <span key={j} style={isDiff ? styles.highlight : {}}>
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
