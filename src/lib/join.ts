export const JOIN_EVENT = "volunsport:open-join";

export function openJoin() {
  window.dispatchEvent(new CustomEvent(JOIN_EVENT));
}
