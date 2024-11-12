const express = require("express");
const _ = require("lodash");
const multer = require("multer");
const FileType = require("file-type");
const fs = require("fs");
const path = require("path");

require("../services/ncncAutoSelling");
const DB = require("../models");

const { Category, Brand, Item, Regist, RegistHistory } = DB;

const tempPath = path.join(process.cwd(), "temp");
const uploadPath = path.join(process.cwd(), "public", "images");

const upload = multer({ dest: tempPath });
try {
  fs.mkdirSync(tempPath);
} catch (e) {
  //
}

try {
  fs.mkdirSync(uploadPath);
} catch (e) {
  //
}

async function appendFileExtension(filePath) {
  try {
    // 파일을 읽어 버퍼로 변환
    const _filePath = path.join(tempPath, filePath);

    const fileBuffer = fs.readFileSync(_filePath);

    // 파일 타입 추론
    const fileType = await FileType.fromBuffer(fileBuffer);

    if (!fileType) {
      throw new Error("파일 타입을 확인할 수 없습니다.");
    }

    // 파일의 확장자
    const extension = fileType.ext;

    // 기존 파일 이름과 확장자 추가된 파일 이름
    const newFilePath = `${filePath}.${extension}`;

    // 파일 이름 변경
    // fs.renameSync(filePath, newFilePath);

    return newFilePath;
  } catch (error) {
    throw new Error("파일 타입 확인 불가");
    // console.error("에러 발생:", error.message);
  }
}

const router = express.Router();
const ncncService = require("../services/ncnc");

router.get("/category", async (req, res) => {
  try {
    const categories = await ncncService.getCategory();
    return res.json(categories);
  } catch (e) {
    return res.json([]);
  }
});

router.put("/category", (req, res) => {
  try {
    ncncService.updateCategory();
    return res.json(true);
  } catch (e) {
    console.dir(e);
    return res.json(false);
  }
});

router.get("/brand/:id", async (req, res) => {
  try {
    const brand = await ncncService.getBrandById(req.params.id);
    return res.json(brand);
  } catch (e) {
    return res.json([]);
  }
});

router.get("/brand", async (req, res) => {
  try {
    const brands = await ncncService.getBrand();
    return res.json(brands);
  } catch (e) {
    return res.json([]);
  }
});

router.put("/brand", (req, res) => {
  try {
    ncncService.updateBrand();
    return res.json(true);
  } catch (e) {
    console.dir(e);
    return res.json(false);
  }
});

router.get("/item/:id", async (req, res) => {
  try {
    const item = await ncncService.getItemById(req.params.id);
    return res.json(item);
  } catch (e) {
    return res.json([]);
  }
});

router.get("/item", async (req, res) => {
  try {
    const brandId = req.query.brand;
    const { name } = req.query;
    const categories = await ncncService.getItemSearch(brandId, name);
    return res.json(categories);
  } catch (e) {
    return res.json([]);
  }
});

router.put("/item", (req, res) => {
  try {
    ncncService.updateItem();
    return res.json(true);
  } catch (e) {
    console.dir(e);
    return res.json(false);
  }
});

router.get("/getItemStatus", async (req, res) => {
  try {
    const itemId = _.get(req.query, "id");
    const brandId = _.get(req.query, "brandId");

    const itemStatus = await ncncService.getItemStatus(brandId, itemId);
    return res.json(itemStatus);
  } catch (e) {
    // if (e instanceof RainbowError) {
    //   return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    // }
    return res.status(500).send(e.message);
  }
});

router.post("/uploadItem", upload.array("files", 10), async (req, res) => {
  try {
    const completePath = [];
    const fileCount = req.files.length;
    let completeFile = 0;

    const brandId = _.get(req.headers, "x-brand");
    if (_.isEmpty(brandId)) {
      return res.status(400).json({ message: "브랜드 아이디 누락" });
    }
    const itemId = _.get(req.headers, "x-item");
    if (_.isEmpty(brandId)) {
      return res.status(400).json({ message: "아이템 아이디 누락" });
    }
    const price = parseInt(_.get(req.headers, "x-price", "0"), 10);

    let brand = await Brand.findOne({ id: brandId });
    brand = JSON.parse(JSON.stringify(brand));
    if (_.isEmpty(brand)) {
      return res.status(400).json({ message: "브랜드를 찾을 수 없음" });
    }

    let category = await Category.findOne({ id: brand.category_id });
    category = JSON.parse(JSON.stringify(category));
    if (_.isEmpty(category)) {
      return res.status(400).json({ message: "카테고리를 찾을 수 없음" });
    }

    let item = await Item.findOne({ id: itemId });
    item = JSON.parse(JSON.stringify(item));
    if (_.isEmpty(item)) {
      return res.status(400).json({ message: "아이템을 찾을 수 없음" });
    }

    try {
      for (const _file of req.files) {
        const fileName = await appendFileExtension(_file.filename);

        const destinationPath = path.join(uploadPath, fileName);

        fs.copyFileSync(_file.path,destinationPath);
        fs.unlinkSync(_file.path);
        // fs.renameSync(_file.path, destinationPath);

        completePath.push(fileName);

        completeFile += 1;
      }
    } catch (e) {
      //
      console.dir(e);
    }

    await Regist.create({
      category_id: _.get(category, "id"),
      category_name: _.get(category, "name"),
      brand_id: brandId,
      brand_name: _.get(brand, "name"),
      item_id: itemId,
      item_name: _.get(item, "name"),
      price,
      image_path: completePath
    });

    return res.json({
      total: fileCount,
      complete: completeFile
    });
  } catch (e) {
    console.dir(e);
    return res.json({
      total: 0,
      complete: 0
    });
  }
});

router.get("/list", async (req, res) => {
  const regist = await Regist.find({});
  return res.json(regist);
});

router.get("/history", async (req, res) => {
  const registHistory = await RegistHistory.find({});
  return res.json(registHistory);
});

module.exports = router;
