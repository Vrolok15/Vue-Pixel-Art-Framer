<template>
  <div class="canvas-wrapper">
    <div class="canvas-container">
      <canvas ref="canvas" id="pixel-canvas"></canvas>
      <div class="center-button" v-if="!hasImage">
        <PixelButton @click="triggerFileInput">Load</PixelButton>
        <input 
          type="file" 
          ref="fileInput"
          accept="image/png"
          class="hidden-input"
          @change="handleFileSelect"
        >
      </div>
    </div>
    <div class="buttons-container">
      <PixelButton>Save</PixelButton>
      <PixelButton @click="clearCanvas">Clear</PixelButton>
    </div>
  </div>
</template>

<script>
import PixelButton from './PixelButton.vue'

export default {
  name: 'PixelCanvas',
  components: {
    PixelButton
  },
  data() {
    return {
      hasImage: false,
      ctx: null,
      canvasSize: 512 // Default canvas size
    }
  },
  mounted() {
    this.initCanvas()
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas
      // Set actual canvas dimensions (not CSS dimensions)
      canvas.width = this.canvasSize
      canvas.height = this.canvasSize
      this.ctx = canvas.getContext('2d')
      this.ctx.imageSmoothingEnabled = false
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            this.drawImage(img)
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    drawImage(img) {
      const canvas = this.$refs.canvas
      
      // Calculate scale to fit the image while maintaining aspect ratio
      let scale = 1
      if (img.width > img.height) {
        // If image is wider than tall, scale based on width
        scale = Math.floor(this.canvasSize / img.width)
      } else {
        // If image is taller than wide, scale based on height
        scale = Math.floor(this.canvasSize / img.height)
      }

      // Calculate centered position
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const x = Math.floor((canvas.width - scaledWidth) / 2)
      const y = Math.floor((canvas.height - scaledHeight) / 2)

      // Clear canvas
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw image with integer scaling
      this.ctx.drawImage(
        img,
        x,
        y,
        scaledWidth,
        scaledHeight
      )

      this.hasImage = true
    },
    clearCanvas() {
      const canvas = this.$refs.canvas
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.hasImage = false
    }
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
  background-color: var(--color-element);
}

#pixel-canvas {
  border: 1px solid var(--color-border);
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  background-color: var(--color-element);
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

.hidden-input {
  display: none;
}
</style> 