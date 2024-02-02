const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

class AutoBuy {
    #profileData;
    #bonusData;
    #buyDataResponse;
    #canBuyData = true;
    #debugMode = false;

    constructor(localStorageData) {
        this.localStorageData = localStorageData;
    }
    async loadBrowser() {
        console.log('Membuka browser...');
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
        console.log('Memvalidasi kredensial...');
        let profileDataPromise = new Promise((resolve, reject) => {
            // Define the response handler function
            const responseHandler = async (response) => {
                if(response.request().method() !== 'OPTIONS'){
                    if (/\/api\/subscriber\/.*\/bonuses/.test(response.url())) {
                        try {
                            this.#bonusData = await response.json();
                        } catch (error) {
                            reject(error);
                        }
                    }
                    if (/\/api\/subscriber\/profile-balance/.test(response.url())) {
                        try {
                            this.#profileData = await response.json();
                        } catch (error) {
                            reject(error);
                        }
                    }
                }
                if(this.#bonusData && this.#profileData) {
                    this.page.off('response', responseHandler);
                    resolve();
                }
            };
        
            // Add the event listener
            this.page.on('response', responseHandler);
        
            // Set a maximum wait time of 10 seconds for the response of get bonuses data
            setTimeout(() => {
                if (!this.#bonusData && this.#profileData) {
                    this.page.off('response', responseHandler);
                    resolve();
                }
            }, 10000);
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
            console.log('Login gagal, silahkan cek ulang kredensial anda');
            return null;
        }
    
        await this.page.screenshot({path: 'screenshots/home.png'});
    
        // Return the profile data
        return true;
    }
    async buyData() {
        if(this.#debugMode) {
            this.page.on('response', async (response) => {
                // console.log(response.status(), response.url());
                const url = new URL(response.url());
                const method = response.request().method();
                const filename = `${Date.now()}${method}_${url.hostname}${url.pathname.replace(/\//g, '_')}`;
                // save all responses to file
                const contentType = response.headers()['content-type'];
                let content;
                if (method == 'GET' || method == 'POST') {  // Skip preflight requests
                    try {
                        if (contentType && contentType.includes('application/json')) {
                            content = JSON.stringify(await response.json(), null, 2);
                            fs.writeFile(path.join('logs', filename), content, (err) => {
                                if (err) throw err;
                            });
                        }
                        if (contentType && contentType.includes('text/html')) {
                            content = await response.text(); 
                            fs.writeFile(path.join('logs', filename), content, (err) => {
                                if (err) throw err;
                            });
                        }
                        
                    } catch (error) {
                        console.log('Error getting response body:', error);
                    }
                }
            });
            // Log all network requests
            this.page.on('request', request => {
                // console.log(request.method(), request.url());
            });
        }
        // await this.page.goto('https://my.telkomsel.com/app/package-details/5aed80cbabd9ad32e4d92aefea0f7660', {waitUntil: 'networkidle2'});
        await this.page.goto('https://my.telkomsel.com/app/package-details/76095f2e2b2e643090092ddf9eb25387', {waitUntil: 'networkidle2'});
        
        try {
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
            // const amount = parseInt(amountInfo.replace(/\D/g,''));
            // if(amount > this.#profileData.data.balance) {
            //     console.log('Pulsa anda tidak cukup');
            //     return false;
            // }
            await this.page.screenshot({path: 'screenshots/buyData.step.1.png'});
            console.log('Klik Beli');
            await this.page.waitForSelector('button[data-testid="btn"]');
            await Promise.all([
                this.page.click('button[data-testid="btn"]'),
                this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
            ]);

            await this.page.screenshot({path: 'screenshots/buyData.step.2.png'});

            const responseHandler = async (response) => {
                if(response.request().method() !== 'OPTIONS'){
                    // console.log(response.status(), response.url());
                    if (/\/api\/payment\/fulfillment/.test(response.url())) {
                        try {
                            this.#buyDataResponse = await response.json();
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
                if(this.#buyDataResponse) {
                    this.page.off('response', responseHandler);
                } 
            };
            // Add the event listener
            this.page.on('response', responseHandler);

            await this.page.waitForSelector('button[data-testid="actionButtonBtn"]');
            console.log('Klik Bayar');
            await this.page.click('button[data-testid="actionButtonBtn"]');
            await this.page.screenshot({path: 'screenshots/buyData.step.3.png'});
            
            let divExists = false;
            let buyDataResponseExists = false;
            let counter = 0;

            while (!divExists && !buyDataResponseExists && counter < 10) {
                divExists = await this.page.$('div[role="presentation"]') !== null;
                buyDataResponseExists = this.#buyDataResponse !== undefined;
                try {
                    const html = await this.page.content();
                    fs.writeFileSync(path.join('logs', `${Date.now()}_buyData.html`), html);
                    await this.page.screenshot({path: `screenshots/buyData_${counter}.png`});
                } catch (error) {
                    console.log(error);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));  // wait for 1 second before checking again
                counter++;
            }

            if (divExists) {
                console.log('Pembelian gagal');
                const dialogInfo = await this.page.evaluate(() => {
                    const title = document.querySelector('.PopupDialog__style__titleDialog').innerText;
                    const content = document.querySelector('.PopupDialog__style__contentDialog').innerText;
                    return [title, content];
                });
                console.log(dialogInfo);
                await this.page.screenshot({path: 'screenshots/buyData.failed.png'});
            } else if (buyDataResponseExists) {
                console.log('Pembelian berhasil');
                await this.page.screenshot({path: 'screenshots/buyData.success.png'});
            } else {
                console.log('Terjadi kesalahan');
                await this.page.screenshot({path: 'screenshots/buyData.unknown.png'});
            }
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
        if(await this.getProfileData()) {
            const profileData = this.#profileData;
            if(profileData.message === 'Success') {
                console.log('Login berhasil');
                console.log('Pulsa anda adalah', profileData.data.balance);
                console.log('Masa aktif kartu sampai', profileData.data.expiry_date);
            }
            const bonusData = this.#bonusData;
            if(bonusData.message === 'Success') {
                let bonusArray = bonusData.data.userBonuses.map((bonus) => {
                    let formattedClass = bonus.class.charAt(0).toUpperCase() + bonus.class.slice(1).toLowerCase();
                    let bonusList = bonus.bonusList.map((bonusItem) => {
                        if(bonusItem.name === 'Ilmupedia'){
                            this.#canBuyData = false;
                        }
                        return [
                            [
                                `Nama => ${bonusItem.name}`,
                                `Total Kuota => ${bonusItem.totalQuota}`,
                                `Sisa Kuota => ${bonusItem.remainingquota} (${bonus.unusedpercent}%)`
                            ]
                        ];
                    });
                    return bonusList.length > 0 ? `${formattedClass} => ${bonus.total} [ ${bonusList} ]` : `${formattedClass} => ${bonus.total}`;
                });
                
                console.log(JSON.stringify(bonusArray, null, 2));
            }
        }
        // await new Promise(resolve => setTimeout(resolve, 10000));  // wait for 1 second
        if(this.#canBuyData) {
            console.log('Anda bisa membeli paket data');
            await this.buyData();
        }else{
            console.log('Paket data anda masih aktif');
        }
        // console.log(profileData);
        await this.browser.close();
    }
}

const autobuy = new AutoBuy(fs.readFileSync('./src/config/localStorage.json', 'utf8'));
autobuy.run();