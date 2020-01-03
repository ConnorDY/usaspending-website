const fs = require('fs');
const axios = require('axios');
const path = require('path');

const Routes = require('../containers/router/RouterRoutes.js').routes;

// 1. get routes from router
// 2. get routes from api (w/ ids)
// 2a. all agencies
// 2b. all federal accounts
// 2c. all states
// 2d. x # of recipients?
// 2e. x # of awards?

const xmlStart = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

const urls = [
    {
        name: 'state',
        url: 'https://api.usaspending.gov/api/v2/recipient/state/',
        method: 'get',
        accessor: 'fips',
        clientRoute: 'https://www.usaspending.gov/#/state'
    },
    {
        name: 'agency',
        url: 'https://api.usaspending.gov/api/v2/references/toptier_agencies/',
        method: 'get',
        accessor: 'agency_id',
        clientRoute: 'https://www.usaspending.gov/#/agency'
    },
    {
        name: 'federal_account',
        url: 'https://api.usaspending.gov/api/v2/federal_accounts/',
        method: 'post',
        accessor: 'account_number',
        requestObject: {
            sort: { field: "budgetary_resources", direction: "desc" },
            page: 1,
            limit: 50,
            filters: { fy: "2019" }
        },
        clientRoute: 'https://www.usaspending.gov/#/federal_account'
    }
];

const xmlEnd = `</urlset>`;

const getBigStringOfXML = (xml, data, previousUrl) => {
    if (!data) return '';
    console.log("previousUrl", previousUrl.name);
    const { accessor, clientRoute } = previousUrl;
    return data.reduce((str, apiPayloadItem) => {
        return `${str}<url><loc>${clientRoute}/${apiPayloadItem[accessor]}</loc></url>`;
    }, xml);
};

const writeXMLFile = (xmlRoutes) => {
    fs.writeFile(
        path.resolve(__dirname, '../../../sitemap.xml'),
        `${xmlStart}${xmlRoutes}${xmlEnd}`,
        () => {
            console.log("Sitemap successfully created!");
        });
};

const buildRouteString = () => {
    let xml = '';
    const result = urls.reduce((previousPromise, url, i, arr) => {
        return previousPromise
            .then((resp) => {
                if (resp !== 'first') {
                    // use previous item in array as the source of truth for traversing the previousPromises' response
                    const previousUrl = arr[i - 1];
                    const results = resp.data.results || resp.data;
                    xml = getBigStringOfXML(xml, results, previousUrl);
                }
                return axios({
                    method: url.method,
                    data: url.requestObject || null,
                    url: url.url
                });
        })
        .catch((e) => console.log("e", e));
    }, Promise.resolve('first'));

    result.then((resp) => {
        // Once the final promise resolves, we can add it to our xml string and then write the file.
        const previousUrl = urls[urls.length -1];
        const { results } = resp.data;
        xml = getBigStringOfXML(xml, results, previousUrl);
        writeXMLFile(xml);
    });
};

buildRouteString();
