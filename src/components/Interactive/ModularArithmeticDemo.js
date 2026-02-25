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
    color: '#ce93d8',
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
    padding: '16px',
    backgroundColor: '#16213e',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
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
    color: '#ce93d8',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #3a4a6b',
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  result: {
    padding: '16px',
    backgroundColor: '#0f0f23',
    borderRadius: '8px',
    border: '2px solid #ce93d8',
    marginTop: '16px',
  },
  resultLabel: {
    fontSize: '12px',
    color: '#ce93d8',
    marginBottom: '8px',
  },
  resultValue: {
    fontFamily: 'monospace',
    fontSize: '20px',
    color: '#a5d6a7',
  },
  calculation: {
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#90caf9',
    backgroundColor: '#0f0f23',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '12px',
    lineHeight: '1.8',
  },
  infoBox: {
    padding: '12px 16px',
    backgroundColor: 'rgba(206, 147, 216, 0.1)',
    border: '1px solid #ce93d8',
    borderRadius: '8px',
    marginTop: '16px',
    fontSize: '13px',
    color: '#e1bee7',
  },
  clockFace: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '4px solid #ce93d8',
    position: 'relative',
    margin: '20px auto',
    backgroundColor: '#0f0f23',
  },
  clockNumber: {
    position: 'absolute',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
  },
  clockHand: {
    position: 'absolute',
    width: '4px',
    backgroundColor: '#ff5722',
    transformOrigin: 'bottom center',
    left: '50%',
    bottom: '50%',
    marginLeft: '-2px',
    borderRadius: '2px',
  },
  clockCenter: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ff5722',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
};

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function modInverse(a, n) {
  a = ((a % n) + n) % n;
  if (gcd(a, n) !== 1) return { result: null, steps: [] };
  
  const steps = [];
  let [old_r, r] = [n, a];
  let [old_s, s] = [0, 1];
  
  steps.push({
    type: 'init',
    description: `初始化: 使用扩展欧几里得算法求 ${a}⁻¹ mod ${n}`,
  });
  
  let stepNum = 1;
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    const new_r = old_r - q * r;
    const new_s = old_s - q * s;
    
    steps.push({
      type: 'step',
      stepNum,
      q,
      old_r,
      r,
      new_r,
      old_s,
      s,
      new_s,
      description: `第${stepNum}步: ${old_r} = ${q} × ${r} + ${new_r}`,
    });
    
    [old_r, r] = [r, new_r];
    [old_s, s] = [s, new_s];
    stepNum++;
  }
  
  const result = ((old_s % n) + n) % n;
  steps.push({
    type: 'result',
    description: `gcd = ${old_r}，系数 s = ${old_s}`,
    finalS: old_s,
    result,
  });
  
  return { result, steps };
}

function BasicModDemo() {
  const [a, setA] = useState(17);
  const [n, setN] = useState(5);
  
  const quotient = Math.floor(a / n);
  const remainder = ((a % n) + n) % n;
  
  return (
    <div>
      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>被除数 a</label>
          <input
            type="number"
            style={styles.input}
            value={a}
            onChange={(e) => setA(parseInt(e.target.value) || 0)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>模数 n</label>
          <input
            type="number"
            style={styles.input}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      </div>
      
      <div style={styles.result}>
        <div style={styles.resultLabel}>计算结果: a mod n</div>
        <div style={styles.resultValue}>{a} mod {n} = {n !== 0 ? remainder : 'undefined'}</div>
      </div>
      
      {n !== 0 && (
        <div style={styles.calculation}>
          {a} = {n} × {quotient} + {remainder}<br/>
          所以 {a} mod {n} = {remainder}
        </div>
      )}
      
      <div style={styles.infoBox}>
        💡 <strong>模运算就是取余数</strong>: {a} 除以 {n}，商是 {quotient}，余数是 {remainder}
      </div>
    </div>
  );
}

function ClockDemo() {
  const [hours, setHours] = useState(15);
  const mod = 12;
  const result = hours % mod || mod;
  
  const getClockPosition = (num, radius) => {
    const angle = (num - 3) * 30 * (Math.PI / 180);
    return {
      left: `${50 + radius * Math.cos(angle)}%`,
      top: `${50 + radius * Math.sin(angle)}%`,
      transform: 'translate(-50%, -50%)',
    };
  };
  
  const handAngle = (result - 3) * 30;
  
  return (
    <div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>输入小时数 (24小时制)</label>
        <input
          type="number"
          style={{...styles.input, maxWidth: '150px'}}
          value={hours}
          onChange={(e) => setHours(parseInt(e.target.value) || 0)}
        />
      </div>
      
      <div style={styles.clockFace}>
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
          <div
            key={num}
            style={{
              ...styles.clockNumber,
              ...getClockPosition(num, 40),
              color: result === num ? '#ff5722' : '#fff',
            }}
          >
            {num}
          </div>
        ))}
        <div
          style={{
            ...styles.clockHand,
            height: '60px',
            transform: `rotate(${handAngle}deg)`,
          }}
        />
        <div style={styles.clockCenter} />
      </div>
      
      <div style={styles.result}>
        <div style={styles.resultLabel}>时钟显示</div>
        <div style={styles.resultValue}>
          {hours}:00 → {result}:00 (12小时制)
        </div>
      </div>
      
      <div style={styles.calculation}>
        {hours} mod 12 = {hours % 12}<br/>
        {hours % 12 === 0 ? '0点 显示为 12点' : `显示为 ${result}点`}
      </div>
      
      <div style={styles.infoBox}>
        💡 <strong>时钟就是模12运算</strong>: 15点 = 15 mod 12 = 3，所以显示 3点
      </div>
    </div>
  );
}

