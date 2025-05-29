export const normaliseIntoArray = (recipients) => {
  return Array.isArray(recipients) ? recipients : [recipients]
}
