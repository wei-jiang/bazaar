
export default {
    getRandFloat: (min, max) => {
        return Math.random() * (max - min) + min;
    },
    getRandInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
