import React, { useState, useEffect, useCallback } from 'react';

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
  select: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    minWidth: '220px',
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
  gate: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    fontWeight: 'bold',
    fontSize: '20px',
    border: '3px solid',
    margin: '4px',
    transition: 'all 0.5s ease',
  },
  gateMul: {
    backgroundColor: 'rgba(206, 147, 216, 0.2)',
    borderColor: '#ce93d8',
    color: '#ce93d8',
  },
  gateAdd: {
    backgroundColor: 'rgba(144, 202, 249, 0.2)',
    borderColor: '#90caf9',
    color: '#90caf9',
  },
  gateHighlight: {
    boxShadow: '0 0 20px rgba(206, 147, 216, 0.6)',
    transform: 'scale(1.15)',
  },
  gateAddHighlight: {
    boxShadow: '0 0 20px rgba(144, 202, 249, 0.6)',
    transform: 'scale(1.15)',
  },
  wire: {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#a5d6a7',
    padding: '6px 10px',
    backgroundColor: '#0f0f23',
    borderRadius: '6px',
    display: 'inline-block',
    margin: '2px',
    transition: 'all 0.3s ease',
  },
  wireHighlight: {
    backgroundColor: '#2a2a4e',
    color: '#ffcc80',
    boxShadow: '0 0 10px rgba(255, 204, 128, 0.3)',
  },
  flowRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '4px',
    minHeight: '64px',
    transition: 'opacity 0.5s ease',
  },
  arrow: {
    textAlign: 'center',
    color: '#ce93d8',
    fontSize: '20px',
    padding: '6px 0',
  },
  stepCard: {
    padding: '14px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '2px solid #3a4a6b',
    marginBottom: '10px',
    fontFamily: 'monospace',
    fontSize: '13px',
    transition: 'all 0.5s ease',
  },
  highlight: {
    color: '#ffcc80',
    fontWeight: 'bold',
  },
  explanation: {
    fontSize: '14px',
    color: '#bbb',
    marginTop: '8px',
    lineHeight: '1.7',
  },
  tooltip: {
    fontSize: '13px',
    color: '#aaa',
    backgroundColor: '#0f0f23',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px dashed #3a4a6b',
    marginTop: '12px',
    lineHeight: '1.6',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    marginLeft: '8px',
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#0f0f23',
    borderRadius: '2px',
    marginTop: '12px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ce93d8',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
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
};

// ==================== Expression data ====================
const expressions = [
  {
    label: 'x³ + x + 5 = y',
    steps: [
      { desc: 'sym1 = x × x', gate: '×', inputs: ['x', 'x'], output: 'sym1' },
      { desc: 'sym2 = sym1 × x', gate: '×', inputs: ['sym1', 'x'], output: 'sym2' },
      { desc: 'y = sym2 + x + 5', gate: '+', inputs: ['sym2', 'x', '5'], output: 'y' },
    ],
    compute: (x) => { const s1 = x * x; const s2 = s1 * x; return { sym1: s1, sym2: s2, y: s2 + x + 5 }; },
    constraints: 3,
  },
  {
    label: 'x² + x + 1 = y',
    steps: [
      { desc: 'sym1 = x × x', gate: '×', inputs: ['x', 'x'], output: 'sym1' },
      { desc: 'y = sym1 + x + 1', gate: '+', inputs: ['sym1', 'x', '1'], output: 'y' },
    ],
    compute: (x) => { const s1 = x * x; return { sym1: s1, y: s1 + x + 1 }; },
    constraints: 2,
  },
  {
    label: 'x³ = y',
    steps: [
      { desc: 'sym1 = x × x', gate: '×', inputs: ['x', 'x'], output: 'sym1' },
      { desc: 'y = sym1 × x', gate: '×', inputs: ['sym1', 'x'], output: 'y' },
    ],
    compute: (x) => { const s1 = x * x; return { sym1: s1, y: s1 * x }; },
    constraints: 2,
  },
];

