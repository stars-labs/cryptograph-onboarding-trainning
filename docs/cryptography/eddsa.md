---
sidebar_position: 7
---

import { EdDSADemo } from '@site/src/components/Interactive';

# 第七章：EdDSA 与 Ed25519

## 🎮 交互式演示

EdDSA 使用独特的扭曲爱德华曲线（Twisted Edwards Curve）和确定性签名机制。
动手试一试：

<EdDSADemo />

---

EdDSA (Edwards-curve Digital Signature Algorithm) 是一种基于扭曲爱德华曲线的签名算法，Ed25519 是其最流行的实现。Solana、Cardano、Polkadot 等区块链使用 Ed25519。

## 6.1 EdDSA 概述

### 使用 EdDSA 的项目

| 项目 | 曲线 | 用途 |
|------|------|------|
| Solana | Ed25519 | 交易签名 |
| Cardano | Ed25519 | 交易签名 |
| Polkadot | Ed25519/Sr25519 | 账户签名 |
| Monero | Ed25519 | 环签名基础 |
| NEAR | Ed25519 | 账户签名 |
| SSH | Ed25519 | 身份认证 |
| Signal | Ed25519 | 消息签名 |

### EdDSA vs ECDSA vs Schnorr

| 特性 | ECDSA | Schnorr | EdDSA |
|------|-------|---------|-------|
| 曲线类型 | Weierstrass | Weierstrass | Edwards |
| 随机数 | 每次签名需要 | 每次签名需要 | **确定性生成** |
| 签名大小 | 64-72 字节 | 64 字节 | 64 字节 |
| 验证速度 | 较慢 | 快 | **最快** |
| 实现复杂度 | 复杂 | 中等 | 简单 |

## 6.2 爱德华曲线

### 为什么不用 Weierstrass 曲线？

爱德华曲线有独特优势：
1. **完备的加法公式**：不需要处理特殊情况
2. **更快的运算**：点加法只需一个公式
3. **天然抗侧信道攻击**

### 扭曲爱德华曲线方程

```
ax² + y² = 1 + dx²y²
```

其中 `a` 和 `d` 是曲线参数。

### Curve25519 参数

Ed25519 使用的曲线：

```
-x² + y² = 1 - (121665/121666)x²y²

等价于: a = -1, d = -121665/121666

素数 p = 2²⁵⁵ - 19
曲线阶 n = 2²⁵² + 27742317777372353535851937790883648493
```

### 基点

```python
# Curve25519 基点 (压缩形式)
By = 4 * pow(5, -1, p) % p  # y 坐标
# y = 0x6666666666666666666666666666666666666666666666666666666666666658
```

## 6.3 Ed25519 签名流程

### 密钥生成

与 ECDSA/Schnorr 不同，Ed25519 从种子派生密钥：

```python
import hashlib

def ed25519_keygen(seed):
    """从 32 字节种子生成密钥对"""
    # 对种子做 SHA-512 哈希
    h = hashlib.sha512(seed).digest()
    
    # 前 32 字节作为私钥标量
    a = int.from_bytes(h[:32], 'little')
    # 清除和设置特定位 (clamping)
    a &= ~7  # 清除最低 3 位
    a &= ~(128 << 248)  # 清除最高位
    a |= 64 << 248  # 设置次高位
    
    # 后 32 字节作为签名时的随机源
    prefix = h[32:]
    
    # 公钥 = a × G
    A = scalar_mult(a, G)
    
    return {
        'private_scalar': a,
        'prefix': prefix,
        'public_key': A
    }
```

### 签名生成

**确定性签名** —— 不需要额外的随机数！

```python
def ed25519_sign(message, private_key, public_key, prefix):
    """Ed25519 签名"""
    # 1. 确定性生成 r
    r = hashlib.sha512(prefix + message).digest()
    r = int.from_bytes(r, 'little') % n
    
    # 2. R = r × G
    R = scalar_mult(r, G)
    
    # 3. 计算挑战
    R_bytes = point_to_bytes(R)
    A_bytes = point_to_bytes(public_key)
    k = hashlib.sha512(R_bytes + A_bytes + message).digest()
    k = int.from_bytes(k, 'little') % n
    
    # 4. s = r + k × a (mod n)
    s = (r + k * private_key) % n
    
    # 5. 返回签名 (R, s)
    return R_bytes + s.to_bytes(32, 'little')
```

