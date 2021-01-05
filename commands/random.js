module.exports = 
{
    name: 'random',
    description: "this command returns a random number.",

    execute(message, args)
    {
        let num

        if(typeof(args[0]) !== 'number') return message.channel.send(':x: You need to use numbers.')

        if(args.length === 2) num = Math.random(args[0])
        else if(args.length === 2)
        {
            if(typeof(args[1]) !== 'number') return message.channel.send(':x: You need to use numbers.')
            num = Math.random(args[0], args[1])
        }

        message.channel.send(num);
    }
}