
export default {
    product: new Nedb({
        filename: 'product.db',
        autoload: true
    }),
    chat_log: new Nedb({
        filename: 'chat_log.db',
        autoload: true
    }),
    orders: new Nedb({
        filename: 'orders.db',
        autoload: true
    }),
    gestures: new Nedb({
        filename: 'gestures.db',
        autoload: true
    }),
    notification: new Nedb({
        filename: 'notification.db',
        autoload: true
    })
}