import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Poll } from '../models/poll.model';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private baseUrl = 'http://localhost:8080/api/polls';

  private http = inject(HttpClient);

  getPolls(): Observable<Poll[]> {
    return this.http.get<Poll[]>(`${this.baseUrl}/all`);
  }

  createPoll(poll: Poll): Observable<Poll> {
    return this.http.post<Poll>(this.baseUrl, poll);
  }

  doVote(pollId: number, optionIndex: number): Observable<void> {
    const url = `${this.baseUrl}/vote`;
    return this.http.post<void>(url, { pollId, optionIndex });
  }

  deletePoll(pollId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${pollId}`);
  }

  // Save/unsave — handled client-side via SavedPollService until backend is ready.
  // TODO (backend): POST /api/polls/{id}/save  and  DELETE /api/polls/{id}/save

  /**
   * Returns polls that the authenticated user has saved.
   * TODO (backend): replace with GET /api/polls/saved
   * and remove the SavedPollService.snapshot filter in PollComponent.
   */
  getSavedPolls(_savedIds: Set<number>, allPolls: Poll[]): Poll[] {
    return allPolls.filter((p) => _savedIds.has(p.id));
  }
}
