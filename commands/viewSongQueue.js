const songQueue = require('../data/songQueue')


module.exports = 
{
    name: 'viewSongQueue',
    description: "displays the song queue.",

    execute(message, args, Discord)
    {
        const embed = new Discord.MessageEmbed()
        .setTitle('Queued Videos:')

        let text = ''

        if(songQueue[message.guild.id].length <= 0) return message.channel.send(':x: There is nothing queued right now!')

        for(i in songQueue[message.guild.id])
        {
            text = text + `${parseInt(i)+1}. \ \ \ ${songQueue[message.guild.id][i].title}\n\n`
        }
        
        console.log(text)
        embed.addField('\u200b', text)

        message.channel.send(embed)
    }
}