import React, { useEffect, useMemo, useState } from 'react';

function mod(n, p) {
  return ((n % p) + p) % p;
}

function modInverse(a, p) {
  let [old_r, r] = [a, p];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return mod(old_s, p);
}

function pointAdd(P, Q, a, p) {
  if (!P) return Q;
  if (!Q) return P;
  if (P.x === Q.x && P.y === Q.y) {
    if (P.y === 0) return null;
    const num = mod(3 * P.x * P.x + a, p);
    const den = modInverse(2 * P.y, p);
    const lambda = mod(num * den, p);
    const x3 = mod(lambda * lambda - 2 * P.x, p);
    const y3 = mod(lambda * (P.x - x3) - P.y, p);
    return { x: x3, y: y3 };
  }
  if (P.x === Q.x) return null;
  const num = mod(Q.y - P.y, p);
  const den = modInverse(Q.x - P.x, p);
  const lambda = mod(num * den, p);
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

const CURVE = {
  a: 2,
  b: 2,
  p: 17,
  G: { x: 5, y: 1 },
  n: 19,
};

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    color: '#e5e7eb',
    marginBottom: '20px',
    border: '1px solid #1f2937',
  },
  title: {
    margin: '0 0 12px 0',
    color: '#38bdf8',
    fontSize: '1.2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '12px',
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
    backgroundColor: '#0b1220',
    color: '#fff',
    fontSize: '13px',
  },
  section: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#111827',
    borderRadius: '8px',
    border: '1px solid #1f2937',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: '13px',
    lineHeight: '1.8',
    color: '#e2e8f0',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '6px',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#7dd3fc',
    fontSize: '11px',
    marginLeft: '6px',
  },
  note: {
    fontSize: '12px',
    color: '#cbd5f5',
    marginTop: '8px',
  },
  details: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#cbd5f5',
  },
  summary: {
    cursor: 'pointer',
  },
  flow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    marginTop: '10px',
  },
  flowCard: {
    padding: '10px',
    backgroundColor: '#0b1220',
    borderRadius: '8px',
    border: '1px solid #1f2937',
    fontSize: '12px',
    color: '#e5e7eb',
    minWidth: '140px',
    flex: '1 1 140px',
  },
  flowTitle: {
    fontWeight: 'bold',
    color: '#7dd3fc',
    marginBottom: '6px',
  },
  flowArrow: {
    color: '#38bdf8',
    fontSize: '18px',
    padding: '0 4px',
  },
};

export default function ECIESDemo() {
  const [d, setD] = useState(7);
  const [k, setK] = useState(5);
  const [m, setM] = useState(9);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const Q = useMemo(() => scalarMult(d, CURVE.G, CURVE.a, CURVE.p), [d]);
  const R = useMemo(() => scalarMult(k, CURVE.G, CURVE.a, CURVE.p), [k]);
  const S = useMemo(() => (Q ? scalarMult(k, Q, CURVE.a, CURVE.p) : null), [k, Q]);
  const S2 = useMemo(() => (R ? scalarMult(d, R, CURVE.a, CURVE.p) : null), [d, R]);

  const key = S ? S.x : 0;
  const C = mod(m + key, CURVE.p);
  const recovered = S2 ? mod(C - S2.x, CURVE.p) : null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔒 椭圆曲线加密解密（简化 ECIES）</h3>
      <div style={styles.note}>
        这是教学版：用共享点的 x 当“密钥”，用加法模拟加密。真实 ECIES 会使用哈希与对称加密。
      </div>

      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>私钥 d</label>
          <input
            type="number"
            min="1"
            max={CURVE.n - 1}
            style={styles.input}
            value={d}
            onChange={(e) => setD(parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>随机数 k</label>
          <input
            type="number"
            min="1"
            max={CURVE.n - 1}
            style={styles.input}
            value={k}
            onChange={(e) => setK(parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>明文 m (0~{CURVE.p - 1})</label>
          <input
            type="number"
            min="0"
            max={CURVE.p - 1}
            style={styles.input}
            value={m}
            onChange={(e) => setM(parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.flow}>
          <div style={styles.flowCard}>
            <div style={styles.flowTitle}>① 生成公钥</div>
            接收者：Q = d×G
          </div>
          <div style={styles.flowArrow}>{isMobile ? '↓' : '→'}</div>
          <div style={styles.flowCard}>
            <div style={styles.flowTitle}>② 发送者选 k</div>
            计算 R = k×G
          </div>
          <div style={styles.flowArrow}>{isMobile ? '↓' : '→'}</div>
          <div style={styles.flowCard}>
            <div style={styles.flowTitle}>③ 共享点</div>
            发送者算 S = k×Q
          </div>
          <div style={styles.flowArrow}>{isMobile ? '↓' : '→'}</div>
          <div style={styles.flowCard}>
            <div style={styles.flowTitle}>④ 加密</div>
            C = (m + S.x) mod p
          </div>
        </div>
        <div style={styles.mono}>
          公钥 Q = d×G = ({Q?.x}, {Q?.y}) <span style={styles.badge}>接收方</span>
          <br/>
          随机点 R = k×G = ({R?.x}, {R?.y}) <span style={styles.badge}>发送方</span>
          <br/>
          共享点 S = k×Q = ({S?.x}, {S?.y})
          <br/>
          加密：C = (m + S.x) mod p = ({m} + {key}) mod {CURVE.p} = {C}
        </div>
        <details style={styles.details}>
          <summary style={styles.summary}>展开步骤解释</summary>
          <div style={styles.mono}>
            1) 发送者只知道公钥 Q，因此先算 R = k×G 并把 R 发给接收者。<br/>
            2) 发送者再算 S = k×Q，得到秘密点。<br/>
            3) 用 S.x 作为“临时钥匙”把明文 m 加密成 C。<br/>
            4) 接收者用私钥 d 计算 S' = d×R，得到同一个点。<br/>
            5) 用 S'.x 还原明文。
            <br/><br/>
            为什么 S = S'？<br/>
            因为 S = k×Q = k×(d×G) = (k×d)×G<br/>
            而 S' = d×R = d×(k×G) = (d×k)×G<br/>
            两者都是 (k×d)×G，所以一定相同。
          </div>
        </details>
      </div>

      <div style={styles.section}>
        <div style={styles.mono}>
          解密端计算 S' = d×R = ({S2?.x}, {S2?.y})
          <br/>
          恢复明文：m = (C - S'.x) mod p = ({C} - {S2?.x ?? 0}) mod {CURVE.p} = {recovered}
        </div>
      </div>
    </div>
  );
}
