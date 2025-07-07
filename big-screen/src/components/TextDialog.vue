<template>
  <transition name="fade">
    <div v-if="dialogVisible" class="textDialogWrap" @click="closeDialog">
      <slot />
    </div>
  </transition>
</template>
<script>
export default {
  data() {
    return {
      dialogVisible: false,
      // rowData: {}
    };
  },
  mounted() {
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeDestroy() {
    // 移除键盘事件监听器
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    handleKeydown(event) {
      // 检查是否是 esc 键
      if (event.keyCode === 27 || event.key === "Escape") {
        // 执行你想要的操作，例如关闭模态框等
        this.closeDialog();
      }
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    showDialog(row, event) {
      if (event) {
        const { clientX, clientY } = event;
        // 考虑到弹框大小和屏幕边缘，可能需要调整以避免超出边界
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const dialogHeight = 100; // 假设弹框高度为100px，需要根据实际情况调整
        const dialogWidth = 200; // 同样，假设宽度为200px

        this.dialogTop = Math.min(clientY, windowHeight - dialogHeight) + "px";
        this.dialogLeft = Math.min(clientX, windowWidth - dialogWidth) + "px";
      }

      // this.rowData = { ...row };
      // console.log("[  this.rowData :]", this.rowData);
      this.dialogVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.textDialogWrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 设置半透明的黑色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: width 0.5s ease-out, transform 0.5s ease-out;
}
</style>
