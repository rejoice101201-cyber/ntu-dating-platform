const HIGH_SCORE_KEY = 'pacman-high-score';

export class HighScoreManager {
  static getHighScore(): number {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  static setHighScore(score: number): boolean {
    try {
      const current = this.getHighScore();
      if (score > current) {
        localStorage.setItem(HIGH_SCORE_KEY, String(score));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}


