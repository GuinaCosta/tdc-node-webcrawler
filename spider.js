const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const os = require('os');

const allTracks = [];

request('https://thedevconf.com/tdc/2021/future/', (err, res, body) => {
        if (err) console.error('Error: ', err)

        const $ = cheerio.load(body);

        $('div#grade-online a').each((item, element) => {
            if (element)
                allTracks.push({ link: 'https://thedevconf.com' + element.attribs.href, trackName: element.attribs.href.split('/')[4]})
        });

        //extra
        allTracks.push({ link: 'https://thedevconf.com/tdc/2021/future/trilha-diversidade-e-acessibilidade', trackName: 'trilha-diversidade-e-acessibilidade'});
        allTracks.push({ link: 'https://thedevconf.com/tdc/2021/future/trilha-carreira-e-mentoria', trackName: 'trilha-carreira-e-mentoria'});
        allTracks.push({ link: 'https://thedevconf.com/tdc/2021/future/tdc4kids', trackName: 'tdc4kids'});
        parseTracks();
    });

function parseTracks() {
    allTracks.forEach((track) => {
        request(track.link, (err, res, body) => {
            if (err) console.error('Error: ', err)

            const $ = cheerio.load(body);

            $('div.modal.fade').each((item, element) => {
                if (element) {
                    let name = $(element).find('a.nome');
                    let enterprise = $(element).find('small span');

                    if (name.length && enterprise.length) {
                        console.log(name[0].firstChild.data.trim() + ',' + enterprise[0].firstChild.data.trim() + ',' + track.trackName);
                        fs.appendFile('results.csv', `${name[0].firstChild.data.trim()},${enterprise[0].firstChild.data.trim()},${track.trackName}${os.EOL}`,
                            (err) => {
                                if (err) console.error(err);
                            });
                    }
                }
            });
        })
    });
}
