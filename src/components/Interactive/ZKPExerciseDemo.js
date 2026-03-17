import React, { useState, useMemo } from 'react';

const S = {
  container: { fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px', backgroundColor: '#1a1a2e', borderRadius: '12px', color: '#eee', marginBottom: '20px' },
  title: { margin: '0 0 20px 0', color: '#ce93d8', fontSize: '1.5rem' },
  section: { marginBottom: '20px', padding: '16px', backgroundColor: '#16213e', borderRadius: '8px' },
  sectionTitle: { margin: '0 0 12px 0', color: '#b39ddb', fontSize: '1.1rem' },
  label: { fontSize: '12px', color: '#90caf9', fontWeight: 'bold', display: 'block', marginBottom: '4px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #3a4a6b', backgroundColor: '#0f0f23', color: '#fff', fontSize: '16px', width: '80px', boxSizing: 'border-box', textAlign: 'center' },
  cellInput: { width: '44px', padding: '6px', textAlign: 'center', backgroundColor: '#0f0f23', border: '1px solid #3a4a6b', borderRadius: '4px', color: '#fff', fontSize: '14px', fontFamily: 'monospace' },
  btn: { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#ce93d8', color: '#000', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  btnSec: { backgroundColor: 'transparent', border: '1px solid #ce93d8', color: '#ce93d8' },
  btnSm: { padding: '6px 14px', fontSize: '12px' },
  btnGreen: { backgroundColor: 'transparent', border: '1px solid #4caf50', color: '#4caf50' },
  explanation: { fontSize: '14px', color: '#bbb', lineHeight: '1.7', marginBottom: '12px' },
  tooltip: { fontSize: '13px', color: '#aaa', backgroundColor: '#0f0f23', padding: '10px 14px', borderRadius: '8px', border: '1px dashed #3a4a6b', marginTop: '12px', lineHeight: '1.6' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', marginLeft: '8px' },
  ok: { color: '#4caf50', fontWeight: 'bold', fontSize: '13px' },
  err: { color: '#f44336', fontWeight: 'bold', fontSize: '13px' },
  hint: { fontSize: '13px', color: '#ffcc80', backgroundColor: 'rgba(255,204,128,0.1)', border: '1px solid #ffcc8044', borderRadius: '6px', padding: '10px 14px', marginTop: '10px', lineHeight: '1.6' },
  answer: { fontSize: '13px', color: '#a5d6a7', backgroundColor: 'rgba(165,214,167,0.1)', border: '1px solid #a5d6a744', borderRadius: '6px', padding: '10px 14px', marginTop: '10px', lineHeight: '1.8', fontFamily: 'monospace' },
  resultOk: { padding: '16px', borderRadius: '8px', marginTop: '12px', textAlign: 'center', backgroundColor: 'rgba(76,175,80,0.2)', border: '2px solid #4caf50' },
  resultFail: { padding: '16px', borderRadius: '8px', marginTop: '12px', textAlign: 'center', backgroundColor: 'rgba(244,67,54,0.2)', border: '2px solid #f44336' },
  row: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' },
  btnRow: { display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' },
  tblH: { padding: '8px 10px', textAlign: 'center', border: '1px solid #3a4a6b', color: '#90caf9', fontWeight: 'bold', backgroundColor: '#0f0f23', minWidth: '44px', fontFamily: 'monospace', fontSize: '13px' },
  tblC: { padding: '4px', textAlign: 'center', border: '1px solid #3a4a6b' },
};

// ---------------------------------------------------------------------------
// Exercise data
// ---------------------------------------------------------------------------

const EXERCISES = {
  simple: {
    label: 'x² + x + 1 = y（基础）',
    expr: 'x² + x + 1 = y',
    vars: ['1', 'x', 'y', 'sym1'],
    witness: (x) => { const s1 = x * x; return [1, x, s1 + x + 1, s1]; },
    A: [[0,1,0,0],[1,1,0,1]],
    B: [[0,1,0,0],[1,0,0,0]],
    C: [[0,0,0,1],[0,0,1,0]],
    cLabels: ['x × x = sym1', '(sym1+x+1) × 1 = y'],
    flattenAnswers: ['sym1 = x × x', 'y = sym1 + x + 1'],
    flattenHints: ['唯一的乘法是 x × x，将其存为中间变量 sym1。', '加法 sym1+x+1 可以直接合并到一个约束，无需额外乘法门。'],
    witnessHint: (x) => { const s1 = x * x; return `s = [1, ${x}, ${s1+x+1}, ${s1}]`; },
    defaultX: 4,
  },
  advanced: {
    label: 'x³ + x + 5 = y（进阶）',
    expr: 'x³ + x + 5 = y',
    vars: ['1', 'x', 'y', 'sym1', 'sym2'],
    witness: (x) => { const s1 = x*x, s2 = s1*x; return [1, x, s2+x+5, s1, s2]; },
    A: [[0,1,0,0,0],[0,0,0,1,0],[5,1,0,0,1]],
    B: [[0,1,0,0,0],[0,1,0,0,0],[1,0,0,0,0]],
    C: [[0,0,0,1,0],[0,0,0,0,1],[0,0,1,0,0]],
    cLabels: ['x × x = sym1', 'sym1 × x = sym2', '(sym2+x+5) × 1 = y'],
    flattenAnswers: ['sym1 = x × x', 'sym2 = sym1 × x', 'y = sym2 + x + 5'],
    flattenHints: ['第一步计算 x²，产生乘法门 1。', '第二步将 x² 乘 x 得 x³，产生乘法门 2。'],
    witnessHint: (x) => { const s1=x*x, s2=s1*x; return `s = [1, ${x}, ${s2+x+5}, ${s1}, ${s2}]`; },
    defaultX: 3,
  },
};

const dot = (v1, v2) => v1.reduce((s, v, i) => s + v * v2[i], 0);

// ---------------------------------------------------------------------------
// Step 1 – Flatten
// ---------------------------------------------------------------------------

function Step1({ ex, onComplete, done }) {
  const [inputs, setInputs] = useState(ex.flattenAnswers.map(() => ''));
  const [checked, setChecked] = useState(ex.flattenAnswers.map(() => null));
  const [showHint, setShowHint] = useState(false);
  const [showAns, setShowAns] = useState(false);

  const check = () => {
    const r = inputs.map((v, i) => v.trim().replace(/\s+/g, ' ') === ex.flattenAnswers[i]);
    setChecked(r);
    if (r.every(Boolean)) onComplete();
  };

  const revealAnswer = () => {
    setInputs([...ex.flattenAnswers]);
    setChecked(ex.flattenAnswers.map(() => true));
    setShowAns(true);
    onComplete();
  };

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>
        第 1 步：拍平表达式
        <span style={{ ...S.badge, backgroundColor: '#ce93d8', color: '#000' }}>Flatten</span>
      </h3>
      <p style={S.explanation}>
        将 <code style={{ color: '#ffcc80' }}>{ex.expr}</code> 分解为只含基本运算的赋值语句。每个乘法需要独立的中间变量，加法可以合并。请按格式填写（如 <code>sym1 = x × x</code>）：
      </p>
      {ex.flattenAnswers.map((_, i) => (
        <div key={i} style={S.row}>
          <span style={{ color: '#90caf9', fontFamily: 'monospace', minWidth: '20px' }}>{i + 1}.</span>
          <input
            style={{ ...S.input, width: '280px', fontSize: '14px', fontFamily: 'monospace', borderColor: checked[i] === true ? '#4caf50' : checked[i] === false ? '#f44336' : '#3a4a6b' }}
            placeholder="变量 = 表达式"
            value={inputs[i]}
            onChange={(e) => { const n = [...inputs]; n[i] = e.target.value; setInputs(n); const c = [...checked]; c[i] = null; setChecked(c); }}
          />
          {checked[i] === true && <span style={S.ok}>✓ 正确</span>}
          {checked[i] === false && <span style={S.err}>✗ 再想想</span>}
        </div>
      ))}
      <div style={S.btnRow}>
        <button style={S.btn} onClick={check}>检查</button>
        <button style={{ ...S.btn, ...S.btnSec, ...S.btnSm }} onClick={() => setShowHint(!showHint)}>{showHint ? '收起提示' : '提示'}</button>
        <button style={{ ...S.btn, ...S.btnSec, ...S.btnSm }} onClick={revealAnswer}>显示答案</button>
        {done && <span style={S.ok}>本步已完成</span>}
      </div>
      {showHint && <div style={S.hint}>{ex.flattenHints.map((h, i) => <div key={i}>提示 {i + 1}：{h}</div>)}</div>}
      {showAns && <div style={S.answer}>{ex.flattenAnswers.map((a, i) => <div key={i}>{a}</div>)}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 – Witness
// ---------------------------------------------------------------------------

function Step2({ ex, xVal, setXVal, onComplete, done }) {
  const w = useMemo(() => ex.witness(xVal), [ex, xVal]);
  const [inputs, setInputs] = useState(ex.vars.map(() => ''));
  const [checked, setChecked] = useState(ex.vars.map(() => null));
  const [showHint, setShowHint] = useState(false);
  const [showAns, setShowAns] = useState(false);

  const reset = (newX) => { setXVal(newX); setInputs(ex.vars.map(() => '')); setChecked(ex.vars.map(() => null)); };

  const check = () => {
    const r = inputs.map((v, i) => parseInt(v) === w[i]);
    setChecked(r);
    if (r.every(Boolean)) onComplete();
  };

  const revealAnswer = () => {
    setInputs(w.map(String));
    setChecked(w.map(() => true));
    setShowAns(true);
    onComplete();
  };

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>
        第 2 步：构造 Witness 向量
        <span style={{ ...S.badge, backgroundColor: '#90caf9', color: '#000' }}>Witness</span>
      </h3>
      <p style={S.explanation}>
        选择 x 的值，计算 witness s = [<code style={{ color: '#ffcc80' }}>{ex.vars.join(', ')}</code>]，依次填入每个分量：
      </p>
      <div style={{ ...S.row, marginBottom: '16px' }}>
        <label style={{ ...S.label, display: 'inline' }}>x =</label>
        <input type="number" style={S.input} value={xVal} onChange={(e) => reset(parseInt(e.target.value) || 0)} />
        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#a5d6a7', backgroundColor: '#0f0f23', padding: '6px 12px', borderRadius: '6px' }}>
          {ex.expr} → y = {w[2]}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <span style={{ color: '#ce93d8', fontFamily: 'monospace', paddingBottom: '8px' }}>s = [</span>
        {ex.vars.map((name, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '11px', color: '#90caf9', fontFamily: 'monospace' }}>{name}</span>
            <input
              style={{ ...S.cellInput, borderColor: checked[i] === true ? '#4caf50' : checked[i] === false ? '#f44336' : '#3a4a6b' }}
              placeholder="?"
              value={inputs[i]}
              onChange={(e) => { const n = [...inputs]; n[i] = e.target.value; setInputs(n); const c = [...checked]; c[i] = null; setChecked(c); }}
            />
            {checked[i] === true && <span style={{ ...S.ok, fontSize: '11px' }}>✓</span>}
            {checked[i] === false && <span style={{ ...S.err, fontSize: '11px' }}>✗</span>}
          </div>
        ))}
        <span style={{ color: '#ce93d8', fontFamily: 'monospace', paddingBottom: '8px' }}>]</span>
      </div>
      <div style={S.btnRow}>
        <button style={S.btn} onClick={check}>检查</button>
        <button style={{ ...S.btn, ...S.btnSec, ...S.btnSm }} onClick={() => setShowHint(!showHint)}>{showHint ? '收起提示' : '提示'}</button>
        <button style={{ ...S.btn, ...S.btnSec, ...S.btnSm }} onClick={revealAnswer}>显示答案</button>
        {done && <span style={S.ok}>本步已完成</span>}
      </div>
      {showHint && <div style={S.hint}>第一个元素固定为 1（常数项）。将 x={xVal} 代入拍平后的各步骤逐一计算。</div>}
      {showAns && <div style={S.answer}>{ex.witnessHint(xVal)}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 – R1CS matrices
// ---------------------------------------------------------------------------

function Step3({ ex, onComplete, done }) {
  const { vars, A, B, C, cLabels } = ex;
  const nc = A.length, nv = vars.length;
  const empty = () => Array.from({ length: nc }, () => Array(nv).fill(''));
  const [mA, setMA] = useState(empty());
  const [mB, setMB] = useState(empty());
  const [mC, setMC] = useState(empty());
  const [checked, setChecked] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showAns, setShowAns] = useState(false);

  const chkMat = (user, ans) => user.map((row, ri) => row.map((v, ci) => parseInt(v) === ans[ri][ci]));

  const check = () => {
    const rA = chkMat(mA, A), rB = chkMat(mB, B), rC = chkMat(mC, C);
    setChecked({ A: rA, B: rB, C: rC });
    if ([rA, rB, rC].every(m => m.every(r => r.every(Boolean)))) onComplete();
  };

  const revealAnswer = () => {
    setMA(A.map(r => r.map(String)));
    setMB(B.map(r => r.map(String)));
    setMC(C.map(r => r.map(String)));
    const t = A.map(r => r.map(() => true));
    setChecked({ A: t, B: t, C: t });
    setShowAns(true);
    onComplete();
  };

  const MatrixEditor = ({ label, color, state, setState, ans, key: k }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ color, fontWeight: 'bold', marginBottom: '6px', fontFamily: 'monospace', fontSize: '13px' }}>矩阵 {k}（{label}）</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ ...S.tblH, minWidth: '100px', fontSize: '11px' }}>约束</th>
              {vars.map((v, i) => <th key={i} style={S.tblH}>{v}</th>)}
            </tr>
          </thead>
          <tbody>
            {state.map((row, ri) => (
              <tr key={ri}>
                <td style={{ ...S.tblC, color: '#aaa', fontSize: '11px', padding: '4px 6px', backgroundColor: '#0f0f23', border: '1px solid #3a4a6b' }}>{cLabels[ri]}</td>
                {row.map((cell, ci) => {
                  const ok = checked && checked[k] && checked[k][ri][ci];
                  const bad = checked && checked[k] && checked[k][ri][ci] === false;
                  return (
                    <td key={ci} style={S.tblC}>
                      <input
                        style={{ ...S.cellInput, borderColor: ok ? '#4caf50' : bad ? '#f44336' : '#3a4a6b' }}
                        placeholder="0"
                        value={cell}
                        onChange={(e) => { const n = state.map(r => [...r]); n[ri][ci] = e.target.value; setState(n); setChecked(null); }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>
        第 3 步：填写 R1CS 矩阵
        <span style={{ ...S.badge, backgroundColor: '#ffcc80', color: '#000' }}>R1CS</span>
      </h3>
      <p style={S.explanation}>
        行对应约束，列对应变量 [{vars.join(', ')}]。每条约束满足 <code style={{ color: '#ffcc80' }}>(A·s)×(B·s) = (C·s)</code>。
      </p>
      <MatrixEditor label="左输入" color="#ce93d8" state={mA} setState={setMA} ans={A} key="A" />
      <MatrixEditor label="右输入" color="#90caf9" state={mB} setState={setMB} ans={B} key="B" />
      <MatrixEditor label="输出" color="#a5d6a7" state={mC} setState={setMC} ans={C} key="C" />
      <div style={S.btnRow}>
        <button style={S.btn} onClick={check}>检查</button>
        <button style={{ ...S.btn, ...S.btnSec, ...S.btnSm }} onClick={() => setShowHint(!showHint)}>{showHint ? '收起提示' : '提示'}</button>
        <button style={{ ...S.btn, ...S.btnSec, ...S.btnSm }} onClick={revealAnswer}>显示答案</button>
        {done && <span style={S.ok}>本步已完成</span>}
      </div>
      {showHint && <div style={S.hint}>乘法约束如 x×x=sym1：A 和 B 都在 x 列填 1，C 在 sym1 列填 1，其余填 0。加法合并约束：A 的系数反映各变量的系数，B 在常数列（第 0 列）填 1。</div>}
      {showAns && (
        <div style={S.answer}>
          {cLabels.map((l, i) => (
            <div key={i}>约束{i+1} {l}：A=[{A[i].join(',')}] B=[{B[i].join(',')}] C=[{C[i].join(',')}]</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 – Verify
// ---------------------------------------------------------------------------

function Step4({ ex, xVal }) {
  const { A, B, C, cLabels } = ex;
  const s = useMemo(() => ex.witness(xVal), [ex, xVal]);
  const checks = A.map((_, i) => {
    const as = dot(A[i], s), bs = dot(B[i], s), cs = dot(C[i], s);
    return { as, bs, cs, product: as * bs, pass: as * bs === cs };
  });
  const allPass = checks.every(c => c.pass);

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>
        第 4 步：验证约束
        <span style={{ ...S.badge, backgroundColor: '#a5d6a7', color: '#000' }}>验证</span>
      </h3>
      <p style={S.explanation}>
        系统用标准答案矩阵和 witness s = [{s.join(', ')}] 检查每条约束 <code style={{ color: '#ffcc80' }}>(A·s)×(B·s) = (C·s)</code>：
      </p>
      {checks.map((c, i) => (
        <div key={i} style={{ padding: '12px', marginBottom: '8px', borderRadius: '8px', backgroundColor: '#0f0f23', border: `1px solid ${c.pass ? '#4caf50' : '#f44336'}` }}>
          <div style={{ color: '#b39ddb', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px', marginBottom: '6px' }}>约束 {i+1}：{cLabels[i]}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', fontFamily: 'monospace', fontSize: '13px' }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(206,147,216,0.15)', color: '#ce93d8' }}>A·s={c.as}</span>
            <span style={{ color: '#666' }}>×</span>
            <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(144,202,249,0.15)', color: '#90caf9' }}>B·s={c.bs}</span>
            <span style={{ color: '#666' }}>=</span>
            <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,204,128,0.15)', color: '#ffcc80' }}>{c.product}</span>
            <span style={{ color: '#666' }}>{c.pass ? '==' : '≠'}</span>
            <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(165,214,167,0.15)', color: '#a5d6a7' }}>C·s={c.cs}</span>
            <span>{c.pass ? '✅' : '❌'}</span>
          </div>
        </div>
      ))}
      <div style={allPass ? S.resultOk : S.resultFail}>
        {allPass ? (
          <>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>所有约束满足！</div>
            <div style={{ fontSize: '14px', color: '#a5d6a7' }}>witness 合法，证明者知道满足 {ex.expr} 的秘密 x = {xVal}。</div>
          </>
        ) : (
          <div style={{ fontSize: '14px' }}>存在不满足的约束，请检查矩阵或 witness。</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ZKPExerciseDemo() {
  const [exKey, setExKey] = useState('simple');
  const ex = EXERCISES[exKey];

  const [xVal, setXVal] = useState(ex.defaultX);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState([false, false, false, false]);
  const [showSummary, setShowSummary] = useState(false);

  const markDone = (i) => setDone(prev => { const n = [...prev]; n[i] = true; return n; });

  const switchExercise = (key) => {
    setExKey(key);
    setXVal(EXERCISES[key].defaultX);
    setStep(0);
    setDone([false, false, false, false]);
    setShowSummary(false);
  };

  const restart = () => { setStep(0); setDone([false, false, false, false]); setShowSummary(false); setXVal(ex.defaultX); };

  const labels = ['拍平表达式', '构造 Witness', '写出 R1CS', '验证约束'];
  const score = done.filter(Boolean).length;

  return (
    <div style={S.container}>
      <h2 style={S.title}>ZKP 练习：R1CS 构造训练</h2>

      {/* Exercise selector */}
      <div style={S.section}>
        <label style={S.label}>选择练习题</label>
        <select
          style={{ ...S.input, width: '260px', fontSize: '14px', cursor: 'pointer' }}
          value={exKey}
          onChange={(e) => switchExercise(e.target.value)}
        >
          {Object.entries(EXERCISES).map(([k, e]) => <option key={k} value={k}>{e.label}</option>)}
        </select>
        <div style={S.tooltip}>
          当前表达式：<code style={{ color: '#ffcc80' }}>{ex.expr}</code>，变量：<code style={{ color: '#90caf9' }}>[{ex.vars.join(', ')}]</code>
        </div>
      </div>

      {/* Step progress indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {labels.map((label, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px',
              fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
              backgroundColor: done[i] ? 'rgba(76,175,80,0.2)' : step === i ? 'rgba(206,147,216,0.2)' : '#0f0f23',
              border: `1px solid ${done[i] ? '#4caf50' : step === i ? '#ce93d8' : '#3a4a6b'}`,
              color: done[i] ? '#4caf50' : step === i ? '#ce93d8' : '#666',
            }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '20px', height: '20px', borderRadius: '50%', fontSize: '11px', fontWeight: 'bold', flexShrink: 0,
              backgroundColor: done[i] ? '#4caf50' : step === i ? '#ce93d8' : '#3a4a6b',
              color: done[i] || step === i ? '#000' : '#aaa',
            }}>
              {done[i] ? '✓' : i + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Active step */}
      {step === 0 && <Step1 ex={ex} onComplete={() => markDone(0)} done={done[0]} />}
      {step === 1 && <Step2 ex={ex} xVal={xVal} setXVal={setXVal} onComplete={() => markDone(1)} done={done[1]} />}
      {step === 2 && <Step3 ex={ex} onComplete={() => markDone(2)} done={done[2]} />}
      {step === 3 && <Step4 ex={ex} xVal={xVal} onComplete={() => markDone(3)} done={done[3]} />}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {step > 0 && <button style={{ ...S.btn, ...S.btnSec }} onClick={() => setStep(s => s - 1)}>上一步</button>}
        {step < 3 && <button style={S.btn} onClick={() => setStep(s => s + 1)}>下一步</button>}
        {step === 3 && (
          <button style={{ ...S.btn, ...S.btnGreen }} onClick={() => { markDone(3); setShowSummary(true); }}>
            完成练习
          </button>
        )}
        <button style={{ ...S.btn, ...S.btnSec, ...S.btnSm, marginLeft: 'auto' }} onClick={restart}>重新开始</button>
      </div>

      {/* Summary */}
      {showSummary && (
        <div style={{ ...(score === 4 ? S.resultOk : S.resultFail), marginTop: '20px' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>
            {score === 4 ? '恭喜完成所有步骤！' : `已完成 ${score} / 4 步`}
          </div>
          <div style={{ fontSize: '14px', lineHeight: '2', color: '#ccc' }}>
            {labels.map((l, i) => <div key={i}>{done[i] ? '✅' : '⬜'} 第 {i+1} 步：{l}</div>)}
          </div>
          {score === 4 && (
            <div style={{ marginTop: '10px', color: '#a5d6a7', fontSize: '14px' }}>
              你已掌握从多项式表达式到 R1CS 的完整流程，这是构造 ZKP 证明系统的核心技能！
            </div>
          )}
        </div>
      )}
    </div>
  );
}
