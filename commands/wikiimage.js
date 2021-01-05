const wiki = require('wikijs').default
const { catchMessageFrom } = require("../functions");

module.exports = 
{
    name: 'wikiimage',
    description: "shows you all images of an wikipedia article.",

    async execute(message, args, Discord, client)
    {
        const embed = new Discord.MessageEmbed()

        try
        {
            const page = await wiki().find(args.join(' '))
            const rawImages = await page.images()
            const images = []

            for(image of rawImages)
            {
                if(image.endsWith('.jpg') || image.endsWith('.png'))
                {
                    images.push(image)
                }
            }

            message.channel.send(`:file_cabinet: Which of the ${images.length} images do you want to look at?`)

            const answer = await catchMessageFrom(message.author.id, message.guild.id, client)
            if(!(parseInt(answer) > 0 && parseInt(answer) <= images.length)) return message.channel.send(':x: You need to enter a valid number.')
            embed.setImage(images[parseInt(answer) - 1])

            message.channel.send(embed)
        }
        catch(err)
        {
            console.log(err)
            message.channel.semd(':x: Could not find any results.')
        }
    }
}