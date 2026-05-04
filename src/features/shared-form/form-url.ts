export const buildFormUrl = (
  activityId: string,
  txId: string,
  options?: { print?: boolean },
): string => {
  const url = new URL(`/form/${activityId}/${txId}`, window.location.origin)
  if (options?.print) {
    url.searchParams.set("print", "1")
  }
  return url.toString()
}
