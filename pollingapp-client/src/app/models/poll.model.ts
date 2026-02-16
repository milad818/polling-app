export interface OptionVote {
  optText: string,
  voteCount: number
}

export interface Poll {
  id: number,
  question: string,
  options: OptionVote[],
}
