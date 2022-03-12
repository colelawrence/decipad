// In the future, this can take a flag id as an arg
export function isEnabled(): boolean {
  return (
    'window' in global &&
    'location' in window &&
    /localhost|.*dev.decipad.com/.test(window.location.hostname)
  );
}
