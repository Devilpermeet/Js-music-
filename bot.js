const { Client, Intents } = require('discord.js');
const DisTube = require('distube');
const SpotifyWebApi = require('spotify-web-api-node');
const { config } = require('dotenv');

// Load environment variables from .env file
config();

// Initialize Discord Client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

// Spotify Client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Your bot's prefix
const PREFIX = '!';

// Create DisTube instance
const distube = new DisTube(client, { searchSongs: 0, emitNewSongOnly: true });

// On bot ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Handle messages
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'play') {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('You need to join a voice channel first!');

        const song = args.join(' ');
        if (!song) return message.reply('You need to provide a song name or URL!');

        distube.play(voiceChannel, song, {
            textChannel: message.channel,
            member: message.member,
        });
    } else if (command === 'stop') {
        distube.stop(message.guild.id);
        message.reply('Stopped the music!');
    } else if (command === 'skip') {
        distube.skip(message.guild.id);
        message.reply('Skipped the current song!');
    } else if (command === 'queue') {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) return message.reply('There is no queue.');
        message.channel.send(`Current queue: ${queue.songs.map(song => song.name).join(', ')}`);
    }
});

// Error handling
client.on('error', console.error);
client.on('warn', console.warn);
client.on('debug', console.debug);

// Login
client.login(process.env.BOT_TOKEN);
