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
  buttonSmall: {
    padding: '6px 14px',
    fontSize: '12px',
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
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    marginLeft: '8px',
  },
};

const stages = [
  {
    id: 'computation',
    label: '原始计算',
    icon: '📝',
    color: '#ffcc80',
    desc: '编写计算逻辑',
    detail: '将高级语言描述的计算转换为明确的数学表达式。例如：x³ + x + 5 = y。这是零知识证明的起点。',
    size: '~1 KB',
    tool: 'circom 编写 .circom 文件',
    example: 'x³ + x + 5 = y',
  },
  {
    id: 'circuit',
    label: '算术电路',
    icon: '⚡',
    color: '#ab47bc',
    desc: '拍平为门电路',
    detail: '将复合运算拆解为只含基本加法和乘法的门电路。每个乘法门将对应一个约束。中间变量 sym1 = x×x, sym2 = sym1×x。',
    size: '~2 KB',
    tool: 'circom --r1cs --wasm',
    example: 'sym1=x×x, sym2=sym1×x, y=sym2+x+5',
  },
  {
    id: 'r1cs',
    label: 'R1CS',
    icon: '📊',
    color: '#ce93d8',
    desc: '约束系统 (A·s)×(B·s)=(C·s)',
    detail: '每个乘法门变成一行约束。A、B、C 矩阵定义了约束结构，witness 向量 s 包含所有变量值。本例有 3 个约束。',
    size: '~5 KB',
    tool: 'snarkjs r1cs info',
    example: '3 个约束，5 个变量',
  },
  {
    id: 'qap',
    label: 'QAP',
    icon: '📈',
    color: '#42a5f5',
    desc: '多项式 A(t)·B(t)-C(t)=H(t)·Z(t)',
    detail: '通过拉格朗日插值将矩阵列转为多项式。所有约束被压缩为一个多项式整除关系，这是效率提升的关键。',
    size: '~10 KB',
    tool: 'snarkjs groth16 setup',
    example: 'Z(t)=(t-1)(t-2)(t-3)',
  },
  {
    id: 'proof',
    label: '证明 π',
    icon: '🔐',
    color: '#4caf50',
    desc: '在加密点 τ 处求值',
    detail: 'Prover 用可信设置提供的加密参数（g^τ, g^τ², ...）对多项式求值，生成简洁的证明。证明大小恒定！',
    size: '~288 bytes',
    tool: 'snarkjs groth16 prove',
    example: 'proof.json + public.json',
  },
  {
    id: 'verify',
    label: '验证',
    icon: '✅',
    color: '#a5d6a7',
    desc: '配对检查',
    detail: '验证者用双线性配对在加密状态下检查多项式等式：e(πA, πB) = e(πC, g)·e(πH, πZ)。只需几毫秒，与电路大小无关！',
    size: 'O(1)',
    tool: 'snarkjs groth16 verify',
    example: 'snarkjs: OK!',
  },
];

const sizeData = [
  { label: '原始计算', value: 100, color: '#ffcc80' },
  { label: '电路描述', value: 200, color: '#ab47bc' },
  { label: 'R1CS', value: 500, color: '#ce93d8' },
  { label: 'QAP', value: 1000, color: '#42a5f5' },
  { label: '证明 π', value: 28, color: '#4caf50' },
];

function StageCard({ stage, index, isActive, isCompleted, isExpanded, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px',
        backgroundColor: isActive ? '#16213e' : '#0f0f23',
        borderRadius: '10px',
        border: `2px solid ${isActive ? stage.color : isCompleted ? stage.color + '66' : '#3a4a6b'}`,
        cursor: 'pointer',
        transition: 'all 0.4s ease',
        minWidth: '130px',
        flex: '1 1 130px',
        boxShadow: isActive ? `0 0 20px ${stage.color}44` : 'none',
        transform: isActive ? 'scale(1.03)' : 'scale(1)',
        opacity: !isActive && !isCompleted ? 0.5 : 1,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '28px' }}>{isCompleted && !isActive ? '✓' : stage.icon}</span>
      </div>
      <div style={{
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 'bold',
        color: stage.color,
        marginBottom: '4px',
      }}>
        {stage.label}
      </div>
      <div style={{
        textAlign: 'center',
        fontSize: '11px',
        color: '#888',
      }}>
        {stage.desc}
      </div>

      {isExpanded && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#1a1a2e',
          borderRadius: '6px',
          fontSize: '12px',
          lineHeight: '1.6',
        }}>
          <div style={{ color: '#ddd', marginBottom: '8px' }}>{stage.detail}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: `${stage.color}22`,
              color: stage.color,
              fontSize: '11px',
            }}>
              大小: {stage.size}
            </span>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#aaa',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}>
              {stage.tool}
            </span>
          </div>
          {stage.example && (
            <div style={{
              marginTop: '6px',
              padding: '6px 8px',
              backgroundColor: '#0f0f23',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#a5d6a7',
            }}>
              {stage.example}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Arrow({ active, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 2px',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: '20px',
        color: active ? color : '#3a4a6b',
        transition: 'all 0.3s ease',
        transform: active ? 'scale(1.3)' : 'scale(1)',
      }}>
        →
      </span>
    </div>
  );
}

