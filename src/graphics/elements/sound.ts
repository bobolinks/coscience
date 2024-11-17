import { PositionalAudio, AudioListener } from 'three/webgpu';
import cache from './cache';

type Props = {
  voice: SpeechSynthesisVoiceNameCN;
  returnPlaying: boolean;
};

export class Sound extends PositionalAudio {
  public readonly isSoundObject = true;
  public readonly props: Props;

  constructor(props: Partial<Props>, listener: AudioListener) {
    super(listener);
    this.props = { voice: 'zh-CN-XiaoshuangNeural', returnPlaying: false, ...props };

    this.setRefDistance(1000);
    this.setLoop(false);
  }
  async playSound(url: string): Promise<void> {
    if (this.isPlaying) {
      if (this.props.returnPlaying) {
        return;
      }
      this.stop();
    }
    const buffer = await cache.loadSound(url);
    if (!buffer) {
      // not found
      console.warn('not found!');
      return;
    }
    this.setLoop(true);
    this.setBuffer(buffer);
    return new Promise((resolve) => {
      this.onEnded = () => {
        resolve();
      };
      this.play();
    });
  }
  async say(content: string): Promise<void> {
    if (this.isPlaying) {
      if (this.props.returnPlaying) {
        return;
      }
      this.stop();
    }
    const buffer = await cache.tts(content, this.props.voice);
    if (!buffer) {
      // not found
      console.warn('not found!');
      return;
    }
    this.setLoop(false);
    this.setBuffer(buffer);
    return new Promise((resolve) => {
      this.onEnded = () => {
        resolve();
      };
      this.play();
    });
  }
  async sayAll(contents: Array<string>): Promise<void> {
    for (const txt of contents) {
      await this.say(txt);
    }
  }
}
