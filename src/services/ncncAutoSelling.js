/* eslint-disable no-use-before-define */
const _ = require("lodash");
const path = require("path");
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const EventEmitter = require("events");

const { Regist, RegistHistory } = require("../models");
const ncncService = require("./ncnc");
const { messageHandler } = require("./telegram");
const logger = require("./logger");

const ncncEvent = new EventEmitter();

class AutoSelling {
  constructor() {
    this.useChrome = false;
    this.chromeUserData = path.join(process.cwd(), "user-data");
    this.init();

    //
  }

  async init() {
    logger.info("chrome driver 초기 설정 시작");
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
      logger.info("chrome driver 실행");
      this.driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
      await this.driver.get("https://ncnc.app/sell/wait-confirmed");

      const buttonLocator = By.css(
        'button[data-cy="sell-wait-confirm-sell-button"]'
      );

      await this.driver.wait(until.elementLocated(buttonLocator), 3000);
      logger.info("chrome driver 판매하기 버튼 확인");

      ncncEvent.on("poll", autoSelling.runPollingLoop);
      ncncEvent.emit("poll");
    } catch (e) {
      logger.error("chrome driver 실행 실패", e);
      await this.driver.quit();
      process.exit(1);
    }

    // 매입 프로세스 시작 이벤트
    ncncEvent.on("purchase", async (_item, result) => {
      const price = _.get(result, "askingPrice");
      const isBlock = _.get(result, "isBlock");
      const isRefuse = _.get(result, "isRefuse");
      if (isBlock === 0 && isRefuse === 0) {
        logger.info("purchase 이벤트 발생", { _item, result });
        if (autoSelling.useChrome === true) {
          logger.info("현재 크롬 사용중", { _item, result });
          // eslint-disable-next-line no-continue
          return;
        }
        autoSelling.useChrome = true;
        logger.info("매입 프로세스 시작", { _item, result });

        let registHistory = null;
        try {
          registHistory = await RegistHistory.create(
            _.omit(_item, ["_id", "created_at", "updated_at"])
          );
          registHistory = JSON.parse(JSON.stringify(registHistory));
          await Regist.findOneAndDelete({ _id: _item._id });
          await RegistHistory.findOneAndUpdate(
            { _id: registHistory._id },
            { status: "progress" }
          );

          const purchaseProcess = `매입중\n브랜드: ${_item.brand_name}\n상품명: ${_item.item_name}\n판매 신청 가격: ${_item.price}원\n현재 매입 가격: ${price}원`;
          await messageHandler(purchaseProcess);
          logger.info(purchaseProcess, { _item, result });

          // 쿠폰 판매하기 버튼
          const buttonLocator = By.css(
            'button[data-cy="sell-wait-confirm-sell-button"]'
          );
          await autoSelling.driver.wait(
            until.elementLocated(buttonLocator),
            5000
          );
          const button = await autoSelling.driver.findElement(buttonLocator);
          await button.click();
          logger.info("판매하기 버튼 클릭", { _item, result });

          // 카테고리 선택
          const categoryLocator = By.xpath(
            `//div[text()='${_item.category_name}']`
          );
          await autoSelling.driver.wait(
            until.elementLocated(categoryLocator),
            5000
          );
          const categoryElement =
            await autoSelling.driver.findElement(categoryLocator);
          if (categoryElement) {
            await categoryElement.click();
            logger.info("카테고리 버튼 클릭", { _item, result });
          }

          // 브랜드 선택
          const brandLocator = By.xpath(`//div[text()='${_item.brand_name}']`);
          await autoSelling.driver.wait(
            until.elementLocated(brandLocator),
            5000
          );
          const brandElement =
            await autoSelling.driver.findElement(brandLocator);
          if (brandElement) {
            await brandElement.click();
            logger.info("브랜드 버튼 클릭", { _item, result });
          }

          // 아이템 검색
          const inputLocator = By.css(
            'input[data-cy="upload-con-search-input"]'
          );
          await autoSelling.driver.wait(
            until.elementLocated(inputLocator),
            5000
          );
          const inputElement =
            await autoSelling.driver.findElement(inputLocator);
          await inputElement.sendKeys(_item.item_name);
          logger.info("아이템 검색 입력", { _item, result });

          await autoSelling.delay(1000);
          // 아이템 선택
          const itemLocator = By.xpath(
            `//div[@id='conItme-name' and text()='${_item.item_name}']`
          );
          await autoSelling.driver.wait(
            until.elementLocated(itemLocator),
            5000
          );
          const itemElement = await autoSelling.driver.findElement(itemLocator);
          await autoSelling.driver.wait(
            until.elementIsVisible(itemElement),
            5000
          );
          await itemElement.click();
          logger.info("아이템 클릭", { _item, result });

          // 약관 체크
          const termCheckLocator = By.id("termCheck");
          await autoSelling.driver.wait(
            until.elementLocated(termCheckLocator),
            5000
          );
          const checkbox =
            await autoSelling.driver.findElement(termCheckLocator);
          const isChecked = await checkbox.isSelected();
          if (!isChecked) {
            await autoSelling.driver.executeScript(
              "arguments[0].click();",
              checkbox
            );
            logger.info("약관 동의 클릭", { _item, result });
          } else {
            logger.info("약관 동의 이미 체크됨", { _item, result });
          }

          const itemCount = _item.image_path.length;
          let completeCount = 0;
          // 로컬 이미지들 올리기
          for (const _path of _item.image_path) {
            const _imagePath = path.join(
              process.cwd(),
              "public",
              "images",
              _path
            );

            const fileInputLocator = By.css('input[type="file"]');
            await autoSelling.driver.wait(
              until.elementLocated(fileInputLocator),
              5000
            );
            const fileInput =
              await autoSelling.driver.findElement(fileInputLocator);
            await fileInput.sendKeys(_imagePath);
            completeCount += 1;
            logger.info("이미지 삽입", { _item, result });
          }

          // 리뷰 신청하기 버튼
          const reviewLocator = By.xpath("//button[text()='리뷰신청하기']");
          await autoSelling.driver.wait(
            until.elementLocated(reviewLocator),
            5000
          );
          const reviewElement =
            await autoSelling.driver.findElement(reviewLocator);
          if (reviewElement) {
            await reviewElement.click();
            logger.info("리뷰 신청", { _item, result });

            await autoSelling.driver.wait(until.alertIsPresent(), 5000); // 최대 5초 대기
            const alert = await autoSelling.driver.switchTo().alert();
            const alertText = await alert.getText();
            await alert.accept();

            if (_.includes(alertText, "쿠폰이 등록되었습니다.")) {
              const purchaseComplete = `매입완료\n브랜드: ${_item.brand_name}\n상품명: ${_item.item_name}\n매입 가격: ${price}원\n완료 갯수: ${completeCount}/${itemCount}\n\n${alertText}`;
              await messageHandler(purchaseComplete);
              logger.info(purchaseComplete, { _item, result });
              await RegistHistory.findOneAndUpdate(
                { _id: registHistory._id },
                { status: "success" }
              );
            } else {
              const purchaseComplete = `매입실패\n브랜드: ${_item.brand_name}\n상품명: ${_item.item_name}\n매입 가격: ${price}원\n완료 갯수: ${completeCount}/${itemCount}\n\n${alertText}`;
              await messageHandler(purchaseComplete);
              logger.info(purchaseComplete, { _item, result });
              await RegistHistory.findOneAndUpdate(
                { _id: registHistory._id },
                { status: "partial_done" }
              );
            }

            autoSelling.useChrome = false;
            // 다시 초기위치로 이동
            await autoSelling.driver.get(
              "https://ncnc.app/sell/wait-confirmed"
            );
          }
        } catch (e) {
          console.dir(e);
          if (e.name === "UnexpectedAlertOpenError") {
            const purchaseFail = `매입 제한량 도달 재등록 필요\n브랜드: ${_item.brand_name}\n상품명: ${_item.item_name}\nid: ${_item._id}`;
            await messageHandler(purchaseFail);
            logger.error(purchaseFail, { _item, result });
            await RegistHistory.findOneAndUpdate(
              { _id: registHistory._id },
              { status: "fail" }
            );
          }
          const purchaseFail = `매입실패 수동 확인 필요\n브랜드: ${_item.brand_name}\n상품명: ${_item.item_name}\nid: ${_item._id}`;
          await messageHandler(purchaseFail);
          logger.error(purchaseFail, { _item, result });
          await RegistHistory.findOneAndUpdate(
            { _id: registHistory._id },
            { status: "fail" }
          );

          autoSelling.useChrome = false;
          // 다시 초기위치로 이동
          await autoSelling.driver.get("https://ncnc.app/sell/wait-confirmed");
        }
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async runPollingLoop() {
    logger.info("runPollingLoop 시작");
    let items = await Regist.find({});
    items = JSON.parse(JSON.stringify(items));

    if (_.isEmpty(items)) {
      return;
    }

    for (const _item of items) {
      let result = null;
      try {
        result = await ncncService.getItemStatus(_item.brand_id, _item.item_id);
      } catch (e) {
        const requestFail = `니콘내콘 리퀘스트 실패`;
        await messageHandler(requestFail);
        logger.error(requestFail, e);
      }
      if (!_.isEmpty(result)) {
        ncncEvent.emit("purchase", _item, result);
      }
      await autoSelling.delay(200);
    }
    logger.info("runPollingLoop 종료");
    setTimeout(() => ncncEvent.emit("poll"), 1000);
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
}

const autoSelling = new AutoSelling();

module.exports = autoSelling;
