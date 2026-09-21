export class MyStatisticViewDto {
  sumScore: number;
  avgScores: number; // округляется, обычно до сотых
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
}
