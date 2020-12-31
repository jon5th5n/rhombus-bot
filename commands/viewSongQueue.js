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

        for(i in songQueue[message.guild.id])
        {
            text = text + `${parseInt(i)+1}. \ \ \ ${songQueue[message.guild.id][i].title}\n\n`
        }
        
        console.log(text)
        embed.addField('\u200b', text)

        message.channel.send(embed)
    }
}