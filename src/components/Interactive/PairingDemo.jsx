import React, { useMemo, useState } from 'react';

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
    backgroundColor: '#111827',
    borderRadius: '12px',
    color: '#e5e7eb',
    marginBottom: '20px',
    border: '1px solid #1f2937',
  },
  title: {
    margin: '0 0 12px 0',
    color: '#60a5fa',
    fontSize: '1.2rem',
  },
  note: {
    fontSize: '12px',
    color: '#cbd5f5',
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    border: '1px solid rgba(96, 165, 250, 0.25)',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    color: '#93c5fd',
    fontWeight: 'bold',
  },
  input: {
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#fff',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box',
  },
  section: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    border: '1px solid #1f2937',
  },
  row: {
    fontFamily: 'monospace',
    fontSize: '13px',
    lineHeight: '1.8',
    color: '#d1d5db',
  },
  good: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  bad: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
};

function modPow(base, exp, mod) {
  if (mod <= 1n) return 0n;
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
}

function toBigInt(value, fallback) {
  const n = Number.isFinite(value) ? Math.trunc(value) : fallback;
  return BigInt(n);
}

export default function PairingDemo() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [P, setP] = useState(2);
  const [Q, setQ] = useState(5);
  const [g, setG] = useState(5);
  const [mod, setMod] = useState(97);

  const result = useMemo(() => {
    const A = toBigInt(a, 2);
    const B = toBigInt(b, 3);
    const Pn = toBigInt(P, 2);
    const Qn = toBigInt(Q, 5);
    const G = toBigInt(g, 5);
    const M = toBigInt(mod, 97);

    const pq = Pn * Qn;
    const ePQ = modPow(G, pq, M);

    const left1 = modPow(G, A * pq, M);
    const right1 = modPow(ePQ, A, M);

    const left2 = modPow(G, B * pq, M);
    const right2 = modPow(ePQ, B, M);

    const left3 = modPow(G, A * B * pq, M);
    const right3 = modPow(ePQ, A * B, M);

    return {
      ePQ,
      left1,
      right1,
      left2,
      right2,
      left3,
      right3,
      eq1: left1 === right1,
      eq2: left2 === right2,
      eq3: left3 === right3,
    };
  }, [a, b, P, Q, g, mod]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔧 配对函数交互式演示（简化版）</h3>
      <div style={styles.note}>
        这里用玩具公式 <strong>e(P, Q) = g^(P×Q) mod m</strong> 来模拟配对函数，
        只为了展示“双线性”的结构，不代表真实配对的计算方式。
      </div>

      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>a</label>
          <input
            type="number"
            style={styles.input}
            value={a}
            onChange={(e) => setA(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>b</label>
          <input
            type="number"
            style={styles.input}
            value={b}
            onChange={(e) => setB(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>P</label>
          <input
            type="number"
            style={styles.input}
            value={P}
            onChange={(e) => setP(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Q</label>
          <input
            type="number"
            style={styles.input}
            value={Q}
            onChange={(e) => setQ(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>g</label>
          <input
            type="number"
            style={styles.input}
            value={g}
            onChange={(e) => setG(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>m (mod)</label>
          <input
            type="number"
            style={styles.input}
            value={mod}
            onChange={(e) => setMod(parseInt(e.target.value, 10) || 1)}
            min="2"
          />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.row}>
          e(P, Q) = g^(P×Q) mod m = <span style={styles.good}>{result.ePQ.toString()}</span>
        </div>
        <div style={styles.row}>
          e(aP, Q) ?= e(P, Q)^a → {result.left1.toString()} vs {result.right1.toString()}{' '}
          <span style={result.eq1 ? styles.good : styles.bad}>
            {result.eq1 ? '相等' : '不相等'}
          </span>
        </div>
        <div style={styles.row}>
          e(P, bQ) ?= e(P, Q)^b → {result.left2.toString()} vs {result.right2.toString()}{' '}
          <span style={result.eq2 ? styles.good : styles.bad}>
            {result.eq2 ? '相等' : '不相等'}
          </span>
        </div>
        <div style={styles.row}>
          e(aP, bQ) ?= e(P, Q)^(ab) → {result.left3.toString()} vs {result.right3.toString()}{' '}
          <span style={result.eq3 ? styles.good : styles.bad}>
            {result.eq3 ? '相等' : '不相等'}
          </span>
        </div>
      </div>
    </div>
  );
}
