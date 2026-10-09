const STORAGE_KEY = "wa1paper-saved-wallpaper-folders";

export function readSavedWallpaperFolders() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  const folders = JSON.parse(saved);
  if (
    !Array.isArray(folders) ||
    folders.some((folder) =>
      !folder ||
      typeof folder.id !== "string" ||
      typeof folder.name !== "string" ||
      !Array.isArray(folder.items),
    )
  ) {
    throw new Error("Os dados das pastas salvas estão inválidos.");
  }

  return folders;
}

export function writeSavedWallpaperFolders(folders) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  window.dispatchEvent(new Event("wa1paper-saved-folders-updated"));
}
