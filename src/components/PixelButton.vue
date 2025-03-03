<template>
  <button class="pixel-button">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'PixelButton'
}
</script>

<style scoped>
.pixel-button {
  font-family: 'Silkscreen', cursive;
  padding: 10px 20px;
  margin: 0 10px;
  border: 2px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pixel-button:hover {
  transform: scale(1.05);
  background-color: var(--color-border);
}
</style> 