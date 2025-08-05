import cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { ISearchedMoviesOrSeries } from '@/types';

/**
 * Scrape searched movies or series
 * @param {Request} req
 * @param {AxiosResponse} res
 * @returns {Promise.<ISearchedMoviesOrSeries[]>} array of movies or series
 */
export const scrapeSearchedMoviesOrSeries = async (
    req: Request,
    res: AxiosResponse
): Promise<ISearchedMoviesOrSeries[]> => {
    const $: cheerio.Root = cheerio.load(res.data);
    const payload: ISearchedMoviesOrSeries[] = [];
    const {
        headers: { host },
        protocol,
    } = req;

    $('div.search-wrapper > div.search-item').each((i, el) => {
        const content: cheerio.Cheerio = $(el).find('div.search-content');
        const obj = {} as ISearchedMoviesOrSeries;

        let type: 'movies' | 'series' = 'movies';

        const hrefAttr = $(content).find('h3 > a').attr('href');
        const movieId = hrefAttr ? hrefAttr.replace(/^\/+|\/+$/g, '') : '';

        obj['_id'] = movieId;

        obj['title'] = $(content).find('h3 > a').text();
        obj['type'] = type;

        obj['posterImg'] = `https://${$(el)
            .find('figure > a > img')
            .last()
            .attr('src')}`;
        obj['url'] = `${protocol}://${host}/${type}/${movieId}`;
        obj['genres'] = [];

        /* eslint-disable */
        $(content)
            .find('p')
            .each((i, el2) => {
                switch ($(el2).find('strong').text().toLowerCase()) {
                    case 'genres:':
                        $(el2).find('strong').remove();
                        obj['genres'] = $(el2).text().trim().split(', ');
                        break;
                    case 'sutradara:':
                        $(el2).find('strong').remove();
                        obj['directors'] = $(el2).text().trim().split(', ');
                        break;
                    case 'bintang:':
                        $(el2).find('strong').remove();
                        obj['casts'] = $(el2).text().trim().split(', ');
                        break;
                    default:
                        break;
                }
            });
        /* eslint-enable */

        payload.push(obj);
    });

    return payload;
};
