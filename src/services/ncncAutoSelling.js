const axios = require("axios");
const _ = require("lodash");
const path = require("path");
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const { Regist, RegistHistory } = require("../models");
const ncncService = require("./ncnc");
const config = require("./config");

class AutoSelling {
  constructor() {
    this.chromeUserData = path.join(process.cwd(), "user-data");
    this.init();

    //
  }

  async init() {
    const options = new chrome.Options();
    options.addArguments("--no-sandbox");
    options.addArguments("--headless=new");
    options.addArguments("--disable-gpu");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments(`--user-data-dir=${this.chromeUserData}`);

    options.setUserPreferences({
      mobileEmulation: { deviceName: "Pixel 7" },
      detach: true
    });

    options.excludeSwitches(["enable-automation"]);

    try {
      this.driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
      await this.driver.get("https://ncnc.app/sell/wait-confirmed");

      const buttonLocator = By.css(
        'button[data-cy="sell-wait-confirm-sell-button"]'
      );

      await this.driver.wait(until.elementLocated(buttonLocator), 3000);

      setInterval(async () => {
        // eslint-disable-next-line no-use-before-define
        await autoSelling.checkStatus();
      }, 1000);
    } catch (e) {
        console.dir(e);
      await this.driver.quit();
      console.dir("chromedriver 실행실패");
      process.exit(1);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getCurrentTime() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }

  // eslint-disable-next-line class-methods-use-this
  delay(ms) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkStatus() {
    let items = await Regist.find({});
    items = JSON.parse(JSON.stringify(items));

    if (_.isEmpty(items)) {
      return;
    }

    for (const _item of items) {
      const result = await ncncService.getItemStatus(
        _item.brand_id,
        _item.item_id
      );
      if (!_.isEmpty(result)) {
        const price = _.get(result, "askingPrice");
        const isBlock = _.get(result, "isBlock");
        const isRefuse = _.get(result, "isRefuse");
        if (isBlock === 0 && isRefuse === 0 && _item.price <= price) {
          let getTime = this.getCurrentTime();
          const noticeText = `[${getTime}] ${_item.brand_name} ${_item.item_name}(${result.askingPrice})`;
          axios.post(
            `https://api.telegram.org/bot${_.get(
              config,
              "telegram_api_key"
            )}/sendMessage`,
            {
              chat_id: _.get(config, "telegram_chat_id"),
              text: `${noticeText} 매입중`
            }
          );

          // 매입중이라면 연결되어있는 크롬 드라이버에 매입 프로세스
          await this.driver.get("https://ncnc.app/sell/wait-confirmed");

          // 쿠폰 판매하기 버튼
          const buttonLocator = By.css(
            'button[data-cy="sell-wait-confirm-sell-button"]'
          );
          const button = await this.driver.findElement(buttonLocator);
          await button.click();
          console.dir("판매하기 버튼");

          // 카테고리 선택
          const categoryLocator = By.xpath(
            `//div[text()='${_item.category_name}']`
          );
          await this.driver.wait(until.elementLocated(categoryLocator), 2000);
          const categoryElement =
            await this.driver.findElement(categoryLocator);
          if (categoryElement) {
            await categoryElement.click();
            console.dir("카테고리 버튼");
          }

          // 브랜드 선택
          const brandLocator = By.xpath(`//div[text()='${_item.brand_name}']`);
          await this.driver.wait(until.elementLocated(brandLocator), 2000);
          const brandElement = await this.driver.findElement(brandLocator);
          if (brandElement) {
            await brandElement.click();
            console.dir("브랜드 버튼");
          }

          // 아이템 검색
          const inputLocator = By.css(
            'input[data-cy="upload-con-search-input"]'
          );
          const inputElement = await this.driver.findElement(inputLocator);
          await inputElement.sendKeys(_item.item_name);
          console.dir("아이템 검색 입력");

          await this.delay(1000);
          // 아이템 선택
          const itemLocator = By.xpath(
            `//div[@id='conItme-name' and text()='${_item.item_name}']`
          );
          await this.driver.wait(until.elementLocated(itemLocator), 10000);
          const itemElement = await this.driver.findElement(itemLocator);
          await this.driver.wait(until.elementIsVisible(itemElement), 10000);
          await itemElement.click();
          console.dir("아이템 클릭");

          // 약관 체크
          const termCheckLocator = By.id("termCheck");
          await this.driver.wait(until.elementLocated(termCheckLocator), 10000);
          const checkbox = await this.driver.findElement(termCheckLocator);
          const isChecked = await checkbox.isSelected();
          console.dir(isChecked);
          if (!isChecked) {
            await this.driver.executeScript("arguments[0].click();", checkbox);
            console.dir("약관 동의");
          }

          // 로컬 이미지 경로 만들어서 올리기
          const itemPaths = [];
          for (const _path of _item.image_path) {
            // console.dir(_path);
            itemPaths.push(path.join(process.cwd(), "public", "images", _path));
          }

          const fileInputLocator = By.css('input[type="file"][multiple]');
          const fileInput = await this.driver.findElement(fileInputLocator);
          await fileInput.sendKeys(itemPaths.join(" "));
          console.dir("이미지 삽입");

          try {
            // 리뷰 신청하기 버튼
            const reviewLocator = By.xpath("//button[text()='리뷰신청하기']");
            await this.driver.wait(until.elementLocated(reviewLocator), 2000);
            const reviewElement = await this.driver.findElement(reviewLocator);
            if (reviewElement) {
              await reviewElement.click();
              console.dir("리뷰 신청");

              await RegistHistory.create(_item);
              await Regist.findOneAndDelete({ _id: _item._id });

              await this.driver.wait(until.alertIsPresent(), 5000); // 최대 5초 대기
              const alert = await this.driver.switchTo().alert();
              const alertText = await alert.getText();

              getTime = this.getCurrentTime();

              axios.post(
                `https://api.telegram.org/bot${_.get(
                  config,
                  "telegram_api_key"
                )}/sendMessage`,
                {
                  chat_id: _.get(config, "telegram_chat_id"),
                  text: `[${getTime}] ${noticeText} 매입완료\n\n${alertText}`
                }
              );
              await alert.accept();
            }
          } catch (e) {
            await RegistHistory.create(_item);
            await Regist.findOneAndDelete({ _id: _item._id });
          }
        }
      }
    }
  }
}

const autoSelling = new AutoSelling();

module.exports = autoSelling;
