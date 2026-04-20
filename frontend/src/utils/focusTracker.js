class FocusTracker {
  constructor() {
    this.tabSwitches = 0;
    this.score = 100;
    this.isTracking = false;

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      this.tabSwitches += 1;
      this.score = Math.max(this.score - 5, 0);
    }
  }

  start() {
    if (this.isTracking) return;

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.isTracking = true;
  }

  stop() {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.isTracking = false;
  }

  getData() {
    return {
      tabSwitches: this.tabSwitches,
      score: this.score
    };
  }

  reset() {
    this.tabSwitches = 0;
    this.score = 100;
  }
}

export default new FocusTracker();