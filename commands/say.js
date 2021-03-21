module.exports = 
{
    name: 'say',
    description: "let's the bot say whatever youn want with tts on.",

    execute(message, args)
    {
        message.delete();

        if(args.length <= 0) return;

        message.channel.send(args.join(' '), { tts : true });
    }
}