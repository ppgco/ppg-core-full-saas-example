import webpush from "npm:web-push";

export function generateVAPIDKeys() {
  return webpush.generateVAPIDKeys();
}
