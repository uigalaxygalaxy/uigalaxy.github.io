import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const recent = await redis.get('recent') || "Offline"
const songName = await redis.get('songName')
const songPlayer = await redis.get('songPlayer')
const timestamp = await Number(redis.get('timestamp'))


const ping = Date.now() - timestamp;
const Datestamp = new Date(timestamp);

const RANDOMTITLES = [
    { title: 'Discord', options: ['Group Meowing', 'Sweaty Discord Moderation', 'Gifting E-Kittens Nitro', 'Discordo'] }
]

function getRandomTitle(keyResponse) {
    RANDOMTITLES.forEach(item => {
        if (keyResponse == item.title) {
            return item.options[Math.floor(Math.random() * item.options.length)];
        }
    });
}

const windows = JSON.parse("[" + recent + "]"); // turn da string to an array
let keyResponse;
let windowTitle;
document.querySelectorAll('.activityInfo').forEach(object, index => {
    keyResponse = windows[index];
    let oldResponse = keyResponse;
    keyResponse = getRandomTitle(keyResponse);
    let newResponse = keyResponse;
    if (index == 0) {
        object.querySelector('.activityTime').textContent = "Top Window";
    }
    else {
        object.querySelector('.activityTime').textContent = `Window #${index + 1}`;
    }
    if (oldResponse == newResponse) {
        windowTitle = newResponse;
    }
    else {
        windowTitle = keyResponse;
    }
    object.querySelector('.activityTitle').textContent = windowTitle;
    object.querySelector('.activityResponse').textContent = `Desktop sent "${oldResponse}" at ${Datestamp}`;

    const symbol = object.querySelector('.pingCircle');
    object.querySelector('.pingNum').textContent = Math.floor(ping);
    if (ping > 1000) {
        symbol.textContent = '⛒';
        symbol.styles.color = '#D06E6E';
    }
    else if (ping > 300) {
        symbol.textContent = '⚠';
        symbol.styles.color = '#FBC02D';

    }
    else if (ping > 100) {
        symbol.textContent = '⬤';
        symbol.styles.color = '#81C784';

    }
    else {
        symbol.textContent = '★';
        symbol.styles.color = '#9dffffff';
    }
});




