class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // 缓冲区大小：4096 帧 (在 48k 采样率下约 85ms，在 44.1k 下约 92ms)
    // FunASR 建议 100ms 左右的数据包
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bytesWritten = 0;
    // this.port.postMessage({ type: 'debug', message: 'Processor initialized' });
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    // 检查输入是否有数据
    if (!input || input.length === 0) {
      // this.port.postMessage({ type: 'debug', message: 'No input channels' });
      return true;
    }

    // 获取第一个声道的音频数据
    const inputChannel = input[0];

    if (inputChannel && inputChannel.length > 0) {
      // 如果当前输入数据量超过剩余空间，则分批处理
      let inputOffset = 0;
      while (inputOffset < inputChannel.length) {
        const remainingSpace = this.bufferSize - this.bytesWritten;
        const copyCount = Math.min(remainingSpace, inputChannel.length - inputOffset);
        
        // 将数据拷贝到缓冲区
        this.buffer.set(inputChannel.subarray(inputOffset, inputOffset + copyCount), this.bytesWritten);
        
        this.bytesWritten += copyCount;
        inputOffset += copyCount;
        
        // 缓冲区满，发送数据
        if (this.bytesWritten >= this.bufferSize) {
          // 发送副本，避免引用问题
          this.port.postMessage(this.buffer.slice());
          this.bytesWritten = 0;
        }
      }
    } else {
        // this.port.postMessage({ type: 'debug', message: 'Input channel empty' });
    }
    return true; // 保持处理器活跃
  }
}

registerProcessor('audio-processor', AudioProcessor);