// ==================== Tab 1: 表达式拍平 ====================
function FlattenTab({ expr, xVal }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const values = expr.compute(xVal);

  const startAnimation = useCallback(() => {
    setVisibleSteps(0);
    setIsAnimating(true);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;
    if (visibleSteps >= expr.steps.length) {
      setIsAnimating(false);
      return;
    }
    const timer = setTimeout(() => setVisibleSteps((s) => s + 1), 900);
    return () => clearTimeout(timer);
  }, [isAnimating, visibleSteps, expr.steps.length]);

  // Reset when expression or x changes
  useEffect(() => {
    setVisibleSteps(0);
    setIsAnimating(false);
  }, [expr, xVal]);

  const resolveVal = (name) => {
    if (name === 'x') return xVal;
    if (/^\d+$/.test(name)) return parseInt(name, 10);
    return values[name] !== undefined ? values[name] : '?';
  };

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          表达式拍平：{expr.label}
          <span style={{ ...styles.badge, backgroundColor: '#ab47bc', color: '#fff' }}>逐步展开</span>
        </h3>
        <p style={styles.explanation}>
          ZKP 电路要求把复杂表达式"拍平"（flatten）为只含<span style={{ color: '#ce93d8' }}>乘法门</span>和
          <span style={{ color: '#90caf9' }}>加法门</span>的基本运算序列。
          每一步引入一个中间变量来保存结果。
        </p>

        <div style={{ fontFamily: 'monospace', fontSize: '15px', padding: '10px 14px', backgroundColor: '#0f0f23', borderRadius: '8px', marginBottom: '16px', color: '#ffcc80' }}>
          原始表达式：{expr.label}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <button
            style={{
              ...styles.button,
              ...(isAnimating ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
            }}
            onClick={startAnimation}
            disabled={isAnimating}
          >
            {visibleSteps === 0 ? '▶ 开始逐步拍平' : isAnimating ? '展开中...' : '▶ 重新演示'}
          </button>
          {visibleSteps === 0 && !isAnimating && (
            <button
              style={{ ...styles.button, ...styles.buttonSecondary, marginLeft: '8px' }}
              onClick={() => setVisibleSteps(expr.steps.length)}
            >
              显示全部步骤
            </button>
          )}
        </div>

        {visibleSteps > 0 && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${(visibleSteps / expr.steps.length) * 100}%` }} />
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          {expr.steps.map((step, i) => {
            if (i >= visibleSteps) return null;
            const isLatest = i === visibleSteps - 1 && isAnimating;
            const isMul = step.gate === '×';
            const outVal = resolveVal(step.output);
            return (
              <div
                key={i}
                style={{
                  ...styles.stepCard,
                  borderColor: isLatest ? '#ce93d8' : (isMul ? '#ab47bc44' : '#3a4a6b'),
                  transform: isLatest ? 'scale(1.01)' : 'scale(1)',
                  opacity: 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isMul ? '#ab47bc' : '#5c6bc0',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ color: '#ce93d8', fontWeight: 'bold' }}>{step.output}</span>
                  <span style={{ color: '#888' }}>=</span>
                  {step.inputs.map((inp, j) => (
                    <React.Fragment key={j}>
                      {j > 0 && (
                        <span style={{ color: isMul ? '#ce93d8' : '#90caf9', fontWeight: 'bold', fontSize: '16px' }}>
                          {step.gate}
                        </span>
                      )}
                      <span style={{
                        ...styles.wire,
                        ...(isLatest ? styles.wireHighlight : {}),
                        fontSize: '13px',
                        padding: '3px 8px',
                      }}>
                        {inp} = {resolveVal(inp)}
                      </span>
                    </React.Fragment>
                  ))}
                  <span style={{ color: '#888' }}>→</span>
                  <span style={{
                    ...styles.wire,
                    ...(isLatest ? { ...styles.wireHighlight, color: '#ce93d8' } : { color: '#ce93d8' }),
                    fontSize: '13px',
                    padding: '3px 8px',
                  }}>
                    {step.output} = <strong>{outVal}</strong>
                  </span>
                  <span style={{
                    ...styles.badge,
                    marginLeft: 'auto',
                    backgroundColor: isMul ? 'rgba(206, 147, 216, 0.25)' : 'rgba(144, 202, 249, 0.25)',
                    color: isMul ? '#ce93d8' : '#90caf9',
                  }}>
                    {isMul ? '乘法门' : '加法门'}
                  </span>
                </div>
                {isLatest && (
                  <div style={{ ...styles.tooltip, marginTop: '10px' }}>
                    第 {i + 1} 步：{step.desc}，结果 = <strong style={{ color: '#ffcc80' }}>{outVal}</strong>
                    {isMul ? '（产生一个 R1CS 约束）' : '（加法可被免费吸收进约束系数）'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {visibleSteps >= expr.steps.length && !isAnimating && (
          <div style={{ ...styles.result, ...styles.resultSuccess }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#a5d6a7' }}>
              拍平完成：共 {expr.steps.length} 步，生成 {expr.constraints} 个 R1CS 约束
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#bbb', lineHeight: '1.9' }}>
              {expr.steps.map((step, i) => (
                <div key={i}>
                  <span style={{ color: step.gate === '×' ? '#ce93d8' : '#90caf9' }}>[{step.gate}]</span>
                  {' '}{step.desc}{'  '}
                  <span style={styles.highlight}>= {resolveVal(step.output)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={styles.tooltip}>
        每个<span style={{ color: '#ce93d8' }}>乘法门</span>对应一个 R1CS 约束，
        而<span style={{ color: '#90caf9' }}>加法门</span>通常被"免费"合并进约束的线性组合中，
        不额外增加约束数量。约束越少，证明生成越快。
      </div>
    </div>
  );
}

// ==================== Tab 2: 电路可视化 ====================
function CircuitVisTab({ expr, xVal }) {
  const values = expr.compute(xVal);

  const resolveVal = (name) => {
    if (name === 'x') return xVal;
    if (/^\d+$/.test(name)) return parseInt(name, 10);
    return values[name] !== undefined ? values[name] : '?';
  };

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          电路结构：{expr.label}
          <span style={{ ...styles.badge, backgroundColor: '#5c6bc0', color: '#fff' }}>静态视图</span>
        </h3>
        <p style={styles.explanation}>
          下图展示将表达式拍平后形成的门电路。
          <span style={{ color: '#ce93d8' }}>紫色圆圈</span>为乘法门，
          <span style={{ color: '#90caf9' }}>蓝色圆圈</span>为加法门，
          方框为信号线（wire）。
        </p>

        <div style={{ marginTop: '20px' }}>
          {expr.steps.map((step, i) => {
            const isMul = step.gate === '×';
            const outVal = resolveVal(step.output);
            return (
              <div key={i}>
                <div style={styles.flowRow}>
                  {step.inputs.map((inp, j) => (
                    <span key={j} style={styles.wire}>
                      {inp} = {resolveVal(inp)}
                    </span>
                  ))}
                  <span style={{ color: '#666', fontSize: '18px' }}>──▶</span>
                  <span style={{
                    ...styles.gate,
                    ...(isMul ? styles.gateMul : styles.gateAdd),
                  }}>
                    {step.gate}
                  </span>
                  <span style={{ color: '#666', fontSize: '18px' }}>──▶</span>
                  <span style={{ ...styles.wire, color: '#ce93d8' }}>
                    {step.output} = {outVal}
                  </span>
                </div>
                {i < expr.steps.length - 1 && <div style={styles.arrow}>↓</div>}
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: '20px',
          padding: '14px',
          backgroundColor: '#0f0f23',
          borderRadius: '8px',
          border: '1px solid #3a4a6b',
        }}>
          <p style={{ margin: '0 0 10px', color: '#b39ddb', fontSize: '14px', fontWeight: 'bold' }}>
            电路摘要
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '8px 14px',
              backgroundColor: 'rgba(206, 147, 216, 0.15)',
              borderRadius: '6px',
              color: '#ce93d8',
              fontSize: '13px',
            }}>
              乘法门：{expr.steps.filter(s => s.gate === '×').length} 个
            </div>
            <div style={{
              padding: '8px 14px',
              backgroundColor: 'rgba(144, 202, 249, 0.15)',
              borderRadius: '6px',
              color: '#90caf9',
              fontSize: '13px',
            }}>
              加法门：{expr.steps.filter(s => s.gate === '+').length} 个
            </div>
            <div style={{
              padding: '8px 14px',
              backgroundColor: 'rgba(165, 214, 167, 0.15)',
              borderRadius: '6px',
              color: '#a5d6a7',
              fontSize: '13px',
            }}>
              R1CS 约束：{expr.constraints} 个
            </div>
            <div style={{
              padding: '8px 14px',
              backgroundColor: 'rgba(255, 204, 128, 0.15)',
              borderRadius: '6px',
              color: '#ffcc80',
              fontSize: '13px',
            }}>
              输出 y = {resolveVal('y')}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.tooltip}>
        R1CS（一阶约束系统）中，每个<strong>乘法门</strong>产生一个约束：
        <code style={{ color: '#ffcc80', marginLeft: '6px' }}>left × right = output</code>。
        约束数量直接决定了零知识证明的证明/验证开销。
      </div>
    </div>
  );
}

// ==================== Tab 3: 动画演示 ====================
function AnimTab({ expr, xVal }) {
  const [animStep, setAnimStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const totalSteps = expr.steps.length;
  const values = expr.compute(xVal);

  const resolveVal = (name) => {
    if (name === 'x') return xVal;
    if (/^\d+$/.test(name)) return parseInt(name, 10);
    return values[name] !== undefined ? values[name] : '?';
  };

  const startPlay = useCallback(() => {
    setAnimStep(0);
    setIsPlaying(true);
  }, []);

  const stepForward = useCallback(() => {
    setAnimStep((s) => Math.min(s + 1, totalSteps - 1));
    setIsPlaying(false);
  }, [totalSteps]);

  const stepBack = useCallback(() => {
    setAnimStep((s) => Math.max(s - 1, 0));
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setAnimStep(-1);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying || animStep < 0) return;
    if (animStep >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 1400);
    return () => clearTimeout(timer);
  }, [isPlaying, animStep, totalSteps]);

  useEffect(() => {
    setAnimStep(-1);
    setIsPlaying(false);
  }, [expr, xVal]);

  const isActive = (i) => animStep === i;
  const isPast = (i) => animStep > i;
  const isVisible = (i) => animStep >= i;

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          信号传播动画：{expr.label}
          <span style={{ ...styles.badge, backgroundColor: '#ab47bc', color: '#fff' }}>逐门演示</span>
        </h3>
        <p style={styles.explanation}>
          观察值如何从输入信号线逐步经过每个门传播到输出。
          当前激活的门和信号线会高亮显示。
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <button
            style={{ ...styles.button, ...(isPlaying ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
            onClick={startPlay}
            disabled={isPlaying}
          >
            {animStep === -1 ? '▶ 自动播放' : isPlaying ? '播放中...' : '▶ 重新播放'}
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary, padding: '10px 16px' }}
            onClick={stepBack}
            disabled={animStep <= 0}
          >
            ◀ 上一步
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary, padding: '10px 16px' }}
            onClick={stepForward}
            disabled={animStep >= totalSteps - 1}
          >
            下一步 ▶
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary, padding: '10px 16px' }}
            onClick={reset}
          >
            重置
          </button>
          {animStep >= 0 && (
            <span style={{ color: '#b39ddb', fontSize: '13px', marginLeft: '4px' }}>
              步骤 {animStep + 1} / {totalSteps}
            </span>
          )}
        </div>

        {animStep >= 0 && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${((animStep + 1) / totalSteps) * 100}%` }} />
          </div>
        )}

        {/* Animated gates */}
        <div style={{ marginTop: '20px' }}>
          {expr.steps.map((step, i) => {
            const isMul = step.gate === '×';
            const active = isActive(i);
            const past = isPast(i);
            const visible = isVisible(i);
            const outVal = resolveVal(step.output);

            return (
              <div key={i}>
                <div style={{
                  ...styles.flowRow,
                  opacity: visible ? 1 : (animStep === -1 ? 0.35 : 0.2),
                }}>
                  {step.inputs.map((inp, j) => (
                    <span key={j} style={{
                      ...styles.wire,
                      ...(active ? styles.wireHighlight : {}),
                      ...(past ? { color: '#a5d6a7' } : {}),
                    }}>
                      {inp} = {resolveVal(inp)}
                    </span>
                  ))}
                  <span style={{ color: '#555', fontSize: '18px' }}>──▶</span>
                  <span style={{
                    ...styles.gate,
                    ...(isMul ? styles.gateMul : styles.gateAdd),
                    ...(active ? (isMul ? styles.gateHighlight : styles.gateAddHighlight) : {}),
                    ...(past ? { opacity: 0.7 } : {}),
                  }}>
                    {step.gate}
                  </span>
                  <span style={{ color: '#555', fontSize: '18px' }}>──▶</span>
                  <span style={{
                    ...styles.wire,
                    color: visible ? '#ce93d8' : '#555',
                    ...(active ? { ...styles.wireHighlight, color: '#ce93d8', boxShadow: '0 0 12px rgba(206, 147, 216, 0.5)' } : {}),
                  }}>
                    {step.output} = {visible ? <strong>{outVal}</strong> : '?'}
                  </span>
                </div>

                {active && (
                  <div style={styles.tooltip}>
                    <strong style={{ color: '#ce93d8' }}>第 {i + 1} 步：</strong>{step.desc}
                    {' → '}结果 = <span style={styles.highlight}>{outVal}</span>
                    {'  '}
                    <span style={{
                      ...styles.badge,
                      backgroundColor: isMul ? 'rgba(206, 147, 216, 0.25)' : 'rgba(144, 202, 249, 0.25)',
                      color: isMul ? '#ce93d8' : '#90caf9',
                    }}>
                      {isMul ? '产生约束' : '免费加法'}
                    </span>
                  </div>
                )}

                {i < expr.steps.length - 1 && <div style={styles.arrow}>↓</div>}
              </div>
            );
          })}
        </div>

        {/* Done summary */}
        {animStep >= totalSteps - 1 && !isPlaying && (
          <div style={{ ...styles.result, ...styles.resultSuccess, marginTop: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#a5d6a7', marginBottom: '6px' }}>
              电路执行完毕
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#bbb', lineHeight: '2' }}>
              {expr.steps.map((step, i) => (
                <div key={i}>
                  <span style={{ color: step.gate === '×' ? '#ce93d8' : '#90caf9' }}>{step.gate}</span>
                  {'  '}{step.desc} = <span style={styles.highlight}>{resolveVal(step.output)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', color: '#ce93d8', fontSize: '14px' }}>
              最终输出：y = <strong style={{ color: '#ffcc80', fontSize: '18px' }}>{resolveVal('y')}</strong>
            </div>
          </div>
        )}
      </div>

      <div style={styles.tooltip}>
        在零知识证明中，证明者按照这条执行路径计算出所有中间值，
        形成 <strong>witness</strong>，然后用 R1CS 约束矩阵验证每一步是否正确执行。
      </div>
    </div>
  );
}

// ==================== Main Component ====================
export default function CircuitBuilderDemo() {
  const [exprIdx, setExprIdx] = useState(0);
  const [xVal, setXVal] = useState(3);
  const [activeTab, setActiveTab] = useState('flatten');

  const expr = expressions[exprIdx];
  const values = expr.compute(xVal);

  const tabItems = [
    { key: 'flatten', label: '表达式拍平' },
    { key: 'circuit', label: '电路可视化' },
    { key: 'anim', label: '动画演示' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>电路构建器：从表达式到算术电路</h2>

      {/* Controls */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>参数设置</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={styles.label}>选择表达式</label>
            <select
              style={styles.select}
              value={exprIdx}
              onChange={(e) => setExprIdx(parseInt(e.target.value, 10))}
            >
              {expressions.map((ex, i) => (
                <option key={i} value={i}>{ex.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={styles.label}>输入 x</label>
            <input
              type="number"
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #3a4a6b',
                backgroundColor: '#0f0f23',
                color: '#fff',
                fontSize: '16px',
                width: '80px',
                textAlign: 'center',
              }}
              value={xVal}
              onChange={(e) => setXVal(parseInt(e.target.value) || 0)}
            />
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '15px',
            color: '#a5d6a7',
            padding: '10px 14px',
            backgroundColor: '#0f0f23',
            borderRadius: '8px',
          }}>
            {expr.label.replace('y', '')}y = <strong style={{ color: '#ffcc80', fontSize: '17px' }}>{values.y}</strong>
          </div>
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(171, 71, 188, 0.15)',
            borderRadius: '8px',
            color: '#ce93d8',
            fontSize: '13px',
          }}>
            R1CS 约束数：<strong>{expr.constraints}</strong>
          </div>
        </div>
        <div style={styles.tooltip}>
          修改 x 的值观察各门输出如何变化。x = 3 时对应经典 ZKP 教材示例。
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabItems.map(({ key, label }) => (
          <button
            key={key}
            style={{
              ...styles.tab,
              ...(activeTab === key ? styles.tabActive : styles.tabInactive),
            }}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'flatten' && <FlattenTab expr={expr} xVal={xVal} />}
      {activeTab === 'circuit' && <CircuitVisTab expr={expr} xVal={xVal} />}
      {activeTab === 'anim' && <AnimTab expr={expr} xVal={xVal} />}
    </div>
  );
}
