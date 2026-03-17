import React, { useState, useCallback, useMemo } from 'react';

// Simplified Poseidon-like hash for demo purposes (not cryptographically secure)
function poseidonHash(...inputs) {
  let h = 0x428a2f98;
  for (const input of inputs) {
    const n = typeof input === 'number' ? input : parseInt(input) || 0;
    h = ((h * 31 + n) ^ (h >>> 16)) >>> 0;
    h = ((h * 0x5bd1e995) ^ (h >>> 13)) >>> 0;
  }
  return h;
}

function poseidonHash2(a, b) {
  return poseidonHash(a, b);
}

// Build a Merkle tree from leaves
function buildMerkleTree(leaves) {
  if (leaves.length === 0) return { root: 0, layers: [[]] };
  let layer = leaves.map(l => l >>> 0);
  const layers = [layer.slice()];
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : layer[i];
      next.push(poseidonHash2(left, right));
    }
    layer = next;
    layers.push(layer.slice());
  }
  return { root: layer[0], layers };
}

// Get Merkle proof for a leaf at given index
function getMerkleProof(layers, index) {
  const proof = [];
  let idx = index;
  for (let i = 0; i < layers.length - 1; i++) {
    const layer = layers[i];
    const isRight = idx % 2 === 1;
    const siblingIdx = isRight ? idx - 1 : idx + 1;
    const sibling = siblingIdx < layer.length ? layer[siblingIdx] : layer[idx];
    proof.push({ hash: sibling, direction: isRight ? 'left' : 'right' });
    idx = Math.floor(idx / 2);
  }
  return proof;
}

const REVIEWERS = [
  { id: 0, name: 'Alice', role: 'engineer', secret: 42 },
  { id: 1, name: 'Bob', role: 'designer', secret: 137 },
  { id: 2, name: 'Charlie', role: 'pm', secret: 256 },
  { id: 3, name: 'Diana', role: 'engineer', secret: 891 },
];

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
    wordBreak: 'break-all',
  },
  arrow: {
    textAlign: 'center',
    color: '#ce93d8',
    fontSize: '24px',
    padding: '4px 0',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    marginLeft: '8px',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: '13px',
    wordBreak: 'break-all',
  },
  card: {
    padding: '12px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '1px solid #3a4a6b',
    marginBottom: '8px',
  },
};

// ======================== Tab 1: Protocol Flow ========================

