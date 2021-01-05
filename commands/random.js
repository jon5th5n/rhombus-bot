const { randomInt } = require("../functions")

module.exports = 
{
    name: 'random',
    description: "this command returns a random number.",

    execute(message, args)
    {
        let num

        if(typeof parseInt(args[0]) !== 'number') return message.channel.send(':x: You need to use numbers.')

        if(args.length === 0) num = randomInt(0, 100)
        else if(args.length === 1) num = randomInt(0, parseInt(args[0]))
        else if(args.length === 2)
        {
            if(typeof parseInt(args[1]) !== 'number') return message.channel.send(':x: You need to use numbers.')
            num = randomInt(parseInt(args[0]), parseInt(args[1]))
        }
        else if(args.length >= 3) return message.channel.send(':x: You only need to send two parameters.')

        message.channel.send(num);
    }
}