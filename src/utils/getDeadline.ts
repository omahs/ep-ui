export const getDeadline = () => {
  const deadline = new Date()
  return Math.floor(deadline.getTime() / 1000.0) + 24 * 60 * 60
}
