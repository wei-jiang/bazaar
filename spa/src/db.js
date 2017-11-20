const idbAdapter = new LokiIndexedAdapter();
const db = new loki("bazaar.db", {
    adapter: idbAdapter,
    autoload: true,
    autoloadCallback: databaseInitialize,
    autosave: true,
    autosaveInterval: 1000
});
function databaseInitialize() {
    window.db = {
        products: db.getCollection("product") ? db.getCollection("product") : db.addCollection("product"),
        chat_log: db.getCollection("chat_log") ? db.getCollection("chat_log") : db.addCollection("chat_log"),
        orders: db.getCollection("orders") ? db.getCollection("orders") : db.addCollection("orders"),
        gestures: db.getCollection("gestures") ? db.getCollection("gestures") : db.addCollection("gestures"),
        notification: db.getCollection("notification") ? db.getCollection("notification") : db.addCollection("notification")
    }
}
export default window.db;