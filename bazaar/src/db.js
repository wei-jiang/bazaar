const idbAdapter = new LokiIndexedAdapter();
let db;

//export promise?
export default new Promise((resolve, reject) => {
    if (db) {
        resolve(db);
    } else {
        let bazaarDB = new loki("bazaar.db", {
            adapter: idbAdapter,
            autoload: true,
            autoloadCallback: () => {
                db = {
                    products: bazaarDB.getCollection("product") ? bazaarDB.getCollection("product") : bazaarDB.addCollection("product"),
                    chat_log: bazaarDB.getCollection("chat_log") ? bazaarDB.getCollection("chat_log") : bazaarDB.addCollection("chat_log"),
                    // orders: bazaarDB.getCollection("orders") ? bazaarDB.getCollection("orders") : bazaarDB.addCollection("orders"),
                    gestures: bazaarDB.getCollection("gestures") ? bazaarDB.getCollection("gestures") : bazaarDB.addCollection("gestures"),
                    notification: bazaarDB.getCollection("notification") ? bazaarDB.getCollection("notification") : bazaarDB.addCollection("notification")
                }
                resolve(db);
            },
            autosave: true,
            autosaveInterval: 1000
        });
    }
})