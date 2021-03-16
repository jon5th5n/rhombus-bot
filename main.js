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
    console.log('Bot is online!');
});

client.on('message', message =>
{
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
    else if(instruction == 'wikiimage')
    {
        client.commands.get('wikiimage').execute(message, args, Discord, client);
    }
    else if(instruction == 'calc')
    {
        client.commands.get('calc').execute(message, args);
    }
    else if(instruction == 'random')
    {
        client.commands.get('random').execute(message, args);
    }
});

client.on('guildMemberAdd', member => {
    if(member.guild.id == '480065595724005376')
    {
        member.roles.add('704277476033167412');
    }
});







// client.login(process.env.token);
client.login('NzkxMzAyODY2NTA5ODg5NTg3.X-NMOQ.Bp2_SI4ktHaZnZiE-WHS-okRtHw');