const PHASES = [
  {
    key: 'tree',
    title: '1. 建立 Merkle 成员树',
    short: '建树',
    description: 'HR 收集所有评审者的 Poseidon commitment，构建 Merkle 树并公开根哈希。',
    details: (data) => {
      const commitments = REVIEWERS.map(r => ({
        name: r.name,
        commitment: poseidonHash(r.secret),
      }));
      const leaves = commitments.map(c => c.commitment);
      const tree = buildMerkleTree(leaves);
      return (
        <div>
          <div style={{ marginBottom: '8px', color: '#90caf9' }}>每位评审者注册 commitment = Poseidon(secret):</div>
          {commitments.map((c, i) => (
            <div key={i} style={styles.stepCalc}>
              {c.name}: commitment = Poseidon({REVIEWERS[i].secret}) = 0x{c.commitment.toString(16).padStart(8, '0')}
            </div>
          ))}
          <div style={{ marginTop: '12px', color: '#ffcc80' }}>
            Merkle Root = 0x{tree.root.toString(16).padStart(8, '0')}
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
            HR 只知道"有4个人在树里"，不知道 secret 和身份的映射关系。
          </div>
        </div>
      );
    },
  },
  {
    key: 'keys',
    title: '2. 生成证明密钥',
    short: '密钥',
    description: '使用 Groth16 trusted setup 生成 proving key 和 verification key。',
    details: () => (
      <div>
        <div style={styles.stepCalc}>
          $ circom review_proof.circom --r1cs --wasm --sym{'\n'}
          $ snarkjs groth16 setup review_proof.r1cs pot12_final.ptau circuit_0000.zkey{'\n'}
          $ snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey{'\n'}
          $ snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
        </div>
        <div style={{ marginTop: '12px', color: '#90caf9', fontSize: '13px' }}>
          proving_key.zkey: ~2MB (浏览器端加载){'\n'}
          verification_key.json: ~1KB (服务端验证){'\n'}
          约束数: ~2870 (浏览器 5-10s 生成证明)
        </div>
      </div>
    ),
  },
  {
    key: 'prove',
    title: '3. 计算零知识证明',
    short: '证明',
    description: '评审者在浏览器端本地生成 ZK proof，证明"我在树里 + 分数合法 + 没投过票"。',
    details: (data) => {
      const reviewer = data.currentReviewer || REVIEWERS[0];
      const commitment = poseidonHash(reviewer.secret);
      const score = data.scores?.[reviewer.id] ?? 8;
      const nullifier = poseidonHash(reviewer.secret, data.revieweeId || 1);
      return (
        <div>
          <div style={{ marginBottom: '8px', color: '#90caf9' }}>
            {reviewer.name} 在浏览器中计算（私有输入不离开浏览器）:
          </div>
          <div style={styles.stepCalc}>
            {`// Private inputs (never sent to server)\nsecret = ${reviewer.secret}\nscore = ${score}\n\n// Computed values\ncommitment = Poseidon(${reviewer.secret}) = 0x${commitment.toString(16).padStart(8, '0')}\nnullifier = Poseidon(${reviewer.secret}, reviewee_id) = 0x${nullifier.toString(16).padStart(8, '0')}\n\n// Circuit checks:\n//   1. commitment is in Merkle tree ✓\n//   2. 1 <= score <= 10           ✓\n//   3. nullifier computed correctly ✓`}
          </div>
          <div style={{ marginTop: '12px', color: '#ffcc80', fontSize: '13px' }}>
            proof = groth16.fullProve(privateInputs, wasm, zkey)
          </div>
        </div>
      );
    },
  },
  {
    key: 'submit',
    title: '4. 匿名提交评审',
    short: '提交',
    description: '将 proof + nullifier + encrypted_score 发送到服务器（不含任何身份信息）。',
    details: (data) => {
      const reviewer = data.currentReviewer || REVIEWERS[0];
      const score = data.scores?.[reviewer.id] ?? 8;
      const nullifier = poseidonHash(reviewer.secret, data.revieweeId || 1);
      return (
        <div>
          <div style={{ marginBottom: '8px', color: '#f44336' }}>
            POST /api/reviews (需 Auth0 JWT，但 proof 与身份无关)
          </div>
          <div style={styles.stepCalc}>
            {`// Request body (server sees only this)\n{\n  "proof": { "pi_a": [...], "pi_b": [...], "pi_c": [...] },\n  "nullifier": "0x${nullifier.toString(16).padStart(8, '0')}",\n  "merkle_root": "0x${(data.merkleRoot || 0).toString(16).padStart(8, '0')}",\n  "encrypted_score": "AES(score, shared_key)"\n}`}
          </div>
          <div style={{ marginTop: '12px', color: '#a5d6a7', fontSize: '13px' }}>
            Server 验证: snarkjs.groth16.verify(vkey, publicSignals, proof){'\n'}
            Server 检查: nullifier 未使用过（防双投）{'\n'}
            Server 不知道: 谁提交的、具体打了几分
          </div>
        </div>
      );
    },
  },
  {
    key: 'aggregate',
    title: '5. 聚合结果',
    short: '结果',
    description: 'HR 只能看到聚合后的平均分，无法追踪到个人打分。',
    details: (data) => {
      const scores = data.allScores || [8, 7, 9, 6];
      const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
      const nullifiers = REVIEWERS.map(r => poseidonHash(r.secret, data.revieweeId || 1));
      return (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#90caf9', marginBottom: '8px' }}>Reviews 数据库表 (注意: 没有 user_id 列!):</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #3a4a6b' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#b39ddb' }}>nullifier</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#b39ddb' }}>encrypted_score</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#b39ddb' }}>verified</th>
                </tr>
              </thead>
              <tbody>
                {nullifiers.map((n, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1a1a2e' }}>
                    <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}>0x{n.toString(16).padStart(8, '0')}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}>AES(...)</td>
                    <td style={{ padding: '8px', color: '#4caf50' }}>true</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ ...styles.result, ...styles.resultSuccess }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>
              Manager 看到: 平均评分 {avg}/10 ({scores.length} 人评审)
            </div>
            <div style={{ fontSize: '13px', color: '#a5d6a7' }}>
              HR 无法知道每个人打了几分
            </div>
          </div>
        </div>
      );
    },
  },
];

