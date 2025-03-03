<template>
  <div class="canvas-wrapper">
    <div class="canvas-container">
      <canvas ref="canvas" id="pixel-canvas"></canvas>
      <div class="center-button" v-if="!hasImage">
        <PixelButton @click="triggerFileInput">Load Image...</PixelButton>
        <input 
          type="file" 
          ref="fileInput"
          accept="image/png"
          class="hidden-input"
          @change="handleFileSelect"
        >
      </div>
    </div>
    <div class="controls-container" v-if="hasImage">
      <div class="buttons-container">
        <PixelButton 
          v-if="isModified"
          @click="saveImage"
        >Save</PixelButton>
        <PixelButton @click="frameSprite">Frame sprite</PixelButton>
        <div class="slider-container">
          <label style="font-size: 12px;display: inline-block;margin-right: 10px;" for="colorSlider">Frame darkness: {{ colorDarkness }}%</label>
          <input 
            type="range" 
            id="colorSlider"
            v-model="colorDarkness"
            min="0" 
            max="100" 
            step="10"
            class="color-slider"
          >
        </div>
        <PixelButton @click="clearCanvas">Clear</PixelButton>
      </div>
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
      canvasSize: 512,
      originalImage: null,
      modifiedImage: null,
      currentScale: 1,
      isModified: false,
      originalFileName: '',
      colorDarkness: 100 // Default to 100% (black)
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
        this.originalFileName = file.name
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
      
      // Store original image for later use
      this.originalImage = img
      this.modifiedImage = img
      
      // Calculate scale to fit the image while maintaining aspect ratio
      if (img.width > img.height) {
        this.currentScale = Math.floor(this.canvasSize / img.width)
      } else {
        this.currentScale = Math.floor(this.canvasSize / img.height)
      }

      this.renderScaledImage()
      this.hasImage = true
    },
    renderScaledImage() {
      if (!this.modifiedImage) return

      const canvas = this.$refs.canvas
      const img = this.modifiedImage
      const scale = this.currentScale

      // Calculate centered position
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const x = Math.floor((canvas.width - scaledWidth) / 2)
      const y = Math.floor((canvas.height - scaledHeight) / 2)

      // Clear canvas
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw scaled image
      this.ctx.drawImage(
        img,
        x,
        y,
        scaledWidth,
        scaledHeight
      )
    },
    clearCanvas() {
      const canvas = this.$refs.canvas
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.hasImage = false
      this.isModified = false
      this.originalFileName = ''
      this.originalImage = null
      this.modifiedImage = null
    },
    createFrame(colorCallback) {
      if (!this.originalImage) return

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = this.originalImage.width
      tempCanvas.height = this.originalImage.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.imageSmoothingEnabled = false

      tempCtx.drawImage(this.originalImage, 0, 0)

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      const data = imageData.data
      const width = tempCanvas.width
      const height = tempCanvas.height
      
      const newImageData = new ImageData(
        new Uint8ClampedArray(data),
        width,
        height
      )

      const isTransparent = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return true
        const i = (y * width + x) * 4
        return data[i + 3] === 0
      }

      const getNeighborColors = (x, y) => {
        const neighbors = [
          [x - 1, y],     // left
          [x + 1, y],     // right
          [x, y - 1],     // top
          [x, y + 1]      // bottom
        ]

        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
          const i = (ny * width + nx) * 4
          if (data[i + 3] !== 0) {
            return {
              r: data[i],
              g: data[i + 1],
              b: data[i + 2]
            }
          }
        }
        return null
      }

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4

          if (isTransparent(x, y)) {
            const neighborColors = getNeighborColors(x, y)
            if (neighborColors) {
              const color = colorCallback(neighborColors)
              newImageData.data[i] = color.r
              newImageData.data[i + 1] = color.g
              newImageData.data[i + 2] = color.b
              newImageData.data[i + 3] = 255
            }
          }
        }
      }

      tempCtx.putImageData(newImageData, 0, 0)

      const framedImage = new Image()
      framedImage.onload = () => {
        this.modifiedImage = framedImage
        this.renderScaledImage()
        this.isModified = true
      }
      framedImage.src = tempCanvas.toDataURL()
    },
    frameSprite() {
      const darknessFactor = (100 - this.colorDarkness) / 100
      this.createFrame((color) => ({
        r: Math.floor(color.r * darknessFactor),
        g: Math.floor(color.g * darknessFactor),
        b: Math.floor(color.b * darknessFactor)
      }))
    },
    saveImage() {
      if (!this.modifiedImage || !this.isModified) return

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = this.modifiedImage.width
      tempCanvas.height = this.modifiedImage.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.imageSmoothingEnabled = false
      tempCtx.drawImage(this.modifiedImage, 0, 0)

      // Create download link
      const link = document.createElement('a')
      link.download = this.getSaveFileName()
      link.href = tempCanvas.toDataURL('image/png')
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    getSaveFileName() {
      if (!this.originalFileName) return 'sprite-framed.png'
      
      const nameParts = this.originalFileName.split('.')
      if (nameParts.length > 1) {
        // Remove extension and add suffix
        nameParts.pop()
        return `${nameParts.join('.')}-framed.png`
      }
      return `${this.originalFileName}-framed.png`
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

.controls-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.slider-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: 'Silkscreen', cursive;
}

.color-slider {
  width: 200px;
  height: 20px;
  -webkit-appearance: none;
  background: var(--color-element);
  outline: none;
  border: 2px solid var(--color-border);
  cursor: pointer;
}

.color-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--color-text);
  cursor: pointer;
}

.color-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--color-text);
  cursor: pointer;
  border: none;
}

.buttons-container {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.hidden-input {
  display: none;
}
</style> 