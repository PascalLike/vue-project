<template>
  <header 
    class="app-header" 
    @click="goHome" 
    role="button" 
    tabindex="0"
    @keydown.enter="goHome"
    @keydown.space="goHome">
    <div class="header-content">
      <div class="logo-container">
        <img 
          src="https://emotionalcities-h2020.eu/wp-content/uploads/2021/07/logo-emotionalcities.svg" 
          alt="eMOTIONAL Cities Logo"
          class="logo"
        />
      </div>
      <h1 class="title">eMOTIONAL Cities Metadata Catalog</h1>
    </div>
  </header>
</template>

<script>
/**
 * Application Header Component
 * Displays the logo and title, acts as a home button
 */
import { inject } from 'vue'

export default {
  name: 'AppHeader',

  setup() {
    const resetView = inject('resetView')

    /**
     * Handles click/keypress events to return to home view
     */
    const goHome = () => {
      if (resetView) {
        resetView()
      }
    }

    return {
      goHome
    }
  }
}
</script>

<style scoped>
.app-header {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  cursor: pointer;
  transition: background-color 0.2s;
}

.app-header:hover {
  background-color: #f8f9fa;
}

.app-header:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

.app-header:focus:not(:focus-visible) {
  outline: none;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo-container {
  flex-shrink: 0;
}

.logo {
  height: 50px;
  width: auto;
  transition: transform 0.2s;
}

.app-header:hover .logo {
  transform: scale(1.05);
}

.title {
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 500;
  font-family: 'Roboto', 'Open Sans', sans-serif;
  margin: 0;
  letter-spacing: 0.5px;
  transition: color 0.2s;
}

.app-header:hover .title {
  color: #1e3c6a;
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .title {
    font-size: 1.2rem;
  }

  .logo {
    height: 40px;
  }
}
</style>
