const mongoose = require("mongoose");
const _ = require("lodash");

const CategorySchema = require("./ncnc/category");
const BrandSchema = require("./ncnc/brand");
const ItemSchema = require("./ncnc/item");

const config = require("../services/config");

const mongo = _.get(config, "mongo");
const mongoIp = _.get(mongo, "ip");
const mongoPort = _.get(mongo, "port");
const mongoDatabase = _.get(mongo, "database");

mongoose
  .connect(`mongodb://${mongoIp}:${mongoPort}/${mongoDatabase}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Successfully connected to mongodb"))
  .catch(e => {
    console.error(e);
    throw new Error("mongo DB connection fail");
  });

module.exports = {
  Category: CategorySchema,
  Brand: BrandSchema,
  Item: ItemSchema
};
