const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')
const { playDispatcher, seperateNumber } = require('../functions')
const songQueue = require('../data/songQueue')

module.exports = 
{
    name: 'play',
    description: "let the bot play music in a voice channel.",

    async execute(message, args, Discord, usage)
    {
        try {
            const voiceChannel = message.member.voice.channel

            if(!voiceChannel) return message.channel.send(':x: You need to be in a voice channel to use this command!')
            if(!args.length) return message.channel.send(':x: You need to enter a search argument!')

            async function videoFinder(query)
            {
                const videoResult = await ytSearch(query)
                if(videoResult.videos.length >= 1) return videoResult.videos[0]
                else return null
            }

            function sendEmbed(messagei)
            {
                const embed = new Discord.MessageEmbed()
                .setTitle(`${songQueue[message.guild.id][0].title}`)
                .setURL(`${songQueue[message.guild.id][0].url}`)
                .setAuthor(`${songQueue[message.guild.id][0].author.name}`)
                .setThumbnail(`${songQueue[message.guild.id][0].thumbnail}`)
                .addFields(
                    {name: 'Duration', value: `${songQueue[message.guild.id][0].timestamp}`, inline: true},
                    {name: 'Requested By', value: messagei.member, inline: true},
                )
                .setFooter(`Uploaded ${songQueue[message.guild.id][0].ago}  |  Views: ` + seperateNumber(songQueue[message.guild.id][0].views))

                messagei.channel.send(embed)
            }

            const video = await videoFinder(args.join(' '))

            if(video)
            {
                if(!(songQueue.hasOwnProperty(message.guild.id)))
                {
                    songQueue[message.guild.id] = []
                }
                songQueue[message.guild.id].push(video)
                message.channel.send(`Enqueued \`${video.title}\` in position \`${songQueue[message.guild.id].length}\``)
            }
            else return message.channel.send(':x: No results found.')

            if(message.guild.voice)
            {
                if(message.guild.voice.connection) return
            }


            const connection = await voiceChannel.join()

            playSong()
            async function playSong()
            {
                if(songQueue[message.guild.id].length > 0)
                {
                    const stream = ytdl(songQueue[message.guild.id][0].url, {filter: 'audioonly'})
                    sendEmbed(message)
                    const dispatcher = connection.play(stream, {seak: 0, volume: 1})
                    .on('finish', () =>
                    {
                        songQueue[message.guild.id].shift()
                        playSong()
                    })
                    playDispatcher.splice(0, playDispatcher.length)
                    playDispatcher.push(dispatcher)
                }
                else
                {
                    message.channel.send('I\'m done playing.')
                    connection.disconnect()
                    return
                }
            }
        }
        catch(err) {
            console.error(err);
        }
    }
}