### 签名验证

```python
def ed25519_verify(message, signature, public_key):
    """Ed25519 验证"""
    # 解析签名
    R = bytes_to_point(signature[:32])
    s = int.from_bytes(signature[32:], 'little')
    
    # 检查 s 范围
    if s >= n:
        return False
    
    # 计算挑战
    R_bytes = signature[:32]
    A_bytes = point_to_bytes(public_key)
    k = hashlib.sha512(R_bytes + A_bytes + message).digest()
    k = int.from_bytes(k, 'little') % n
    
    # 验证: s × G == R + k × A
    left = scalar_mult(s, G)
    right = point_add(R, scalar_mult(k, public_key))
    
    return left == right
```

## 6.4 为什么 Ed25519 更安全？

### 确定性签名

```
ECDSA: 签名 = f(消息, 私钥, 随机数k)  // k 泄露 = 私钥泄露
EdDSA: 签名 = f(消息, 私钥)           // 无需外部随机数！
```

随机数 r 由 `Hash(prefix || message)` 确定性生成，相同消息产生相同签名。

### 不存在 k 重复问题

回顾 PS3 泄露事件：ECDSA 使用相同的 k 导致私钥泄露。

Ed25519 **从根本上消除了这个风险**。

### 抗侧信道攻击

Edwards 曲线的完备加法公式：

```
# Weierstrass 曲线点加法需要判断多种情况
if P == Q:
    # 点倍乘公式
elif P == -Q:
    # 返回无穷远点
else:
    # 普通点加法

# Edwards 曲线只需一个公式！
x3 = (x1*y2 + x2*y1) / (1 + d*x1*x2*y1*y2)
y3 = (y1*y2 - a*x1*x2) / (1 - d*x1*x2*y1*y2)
```

没有条件分支 = 抗定时攻击。

## 6.5 Solana 中的 Ed25519

### 交易签名

```javascript
// 使用 @solana/web3.js
const { Keypair, Transaction, SystemProgram } = require('@solana/web3.js');

// 生成密钥对
const keypair = Keypair.generate();
console.log('公钥:', keypair.publicKey.toBase58());
// 输出: HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH

// 创建交易
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: keypair.publicKey,
    toPubkey: recipientPubkey,
    lamports: 1000000000,  // 1 SOL
  })
);

// 签名（内部使用 Ed25519）
transaction.sign(keypair);
```

### 验证签名

```javascript
const nacl = require('tweetnacl');

// 手动验证
const message = Buffer.from('Hello Solana');
const signature = nacl.sign.detached(message, keypair.secretKey);
const isValid = nacl.sign.detached.verify(message, signature, keypair.publicKey.toBytes());
console.log('签名有效:', isValid);
```

## 6.6 Ed25519 vs secp256k1

### 性能对比

| 操作 | secp256k1 (ECDSA) | Ed25519 |
|------|-------------------|---------|
| 密钥生成 | ~50 μs | ~30 μs |
| 签名 | ~50 μs | ~70 μs |
| 验证 | ~100 μs | ~120 μs |
| 批量验证 (1000) | 100 ms | 30 ms |

Ed25519 批量验证显著更快。

### 安全强度

两者都提供约 128 位安全强度：
- secp256k1: 256 位曲线
- Ed25519: 255 位曲线

## 6.7 Sr25519 (Schnorr on Ristretto25519)

Polkadot 使用的变体：

```
Ed25519 → Sr25519
       ↑
  添加 VRF + Schnorr 特性
```

### 优势

- 支持可验证随机函数 (VRF)
- 更好的多签支持
- 层次派生密钥

```rust
// Substrate/Polkadot 代码
use sp_core::sr25519::{Pair, Public, Signature};

let (pair, _, _) = Pair::generate_with_phrase(None);
let message = b"Hello Polkadot";
let signature = pair.sign(message);

assert!(Pair::verify(&signature, message, &pair.public()));
```

## 6.8 Python 完整实现