function EuclideanVisualizer({ steps, a, n }) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;

  const nextStep = () => setStepIndex(prev => Math.min(totalSteps - 1, prev + 1));
  const prevStep = () => setStepIndex(prev => Math.max(0, prev - 1));

  const renderDivisionBar = (step) => {
    if (step.type !== 'step') return null;
    
    const total = step.old_r;
    const quotient = step.q;
    const divisor = step.r;
    const remainder = step.new_r;
    
    return (
      <div style={{margin: '20px 0', padding: '10px', backgroundColor: '#0f0f23', borderRadius: '8px'}}>
        <div style={{marginBottom: '8px', fontSize: '12px', color: '#aaa'}}>除法可视化: {total} ÷ {divisor}</div>
        
        <div style={{display: 'flex', marginBottom: '4px', position: 'relative'}}>
          <div style={{
            width: '100%', 
            height: '30px', 
            backgroundColor: '#3f51b5', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '12px'
          }}>
            {total} (被除数)
          </div>
        </div>
        
        <div style={{display: 'flex', gap: '2px'}}>
          {Array.from({length: Math.min(quotient, 10)}).map((_, i) => (
            <div key={i} style={{
              flex: divisor / total,
              height: '30px',
              backgroundColor: '#ff9800',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontSize: '10px',
              overflow: 'hidden'
            }}>
              {quotient > 10 && i === 9 ? '...' : divisor}
            </div>
          ))}
          {remainder > 0 && (
            <div style={{
              flex: remainder / total,
              height: '30px',
              backgroundColor: '#4caf50',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontSize: '10px'
            }}>
              {remainder}
            </div>
          )}
        </div>
        
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#888'}}>
          <div>
            <span style={{color: '#ff9800'}}>■</span> 除数 ({divisor}) × {quotient}
          </div>
          <div>
            <span style={{color: '#4caf50'}}>■</span> 余数 ({remainder})
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      marginTop: '20px',
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #334155'
    }}>
      <div style={{
        padding: '16px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{color: '#94a3b8', fontSize: '14px'}}>
          算法演示 ({stepIndex + 1}/{totalSteps})
        </span>
        <div style={{display: 'flex', gap: '8px'}}>
          <button 
            onClick={prevStep} 
            disabled={stepIndex === 0}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              backgroundColor: stepIndex === 0 ? '#1e293b' : '#334155',
              color: stepIndex === 0 ? '#64748b' : '#e2e8f0',
              cursor: stepIndex === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ← 上一步
          </button>
          <button 
            onClick={nextStep} 
            disabled={stepIndex === totalSteps - 1}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: stepIndex === totalSteps - 1 ? '#475569' : '#3b82f6',
              color: '#fff',
              cursor: stepIndex === totalSteps - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            下一步 →
          </button>
        </div>
      </div>

      <div style={{padding: '20px'}}>
        {currentStep.type === 'init' && (
          <div style={{textAlign: 'center', padding: '20px 0'}}>
            <div style={{fontSize: '40px', marginBottom: '16px'}}>🎯</div>
            <h4 style={{color: '#e2e8f0', margin: '0 0 8px 0'}}>开始寻找模逆元</h4>
            <p style={{color: '#94a3b8'}}>
              我们要找到一个数 <span style={{color: '#fbbf24'}}>x</span><br/>
              使得 <span style={{color: '#c084fc', fontSize: '1.2em'}}>{a} · x ≡ 1 (mod {n})</span>
            </p>
            <div style={{marginTop: '20px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', display: 'inline-block'}}>
              算法：扩展欧几里得 (Extended Euclidean)
            </div>
          </div>
        )}

        {currentStep.type === 'step' && (
          <div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div>
                <h5 style={{color: '#e2e8f0', margin: '0 0 12px 0', borderBottom: '2px solid #3b82f6', paddingBottom: '8px', display: 'inline-block'}}>
                  1. 欧几里得除法
                </h5>
                <div style={{fontSize: '18px', color: '#e2e8f0', fontFamily: 'monospace', marginBottom: '8px'}}>
                  {currentStep.old_r} = {currentStep.q} × {currentStep.r} + <span style={{color: '#4caf50', fontWeight: 'bold'}}>{currentStep.new_r}</span>
                </div>
                <div style={{color: '#94a3b8', fontSize: '13px'}}>
                  我们将 <span style={{color: '#3f51b5'}}>{currentStep.old_r}</span> 除以 <span style={{color: '#ff9800'}}>{currentStep.r}</span>，
                  得到商 {currentStep.q} 和余数 <span style={{color: '#4caf50'}}>{currentStep.new_r}</span>
                </div>
                {renderDivisionBar(currentStep)}
              </div>

              <div>
                <h5 style={{color: '#e2e8f0', margin: '0 0 12px 0', borderBottom: '2px solid #fbbf24', paddingBottom: '8px', display: 'inline-block'}}>
                  2. 更新系数 s (追踪器)
                </h5>
                <div style={{backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px'}}>
                  <div style={{marginBottom: '12px', color: '#94a3b8', fontSize: '13px'}}>
                    系数 <span style={{color: '#fbbf24'}}>s</span> 记录了累积使用了多少个 <strong>{a}</strong>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                    <div style={{padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '6px', color: '#94a3b8'}}>
                      旧 s: {currentStep.old_s}
                    </div>
                    <div style={{color: '#64748b'}}>-</div>
                    <div style={{padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '6px', color: '#fff'}}>
                      商: {currentStep.q}
                    </div>
                    <div style={{color: '#64748b'}}>×</div>
                    <div style={{padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '6px', color: '#fbbf24'}}>
                      当前 s: {currentStep.s}
                    </div>
                  </div>

                  <div style={{fontSize: '20px', color: '#e2e8f0', textAlign: 'center', padding: '12px', border: '1px dashed #475569', borderRadius: '8px'}}>
                    新 s = <span style={{color: '#4caf50', fontWeight: 'bold'}}>{currentStep.new_s}</span>
                  </div>
                  
                  <div style={{marginTop: '12px', fontSize: '12px', color: '#64748b', textAlign: 'center'}}>
                    验证: {currentStep.new_r} ≡ {currentStep.new_s} × {a} (mod {n})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep.type === 'result' && (
          <div style={{textAlign: 'center', padding: '20px 0'}}>
             <div style={{fontSize: '40px', marginBottom: '16px'}}>🎉</div>
             <h4 style={{color: '#e2e8f0', margin: '0 0 12px 0'}}>计算完成!</h4>
             
             <div style={{display: 'inline-grid', gap: '16px', textAlign: 'left'}}>
               <div style={{padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: '4px solid #4caf50'}}>
                 <div style={{color: '#94a3b8', fontSize: '12px'}}>最终结果</div>
                 <div style={{fontSize: '24px', color: '#4caf50', fontWeight: 'bold'}}>
                   {currentStep.result}
                 </div>
                 <div style={{color: '#64748b', fontSize: '12px'}}>这是 {a} 的模逆元</div>
               </div>

               {currentStep.finalS < 0 && (
                 <div style={{padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '13px', color: '#94a3b8'}}>
                   注意: 原始计算出的 s 是 {currentStep.finalS} (负数)<br/>
                   我们加上模数 {n} 得到正数结果: {currentStep.finalS} + {n} = {currentStep.result}
                 </div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModInverseDemo() {
  const [a, setA] = useState(3);
  const [n, setN] = useState(7);

  
  const { result: inverse, steps } = useMemo(() => modInverse(a, n), [a, n]);
  
  return (
    <div>
      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>数字 a</label>
          <input
            type="number"
            style={styles.input}
            value={a}
            onChange={(e) => setA(parseInt(e.target.value) || 0)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>模数 n</label>
          <input
            type="number"
            style={styles.input}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      </div>
      
      <div style={styles.result}>
        <div style={styles.resultLabel}>模逆元: a⁻¹ mod n</div>
        <div style={styles.resultValue}>
          {inverse !== null
            ? `${a}⁻¹ mod ${n} = ${inverse}`
            : `不存在 (gcd(${a}, ${n}) = ${gcd(a, n)} ≠ 1)`}
        </div>
      </div>
      
      {inverse !== null && (
        <>
          <EuclideanVisualizer steps={steps} a={a} n={n} />

                
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: 'rgba(144, 202, 249, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(144, 202, 249, 0.3)',
                  fontSize: '13px',
                  lineHeight: '1.8',
                }}>
                  <div style={{color: '#90caf9', fontWeight: 'bold', marginBottom: '8px'}}>
                    🎯 第一步：理解问题
                  </div>
                  <div style={{color: '#ddd'}}>
                    求 <span style={{color: '#a5d6a7'}}>{a}⁻¹ mod {n}</span> 就是找一个数 x，使得：
                  </div>
                  <div style={{color: '#fff', margin: '8px 0', paddingLeft: '16px'}}>
                    {a} × x ≡ 1 (mod {n})
                  </div>
                  <div style={{color: '#aaa', fontSize: '12px'}}>
                    即：{a} 乘以某个数 x，除以 {n} 的余数等于 1
                  </div>
                  
                  <div style={{color: '#90caf9', fontWeight: 'bold', marginTop: '16px', marginBottom: '8px'}}>
                    🔄 第二步：转化为方程
                  </div>
                  <div style={{color: '#ddd'}}>
                    {a} × x ≡ 1 (mod {n}) 意味着存在整数 y 使得：
                  </div>
                  <div style={{color: '#fff', margin: '8px 0', paddingLeft: '16px'}}>
                    {a} × x + {n} × y = 1
                  </div>
                  <div style={{color: '#aaa', fontSize: '12px'}}>
                    这就是贝祖等式！扩展欧几里得算法可以求出 x 和 y
                  </div>
                </div>
                
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: 'rgba(165, 214, 167, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(165, 214, 167, 0.3)',
                  fontSize: '13px',
                  lineHeight: '1.8',
                }}>
                  <div style={{color: '#a5d6a7', fontWeight: 'bold', marginBottom: '8px'}}>
                    📊 第三步：辗转相除求解
                  </div>
                  <div style={{color: '#ddd', marginBottom: '8px'}}>
                    <span style={{color: '#ffcc80', fontWeight: 'bold'}}>系数 s 是什么？</span>
                    <br/>
                    它是输入的数字 <span style={{color: '#ce93d8'}}>a (即 {a})</span> 的计数器。
                  </div>
                  <div style={{color: '#aaa', fontSize: '12px', marginBottom: '8px'}}>
                    每一行都在计算：
                    <br/>
                    <div style={{padding: '4px 0', color: '#fff', textAlign: 'center'}}>
                      <span style={{color: '#90caf9'}}>余数 r</span> ≡ <span style={{color: '#ffcc80'}}>s</span> × <span style={{color: '#ce93d8'}}>{a}</span> (mod {n})
                    </div>
                    意思就是：<span style={{color: '#ffcc80'}}>s</span> 个 <span style={{color: '#ce93d8'}}>{a}</span> 相加，除以 {n} 的余数刚好是 <span style={{color: '#90caf9'}}>r</span>。
                    <br/><br/>
                    🎯 <strong>最终目标：</strong> 找到一个 <span style={{color: '#ffcc80'}}>s</span>，使得余数变成 <span style={{color: '#fff'}}>1</span>。
                  </div>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr 1.5fr',
                  gap: '4px 16px',
                  fontSize: '13px',
                  marginBottom: '12px',
                }}>
                  <div style={{color: '#888', borderBottom: '1px solid #444', paddingBottom: '4px'}}>步骤</div>
                  <div style={{color: '#888', borderBottom: '1px solid #444', paddingBottom: '4px'}}>辗转相除 (求余数 r)</div>
                  <div style={{color: '#888', borderBottom: '1px solid #444', paddingBottom: '4px'}}>
                    系数 s (用了多少个 {a})
                    <div style={{fontSize: '10px', fontWeight: 'normal'}}>验证: r ≡ s × {a}</div>
                  </div>
                  
                  {steps.filter(s => s.type === 'step').map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div style={{color: '#ce93d8'}}>#{step.stepNum}</div>
                      <div>
                        <span style={{color: '#90caf9'}}>{step.old_r}</span>
                        {' = '}
                        <span style={{color: '#fff'}}>{step.q}</span>
                        {' × '}
                        <span style={{color: '#90caf9'}}>{step.r}</span>
                        {' + '}
                        <span style={{color: '#a5d6a7'}}>{step.new_r}</span>
                      </div>
                      <div>
                        <div style={{color: '#ffcc80'}}>
                          s: {step.old_s} - {step.q}×{step.s} = {step.new_s}
                        </div>
                        <div style={{color: '#aaa', fontSize: '11px', marginTop: '4px', lineHeight: '1.4'}}>
                          <span style={{color: '#90caf9'}}>余数{step.new_r}</span> 来自 <span style={{color: '#90caf9'}}>{step.old_r}</span> - <span style={{color: '#fff'}}>{step.q}</span>×<span style={{color: '#90caf9'}}>{step.r}</span>
                          <br/>
                          所以系数也是: <span style={{color: '#ffcc80'}}>{step.old_s}</span> - <span style={{color: '#fff'}}>{step.q}</span>×<span style={{color: '#ffcc80'}}>{step.s}</span>
                        </div>
                        <div style={{color: '#666', fontSize: '11px', marginTop: '4px', borderTop: '1px dashed #444', paddingTop: '2px'}}>
                          验证: {step.new_r} ≡ {step.new_s}×{a} (mod {n})
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                

                
                {steps.filter(s => s.type === 'result').map((step, idx) => (
                  <div key={idx} style={{
                    borderTop: '1px solid #444',
                    paddingTop: '12px',
                    marginTop: '8px',
                  }}>
                    <div style={{color: '#a5d6a7'}}>
                      ✓ {step.description}
                    </div>
                    <div style={{marginTop: '8px'}}>
                      {step.finalS < 0 ? (
                        <>
                          s = {step.finalS} {'<'} 0，需要调整: {step.finalS} + {n} = <span style={{color: '#a5d6a7', fontWeight: 'bold'}}>{step.result}</span>
                        </>
                      ) : (
                        <>
                          s = {step.finalS}，即为模逆元: <span style={{color: '#a5d6a7', fontWeight: 'bold'}}>{step.result}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
        </>
      )}
      
      <div style={styles.infoBox}>
        💡 <strong>模逆元</strong>: 找一个数 b，使得 a × b ≡ 1 (mod n)。只有当 gcd(a, n) = 1 时才存在。
        <br/><br/>
        <strong>ECDSA 中的应用</strong>: 签名公式 s = k⁻¹(z + r·d) mod n 需要计算 k 的模逆元
      </div>
    </div>
  );
}

function ModArithmeticDemo() {
  const [a, setA] = useState(8);
  const [b, setB] = useState(5);
  const [n, setN] = useState(7);
  
  const addResult = ((a % n) + (b % n)) % n;
  const mulResult = ((a % n) * (b % n)) % n;
  
  return (
    <div>
      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>a</label>
          <input
            type="number"
            style={styles.input}
            value={a}
            onChange={(e) => setA(parseInt(e.target.value) || 0)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>b</label>
          <input
            type="number"
            style={styles.input}
            value={b}
            onChange={(e) => setB(parseInt(e.target.value) || 0)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>n</label>
          <input
            type="number"
            style={styles.input}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
        <div style={styles.result}>
          <div style={styles.resultLabel}>加法: (a + b) mod n</div>
          <div style={styles.resultValue}>({a} + {b}) mod {n} = {addResult}</div>
        </div>
        <div style={styles.result}>
          <div style={styles.resultLabel}>乘法: (a × b) mod n</div>
          <div style={styles.resultValue}>({a} × {b}) mod {n} = {mulResult}</div>
        </div>
      </div>
      
      <div style={styles.calculation}>
        <strong>加法:</strong> {a} + {b} = {a + b} → {a + b} mod {n} = {addResult}<br/>
        <strong>乘法:</strong> {a} × {b} = {a * b} → {a * b} mod {n} = {mulResult}
      </div>
      
      <div style={styles.infoBox}>
        💡 <strong>模运算性质</strong>: 可以先取模再运算，结果相同
        <br/>
        (a + b) mod n = ((a mod n) + (b mod n)) mod n
      </div>
    </div>
  );
}

export default function ModularArithmeticDemo() {
  const [activeTab, setActiveTab] = useState('basic');
  
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔢 模运算交互演示</h3>
      
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'basic' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('basic')}
        >
          基础取模
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'clock' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('clock')}
        >
          时钟类比
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'arithmetic' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('arithmetic')}
        >
          模运算
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'inverse' ? styles.tabActive : styles.tabInactive)}}
          onClick={() => setActiveTab('inverse')}
        >
          模逆元
        </button>
      </div>
      
      <div style={styles.section}>
        {activeTab === 'basic' && <BasicModDemo />}
        {activeTab === 'clock' && <ClockDemo />}
        {activeTab === 'arithmetic' && <ModArithmeticDemo />}
        {activeTab === 'inverse' && <ModInverseDemo />}
      </div>
    </div>
  );
}
