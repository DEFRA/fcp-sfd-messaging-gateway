export const normalizeIntoArray = (recipients) => {
  return Array.isArray(recipients) ? recipients : [recipients]
}