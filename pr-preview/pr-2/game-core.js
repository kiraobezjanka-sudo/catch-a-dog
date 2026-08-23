export class CatchDachshundGame {
  constructor({ durationMs = 30_000 } = {}) {
    this.durationMs = durationMs;
    this.status = "idle";
    this.score = 0;
    this.endsAt = null;
    this.remainingMs = durationMs;
  }

  start(now = 0) {
    this.status = "running";
    this.score = 0;
    this.remainingMs = this.durationMs;
    this.endsAt = now + this.durationMs;
    return this.snapshot(now);
  }

  tick(now = 0) {
    if (this.status === "running" && now >= this.endsAt) {
      this.remainingMs = 0;
      this.status = "finished";
    }
    return this.snapshot(now);
  }

  catch(now = 0) {
    this.tick(now);
    if (this.status !== "running") return false;
    this.score += 1;
    return true;
  }

  pause(now = 0) {
    if (this.status !== "running") return false;
    this.remainingMs = Math.max(0, this.endsAt - now);
    if (this.remainingMs === 0) {
      this.status = "finished";
      return false;
    }
    this.status = "paused";
    this.endsAt = null;
    return true;
  }

  resume(now = 0) {
    if (this.status !== "paused" || this.remainingMs <= 0) return false;
    this.status = "running";
    this.endsAt = now + this.remainingMs;
    return true;
  }

  getRemainingMs(now = 0) {
    if (this.status === "running") return Math.max(0, this.endsAt - now);
    if (this.status === "finished") return 0;
    return this.remainingMs;
  }

  snapshot(now = 0) {
    const remainingMs = this.getRemainingMs(now);
    return {
      status: this.status,
      score: this.score,
      remainingMs,
      seconds: Math.ceil(remainingMs / 1000),
    };
  }
}

