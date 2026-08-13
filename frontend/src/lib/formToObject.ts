export function formToObject(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries());
}
