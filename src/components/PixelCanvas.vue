<template>
  <div class="canvas-wrapper">
    <div class="canvas-container">
      <canvas id="pixel-canvas"></canvas>
      <div class="center-button">
        <PixelButton>Load</PixelButton>
      </div>
    </div>
    <div class="buttons-container">
      <PixelButton>Save</PixelButton>
      <PixelButton>Clear</PixelButton>
    </div>
  </div>
</template>

<script>
import PixelButton from './PixelButton.vue'

export default {
  name: 'PixelCanvas',
  components: {
    PixelButton
  }
}
</script>

<style scoped>
.canvas-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.canvas-container {
  position: relative;
  width: 80vmin;
  height: 80vmin;
}

#pixel-canvas {
  border: 1px solid var(--color-border);
  width: 100%;
  height: 100%;
  display: block;
}

.center-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.buttons-container {
  margin-top: 20px;
  display: flex;
  gap: 20px;
  justify-content: center;
}
</style> 