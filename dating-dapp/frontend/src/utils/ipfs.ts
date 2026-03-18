export async function storeProfile(profile) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return `Qm${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16)}`;
}
