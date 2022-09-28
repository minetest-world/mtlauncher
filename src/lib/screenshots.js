import { BaseDirectory, readDir, createDir } from "@tauri-apps/api/fs";
import { getInstalledVersions } from '$lib/api/versions';

export async function getScreenshots(version=null) {
    let screenshots = [];
    if(version != null) {
        try {
            screenshots = await readDir(`versions/${version}/screenshots`, {
                dir: BaseDirectory.App,
                recursive: false
            });
        }
        catch {
            await createDir(`versions/${version}/screenshots`, {
                dir: BaseDirectory.App,
                recursive: false
            });
            return [];
        }
    } else {
        let versions = await getInstalledVersions();
        for (let i in versions) 
            screenshots = screenshots.concat(await getScreenshots(versions[i]));
    }
    return screenshots.sort((a,b) => a.lastModified - b.lastModified);
} 
