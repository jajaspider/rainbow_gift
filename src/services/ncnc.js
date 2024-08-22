const _ = require("lodash");
const axios = require("axios");

const DB = require("../models");

function toJSON(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function sleep(ms = 1000) {
  // eslint-disable-next-line no-unused-vars
  await new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

const { Category, Brand, Item } = DB;

async function updateCategory() {
  const result = await axios.get(`https://api2.ncnc.app/con-category1s`);
  const resultData = _.get(result, "data.conCategory1s", []);

  for (const _category of resultData) {
    const categoryObj = {
      name: _category.name,
      id: _category.id
    };
    await Category.findOneAndUpdate({ name: _category.name }, categoryObj, {
      upsert: true,
      new: true
    });
  }

  return resultData;
}

async function getCategory() {
  let category = await Category.find({});
  category = toJSON(category);

  return category;
}

async function updateBrand() {
  const categories = await getCategory();
  for (const _category of categories) {
    const result = await axios.get(
      `https://api2.ncnc.app/con-category2s?conCategory1Id=${_category.id}&forSeller=1`
    );
    const brands = _.get(result, "data.conCategory2s", []);
    for (const _brand of brands) {
      const brandObj = {
        name: _brand.name,
        id: _brand.id,
        category_id: _brand.conCategory1Id
      };
      await Brand.findOneAndUpdate({ name: _brand.name }, brandObj, {
        upsert: true,
        new: true
      });
    }
  }
}

async function getBrand() {
  let brand = await Brand.find({});
  brand = toJSON(brand);

  return brand;
}

async function updateItem() {
  const brands = await getBrand();
  for (const _brand of brands) {
    const result = await axios.get(
      `https://api2.ncnc.app/con-items?conCategory2Id=${_brand.id}&forSeller=1`
    );
    const items = _.get(result, "data.conItems", []);
    for (const _item of items) {
      const itemObj = {
        name: _item.name,
        id: _item.id,
        brand_name: _brand.name,
        brand_id: _brand.id
      };
      await Item.findOneAndUpdate(
        { brand_name: _brand.name, name: _item.name },
        itemObj,
        {
          upsert: true,
          new: true
        }
      );
    }

    await sleep(300);
  }
}

async function getItemById(id) {
  let targetItems = await Item.findOne({ id });
  targetItems = toJSON(targetItems);

  return targetItems;
}

async function getItemByName(name) {
  const nameRegex = new RegExp(`${name}`, "i");
  let targetItems = await Item.find({ name: nameRegex });
  targetItems = toJSON(targetItems);

  return targetItems;
}

async function getItemSearch(brandId, name) {
  const nameRegex = new RegExp(name, "i");
  console.dir(nameRegex);
  let targetItems = await Item.find({ brand_id: brandId, name: nameRegex });
  targetItems = toJSON(targetItems);

  return targetItems;
}

async function getItemStatus(brandId, itemId) {
  // eslint-disable-next-line no-param-reassign
  brandId = Number(brandId);
  // eslint-disable-next-line no-param-reassign
  itemId = Number(itemId);
  const result = await axios.get(
    `https://api2.ncnc.app/con-items?conCategory2Id=${brandId}&forSeller=1`
  );
  const resultData = _.get(result, "data.conItems");
  const targetItem = _.find(resultData, { id: itemId });
  if (_.isEmpty(targetItem)) {
    return null;
  }

  return targetItem;
}

module.exports = {
  updateCategory,
  getCategory,
  updateBrand,
  getBrand,
  getItemByName,
  getItemById,
  getItemSearch,
  getItemStatus,
  updateItem
};
