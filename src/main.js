const fs = require('fs');
const puppeteer = require('puppeteer');

class AutoBuy {
    #profileData;

    constructor(localStorageData) {
        this.localStorageData = localStorageData;
    }
    async loadBrowser() {
        this.browser = await puppeteer.launch({
            args: [
                '--enable-features=NetworkService',
                '--disable-web-security'
            ],
            devtools: true,
            ignoreHTTPSErrors: true,
            headless: "new"
        });
        this.page = await this.browser.newPage();
        await this.page.emulate(puppeteer.devices['Galaxy S9+']);
    }
    async loadAuth() {
        await this.page.goto('https://my.telkomsel.com/'); // must load first before set localStorage
        const localStorageData = this.localStorageData
        // Set localStorage data
        await this.page.evaluate((localStorageData) => {
            localStorage.clear();
            for (let key in localStorageData) {
                console.log(key);
                localStorage.setItem(key, localStorageData[key]);
            }
        }, JSON.parse(localStorageData));
    }
    async getProfileData() {
        let profileDataPromise = new Promise((resolve, reject) => {
            // Wait for the response from the specific URL
            this.page.on('response', async (response) => {
                // console.log(response.status(), response.url());
                if (response.url() === 'https://tdw.telkomsel.com/api/subscriber/profile-balance' && response.request().method() !== 'OPTIONS') {
                    try {
                        this.#profileData = await response.json();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
        
        // Log all network requests
        this.page.on('request', request => {
            // console.log(request.method(), request.url());
        });
        await this.page.goto('https://my.telkomsel.com/web');
        
        try {
            // Wait for the URL to change or for the response from the specific URL
            await Promise.race([
                profileDataPromise,
                this.page.waitForFunction(() => {
                    const urls = ['https://my.telkomsel.com/login/web', 'https://www.telkomsel.com/shops/onelink/general'];
                    return urls.some(url => window.location.href.includes(url));
                }, { timeout: 5000 })  // wait for up to 5 seconds
            ]);
        } catch (error) {
            console.log('Something went wrong')
            console.log(error);
            await this.page.screenshot({path: 'screenshots/error.png'});
            return null;
        }
    
        // Check if the current URL is one of the target URLs
        const urls = ['https://my.telkomsel.com/login/web', 'https://www.telkomsel.com/shops/onelink/general'];
        if (urls.some(url => this.page.url().includes(url))) {
            console.log('Credentials are invalid')
            return null;
        }
    
        await this.page.screenshot({path: 'screenshots/home.png'});
    
        // Return the profile data
        return this.#profileData;
    }
    async buyData() {
        await this.page.goto('https://my.telkomsel.com/app/package-details/76095f2e2b2e643090092ddf9eb25387', {waitUntil: 'networkidle2'});
        try {
            // await this.page.waitForSelector('button[data-testid="btn"]:contains("Beli")', { timeout: 5000 }); // wait for up to 5 seconds
            // await this.page.click('button[data-testid="btn"]:contains("Beli")');
            // await this.page.evaluate(() => {
            //     document.querySelector('button[data-testid="btn"]:contains("Beli")').click();
            // });
            const packageInfo = await this.page.evaluate(() => {
                const packageElements = Array.from(document.querySelectorAll('.QuotaDetail__style__packageBonuses'));
                
                const details = packageElements.map(element => {
                    const itemNameElement = element.querySelector('.QuotaDetail__style__itemName');
                    const quotaTextElement = element.querySelector('.QuotaDetail__style__quotaText');
            
                    return {
                        itemName: itemNameElement ? itemNameElement.textContent : null,
                        quotaText: quotaTextElement ? quotaTextElement.textContent : null,
                    };
                });
            
                return details;
            });
            
            console.log(packageInfo);

            const amountInfo = await this.page.evaluate(() => {
                const amountElement = document.querySelector('.MobileView__style__amount strong');
                return amountElement ? amountElement.textContent : null;
            });
            
            console.log("Harga :", amountInfo);
            // convert to number
            const amount = parseInt(amountInfo.replace(/\D/g,''));
            // if(amount > this.#profileData.data.balance) {
            //     console.log('Pulsa anda tidak cukup');
            //     return false;
            // }
            async function click(selector, page) {
                let element = null;
                let attempts = 0;
            
                while (!element && attempts < 10) {
                    element = await page.$(selector);
                    if (!element) {
                        await page.waitForTimeout(1000);  // wait for 1 second
                        attempts++;
                    }
                }
            
                if (element) {
                    await element.click();
                } else {
                    console.log('The element did not appear within 10 seconds.');
                }
            }
            
            await click('button[data-testid="btn"]', this.page);
            console.log('Klik Beli');
            await click('button[data-testid="actionButtonBtn"]', this.page);
            console.log('Klik Bayar');
            
            await this.page.screenshot({path: 'screenshots/buyData.png'});

            console.log('Cek Tangkapan Layar');

        } catch (error) {
            console.log('Something went wrong')
            console.log(error);
            await this.page.screenshot({path: 'screenshots/buyData.error.png'});
            return null;
        }
    }
    async run() {
        await this.loadBrowser();
        await this.loadAuth();
        const profileData = await this.getProfileData();
        if(profileData) {
            if(profileData.message === 'Success') {
                console.log('Login berhasil');
                console.log('Pulsa anda adalah', profileData.data.balance);
                console.log('Masa aktif kartu sampai', profileData.data.expiry_date);
                await this.buyData();
            }
        }
        // console.log(profileData);
        await this.browser.close();
    }
}

const autobuy = new AutoBuy(fs.readFileSync('./src/config/localStorage.json', 'utf8'));
autobuy.run();


async function run() {
    const browser = await puppeteer.launch({
        args: [
            '--enable-features=NetworkService',
            '--disable-web-security'
        ],
        ignoreHTTPSErrors: true,
        headless: true
    });
    const page = await browser.newPage();
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537');

    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://my.telkomsel.com/');
    const localStorageData = fs.readFileSync('./src/config/localStorage.json', 'utf8');
    // console.log(JSON.parse(localStorageData));
    // Set localStorage data
    await page.evaluate((localStorageData) => {
        localStorage.clear();
        for (let key in localStorageData) {
            console.log(key);
            localStorage.setItem(key, localStorageData[key]);
        }
    }, JSON.parse(localStorageData));

    

    // Log all network requests
    page.on('request', request => {
        console.log('Request URL:', request.url());
    });

    let profileData;

    // Wait for the response from the specific URL
    page.on('response', async (response) => {
        if (response.url() === 'https://tdw.telkomsel.com/api/attributes/getprofile') {
            profileData = await response.json();
            console.log('Profile data:', profileData);
        }
    });
    await page.goto('https://my.telkomsel.com/app/my-account/user-profile');
    try {
        await page.waitForResponse(response => response.url() === 'https://tdw.telkomsel.com/api/attributes/getprofile');
    } catch (error) {
        
    }
    await page.screenshot({path: 'profile.png'});


    // await page.goto('https://my.telkomsel.com/app/package-details/6a8c0352f7063c8d5294ae06b0c67777?campaignId=CAM_983250&campaignTrackingId=CAM_983250');
    // await page.screenshot({path: 'package.png'});
    // Get localStorage data
    const data = await page.evaluate(() => {
        let json = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            json[key] = localStorage.getItem(key);
        }
        return json;
    });

    // console.log(data);

    // await page.screenshot({path: 'screenshot.png'});
    await browser.close();
}
