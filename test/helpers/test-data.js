export const createRecipients = (count) => {
  return Array.from({ length: count }, (_, i) => `test${i}@example.com`)
}
