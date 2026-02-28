export interface OptionVote {
  optText: string;
  voteCount: number;
}

export interface PollOwner {
  id: number;
  username: string;
  email: string;
}

export interface Poll {
  id: number;
  question: string;
  options: OptionVote[];
  owner?: PollOwner;
  createdAt?: string;
  /**
   * Backend-populated flag indicating whether the authenticated user has saved
   * this poll. The field will be present once the backend adds the
   * `user_saved_polls` join table and includes it in GET /api/polls/all and
   * GET /api/polls/{id} responses.
   *
   * Until then, SavedPollService manages this state client-side via localStorage.
   */
  savedByCurrentUser?: boolean;
}
