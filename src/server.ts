import express from "express";
var cors = require('cors');
import compression from "compression";
import * as db from './data/data.json';


const data = (db as any).default;

const app: express.Express = express();

const chaos = (): Promise<void> => {

    const rand = Math.ceil(Math.random() * 3000);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.2) {
                resolve();
            } else {
                reject();
            }
        }, rand)
    });
}

app.use(compression());
app.use(cors());

const indexHtml = require('html-loader?attrs=false!templates/index.html')
    .match(/^module.exports = "(.*)";/i)[1].trim().replace(/\\"/g, '"');

app.get('/', (req, res) => {
    res.send(indexHtml);
});

app.get('/GetFullList', (req, res) => {
    chaos().then(
        () => res.json(data || {}),
        () => res.sendStatus(500)
    );
});

app.get('/GetGames', (req, res) => {
    const limit = Number(req.query.limit) ? (Number(req.query.limit)) > 50 ? 50 : (Number(req.query.limit)) : 10;
    const start = Number(req.query.start) || 0;
    let games: any[] = data.games || [];

    if (req.query.sort) {
        switch (req.query.sort) {
            case 'name':
                games = games.sort((a, b) => (a.Name.en > b.Name.en) ? 1 : -1);
                break;

            case 'id':
                games = games.sort((a, b) => (a.ID > b.ID) ? 1 : -1);
                break;
        }
    }

    if (req.query.order === 'desc') {
        games.reverse();
    }

    chaos().then(
        () => res.json(games.slice(start, start + limit)),
        () => res.sendStatus(500)
    );
});

app.get('/GetGamesCount', (req, res) => {
    chaos().then(
        () => res.json({count: data.games.length || 0}),
        () => res.sendStatus(500)
    );
})

app.get('/GetMerchants', (req, res) => {
    chaos().then(
        () => res.json(data.merchants || []),
        () => res.sendStatus(500)
    );
});

app.get('/GetCategories', (req, res) => {
    chaos().then(
        () => res.json(data.categories || []),
        () => res.sendStatus(500)
    );
});

app.get('/GetCountriesRestrictions', (req, res) => {
    chaos().then(
        () => res.json(data.countriesRestrictions || []),
        () => res.sendStatus(500)
    );
});

app.get('/GetMerchantsCurrencies', (req, res) => {
    chaos().then(
        () => res.json(data.merchantsCurrencies || []),
        () => res.sendStatus(500)
    );
});

app.listen(3000, () => {
    console.log('\nserver start at http://localhost:3000\n');
});
