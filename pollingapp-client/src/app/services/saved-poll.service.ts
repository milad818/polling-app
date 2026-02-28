import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SavedPollService {
  private readonly key = 'savedPolls';

  getSavedIds(): number[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) ?? '[]') as number[];
    } catch {
      return [];
    }
  }

  isSaved(pollId: number): boolean {
    return this.getSavedIds().includes(pollId);
  }

  toggle(pollId: number): void {
    const ids = this.getSavedIds();
    const idx = ids.indexOf(pollId);
    if (idx === -1) {
      ids.push(pollId);
    } else {
      ids.splice(idx, 1);
    }
    localStorage.setItem(this.key, JSON.stringify(ids));
  }
}
