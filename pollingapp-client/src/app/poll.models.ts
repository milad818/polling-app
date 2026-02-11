export interface OptionVote {
  opt: string,
  votes: number
}

export interface Poll {
  id: number,
  question: string,
  options: OptionVote[],
}
