import puppeteer from "puppeteer"
import Tesseract from "tesseract.js"

const worker = Tesseract.createWorker();

(async () => {
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')


    let x = await puppeteer.launch();
    const browser = await x.createIncognitoBrowserContext();
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4356.0 Safari/537.36")
    await page.goto('https://cd.zu.anjuke.com/fangyuan/x1-p2/', { waitUntil: 'domcontentloaded' });
    
    let elements = await page.$$(".zu-itemmod")
    let ua = await x.userAgent()
    let i = 1
    for(let element of elements){
        let address = await element.$eval("address", node => node.textContent)
        if(address == null) continue
        address = address.replace(/\s+/g, " ").trim()
        console.log(address, i++)

        let priceE = await element.$(".zu-side strong")
        if(priceE == null) continue

        await priceE.screenshot({ path: 'hn.png' });
        
        const { data: { text } } = await worker.recognize('./hn.png');
        console.log(text);
    }

    await browser.close();
    await worker.terminate();
})();