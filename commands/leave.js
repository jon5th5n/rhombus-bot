const songQueue = require('../data/songQueue')

module.exports = 
{
    name: 'leave',
    description: "stops everything the bot is doing right now.",

    async execute(message, args)
    {
        const voiceChannel = message.member.voice.channel
   
        if(!voiceChannel) return message.channel.send(':x: You need to be in a voice channel to use this command!')

        if(songQueue.hasOwnProperty(message.guild.id))
        {
            songQueue[message.guild.id].splice(0, songQueue[message.guild.id].length)
        }

        await voiceChannel.leave()
    }
}