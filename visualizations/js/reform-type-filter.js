// reform-type-filter.js - Multi-select reform type filter with checkboxes

export class ReformTypeFilter {
  constructor() {
    this.selectedTypes = new Set();
    this.allTypes = [];
    this.onChange = null;

    this.initFromURLParams();
  }

  initFromURLParams() {
    const params = new URLSearchParams(window.location.search);
    const types = params.get('reformTypes');
    if (types) {
      types.split(',').forEach(t => this.selectedTypes.add(t));
    }
  }

  updateURLParams() {
    const params = new URLSearchParams(window.location.search);

    if (this.selectedTypes.size > 0 && this.selectedTypes.size < this.allTypes.length) {
      params.set('reformTypes', Array.from(this.selectedTypes).join(','));
    } else {
      params.delete('reformTypes');
    }

    const newURL = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newURL);
  }

  setTypes(types) {
    this.allTypes = types.sort();
    // If no types selected, select all by default
    if (this.selectedTypes.size === 0) {
      this.allTypes.forEach(t => this.selectedTypes.add(t));
    }
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const checkboxesHTML = this.allTypes.map(type => `
      <label class="checkbox-label">
        <input
          type="checkbox"
          class="reform-checkbox"
          value="${type}"
          ${this.selectedTypes.has(type) ? 'checked' : ''}
        />
        <span class="checkbox-text">${type}</span>
      </label>
    `).join('');

    container.innerHTML = `
      <div class="reform-type-filter">
        <div class="filter-header">
          <span class="filter-label">Reform types:</span>
          <button id="selectAllTypes" class="btn-link">Select All</button>
          <button id="clearAllTypes" class="btn-link">Clear All</button>
        </div>
        <div class="checkbox-grid">
          ${checkboxesHTML}
        </div>
      </div>
    `;

    // Event listeners
    const checkboxes = container.querySelectorAll('.reform-checkbox');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.selectedTypes.add(e.target.value);
        } else {
          this.selectedTypes.delete(e.target.value);
        }
        this.updateURLParams();
        if (this.onChange) this.onChange();
      });
    });

    document.getElementById('selectAllTypes')?.addEventListener('click', () => {
      this.selectedTypes.clear();
      this.allTypes.forEach(t => this.selectedTypes.add(t));
      checkboxes.forEach(cb => cb.checked = true);
      this.updateURLParams();
      if (this.onChange) this.onChange();
    });

    document.getElementById('clearAllTypes')?.addEventListener('click', () => {
      this.selectedTypes.clear();
      checkboxes.forEach(cb => cb.checked = false);
      this.updateURLParams();
      if (this.onChange) this.onChange();
    });
  }

  filterData(data) {
    if (this.selectedTypes.size === 0 || this.selectedTypes.size === this.allTypes.length) {
      return data;
    }
    return data.filter(d => this.selectedTypes.has(d.reform_type));
  }

  reset() {
    this.selectedTypes.clear();
    this.allTypes.forEach(t => this.selectedTypes.add(t));
    this.updateURLParams();

    const checkboxes = document.querySelectorAll('.reform-checkbox');
    checkboxes.forEach(cb => cb.checked = true);
  }

  getState() {
    return {
      selectedTypes: Array.from(this.selectedTypes),
      allTypes: this.allTypes
    };
  }
}
