import { BaseDirectory, readDir, createDir } from "@tauri-apps/api/fs";

export async function getScreenshots(version) {
    try {
        let entries = await readDir(`versions/${version}/screenshots`, {
            dir: BaseDirectory.App,
            recursive: false
        });
        return entries.sort((a,b) => a.lastModified - b.lastModified);
    }
    catch {
        await createDir(`versions/${version}/screenshots`, {
            dir: BaseDirectory.App,
            recursive: false
        });
        return [];
    }
} 