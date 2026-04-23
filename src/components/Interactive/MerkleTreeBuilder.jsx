import React, { useState, useMemo } from 'react';

// 简化的哈希函数（用于教学演示）
function simpleHash(data) {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
}

// 构建 Merkle 树
function buildMerkleTree(transactions) {
  if (transactions.length === 0) return { levels: [], root: '' };
  
  // Level 0: 叶子节点
  let level = transactions.map(tx => ({
    hash: simpleHash(tx),
    data: tx,
    isLeaf: true
  }));
  
  const levels = [level];
  
  // 逐层向上构建
  while (level.length > 1) {
    // 奇数个节点，复制最后一个
    if (level.length % 2 === 1) {
      level = [...level, { ...level[level.length - 1], isDuplicate: true }];
    }
    
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      const combined = level[i].hash + level[i + 1].hash;
      nextLevel.push({
        hash: simpleHash(combined),
        left: level[i],
        right: level[i + 1],
        isLeaf: false
      });
    }
    
    levels.push(nextLevel);
    level = nextLevel;
  }
  
  return {
    levels,
    root: level[0]?.hash || ''
  };
}

// 生成 Merkle 证明
function getMerkleProof(levels, txIndex) {
  if (levels.length === 0) return [];
  
  const proof = [];
  let index = txIndex;
  
  for (let i = 0; i < levels.length - 1; i++) {
    const level = levels[i];
    const isRight = index % 2 === 1;
    const siblingIndex = isRight ? index - 1 : index + 1;
    
    if (siblingIndex < level.length) {
      proof.push({
        hash: level[siblingIndex].hash,
        position: isRight ? 'LEFT' : 'RIGHT'
      });
    }
    
    index = Math.floor(index / 2);
  }
  
  return proof;
}

