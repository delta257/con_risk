<template>
  <transition name="fade">
    <div v-if="dialogVisible || value" class="textDialogWrap" @click.self="handleClose">
      <slot />
    </div>
  </transition>
</template>
<script>
export default {
  props: {
    value: Boolean
  },
  data() {
    return {
      dialogVisible: false,
      // rowData: {}
    };
  },
  watch: {
    value(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      if (!val) this.$emit('close');
    }
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
        this.handleClose();
      }
    },
    handleClose() {
      this.dialogVisible = false;
      this.$emit('close');
    },
    showDialog() {
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: width 0.5s ease-out, transform 0.5s ease-out;
}
</style>
