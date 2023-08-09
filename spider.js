const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const os = require('os');

const allTracks = [];
const fileName = `results-${new Date().getTime()}.csv`;
const LOCATION_IN_URL_POSITION = 6;
const TRACKNAME_IN_URL_POSITION = 4;

function trackOldEditions() {
    request('https://thedevconf.com/tdc/2021/future/', (err, res, body) => {
        if (err) console.error('Error: ', err)

        const $ = cheerio.load(body);

        $('div#grade-online a').each((item, element) => {
            if (element)
                allTracks.push({
                    link: 'https://thedevconf.com' + element.attribs.href,
                    trackName: element.attribs.href.split('/')[4]
                })
        });

        //extra
        allTracks.push({
            link: 'https://thedevconf.com/tdc/2021/future/trilha-diversidade-e-acessibilidade',
            trackName: 'trilha-diversidade-e-acessibilidade'
        });
        allTracks.push({
            link: 'https://thedevconf.com/tdc/2021/future/trilha-carreira-e-mentoria',
            trackName: 'trilha-carreira-e-mentoria'
        });
        allTracks.push({link: 'https://thedevconf.com/tdc/2021/future/tdc4kids', trackName: 'tdc4kids'});
        parseTracks();
    });
}

function track2023Editions() {
    //const editions = ['https://thedevconf.com/tdc/2023/connections/belo-horizonte', 'https://thedevconf.com/tdc/2023/connections/recife']
    const editions = ['https://thedevconf.com/tdc/2023/business']


    editions.forEach((edition) => {
        request(edition, undefined, (err, res, body) => {
            if (err) console.error('Error: ', err)

            const $ = cheerio.load(body);

            $('div#grade-basic a').each((_item, element) => {
                if (element && !element.href?.indexOf('trilhas-de-patrocinadores')) {
                    allTracks.push({
                        link: 'https://thedevconf.com' + element.attribs.href,
                        trackName: element.attribs.href.split('/')[TRACKNAME_IN_URL_POSITION],
                        location: edition.split('/')[LOCATION_IN_URL_POSITION]
                    });
                }
            });
            $('div#grade-premium a').each((_item, element) => {
                if (element && !element.href?.indexOf('trilhas-de-patrocinadores')) {
                    allTracks.push({
                        link: 'https://thedevconf.com' + element.attribs.href,
                        trackName: element.attribs.href.split('/')[TRACKNAME_IN_URL_POSITION],
                        location: edition.split('/')[LOCATION_IN_URL_POSITION]
                    });
                }
            });
            parseTracks();
        });
    });
}

function parseTracks() {
    allTracks.forEach((track) => {
        request(track.link, (err, res, body) => {
            if (err) {
                console.error('Error: ', err);
            }

            const $ = cheerio.load(body);

            $('div.modal.fade').each((_item, element) => {
                if (element) {
                    const name = $(element).find('a.nome');
                    const enterprise = $(element).find('small span');

                    if (name.length && enterprise.length) {
                        //console.log(`${name[0].firstChild.data.trim()},${enterprise[0].firstChild.data.trim()},${track.trackName},${track.location}`);
                        fs.appendFile(fileName, `${name[0].firstChild.data.trim()},${enterprise[0].firstChild.data.trim()},${track.trackName},${track.location}${os.EOL}`,
                            csvErr => {
                                if (csvErr) {
                                    console.error(err);
                                }
                            });
                    }
                }
            });
        });
    });
}

track2023Editions();
