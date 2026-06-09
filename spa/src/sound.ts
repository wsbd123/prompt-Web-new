/**
 * 点击音效工具模块
 * 使用实时 AudioContext 同步合成点击音效，无延迟播放。
 * 每次创建新的 OscillatorNode，连续点击不重叠。
 */

let audioCtx: AudioContext | null = null;

/** 获取或创建 AudioContext（懒初始化，复用实例） */
function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/**
 * 播放点击音效（同步，无延迟）
 * 在 touchstart 回调中直接调用即可。
 * 音效：拨弦声，短促有弹性，Sine 波 600Hz，2ms 起音 + 100ms 自然衰减。
 */
export function playClickSound(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // 频率：600Hz 拨弦感，60ms 微降至 500Hz
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);

  // 包络：极快起音 2ms，100ms 内自然衰减
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}