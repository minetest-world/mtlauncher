import { fileBackedStore } from '$lib/preferences';

const KV_REGEX = /\s+(?<key>[a-z_]+)\s?=\s?(?<val>.*)/;

export const CONFIG_NODES = {
    'mouse_sensitivity': {
        description: 'The sensitivity of your mouse. Higher = faster mouse movements',
        type: 'float',
        min: 0.001,
        max: 10
    },
    'invert_mouse': {
        description: 'Invert vertical mouse movement',
        type: 'bool'
    }
};

let configCache = false;
export async function getConfig() {
    if (!configCache) {
        configCache = await fileBackedStore('core.conf', {
            mouse_sensitivity: 0.2
        }, (content) => parseConfigFile(content), (content) => writeConfigFile(content));
    }

    return configCache;
}

// file backed store funcs
export function parseConfigFile(data) {
    let res = {};

    let lines = data.split(/\r?\n/);
    for (const line of lines) {
        const parsed = KV_REGEX.exec(line);
        if (parsed !== null) {
            const { groups: { key, value }} = parsed;
            if (CONFIG_NODES.hasOwnProperty(key)) {
                res[key] = parseField(key, value);
            }
        }
    }

    return res;
}

function parseField(key, value) {
    let type = CONFIG_NODES[key]?.type || 'string';
    switch (type) {
        case 'string':
        default:
            return value;

        case 'float':
            return parseFloat(value);

        case 'int':
            return parseInt(value);
    }
}

export async function writeConfigFile(data) {
    let keys = Object.keys(data);
    let res = `# mtlauncher general config\n# this gets copied as a "local" config when launching a game version\n# if you edit this file manually, restart mtlauncher!\n\n`;
    if (!keys.length) return res;

    for (const key of keys) {
        res += `${key} = ${String(data[key])}\n`;
    }
    return res;
}