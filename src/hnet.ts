import { EventEmitter } from './utils/events';

type CtrlButton = 'START' | 'A' | 'B' | 'C' | 'D';

type CtrlData = {
  /** 方向，相对方向盘位置，最大长度为1 */
  axis?: { x: number; y: number };
  /** 手指触摸点，相对屏幕缩放，中心点在屏幕中心, 左右-1.0～1.0，上下1.0～-1.0 */
  touch?: { x: number; y: number };
  /** 按键，touchstart时触发 */
  buttons: CtrlButton[];
};

type EventMap = {
  axis: { x: number; y: number };
  touch: { x: number; y: number };
  button: CtrlButton[];
};

class HnetWebDevice extends EventEmitter<EventMap> {
  private webSocket: WebSocket | undefined;

  async start() {
    const webSocket = await this.connect('ws://localhost:3823');
    webSocket.binaryType = 'arraybuffer';
    this.webSocket = webSocket;
    // app layer connect
    webSocket.send(`connect:maslan`);
    webSocket.addEventListener('message', (ev) => {
      let data: CtrlData = ev.data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      if (data.axis) {
        this.emit('axis', data.axis);
      }
      if (data.touch) {
        this.emit('touch', data.touch);
      }
      if (data.buttons.length) {
        this.emit('button', data.buttons);
      }
    });
  }

  stop() {
    if (this.webSocket) {
      const ws = this.webSocket;
      this.webSocket = undefined;
      ws.close();
    }
  }

  private async connect(address: string): Promise<WebSocket> {
    return new Promise((resolve) => {
      let ws = new WebSocket(address);
      const timer = setInterval(() => {
        if (ws.readyState === 1) {
          clearInterval(timer);
          resolve(ws);
        } else if (ws.readyState === 3) {
          // is closed
          ws = new WebSocket(address);
          ws.addEventListener('close', () => {
            if (this.webSocket) {
              return;
            }
            this.start();
          });
        }
      }, 500);
    });
  }
}

const device = new HnetWebDevice();

device.start();

export default device;
