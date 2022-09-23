import {fetch as tFetch, ResponseType} from '@tauri-apps/api/http';
import { writable, get } from 'svelte/store';

let postCache = writable([]);
export async function getPosts() {
    if (!get(postCache).length) {
        let res = await tFetch('https://blog.minetest.net/feed.rss', {
            method: 'GET',
            responseType: ResponseType.Text
        });

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(res.data, 'text/xml');

        const posts = Array.from(xmlDoc.getElementsByTagName('item'));

        const getTag = (root, name) => {
            let res = root.getElementsByTagName(name)[0];
            if (!res) {
                return {
                    textContent: '',
                    getAttribute: i => ''
                };
            }
            return res;
        };

        postCache.set(posts.map(post => {
            return {
                title: getTag(post, 'title').textContent,
                description: getTag(post, 'description').textContent.replaceAll('="/static', '="https://blog.minetest.net/static'),
                date: getTag(post, 'pubDate').textContent,
                link: getTag(post, 'link').textContent,
                image: getTag(post, 'enclosure').getAttribute('url')
            }
        }));
    }

    return get(postCache);
}
