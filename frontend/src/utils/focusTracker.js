class FocusTracker {
  constructor() {
    this.tabSwitches = 0;
    this.score = 100;
    this.isTracking = false;

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      this.tabSwitches += 1;
      this.score = Math.max(this.score - 5, 0);
    }
  }

  handleBlur() {
    if (this.recoveryInterval) clearInterval(this.recoveryInterval);
    // Only count as switch if visibility didn't already catch it
    this.score = Math.max(this.score - 2, 0);
  }

  handleFocus() {
    // Start a timer to recover score if stayed focused
    if (this.recoveryInterval) clearInterval(this.recoveryInterval);
    this.recoveryInterval = setInterval(() => {
      if (this.score < 100) {
        this.score = Math.min(this.score + 1, 100);
      }
    }, 60000); // +1% every minute of focus
  }


  ///uu

  start() {
    if (this.isTracking) return;

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("focus", this.handleFocus);
    this.isTracking = true;
  }

  stop() {
    if (this.recoveryInterval) clearInterval(this.recoveryInterval);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("focus", this.handleFocus);
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