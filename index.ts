import puppeteer from "puppeteer"
import Tesseract from "tesseract.js"
import fs from "fs"

const worker = Tesseract.createWorker();

(async () => {
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    await worker.setParameters({
        tessedit_char_whitelist: '0123456789'
    })


    let x = await puppeteer.launch();
    const browser = await x.createIncognitoBrowserContext();
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4356.0 Safari/537.36")
    await page.goto('https://cd.zu.anjuke.com/fangyuan/x1-p2/', { waitUntil: 'domcontentloaded' });
    let data= await page.evaluate(function(){
        let elements = document.querySelectorAll(".zu-itemmod")
        let res = []
        for(let element of elements){
            let str = element.querySelector("address.details-item")?.childNodes[2].nodeValue?.trim() || ""
            let [pre, local] = str.split(" ")
            let [qu, range] = pre.split("-")
            str = qu.replace("区", "") + "区" + local
            res.push(str)
        }
        return res.join("\n")
    })
    fs.writeFileSync("./location.txt", data, "utf-8")

    
    // let elements = await page.$$(".zu-itemmod")
    // let ua = await x.userAgent()
    // let i = 1
    // for(let element of elements){
    //     // let address = await element.$eval("address", node => node.textContent)
    //     // if(address == null) continue
    //     // address = address.replace(/\s+/g, " ").trim()
    //     // console.log(address, i++)
    //     let data= await element.evaluate(function(){
    //         let x = document.querySelectorAll(".zu-itemmod")
    //         console.log(x)
    //         return x.length
    //     })
    //     console.log(data)
        


    //     // let priceE = await element.$(".zu-side strong")
    //     // if(priceE == null) continue
    //     // console.log(await getElementNumber(priceE))
    //     // let sizeE = await element.$(".details-item.tag .strongbox:nth-of-type(3)")
    //     // if(sizeE == null) continue
    //     // console.log(await getElementNumber(sizeE))
    // }

    await browser.close();
    await worker.terminate();
})();

async function getElementNumber(element: puppeteer.ElementHandle){
    await element.screenshot({ path: 'hn.png' });
    const { data: { text } } = await worker.recognize('./hn.png')
    return text
}