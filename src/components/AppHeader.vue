<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo-container">
        <img 
          src="https://emotionalcities-h2020.eu/wp-content/uploads/2021/07/logo-emotionalcities.svg" 
          alt="eMOTIONAL Cities Logo"
          class="logo"
        />
      </div>
      <h1 class="title">eMOTIONAL Cities Records Catalogue</h1>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader'
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
  height: 60px;
  width: auto;
}

.title {
  color: #2C5697; /* eMOTIONAL Cities blue */
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .title {
    font-size: 1.4rem;
  }
}
</style>
