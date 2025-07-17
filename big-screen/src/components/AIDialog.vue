<template>
  <transition name="fade">
    <div v-if="value" class="textDialogWrap" @click.self="close">
      <div
        class="map-popup ai-dialog"
        :style="{ left: dialogLeft + 'px', top: dialogTop + 'px', position: 'fixed' }"
        ref="dialog"
      >
        <div
          class="popup-title drag-handle"
          @mousedown="startDrag"
          style="cursor: move; user-select: none;"
        >AI智能助手</div>
        <div class="ai-chat-content" ref="chatContent">
          <div v-for="(msg, idx) in messages" :key="idx" :class="['ai-msg', msg.role]">
            <div class="bubble">
              <span v-if="msg.role==='user'">🧑：</span>
              <span v-else>🤖：</span>
              <span v-html="msg.content.replace(/\n/g, '<br>')"></span>
            </div>
          </div>
          <div v-if="loading" class="ai-msg assistant"><div class="bubble">🤖：<span>正在思考...</span></div></div>
        </div>
        <div class="ai-chat-input-row">
          <input v-model="input" :disabled="loading" @keyup.enter="send" placeholder="请输入内容..." class="ai-chat-input" />
          <button @click="send" :disabled="loading || !input.trim()" class="ai-chat-send">发送</button>
        </div>
        <span class="popup-close" @click="close">×</span>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'AIDialog',
  props: {
    value: Boolean
  },
  data() {
    return {
      input: '',
      messages: [],
      loading: false,
      // 拖动相关
      dragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
      dialogLeft: window.innerWidth / 2 - 240, // 居中
      dialogTop: window.innerHeight / 2 - 200,
    };
  },
  watch: {
    value(val) {
      if (val) {
        this.$nextTick(() => {
          this.scrollToBottom();
          // 弹窗打开时居中
          this.dialogLeft = window.innerWidth / 2 - 240;
          this.dialogTop = window.innerHeight / 2 - 200;
        });
      }
    },
    messages() {
      this.$nextTick(this.scrollToBottom);
    }
  },
  methods: {
    close() {
      this.$emit('input', false);
    },
    async send() {
      if (!this.input.trim() || this.loading) return;
      const userMsg = { role: 'user', content: this.input };
      this.messages.push(userMsg);
      const history = this.messages.slice(-10); // 只保留最近10条上下文
      this.input = '';
      this.loading = true;
      try {
        const res = await fetch('http://localhost:5000/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });
        const data = await res.json();
        this.messages.push({ role: 'assistant', content: data.reply });
      } catch (e) {
        this.messages.push({ role: 'assistant', content: 'AI接口请求失败，请稍后重试。' });
      }
      this.loading = false;
    },
    scrollToBottom() {
      const el = this.$refs.chatContent;
      if (el) el.scrollTop = el.scrollHeight;
    },
    // 拖动相关
    startDrag(e) {
      this.dragging = true;
      // 鼠标点在弹窗内的偏移
      const dialog = this.$refs.dialog;
      const rect = dialog.getBoundingClientRect();
      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    onDrag(e) {
      if (!this.dragging) return;
      // 限制弹窗不出屏幕
      let left = e.clientX - this.dragOffsetX;
      let top = e.clientY - this.dragOffsetY;
      // 限制范围
      left = Math.max(0, Math.min(left, window.innerWidth - 480));
      top = Math.max(0, Math.min(top, window.innerHeight - 100));
      this.dialogLeft = left;
      this.dialogTop = top;
    },
    stopDrag() {
      this.dragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    },
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  }
};
</script>
<style scoped>
.textDialogWrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* background: rgba(0,0,0,0.5); */
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.map-popup.ai-dialog {
  width: 480px;
  max-width: 95vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
  border: 1.5px solid #d0d7de;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13), 0 1.5px 4px rgba(30,144,255,0.08);
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
  /* 取消原有居中定位，改为js控制 */
  left: 0;
  top: 0;
  margin: 0;
}
.drag-handle {
  cursor: move;
  user-select: none;
}
.popup-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}
.popup-close {
  position: absolute;
  right: 10px;
  top: 6px;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}
.ai-chat-content {
  flex: 1;
  overflow-y: auto;
  background: #f7f7f7;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  min-height: 180px;
  max-height: 40vh;
}
.ai-msg {
  display: flex;
  margin-bottom: 8px;
  max-width: 100%;
}
.ai-msg.user {
  justify-content: flex-end;
}
.ai-msg.assistant {
  justify-content: flex-start;
}
.bubble {
  padding: 6px 14px;
  border-radius: 16px 16px 4px 16px;
  max-width: 80%;
  word-break: break-all;
  display: inline-block;
}
.ai-msg.user .bubble {
  background: #e3f2fd;
  border-radius: 16px 16px 4px 16px;
  color: #222;
}
.ai-msg.assistant .bubble {
  background: #f1f8e9;
  border-radius: 16px 16px 16px 4px;
  color: #1a73e8;
}
.ai-chat-input-row {
  border-top: 1px solid #eee;
  padding: 12px 10px 12px 10px;
  background: #fafbfc;
  border-radius: 0 0 18px 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
}
.ai-chat-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid #d0d7de;
  font-size: 15px;
  background: #fff;
  outline: none;
  transition: border 0.2s;
}
.ai-chat-input:focus {
  border: 1.5px solid #1a73e8;
}
.ai-chat-send {
  padding: 8px 22px;
  border: none;
  background: linear-gradient(90deg, #1a73e8);
  color: #fff;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(30,144,255,0.08);
  transition: background 0.2s;
}
.ai-chat-send:disabled {
  background: #b0b8c1;
  cursor: not-allowed;
}
</style> 