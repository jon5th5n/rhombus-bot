const { mentionToId, idToMention } = require("../functions");

module.exports = 
{
    name: 'offend',
    description: "you can offend someone.",

    execute(message, args, client)
    {
        const offenses = [
            "you suck!",
            "go die!",
            "noone likes you!",
            "your mom is a hoe!",
            "you are ugly!",
            "go fuck yourself!",
            "suck my dick!",
            "I hope you get AIDS and die!",
            "you are a HURENSOHN!",
            "your parents are siblings"
        ];

        if(mentionToId(args[0]) === client.user.id)
        {
            message.channel.send(idToMention(message.author.id) + ' ' + offenses[Math.floor(Math.random() * offenses.length)]);
        }
        else message.channel.send(args[0] + ' ' + offenses[Math.floor(Math.random() * offenses.length)]);
    }
}