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
}
