import { isTouchDevice } from './sys';

const cursor: HTMLElement = document.createElement('div');
const trash: HTMLElement = document.createElement('i');
const cursorSize = isTouchDevice ? 45 : 30;
const trashSize = isTouchDevice ? 90 : 60;

export class Dragable {
  elementClick: Element | null = null;
  elementDragging: Element | null = null;
  elementOver: Element | null = null;
  dataTransfer: DataTransfer | null = null;
  isMoved = false;
  constructor(private dom: HTMLElement) {
    if (!cursor.isConnected) {
      cursor.style.display = 'none';
      cursor.style.position = 'absolute';
      cursor.style.width = `${cursorSize}px`;
      cursor.style.height = `${cursorSize}px`;
      cursor.style.marginLeft = `-${cursorSize / 2}px`;
      cursor.style.marginTop = `-${cursorSize / 2}px`;
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = '#888';
      cursor.style.zIndex = '9999';
      cursor.style.pointerEvents = 'none';
      document.body.appendChild(cursor);

      trash.style.display = 'none';
      trash.style.position = 'absolute';
      trash.style.width = `${trashSize}px`;
      trash.style.height = `${trashSize}px`;
      trash.style.borderRadius = '50%';
      trash.style.color = '#fff';
      trash.style.fontSize = `${trashSize * 2 / 3}px`;
      trash.style.backgroundColor = '#F56C6C';
      trash.style.lineHeight = `${trashSize}px`;
      trash.style.textAlign = 'center';
      trash.style.zIndex = '9998';
      trash.classList.toggle('trash');
      trash.classList.toggle('icon-trash');
      trash.ondrop = (ev: DragEvent) => {
        if (ev.dataTransfer) {
          ev.dataTransfer.setData('selfRemove', "true");
        }
      };
      document.body.appendChild(trash);
    }
    const down = (e: PointerEvent) => {
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      this.elementClick = elem;
      if (!elem || elem.getAttribute('draggable') !== 'true') {
        return;
      }
      this.dataTransfer = null;
      this.elementDragging = elem;
      this.isMoved = false;
      if (!isTouchDevice) {
        dom.addEventListener('pointerup', up);
        dom.addEventListener('pointermove', move);
        dom.setPointerCapture(e.pointerId);
      } if (e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.showCursor(e.clientX, e.clientY);
      return true;
    };
    if (isTouchDevice) {
      dom.addEventListener('touchstart', (e: any) => {
        if (down({
          clientX: e.pageX,
          clientY: e.pageY,
        } as any)) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
      dom.ontouchmove = (e: any) => {
        if (move({
          clientX: e.pageX,
          clientY: e.pageY,
        } as any)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      dom.ontouchend = (e: any) => {
        if (up({
          clientX: e.pageX,
          clientY: e.pageY,
        } as any)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
    } else {
      dom.addEventListener('pointerdown', down);
    }
    const move = (e: PointerEvent) => {
      if (!this.elementDragging) {
        return;
      }
      if (!this.isMoved) {
        this.isMoved = true;
        const showTrash = this.elementDragging.getAttribute('showTrash');
        if (showTrash && showTrash !== 'false') {
          this.showTrash();
        }
        this.dataTransfer = new DataTransfer();
        const eo = new DragEvent('dragstart', {
          clientX: e.clientX,
          clientY: e.clientY,
          dataTransfer: this.dataTransfer,
        });
        this.elementDragging.dispatchEvent(eo);
      }
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      if (!elem) {
        return true;
      }
      if (elem !== this.elementOver) {
        if (this.elementOver) {
          this.elementOver.setAttribute('isdragover', 'false');
          const eo = new DragEvent('dragleave', {
            clientX: e.clientX,
            clientY: e.clientY,
            dataTransfer: this.dataTransfer,
          });
          this.elementOver.dispatchEvent(eo);
        }
        this.elementOver = elem;
        this.elementOver.setAttribute('isdragover', 'true');
      }
      this.moveCursor(e.clientX, e.clientY);
      const eo = new DragEvent('dragover', {
        clientX: e.clientX,
        clientY: e.clientY,
        dataTransfer: this.dataTransfer,
      });
      elem?.dispatchEvent(eo);
      return true;
    };
    const up = (e: PointerEvent) => {
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      this.hideCursor();
      if (!this.elementDragging) {
        // if (this.elementClick) {
        //   this.elementClick.dispatchEvent(new Event('click'));
        // }
        return;
      }
      if (!elem) {
        this.isMoved = false;
        this.elementDragging.dispatchEvent(new DragEvent('dragend', {
          clientX: e.clientX,
          clientY: e.clientY,
          dataTransfer: this.dataTransfer,
        }));
        this.elementDragging = null;
        return true;
      }
      if (this.isMoved && elem !== this.elementDragging) {
        const eo = new DragEvent('drop', {
          clientX: e.clientX,
          clientY: e.clientY,
          dataTransfer: this.dataTransfer,
        });
        elem.dispatchEvent(eo);
      } else {
        elem.dispatchEvent(new Event('click'));
      }
      this.elementDragging.dispatchEvent(new DragEvent('dragend', {
        clientX: e.clientX,
        clientY: e.clientY,
        dataTransfer: this.dataTransfer,
      }));
      this.elementDragging = null;
      if (this.elementOver) {
        this.elementOver.removeAttribute('isdragover');
        this.elementOver = null;
      }
      if (!isTouchDevice) {
        dom.removeEventListener('pointermove', move);
        dom.removeEventListener('pointerup', up);
      }
      return true;
    };
  }
  showCursor(x: number, y: number) {
    cursor.style.display = 'block';
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    const trashX = x < window.innerWidth / 2 ? x + 240 : x - 240;
    trash.style.left = `${trashX}px`;
    trash.style.top = `${y - trash.clientHeight / 2}px`;
  }
  showTrash() {
    trash.style.display = 'block';
  }
  moveCursor(x: number, y: number) {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }
  hideCursor() {
    cursor.style.display = 'none';
    trash.style.display = 'none';
  }
}
