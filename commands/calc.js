module.exports = 
{
    name: 'calc',
    description: "this is a simple calculator.",

    execute(message, args)
    {
        if(args[1] === '*')
        {
            message.channel.send(parseFloat(args[0]) * parseFloat(args[2]))
        }
        else if(args[1] === '/')
        {
            message.channel.send(parseFloat(args[0]) / parseFloat(args[2]))
        }
        else if(args[1] === '+')
        {
            message.channel.send(parseFloat(args[0]) + parseFloat(args[2]))
        }
        else if(args[1] === '-')
        {
            message.channel.send(parseFloat(args[0]) - parseFloat(args[2]))
        }
        else if(args[1] === '%')
        {
            message.channel.send(parseFloat(args[0]) % parseFloat(args[2]))
        }
    }
}