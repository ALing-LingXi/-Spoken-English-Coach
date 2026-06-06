import { ref } from "vue";
import { useChatStore } from "../store/chat";

/**
 * 音频播放 Hook：队列管理、播放打断
 * 播放状态统一写入 Store
 */
export function usePlayer() {
  const currentAudio = ref(null);
  const queue = ref([]);

  /** base64 转 Audio URL */
  function base64ToAudioUrl(base64Audio) {
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "audio/mp3" });
    return URL.createObjectURL(blob);
  }

  /** 播放单条音频 */
  function playAudio(base64Audio) {
    const store = useChatStore();
    return new Promise((resolve) => {
      stopCurrent();

      const url = base64ToAudioUrl(base64Audio);
      const audio = new Audio(url);
      currentAudio.value = audio;
      store.setPlaying(true);

      audio.onended = () => {
        store.setPlaying(false);
        currentAudio.value = null;
        URL.revokeObjectURL(url);
        resolve();
      };

      audio.onerror = () => {
        store.setPlaying(false);
        currentAudio.value = null;
        URL.revokeObjectURL(url);
        resolve();
      };

      audio.play().catch(() => {
        store.setPlaying(false);
        currentAudio.value = null;
        URL.revokeObjectURL(url);
        resolve();
      });
    });
  }

  /** 停止当前播放（不清队列） */
  function stopCurrent() {
    const store = useChatStore();
    if (currentAudio.value) {
      currentAudio.value.onended = null;
      currentAudio.value.onerror = null;
      currentAudio.value.pause();
      currentAudio.value.currentTime = 0;
      currentAudio.value = null;
    }
    store.setPlaying(false);
  }

  /** 完全停止：停当前 + 清空队列 */
  function stop() {
    stopCurrent();
    queue.value = [];
  }

  /** 打断当前播放，但保留队列 */
  function interrupt() {
    stopCurrent();
    playNext();
  }

  /** 添加到队列并自动播放 */
  function addToQueue(base64Audio) {
    const store = useChatStore();
    queue.value.push(base64Audio);
    if (!store.isPlaying) {
      playNext();
    }
  }

  /** 播放队列中下一条 */
  async function playNext() {
    if (queue.value.length === 0) return;

    const next = queue.value.shift();
    await playAudio(next);
    playNext();
  }

  /** 清空队列 */
  function clearQueue() {
    queue.value = [];
  }

  return {
    addToQueue,
    stop,
    interrupt,
    clearQueue,
  };
}
