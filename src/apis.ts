import net from './utils/net';

export default {
  /**
   * @param text
   * @param voice
   * @returns url
   */
  async tts(text: string, voice?: SpeechSynthesisVoiceNameCN): Promise<string> {
    return await net.rpcCall('/tts/speakText', text, voice);
  }
};