export default function ProofPipelineDemo() {
  const [currentStage, setCurrentStage] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedStage, setExpandedStage] = useState(-1);

  const startAnimation = useCallback(() => {
    setCurrentStage(0);
    setIsPlaying(true);
    setExpandedStage(-1);
  }, []);

  const pauseAnimation = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStage(s => Math.min(s + 1, stages.length - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentStage(-1);
    setIsPlaying(false);
    setExpandedStage(-1);
  }, []);

  useEffect(() => {
    if (!isPlaying || currentStage < 0) return;
    if (currentStage >= stages.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStage(s => s + 1);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentStage, isPlaying]);

  const handleStageClick = (index) => {
    setExpandedStage(expandedStage === index ? -1 : index);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔄 ZKP 完整流水线演示</h2>

      <p style={styles.explanation}>
        从原始计算到零知识证明的完整流水线。点击播放观看数据如何在每个阶段变换，
        或点击任意阶段查看详情。
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {currentStage === -1 ? (
          <button style={styles.button} onClick={startAnimation}>
            ▶ 播放全流程
          </button>
        ) : (
          <>
            {isPlaying ? (
              <button style={styles.button} onClick={pauseAnimation}>
                ⏸ 暂停
              </button>
            ) : (
              <button style={styles.button} onClick={() => setIsPlaying(true)}>
                ▶ 继续
              </button>
            )}
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={nextStep}
              disabled={currentStage >= stages.length - 1}
            >
              ⏭ 下一步
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={reset}
            >
              ↺ 重置
            </button>
          </>
        )}
      </div>

      {/* Progress bar */}
      {currentStage >= 0 && (
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${((currentStage + 1) / stages.length) * 100}%`,
          }} />
        </div>
      )}

      {/* Pipeline flow */}
      <div style={{
        ...styles.section,
        marginTop: '16px',
      }}>
        <h3 style={styles.sectionTitle}>
          流水线
          {currentStage >= 0 && (
            <span style={{
              ...styles.badge,
              backgroundColor: stages[currentStage]?.color || '#ce93d8',
              color: '#000',
            }}>
              {currentStage + 1}/{stages.length}
            </span>
          )}
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          overflowX: 'auto',
          padding: '8px 0',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {stages.map((stage, i) => (
            <React.Fragment key={stage.id}>
              <StageCard
                stage={stage}
                index={i}
                isActive={currentStage === i}
                isCompleted={currentStage > i}
                isExpanded={expandedStage === i}
                onClick={() => handleStageClick(i)}
              />
              {i < stages.length - 1 && (
                <Arrow
                  active={currentStage >= i && currentStage > -1}
                  color={stage.color}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Size comparison */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          数据大小对比
          <span style={{
            ...styles.badge,
            backgroundColor: '#4caf50',
            color: '#000',
          }}>简洁性</span>
        </h3>
        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '12px' }}>
          这就是"succinct"的含义——证明大小远小于原始计算！
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sizeData.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '80px',
                fontSize: '12px',
                color: item.color,
                fontWeight: 'bold',
                textAlign: 'right',
                flexShrink: 0,
              }}>
                {item.label}
              </div>
              <div style={{
                flex: 1,
                height: '24px',
                backgroundColor: '#0f0f23',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${(item.value / 1000) * 100}%`,
                  minWidth: '4px',
                  height: '100%',
                  backgroundColor: item.color,
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '6px',
                }}>
                  {item.value >= 50 && (
                    <span style={{ fontSize: '10px', color: '#000', fontWeight: 'bold' }}>
                      {item.label === '证明 π' ? '288 B' : `~${item.value} B`}
                    </span>
                  )}
                </div>
              </div>
              {item.value < 50 && (
                <span style={{ fontSize: '11px', color: item.color, fontWeight: 'bold' }}>
                  288 bytes
                </span>
              )}
            </div>
          ))}
        </div>

        <div style={styles.tooltip}>
          💡 无论电路多复杂（几百万个门），Groth16 证明始终只有 <strong>~288 字节</strong>（3 个椭圆曲线点）。
          验证时间也是常数级的 O(1)。
        </div>
      </div>

      {/* Final summary when animation completes */}
      {currentStage >= stages.length - 1 && !isPlaying && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(76, 175, 80, 0.15)',
          border: '2px solid #4caf50',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅ 流水线完成！</div>
          <div style={{ fontSize: '14px', color: '#a5d6a7', lineHeight: '1.8' }}>
            从一个简单的计算 x³ + x + 5 = y，经过算术电路 → R1CS → QAP → 证明生成，<br />
            最终得到一个只有 288 字节的证明，验证者无需知道 x 的值就能确信计算是正确的。
          </div>
        </div>
      )}
    </div>
  );
}
