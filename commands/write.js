module.exports = 
{
    name: 'write',
    description: "let's the bot write out whatever youn want.",

    execute(message, args)
    {
        message.delete();

        if(args.length <= 0) return;

        message.channel.send(args.join(' '));
    }
}