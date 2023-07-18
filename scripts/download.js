const https = require('https'); // or 'https' for https:// URLs
const http = require('http');
const fs = require('fs');

const [,,fontFamily, variant] = process.argv

https.get(`https://www.googleapis.com/webfonts/v1/webfonts?family=${fontFamily}&key=${process.env.API_KEY}`,(res) => {
    let body = "";

    res.on("data", (chunk) => {
        body += chunk;
    });

    res.on("end", () => {
        try {
            let json = JSON.parse(body);
            if(json.error != null) {
                console.error(json.error)
                return
            }
            const [,url] = Object.entries(json.items[0].files).find(([name]) => name.toLocaleLowerCase() === variant.toLocaleLowerCase())
            download(url)
        } catch (error) {
            console.error("fetch font families", fontFamily, error.message);
        };
    });

}).on("error", (error) => {
    console.error("fetch font families", fontFamily, error.message);
});

function download(url) {
    try {
        const file = fs.createWriteStream(`font.ttf`);
        (url.startsWith("https") ? https : http).get(url, (response) => {
            response.pipe(file);
            
            // after download completed close filestream
            file.on("finish", () => {
                file.close();
            });
        }).on("error", (error) => {
            console.error("download", url, error.message);
        });
    } catch (error) {
        console.error("download", url, error.message);
    };
}