// 验证 Merkle 证明
function verifyProof(txHash, proof, expectedRoot) {
  let current = txHash;
  const steps = [{ step: 0, hash: current, description: '交易哈希' }];
  
  proof.forEach((item, i) => {
    if (item.position === 'LEFT') {
      current = simpleHash(item.hash + current);
      steps.push({
        step: i + 1,
        hash: current,
        description: `Hash(${item.hash} + 上一步) = ${current}`
      });
    } else {
      current = simpleHash(current + item.hash);
      steps.push({
        step: i + 1,
        hash: current,
        description: `Hash(上一步 + ${item.hash}) = ${current}`
      });
    }
  });
  
  return {
    valid: current === expectedRoot,
    computedRoot: current,
    steps
  };
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
  inputGroup: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#4fc3f7',
    color: '#000',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  },
  buttonSecondary: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #4fc3f7',
    backgroundColor: 'transparent',
    color: '#4fc3f7',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  txList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  txItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
  },
  txIndex: {
    backgroundColor: '#4fc3f7',
    color: '#000',
    padding: '4px 10px',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  txHash: {
    fontFamily: 'monospace',
    color: '#a5d6a7',
    fontSize: '13px',
  },
  deleteBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#ef5350',
    cursor: 'pointer',
    fontSize: '18px',
  },
  treeContainer: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    overflowX: 'auto',
  },
  treeLevel: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  treeNode: {
    padding: '10px 14px',
    backgroundColor: '#1e3a5f',
    borderRadius: '8px',
    textAlign: 'center',
    border: '2px solid #3a6ea5',
    minWidth: '100px',
  },
  treeNodeRoot: {
    backgroundColor: '#4a148c',
    border: '2px solid #7b1fa2',
  },
  treeNodeHighlight: {
    backgroundColor: '#2e7d32',
    border: '2px solid #4caf50',
  },
  treeNodeProof: {
    backgroundColor: '#e65100',
    border: '2px solid #ff9800',
  },
  nodeHash: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#fff',
  },
  nodeLabel: {
    fontSize: '10px',
    color: '#90caf9',
    marginTop: '4px',
  },
  proofContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  proofItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
  },
  proofPosition: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  verifyResult: {
    padding: '16px',
    borderRadius: '8px',
    marginTop: '16px',
  },
  verifySuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    border: '1px solid #4caf50',
  },
  verifyFail: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    border: '1px solid #f44336',
  },
  steps: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
  },
  step: {
    padding: '6px 0',
    borderBottom: '1px solid #3a4a6b',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default function MerkleTreeBuilder() {
  const [transactions, setTransactions] = useState([
    'Alice -> Bob: 10 BTC',
    'Bob -> Carol: 5 BTC',
    'Carol -> Dave: 3 BTC',
    'Dave -> Eve: 1 BTC',
  ]);
  const [newTx, setNewTx] = useState('');
  const [selectedTxIndex, setSelectedTxIndex] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  
  const tree = useMemo(() => buildMerkleTree(transactions), [transactions]);
  const proof = useMemo(() => getMerkleProof(tree.levels, selectedTxIndex), [tree, selectedTxIndex]);
  
  const verification = useMemo(() => {
    if (transactions.length === 0 || selectedTxIndex >= transactions.length) return null;
    const txHash = simpleHash(transactions[selectedTxIndex]);
    return verifyProof(txHash, proof, tree.root);
  }, [transactions, selectedTxIndex, proof, tree.root]);
  
  const addTransaction = () => {
    if (newTx.trim()) {
      setTransactions([...transactions, newTx.trim()]);
      setNewTx('');
    }
  };
  
  const removeTransaction = (index) => {
    const newTxs = transactions.filter((_, i) => i !== index);
    setTransactions(newTxs);
    if (selectedTxIndex >= newTxs.length) {
      setSelectedTxIndex(Math.max(0, newTxs.length - 1));
    }
  };
  
  const getNodeStyle = (levelIndex, nodeIndex) => {
    const isRoot = levelIndex === tree.levels.length - 1;
    if (isRoot) return { ...styles.treeNode, ...styles.treeNodeRoot };
    
    // 检查是否在证明路径上
    let checkIndex = selectedTxIndex;
    for (let i = 0; i <= levelIndex; i++) {
      if (i === levelIndex) {
        const siblingIndex = checkIndex % 2 === 0 ? checkIndex + 1 : checkIndex - 1;
        if (nodeIndex === siblingIndex) {
          return { ...styles.treeNode, ...styles.treeNodeProof };
        }
        if (nodeIndex === checkIndex && levelIndex === 0) {
          return { ...styles.treeNode, ...styles.treeNodeHighlight };
        }
      }
      checkIndex = Math.floor(checkIndex / 2);
    }
    
    return styles.treeNode;
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🌳 Merkle 树交互式构建器</h2>
      
      {/* 交易输入 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📝 添加交易</h3>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="输入交易内容，如：Alice -> Bob: 10 BTC"
            value={newTx}
            onChange={(e) => setNewTx(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTransaction()}
          />
          <button style={styles.button} onClick={addTransaction}>
            添加
          </button>
        </div>
        
        <div style={styles.txList}>
          {transactions.map((tx, i) => (
            <div key={i} style={styles.txItem}>
              <span style={styles.txIndex}>Tx{i}</span>
              <span>{tx}</span>
              <span style={styles.txHash}>→ {simpleHash(tx)}</span>
              <button style={styles.deleteBtn} onClick={() => removeTransaction(i)}>
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Merkle 树可视化 */}
      {transactions.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🌲 Merkle 树结构</h3>
          <div style={{ marginBottom: '12px', fontSize: '14px', color: '#90caf9' }}>
            <span style={{ color: '#4caf50' }}>■</span> 选中交易 &nbsp;
            <span style={{ color: '#ff9800' }}>■</span> 证明路径 &nbsp;
            <span style={{ color: '#7b1fa2' }}>■</span> Merkle 根
          </div>
          
          <div style={styles.treeContainer}>
            {tree.levels.map((level, levelIndex) => (
              <div key={levelIndex} style={styles.treeLevel}>
                {level.map((node, nodeIndex) => (
                  <div
                    key={nodeIndex}
                    style={getNodeStyle(levelIndex, nodeIndex)}
                  >
                    <div style={styles.nodeHash}>{node.hash}</div>
                    <div style={styles.nodeLabel}>
                      {levelIndex === 0 
                        ? `Tx${nodeIndex}${node.isDuplicate ? ' (复制)' : ''}`
                        : levelIndex === tree.levels.length - 1 
                          ? 'Root' 
                          : `H${nodeIndex}`
                      }
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <strong style={{ color: '#ba68c8' }}>Merkle 根: </strong>
            <code style={{ color: '#4fc3f7', fontSize: '16px' }}>{tree.root}</code>
          </div>
        </div>
      )}
      
      {/* Merkle 证明 */}
      {transactions.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔐 Merkle 证明验证</h3>
          
          <div style={styles.inputGroup}>
            <select 
              style={styles.select}
              value={selectedTxIndex}
              onChange={(e) => setSelectedTxIndex(parseInt(e.target.value))}
            >
              {transactions.map((tx, i) => (
                <option key={i} value={i}>
                  Tx{i}: {tx.substring(0, 30)}{tx.length > 30 ? '...' : ''}
                </option>
              ))}
            </select>
            <button 
              style={styles.buttonSecondary}
              onClick={() => setShowVerification(!showVerification)}
            >
              {showVerification ? '隐藏验证过程' : '显示验证过程'}
            </button>
          </div>
          
          <div style={{ marginTop: '12px' }}>
            <strong style={{ color: '#90caf9' }}>证明路径 ({proof.length} 个哈希):</strong>
          </div>
          
          <div style={styles.proofContainer}>
            {proof.map((item, i) => (
              <div key={i} style={styles.proofItem}>
                <span style={{
                  ...styles.proofPosition,
                  backgroundColor: item.position === 'LEFT' ? '#1565c0' : '#c62828'
                }}>
                  {item.position}
                </span>
                <code style={{ color: '#ffcc80' }}>{item.hash}</code>
              </div>
            ))}
          </div>
          
          {showVerification && verification && (
            <div style={{
              ...styles.verifyResult,
              ...(verification.valid ? styles.verifySuccess : styles.verifyFail)
            }}>
              <strong>
                {verification.valid ? '✅ 验证通过!' : '❌ 验证失败!'}
              </strong>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                计算得到的根: <code>{verification.computedRoot}</code>
                <br />
                期望的根: <code>{tree.root}</code>
              </p>
              
              <div style={styles.steps}>
                <strong style={{ fontSize: '13px' }}>验证步骤:</strong>
                {verification.steps.map((step, i) => (
                  <div key={i} style={styles.step}>
                    Step {step.step}: {step.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
