// date-range-selector.js - Date range filtering with URL params persistence

export class DateRangeSelector {
  constructor() {
    this.minDate = '2015-01';
    this.maxDate = '2024-12';
    this.startDate = null;
    this.endDate = null;
    this.onChange = null;

    this.initFromURLParams();
  }

  initFromURLParams() {
    const params = new URLSearchParams(window.location.search);
    this.startDate = params.get('startDate') || this.minDate;
    this.endDate = params.get('endDate') || this.maxDate;
  }

  updateURLParams() {
    const params = new URLSearchParams(window.location.search);

    if (this.startDate && this.startDate !== this.minDate) {
      params.set('startDate', this.startDate);
    } else {
      params.delete('startDate');
    }

    if (this.endDate && this.endDate !== this.maxDate) {
      params.set('endDate', this.endDate);
    } else {
      params.delete('endDate');
    }

    const newURL = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newURL);
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="date-range-wrapper">
        <label for="startDateInput" class="date-label">Start date:</label>
        <input
          type="month"
          id="startDateInput"
          class="date-input"
          min="${this.minDate}"
          max="${this.maxDate}"
          value="${this.startDate}"
        />

        <label for="endDateInput" class="date-label">End date:</label>
        <input
          type="month"
          id="endDateInput"
          class="date-input"
          min="${this.minDate}"
          max="${this.maxDate}"
          value="${this.endDate}"
        />
      </div>
    `;

    // Event listeners
    const startInput = document.getElementById('startDateInput');
    const endInput = document.getElementById('endDateInput');

    startInput.addEventListener('change', (e) => {
      this.startDate = e.target.value;
      this.updateURLParams();
      if (this.onChange) this.onChange();
    });

    endInput.addEventListener('change', (e) => {
      this.endDate = e.target.value;
      this.updateURLParams();
      if (this.onChange) this.onChange();
    });
  }

  filterData(data) {
    if (!this.startDate && !this.endDate) return data;

    const start = this.startDate ? new Date(this.startDate + '-01') : new Date('2015-01-01');
    const end = this.endDate ? new Date(this.endDate + '-01') : new Date('2024-12-31');

    // Set end to last day of month
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);

    return data.filter(d => {
      if (!d.effective_date) return true;
      const date = new Date(d.effective_date);
      return date >= start && date <= end;
    });
  }

  reset() {
    this.startDate = this.minDate;
    this.endDate = this.maxDate;
    this.updateURLParams();

    const startInput = document.getElementById('startDateInput');
    const endInput = document.getElementById('endDateInput');
    if (startInput) startInput.value = this.startDate;
    if (endInput) endInput.value = this.endDate;
  }

  getState() {
    return {
      startDate: this.startDate,
      endDate: this.endDate
    };
  }
}
