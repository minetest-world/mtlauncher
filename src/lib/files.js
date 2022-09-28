import { dirname, appDir, sep } from '@tauri-apps/api/path';
import { open } from "@tauri-apps/api/shell";

export async function openFolderForFile(file) {
    let dirToOpen = await dirname(file);
    await open(dirToOpen);
}

export async function fileName(file) {
    return file.split(sep).slice(-1);
}