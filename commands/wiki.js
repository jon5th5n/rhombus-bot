const wiki = require('wikijs').default
const { formatString } = require('../functions');

module.exports = 
{
    name: 'wiki',
    description: "shows a wiki article about a specific topic.",

    execute(message, args, Discord)
    {
        const embed = new Discord.MessageEmbed()

        wiki().find(args[0]).then(page => page.summary())
        .then(summary => {
            embed.addField('Summary: ', formatString(summary, 85))
            message.channel.send(embed)
        })
    }
}