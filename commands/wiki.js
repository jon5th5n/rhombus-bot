const wiki = require('wikijs').default

module.exports = 
{
    name: 'wiki',
    description: "shows a wiki article about a specific topic.",

    async execute(message, args, Discord)
    {
        const embed = new Discord.MessageEmbed()

        try
        {
            const page = await wiki().find(args.join(' '))
            const summary = await page.summary()
            const thumbnail = await page.mainImage()
            const url = await page.url()
            const title = page['raw']['title']

            embed.setTitle(title)
            embed.setThumbnail(thumbnail)
            embed.setURL(url)

            if(summary.length >= 5500)
            {
                summary = summary.slice(0, 5500)
            }
            let summaryi = summary
            for(i = -1024; i <= summary.length; i += 1024)
            {
                if(summaryi.length >= 750)
                {
                    let seperate = []
                    for(i = 0; i <= 750; i++)
                    {
                        if(summaryi.charAt(i) === '.' || summaryi.charAt(i) === '!' || summaryi.charAt(i) === '?')
                        {
                            seperate.push(i)
                        }
                    }
                    embed.addField('\u200b', summaryi.slice(0, seperate[seperate.length - 1] + 2))
                    summaryi = summaryi.slice(seperate[seperate.length - 1] + 2)
                }
                else
                {
                    embed.addField('\u200b', summaryi)
                    break
                }
            }

            message.channel.send(embed)
        }
        catch(err)
        {
            console.log(err)
            message.channel.send(':x: Could not find any results.')
        }
    }
}