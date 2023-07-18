import { Dataset, PlaywrightCrawler, ProxyConfiguration } from 'crawlee';

const startUrls = ['http://www.moscow-city.vybory.izbirkom.ru/region/izbirkom?action=show&root=772000018&tvd=4774020272853&vrn=100100225883172&prver=0&pronetvd=null&region=77&sub_region=77&type=242&report_mode=null'];

const crawler = new PlaywrightCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    async requestHandler({ page }) {
        let titleTable = page.locator('table').filter({hasText:'Наименование избирательной комиссии'});
        let resultsTable = page.locator('table').filter({ hasText: 'Число избирателей' });
        let resultRows = await resultsTable.locator('tr').all();
        let results = await Promise.all(resultRows.map(async (row) => {
            let cells = await row.locator('td').all();
            let cellTexts = cells.map(async (cell) => {
                return await cell.innerText();
            });
            return await Promise.all(cellTexts);
        }));

        console.log(results);
        Dataset.pushData({
            url: page.url(),
            title: await titleTable.innerText(),
            results,
        })
    },
});

await crawler.run(startUrls);
