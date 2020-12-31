const ytdl = require('ytdl-core')
const { playDispatcher } = require("../functions")
const play = require("./play")
const songQueue = require('../data/songQueue')

module.exports = 
{
    name: 'skip',
    description: "skips to the next song in queue.",

    execute(message, args, Discord)
    {
        songQueue[message.guild.id].shift()
        const connection = message.guild.voice.connection
        playDispatcher[0].destroy()

        playSong()
        async function playSong()
        {
            if(songQueue[message.guild.id].length > 0)
            {
                const stream = ytdl(songQueue[message.guild.id][0].url, {filter: 'audioonly'})
                
                const embed = new Discord.MessageEmbed()
                .setTitle(`${songQueue[message.guild.id][0].title}`)
                .setURL(`${songQueue[message.guild.id][0].url}`)
                .setAuthor(`${songQueue[message.guild.id][0].author.name}`)
                .setThumbnail(`${songQueue[message.guild.id][0].thumbnail}`)
                .addFields(
                    {name: 'Duration', value: `${songQueue[message.guild.id][0].duration}`, inline: true},
                    {name: 'Requested By', value: message.author, inline: true}
                )
        
                message.channel.send(embed)

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
}