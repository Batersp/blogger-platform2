export const Utils = {
  convertJwtDateToISO(date: number): string {
    return new Date(date * 1000).toISOString();
  },
};
