require("dotenv").config();
const {MongoClient} = require("mongodb");

let client = null;

module.exports = async function ConnecMongo() {
    if (client) {
        return client;
    }

    // eslint-disable-next-line no-useless-catch
    try {
        client = await MongoClient.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        return client;
    } catch (error) {
        throw error;
    }
};