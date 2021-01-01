const { memory } = require('console');
const Discord = require('discord.js');
const client = new Discord.Client();
const wiki = require('wikijs').default

const { mentionIsRole, mentionToId, idToMention, isMention, whiteFrameNumber, calculateSumInScope, seperateNumber, formatString } = require('./functions');

const prefix = '#';

const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles)
{
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


client.once('ready', () => 
{
    console.log(formatString('1, 2, 3 4 5 6 7 8 9 ', 20))
    console.log('Bot is online!');
});

client.on('message', message =>
{
    if(message.author.id === '415169511205896193')
    {
        message.channel.send(':middle_finger:');
    }
    if(message.author.id === '455264385217331210')
    {
        message.channel.send(':peach:');
    }

    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(' ');
    const instruction = args.shift().toLowerCase();

    if(instruction == 'ping')
    {
        client.commands.get('ping').execute(message, args);
    }
    else if(instruction == 'offend')
    {
        client.commands.get('offend').execute(message, args, client);
    }
    else if(instruction == 'challenge')
    {
        client.commands.get('challenge').execute(message, args, client, Discord);
    }
    else if(instruction == 'play')
    {
        client.commands.get('play').execute(message, args, Discord);
    }
    else if(instruction == 'leave')
    {
        client.commands.get('leave').execute(message, args);
    }
    else if(instruction == 'queue')
    {
        client.commands.get('viewSongQueue').execute(message, args, Discord);
    }
    else if(instruction == 'skip')
    {
        client.commands.get('skip').execute(message, args, Discord);
    }
    else if(instruction == 'wiki')
    {
        client.commands.get('wiki').execute(message, args, Discord);
    }
});







client.login(process.env.token);