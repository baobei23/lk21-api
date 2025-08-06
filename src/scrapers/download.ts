import axios from 'axios';
import cheerio from 'cheerio';
import { Request } from 'express';
import { IDownloads } from '@/types';
import { AxiosResponse } from 'axios';

/**
 * Scrape downloads asynchronously
 * @param {Request} ExpressRequest
 * @param {AxiosResponse} AxiosResponse
 * @returns {Promise.<IDownloads[]>} array of Downloads objects
 */
export const scrapeDownloads = async (
    req: Request,
    res: AxiosResponse
): Promise<IDownloads[]> => {
    const $: cheerio.Root = cheerio.load(res.data);

    let downloads: IDownloads[] = [];

    $('tbody > tr').each(function (i, el) {
        let server = $(el).find('strong').text()!;
        let link = $(el).find('a').attr('href')!;
        //@ts-ignore
        let quality = $(el).find('a').attr('class').substring(9, 13);
        downloads.push({
            server,
            link,
            quality,
        });
    });

    return downloads;
};

/**
 * Scrape getCookie asynchronously
 * @param {id} string
 */
export const getCookie = async (url:string): Promise<string> => {
	const res = await fetch(url, {
		method: "GET",
		redirect: "follow",
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
		},
	});

	if (!res.headers.get("set-cookie")) {
		throw new Error("failed get cookie");
	}

	const cookie = res.headers.get("set-cookie")!.split(";")[0];
	return cookie;
};
