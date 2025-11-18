// loading-skeleton.js - Loading skeleton utilities

export class LoadingSkeleton {
  static show(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.add('loading');
    container.innerHTML = `
      <div class="skeleton-wrapper">
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 80%"></div>
        <div class="skeleton skeleton-text" style="width: 60%"></div>
      </div>
    `;
  }

  static hide(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.remove('loading');
  }

  static showChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const parent = canvas.parentElement;
    parent.classList.add('loading-chart');
  }

  static hideChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const parent = canvas.parentElement;
    parent.classList.remove('loading-chart');
  }

  static showMultiple(containerIds) {
    containerIds.forEach(id => this.show(id));
  }

  static hideMultiple(containerIds) {
    containerIds.forEach(id => this.hide(id));
  }
}

// Memoization utility for expensive calculations
export class Memoizer {
  constructor() {
    this.cache = new Map();
  }

  memoize(key, fn) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = fn();
    this.cache.set(key, result);
    return result;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }

  has(key) {
    return this.cache.has(key);
  }
}