```python
import hashlib
import secrets

# Curve25519 参数
p = 2**255 - 19
d = -121665 * pow(121666, -1, p) % p
n = 2**252 + 27742317777372353535851937790883648493

# 基点 (只展示 y 坐标的压缩形式)
By = 4 * pow(5, -1, p) % p

class Ed25519:
    def __init__(self):
        self.p = p
        self.d = d
        self.n = n
        # 实际实现需要完整的基点坐标
        # 这里简化处理
    
    def generate_keypair(self):
        """生成密钥对"""
        seed = secrets.token_bytes(32)
        h = hashlib.sha512(seed).digest()
        
        # 私钥处理 (clamping)
        a = bytearray(h[:32])
        a[0] &= 248
        a[31] &= 127
        a[31] |= 64
        private_scalar = int.from_bytes(bytes(a), 'little')
        
        prefix = h[32:]
        
        # 公钥 = private_scalar × G
        # (需要完整的标量乘法实现)
        public_key = self._scalar_mult(private_scalar)
        
        return {
            'seed': seed,
            'private': private_scalar,
            'prefix': prefix,
            'public': public_key
        }
    
    def sign(self, message, keypair):
        """签名消息"""
        prefix = keypair['prefix']
        private = keypair['private']
        public = keypair['public']
        
        # 1. r = Hash(prefix || message)
        r_hash = hashlib.sha512(prefix + message).digest()
        r = int.from_bytes(r_hash, 'little') % self.n
        
        # 2. R = r × G
        R = self._scalar_mult(r)
        
        # 3. k = Hash(R || A || message)
        k_hash = hashlib.sha512(
            self._point_to_bytes(R) + 
            self._point_to_bytes(public) + 
            message
        ).digest()
        k = int.from_bytes(k_hash, 'little') % self.n
        
        # 4. s = r + k × private
        s = (r + k * private) % self.n
        
        return self._point_to_bytes(R) + s.to_bytes(32, 'little')
    
    def verify(self, message, signature, public_key):
        """验证签名"""
        if len(signature) != 64:
            return False
        
        R = self._bytes_to_point(signature[:32])
        s = int.from_bytes(signature[32:], 'little')
        
        if s >= self.n:
            return False
        
        # k = Hash(R || A || message)
        k_hash = hashlib.sha512(
            signature[:32] + 
            self._point_to_bytes(public_key) + 
            message
        ).digest()
        k = int.from_bytes(k_hash, 'little') % self.n
        
        # 验证 s × G == R + k × A
        left = self._scalar_mult(s)
        right = self._point_add(R, self._scalar_mult_point(k, public_key))
        
        return left == right
    
    def _scalar_mult(self, k):
        """标量乘法 k × G"""
        # 简化实现，实际需要完整的 Edwards 曲线运算
        pass
    
    def _point_add(self, P, Q):
        """Edwards 曲线点加法"""
        # (x1, y1) + (x2, y2) = (x3, y3)
        # x3 = (x1*y2 + x2*y1) / (1 + d*x1*x2*y1*y2)
        # y3 = (y1*y2 + x1*x2) / (1 - d*x1*x2*y1*y2)
        pass
    
    def _point_to_bytes(self, point):
        """点压缩"""
        pass
    
    def _bytes_to_point(self, data):
        """点解压"""
        pass


# 使用示例
if __name__ == "__main__":
    ed = Ed25519()
    keypair = ed.generate_keypair()
    print(f"公钥: {keypair['public']}")
    
    message = b"Hello Ed25519!"
    # signature = ed.sign(message, keypair)
    # is_valid = ed.verify(message, signature, keypair['public'])
```

## 本章小结

| 特性 | Ed25519 优势 |
|------|-------------|
| 确定性签名 | 无需外部随机数，消除 k 重复风险 |
| 速度 | 批量验证极快 |
| 安全性 | 抗侧信道攻击 |
| 简洁性 | 完备的加法公式 |

## 思考题

1. 为什么 Ed25519 使用确定性 nonce 更安全？
2. Edwards 曲线和 Weierstrass 曲线如何转换？
3. Solana 为什么选择 Ed25519 而不是 secp256k1？

---

下一章：[BLS 签名与聚合](/docs/cryptography/bls)
