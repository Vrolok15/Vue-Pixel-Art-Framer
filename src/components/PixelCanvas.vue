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
    <div class="buttons-container" v-if="hasImage">
      <PixelButton 
        v-if="isModified"
        @click="saveImage"
      >Save</PixelButton>
      <PixelButton @click="frameSprite">Frame sprite</PixelButton>
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
      canvasSize: 512,
      originalImage: null,
      currentScale: 1,
      isModified: false,
      originalFileName: ''
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
      if (!this.originalImage) return

      const canvas = this.$refs.canvas
      const img = this.originalImage
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
    },
    frameSprite() {
      if (!this.originalImage) return

      // Create a temporary canvas to work with original size
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = this.originalImage.width
      tempCanvas.height = this.originalImage.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.imageSmoothingEnabled = false

      // Draw original image to temp canvas
      tempCtx.drawImage(this.originalImage, 0, 0)

      // Get image data at original size
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      const data = imageData.data
      const width = tempCanvas.width
      const height = tempCanvas.height
      
      // Create a copy of the original image data
      const newImageData = new ImageData(
        new Uint8ClampedArray(data),
        width,
        height
      )

      // Helper function to check if a pixel is transparent
      const isTransparent = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return true
        const i = (y * width + x) * 4
        return data[i + 3] === 0
      }

      // Helper function to check if a pixel has non-transparent neighbors
      const hasNonTransparentNeighbor = (x, y) => {
        const neighbors = [
          [x - 1, y],     // left
          [x + 1, y],     // right
          [x, y - 1],     // top
          [x, y + 1]      // bottom
        ]

        return neighbors.some(([nx, ny]) => {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) return false
          const i = (ny * width + nx) * 4
          return data[i + 3] !== 0
        })
      }

      // Loop through every pixel at original size
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4

          if (isTransparent(x, y) && hasNonTransparentNeighbor(x, y)) {
            newImageData.data[i] = 0      // R
            newImageData.data[i + 1] = 0  // G
            newImageData.data[i + 2] = 0  // B
            newImageData.data[i + 3] = 255 // A
          }
        }
      }

      // Put the modified image data back to temp canvas
      tempCtx.putImageData(newImageData, 0, 0)

      // Create new image from the modified canvas
      const framedImage = new Image()
      framedImage.onload = () => {
        this.originalImage = framedImage
        this.renderScaledImage()
        this.isModified = true
      }
      framedImage.src = tempCanvas.toDataURL()
    },
    saveImage() {
      if (!this.originalImage || !this.isModified) return

      // Create temporary canvas with original size
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = this.originalImage.width
      tempCanvas.height = this.originalImage.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.imageSmoothingEnabled = false
      tempCtx.drawImage(this.originalImage, 0, 0)

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