function ProtocolFlowTab() {
  const [activePhase, setActivePhase] = useState(0);
  const [expandedPhases, setExpandedPhases] = useState(new Set([0]));
  const [simulating, setSimulating] = useState(false);
  const [simPhase, setSimPhase] = useState(-1);

  const data = useMemo(() => {
    const commitments = REVIEWERS.map(r => poseidonHash(r.secret));
    const tree = buildMerkleTree(commitments);
    return {
      merkleRoot: tree.root,
      revieweeId: 1,
      currentReviewer: REVIEWERS[0],
      scores: { 0: 8, 1: 7, 2: 9, 3: 6 },
      allScores: [8, 7, 9, 6],
    };
  }, []);

  const togglePhase = (idx) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
    setActivePhase(idx);
  };

  const runSimulation = useCallback(() => {
    setSimulating(true);
    setSimPhase(0);
    setExpandedPhases(new Set([0]));
    let phase = 0;
    const interval = setInterval(() => {
      phase++;
      if (phase >= PHASES.length) {
        clearInterval(interval);
        setSimulating(false);
        return;
      }
      setSimPhase(phase);
      setExpandedPhases(prev => new Set([...prev, phase]));
      setActivePhase(phase);
    }, 2000);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ color: '#90caf9', fontSize: '13px' }}>
          模拟 4 位评审者对 reviewee_id=1 的匿名评审流程
        </div>
        <button
          style={{ ...styles.button, padding: '8px 16px', fontSize: '13px' }}
          onClick={runSimulation}
          disabled={simulating}
        >
          {simulating ? '模拟中...' : '自动演示全流程'}
        </button>
      </div>

      <div style={styles.stepContainer}>
        {PHASES.map((phase, idx) => {
          const isActive = activePhase === idx;
          const isExpanded = expandedPhases.has(idx);
          const isSimActive = simulating && simPhase === idx;
          return (
            <div key={phase.key}>
              <div
                style={{
                  ...styles.step,
                  cursor: 'pointer',
                  borderColor: isActive ? '#ce93d8' : '#3a4a6b',
                  transition: 'border-color 0.3s',
                  ...(isSimActive ? { boxShadow: '0 0 12px rgba(206,147,216,0.4)' } : {}),
                }}
                onClick={() => togglePhase(idx)}
              >
                <div style={styles.stepNumber}>{idx + 1}</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>{phase.title}</div>
                  <div style={{ fontSize: '13px', color: '#aaa' }}>{phase.description}</div>
                  {isExpanded && (
                    <div style={{ marginTop: '12px' }}>
                      {phase.details(data)}
                    </div>
                  )}
                </div>
              </div>
              {idx < PHASES.length - 1 && (
                <div style={styles.arrow}>|</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ======================== Tab 2: Circuit Simulation ========================

function CircuitSimTab() {
  const [secret, setSecret] = useState(42);
  const [score, setScore] = useState(8);
  const [revieweeId, setRevieweeId] = useState(1);
  const [verified, setVerified] = useState(null);

  const commitment = useMemo(() => poseidonHash(secret), [secret]);
  const nullifier = useMemo(() => poseidonHash(secret, revieweeId), [secret, revieweeId]);

  const allCommitments = useMemo(() => {
    return REVIEWERS.map(r => poseidonHash(r.secret));
  }, []);

  const tree = useMemo(() => buildMerkleTree(allCommitments), [allCommitments]);

  const memberIndex = useMemo(() => {
    return allCommitments.indexOf(commitment);
  }, [allCommitments, commitment]);

  const proof = useMemo(() => {
    if (memberIndex < 0) return null;
    return getMerkleProof(tree.layers, memberIndex);
  }, [tree, memberIndex]);

  const runVerification = useCallback(() => {
    const rangeOk = score >= 1 && score <= 10;
    const memberOk = memberIndex >= 0;

    // Verify Merkle proof
    let merkleOk = false;
    if (memberOk && proof) {
      let current = allCommitments[memberIndex];
      for (const p of proof) {
        if (p.direction === 'right') {
          current = poseidonHash2(current, p.hash);
        } else {
          current = poseidonHash2(p.hash, current);
        }
      }
      merkleOk = current === tree.root;
    }

    // Verify nullifier
    const expectedNullifier = poseidonHash(secret, revieweeId);
    const nullifierOk = expectedNullifier === nullifier;

    setVerified({
      rangeOk,
      memberOk,
      merkleOk,
      nullifierOk,
      allPassed: rangeOk && merkleOk && nullifierOk,
    });
  }, [score, secret, revieweeId, memberIndex, proof, allCommitments, tree, nullifier]);

  const scoreBits = useMemo(() => {
    const bits = [];
    let n = score;
    for (let i = 0; i < 4; i++) {
      bits.push(n & 1);
      n >>= 1;
    }
    return bits;
  }, [score]);

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Private Inputs (only you know)</h3>
        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Secret (your private key)</label>
            <input
              type="number"
              style={styles.input}
              value={secret}
              onChange={(e) => { setSecret(parseInt(e.target.value) || 0); setVerified(null); }}
            />
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
              try: {REVIEWERS.map(r => r.secret).join(', ')}
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Score (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={score}
              onChange={(e) => { setScore(parseInt(e.target.value)); setVerified(null); }}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', color: '#ffcc80', fontWeight: 'bold', fontSize: '18px' }}>{score}</div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Reviewee ID</label>
            <input
              type="number"
              style={styles.input}
              value={revieweeId}
              onChange={(e) => { setRevieweeId(parseInt(e.target.value) || 0); setVerified(null); }}
            />
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Computed Values</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={styles.stepCalc}>
            commitment = Poseidon({secret}) = 0x{commitment.toString(16).padStart(8, '0')}
          </div>
          <div style={styles.stepCalc}>
            nullifier = Poseidon({secret}, {revieweeId}) = 0x{nullifier.toString(16).padStart(8, '0')}
          </div>
          <div style={styles.stepCalc}>
            Merkle root = 0x{tree.root.toString(16).padStart(8, '0')}
            {memberIndex >= 0
              ? ` (your leaf at index ${memberIndex})`
              : ' (you are NOT in the tree!)'}
          </div>
          {proof && (
            <div style={styles.stepCalc}>
              Merkle proof path:{'\n'}
              {proof.map((p, i) => `  level ${i}: sibling=0x${p.hash.toString(16).padStart(8, '0')} (${p.direction})`).join('\n')}
            </div>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Constraint Checks</h3>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: '#90caf9', fontSize: '13px', marginBottom: '8px' }}>
            Range Check: score binary decomposition
          </div>
          <div style={styles.stepCalc}>
            {score} = {scoreBits.map((b, i) => `${b}*2^${i}`).join(' + ')} = {scoreBits.reduce((s, b, i) => s + b * (1 << i), 0)}
            {'\n'}Bits: [{scoreBits.join(', ')}]
            {'\n'}Each bit b_i: b_i * (b_i - 1) === 0? {scoreBits.every(b => b === 0 || b === 1) ? 'YES' : 'NO'}
            {'\n'}1 {'<='} score {'<='} 10? {score >= 1 && score <= 10 ? 'YES' : 'NO'}
          </div>
        </div>

        <button style={styles.button} onClick={runVerification}>
          Verify All Constraints
        </button>

        {verified && (
          <div style={{ marginTop: '16px' }}>
            {[
              { label: 'Range check (1 <= score <= 10)', ok: verified.rangeOk },
              { label: 'Merkle membership proof', ok: verified.merkleOk },
              { label: 'Nullifier correctly derived', ok: verified.nullifierOk },
            ].map((check, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px' }}>{check.ok ? '\u2705' : '\u274C'}</span>
                <span style={{ color: check.ok ? '#a5d6a7' : '#ef9a9a' }}>{check.label}</span>
              </div>
            ))}
            <div style={{
              ...styles.result,
              ...(verified.allPassed ? styles.resultSuccess : styles.resultFail),
            }}>
              {verified.allPassed
                ? 'All constraints satisfied! Proof would be valid.'
                : 'Constraint violation! Proof generation would fail.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ======================== Tab 3: Anonymity Analysis ========================

function TimingAttackDemo() {
  const [mode, setMode] = useState('none'); // 'none' | 'batch' | 'delay'
  const [submitted, setSubmitted] = useState([]);
  const [running, setRunning] = useState(false);

  const simulateSubmissions = useCallback(() => {
    setSubmitted([]);
    setRunning(true);

    const names = ['Alice', 'Bob', 'Charlie', 'Diana'];
    // Real submission times (when user clicked submit)
    const realTimes = [
      { name: 'Alice', realTime: 3 },
      { name: 'Bob', realTime: 7 },
      { name: 'Charlie', realTime: 12 },
      { name: 'Diana', realTime: 18 },
    ];

    let entries;
    if (mode === 'none') {
      // No protection: server sees exact times
      entries = realTimes.map(r => ({
        name: r.name,
        serverTime: r.realTime,
        nullifier: '0x' + poseidonHash(REVIEWERS.find(rv => rv.name === r.name).secret, 1).toString(16).padStart(8, '0'),
      }));
    } else if (mode === 'delay') {
      // Random delay: add 0-30 "minutes" of random delay
      entries = realTimes.map(r => ({
        name: r.name,
        serverTime: r.realTime + Math.floor(Math.random() * 30),
        nullifier: '0x' + poseidonHash(REVIEWERS.find(rv => rv.name === r.name).secret, 1).toString(16).padStart(8, '0'),
      }));
      // Sort by server time (order is now scrambled)
      entries.sort((a, b) => a.serverTime - b.serverTime);
    } else {
      // Batch: all arrive at the same "time"
      const batchTime = 60; // all at deadline
      entries = realTimes.map(r => ({
        name: r.name,
        serverTime: batchTime,
        nullifier: '0x' + poseidonHash(REVIEWERS.find(rv => rv.name === r.name).secret, 1).toString(16).padStart(8, '0'),
      }));
      // Shuffle order randomly
      for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
      }
    }

    // Animate entries appearing one by one
    entries.forEach((entry, i) => {
      setTimeout(() => {
        setSubmitted(prev => [...prev, entry]);
        if (i === entries.length - 1) setRunning(false);
      }, (i + 1) * 600);
    });
  }, [mode]);

  return (
    <div style={{ ...styles.section, marginTop: '16px', borderLeft: '3px solid #f48fb1' }}>
      <h3 style={{ ...styles.sectionTitle, color: '#f48fb1' }}>SSO + Timing Attack Simulation</h3>
      <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '12px' }}>
        Employee concern: "After SSO login, HR knows I submitted a review. Can they track my score?"
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {[
          { key: 'none', label: 'No Protection' },
          { key: 'delay', label: 'Random Delay' },
          { key: 'batch', label: 'Batch Submit' },
        ].map(m => (
          <button
            key={m.key}
            style={{
              ...styles.button,
              ...(mode === m.key ? {} : styles.buttonSecondary),
              padding: '6px 14px',
              fontSize: '12px',
            }}
            onClick={() => { setMode(m.key); setSubmitted([]); }}
          >
            {m.label}
          </button>
        ))}
        <button
          style={{ ...styles.button, padding: '6px 14px', fontSize: '12px', marginLeft: 'auto', backgroundColor: '#4caf50' }}
          onClick={simulateSubmissions}
          disabled={running}
        >
          {running ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {/* Server log view */}
      <div style={{ backgroundColor: '#0f0f23', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
        <div style={{ color: '#666', marginBottom: '8px' }}>$ tail -f /var/log/nginx/access.log</div>
        {submitted.length === 0 && (
          <div style={{ color: '#444' }}>Waiting for submissions...</div>
        )}
        {submitted.map((s, i) => (
          <div key={i} style={{ marginBottom: '4px' }}>
            <span style={{ color: '#90caf9' }}>T+{String(s.serverTime).padStart(2, '0')}m</span>
            {' '}
            <span style={{ color: '#a5d6a7' }}>POST /api/reviews</span>
            {' '}
            <span style={{ color: mode === 'none' ? '#ef9a9a' : '#ffcc80' }}>
              User={mode === 'none' ? s.name : '???'}
            </span>
            {' '}
            <span style={{ color: '#b39ddb' }}>nullifier={s.nullifier}</span>
          </div>
        ))}
      </div>

      {submitted.length === 4 && (
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#0f0f23', borderRadius: '8px' }}>
          {mode === 'none' && (
            <div>
              <div style={{ color: '#ef9a9a', fontWeight: 'bold', marginBottom: '4px' }}>
                Risk: HR can correlate identity with nullifier via timestamps
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                HR sees exactly when each person submitted. Combined with access logs,
                they can map nullifiers to identities. However, they still CANNOT see the actual scores
                (encrypted + ZK proof hides the value).
              </div>
            </div>
          )}
          {mode === 'delay' && (
            <div>
              <div style={{ color: '#ffcc80', fontWeight: 'bold', marginBottom: '4px' }}>
                Better: Random delays scramble the submission order
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                With random 0-30 min delays, submission order no longer matches real order.
                If the proxy also strips JWT identity (forwarding only role="employee"),
                the server log shows anonymous requests. HR cannot tell who submitted which nullifier.
              </div>
            </div>
          )}
          {mode === 'batch' && (
            <div>
              <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '4px' }}>
                Best: All submissions arrive simultaneously at deadline
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                All 4 proofs arrive in random order at the same moment.
                Even with full server access, HR sees 4 identical-looking requests
                with no timing information to distinguish them.
                Combined with identity stripping, this provides maximum anonymity.
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
        <strong style={{ color: '#ce93d8' }}>Key insight:</strong> Even in the "No Protection" worst case,
        HR can only learn <em>who submitted a review</em> (like a polling station knowing you voted),
        but never <em>what score was given</em>. The timing mitigations add defense-in-depth
        by preventing even the identity-nullifier correlation.
      </div>
    </div>
  );
}

function AnonymityTab() {
  const [selectedReviewer, setSelectedReviewer] = useState(0);

  const reviewerData = useMemo(() => {
    return REVIEWERS.map(r => {
      const commitment = poseidonHash(r.secret);
      const nullifier = poseidonHash(r.secret, 1);
      const score = [8, 7, 9, 6][r.id];
      return {
        ...r,
        commitment,
        nullifier,
        score,
        proof: `{ pi_a: [0x${poseidonHash(r.secret, score, 1).toString(16).padStart(8, '0')}...], pi_b: [...], pi_c: [...] }`,
      };
    });
  }, []);

  const current = reviewerData[selectedReviewer];

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Select Reviewer Identity</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {REVIEWERS.map((r, i) => (
            <button
              key={i}
              style={{
                ...styles.button,
                ...(selectedReviewer === i ? {} : styles.buttonSecondary),
                padding: '8px 16px',
                fontSize: '13px',
              }}
              onClick={() => setSelectedReviewer(i)}
            >
              {r.name} ({r.role})
            </button>
          ))}
        </div>
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#888' }}>
          Switch between identities to see how the outputs change — notice the anonymity properties.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left: What HR sees */}
        <div style={{ ...styles.section, borderLeft: '3px solid #4caf50' }}>
          <h3 style={{ ...styles.sectionTitle, color: '#4caf50' }}>HR CAN see</h3>
          <div style={styles.card}>
            <div style={styles.label}>Nullifier (public)</div>
            <div style={{ ...styles.mono, color: '#ffcc80', marginTop: '4px' }}>
              0x{current.nullifier.toString(16).padStart(8, '0')}
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.label}>ZK Proof (public)</div>
            <div style={{ ...styles.mono, color: '#a5d6a7', marginTop: '4px', fontSize: '11px' }}>
              {current.proof}
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.label}>Encrypted Score</div>
            <div style={{ ...styles.mono, color: '#90caf9', marginTop: '4px' }}>
              AES(score, shared_key) = 0x{poseidonHash(current.score, 999).toString(16).padStart(8, '0')}
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.label}>Merkle Root</div>
            <div style={{ ...styles.mono, color: '#b39ddb', marginTop: '4px' }}>
              0x{buildMerkleTree(REVIEWERS.map(r => poseidonHash(r.secret))).root.toString(16).padStart(8, '0')}
            </div>
          </div>
        </div>

        {/* Right: What HR cannot see */}
        <div style={{ ...styles.section, borderLeft: '3px solid #f44336' }}>
          <h3 style={{ ...styles.sectionTitle, color: '#f44336' }}>HR CANNOT see</h3>
          <div style={{ ...styles.card, borderColor: '#f44336' }}>
            <div style={styles.label}>Reviewer Identity</div>
            <div style={{ ...styles.mono, color: '#ef9a9a', marginTop: '4px' }}>
              {current.name} (secret={current.secret})
            </div>
          </div>
          <div style={{ ...styles.card, borderColor: '#f44336' }}>
            <div style={styles.label}>Actual Score</div>
            <div style={{ ...styles.mono, color: '#ef9a9a', marginTop: '4px', fontSize: '18px' }}>
              {current.score} / 10
            </div>
          </div>
          <div style={{ ...styles.card, borderColor: '#f44336' }}>
            <div style={styles.label}>Secret Value</div>
            <div style={{ ...styles.mono, color: '#ef9a9a', marginTop: '4px' }}>
              {current.secret}
            </div>
          </div>
          <div style={{ ...styles.card, borderColor: '#f44336' }}>
            <div style={styles.label}>Merkle Path (which leaf)</div>
            <div style={{ ...styles.mono, color: '#ef9a9a', marginTop: '4px' }}>
              leaf index = {current.id}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...styles.section, marginTop: '16px', borderLeft: '3px solid #ffcc80' }}>
        <h3 style={{ ...styles.sectionTitle, color: '#ffcc80' }}>Indistinguishability Test</h3>
        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#aaa' }}>
          All 4 reviewers submitted reviews. Here is what HR sees in the database:
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #3a4a6b' }}>
              <th style={{ padding: '8px', textAlign: 'left', color: '#b39ddb' }}>#</th>
              <th style={{ padding: '8px', textAlign: 'left', color: '#b39ddb' }}>Nullifier</th>
              <th style={{ padding: '8px', textAlign: 'left', color: '#b39ddb' }}>Proof Valid</th>
              <th style={{ padding: '8px', textAlign: 'left', color: '#b39ddb' }}>Who?</th>
            </tr>
          </thead>
          <tbody>
            {reviewerData.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1a1a2e' }}>
                <td style={{ padding: '8px' }}>{i + 1}</td>
                <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                  0x{r.nullifier.toString(16).padStart(8, '0')}
                </td>
                <td style={{ padding: '8px', color: '#4caf50' }}>true</td>
                <td style={{ padding: '8px', color: '#f44336' }}>???</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#0f0f23', borderRadius: '8px' }}>
          <div style={{ color: '#ffcc80', fontWeight: 'bold', marginBottom: '8px' }}>
            "If HR knew a specific nullifier belongs to someone?"
          </div>
          <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.6' }}>
            <strong style={{ color: '#ce93d8' }}>Answer: Impossible.</strong> Nullifier = Poseidon(secret, reviewee_id).
            HR does not know anyone's secret. Poseidon is a one-way function — given a nullifier,
            you cannot reverse-compute which secret produced it. Even if HR has the full Merkle tree of commitments,
            commitments are Poseidon(secret) which is also one-way.
            There is no link between commitment and nullifier without knowing the secret.
          </div>
        </div>
      </div>

      <TimingAttackDemo />
    </div>
  );
}

// ======================== Main Component ========================

export default function ZKP360ReviewDemo() {
  const [activeTab, setActiveTab] = useState('protocol');

  const tabItems = [
    { key: 'protocol', label: 'Protocol Flow' },
    { key: 'circuit', label: 'Circuit Simulation' },
    { key: 'anonymity', label: 'Anonymity Analysis' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ZKP Anonymous 360 Review System</h2>
      <div style={styles.tabs}>
        {tabItems.map(t => (
          <button
            key={t.key}
            style={{ ...styles.tab, ...(activeTab === t.key ? styles.tabActive : styles.tabInactive) }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'protocol' && <ProtocolFlowTab />}
      {activeTab === 'circuit' && <CircuitSimTab />}
      {activeTab === 'anonymity' && <AnonymityTab />}
    </div>
  );
}
