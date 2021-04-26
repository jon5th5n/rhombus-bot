/*==commands=================================================================================================================================================================================

#taboo          create          public          [lobby-name]          ([max. player])          : creates a public game lobby
#taboo          join            [lobby-name]                                                   : joins a public lobby

#taboo          create          private         [lobby-name]          [@member]                : creates a private lobby and asks everyone added to join
#taboo          add             [@member]                                                      : asks the one added to join the private lobby

#taboo          kick            [@member]                                                      : kicks the one added from the game lobby and prevents him from joining again if public
#taboo          leave                                                                          : leaves the game lobby

#taboo          list                                                                           : lists all the puplic game lobbys on the server right now
#taboo          list            [lobby-name]                                                   : lists everyone playing in the game lobby
#taboo          stats                                                                          : shows your own game stats
#taboo          stats           [@member]                                                      : shows the game stats of the one added
#taboo          gstats                                                                         : shows your own global game stats
#taboo          gstats          [@member]                                                      : shows the global game stats of the one added

====database=================================================================================================================================================================================

gameboards = {                 |        guildStats = {                                |        globalStats = {
    guild1 : {                 |            guild1 : {                                |            player1 : '140',
        game1 : 'gameboard',   |                score : player1 + player2 + ...,      |            player2 : '50',
        game2 : 'gameboard',   |                player1 : '35',                       |            player3 : '78',
        ...                    |                player2 : '20',                       |            ...
    },                         |                ...                                   |        }
    guild2 : {                 |            },                                        |        
        game1 : 'gameboard',   |            guild1 : {                                |
        game2 : 'gameboard',   |                score : player1 + player2 + ...,      |
        ...                    |                player1 : '35',                       |
    },                         |                player2 : '20',                       |
    ...                        |                ...                                   |
}                              |            },                                        |
...............................|            ...                                       |
...............................|        }                                             |

====Permission Overwrites====================================================================================================================================================================

@everyone:
    deny:
        VIEW_CHANNEL
        SEND_MESSAGES
@player:
    allow:
        VIEW_CHANNEL
        SEND_MESSAGES
        READ_MESSAGE_HISTORY
    deny:
        SEND_TTS_MESSAGES
        MANAGE_MESSAGES
        EMBED_LINKS
        ATTACH_FILES
        MENTION_EVERYONE

===========================================================================================================================================================================================*/


const fs = require('fs');
const Discord = require('discord.js');
const { MessageCollector } = require('discord.js');
const { mentionToId, idToMention, randomInt, catchMessage } = require('../functions');
const tabooGames = require('../data/tabooGames');

module.exports = 
{
    name: 'taboo',
    description: "you can play a game of taboo.",

    async execute(message, args, client, Discord) 
    {
        //<< check over all lobbies and delete them if they are emty <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        for(let guild in tabooGames) {
            for(let lobby in tabooGames[guild]) {
                //delete lobby if empty
                if(tabooGames[guild][lobby].players.length <= 0) {
                    let channel = await client.channels.fetch(tabooGames[guild][lobby].channelId);
                    channel.delete();
                    delete tabooGames[guild][lobby];
                }
            }
            // delete guild if empty
            if(Object.keys(tabooGames[guild]).length <= 0) delete tabooGames[guild];
        }

        //<< create lobby <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        if(args[0] === 'create')
        {
            if(args[1] === 'public')
            {
                // check if player already is member of another lobby
                for(let guild in tabooGames) {
                    for(let lobby in tabooGames[guild]) {
                        for(let player of tabooGames[guild][lobby].players) {
                            if(player.id === message.author.id) return message.channel.send(':x: You are already playing in another lobby.');
                        }
                    }
                }

                // create lobby
                let lobby = {
                    name : args[2],
                    public : true,
                    owner : message.author,
                    maxPlayers : args[3] || 50,
                    channelId : null,

                    players : [message.author],
                    bannedPlayers : []
                };

                // create new channel and set some permissions
                message.guild.channels.create('taboo ' + lobby.name, {
                    type : 'text',
                    permissionOverwrites : [
                        {
                            id : message.guild.roles.everyone.id,
                            deny : ['VIEW_CHANNEL', 'SEND_MESSAGES']
                        },
                        {
                            id : client.user.id,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'MENTION_EVERYONE']
                        },
                        {
                            id : lobby.owner.id,
                            allow : ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                            deny : ['SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'MENTION_EVERYONE']
                        }
                    ]
                }).then(channel => {
                    // set lobby channel to newly created channel
                    lobby.channelId = channel.id;

                    // add the lobby into tabooGames object
                    if(!(message.guild.id in tabooGames)) tabooGames[message.guild.id] = {};
                    tabooGames[message.guild.id][lobby.name] = lobby;

                    // start game loop
                    playGame(message.guild.id, lobby.name, client);
                })
            }
            if(args[1] === 'private')
            {
                // check if player already is member of another lobby
                for(let guild in tabooGames) {
                    for(let lobby in tabooGames[guild]) {
                        for(let player of tabooGames[guild][lobby].players) {
                            if(player.id === message.author.id) return message.channel.send(':x: You are already playing in another lobby.');
                        }
                    }
                }

                // create lobby
                let lobby = {
                    name : args[2],
                    public : false,
                    owner : message.author,
                    maxPlayers : 50,
                    channelId : null,

                    players : [message.author],
                    bannedPlayers : []
                };
                
                // create new channel and set some permissions
                message.guild.channels.create('taboo ' + lobby.name, {
                    type : 'text',
                    permissionOverwrites : [
                        {
                            id : message.guild.roles.everyone.id,
                            deny : ['VIEW_CHANNEL', 'SEND_MESSAGES']
                        },
                        {
                            id : client.user.id,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'MENTION_EVERYONE']
                        },
                        {
                            id : lobby.owner.id,
                            allow : ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                            deny : ['SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'MENTION_EVERYONE']
                        }
                    ]
                }).then(channel => {
                    // set lobby channel to newly created channel
                    lobby.channelId = channel.id;

                    // add the lobby into tabooGames object
                    if(!(message.guild.id in tabooGames)) tabooGames[message.guild.id] = {};
                    tabooGames[message.guild.id][lobby.name] = lobby;

                    // start gameLoop
                    playGame(message.guild.id, lobby.name, client);

                    // invite every added player
                    for(let i = 3; i < args.length; i++) {
                        addPlayer(mentionToId(args[i]), tabooGames[message.guild.id][lobby.name], message.guild, client);
                    }
                })
            }
        }
        //<< join puplic lobby <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        else if(args[0] === 'join')
        {
            joinLobby(message.author, args[1], message.guild, message.channel, client);
        }
        //<< list all lobbys on the server <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        else if(args[0] === 'list')
        {
            let lobbyList = new Discord.MessageEmbed()
                .setColor('#7c10c9')
                .setAuthor('taboo')
                .setTitle('Lobby-List');
            
            // check if there are open lobbies in this guild
            if(!(message.guild.id in tabooGames)) return message.channel.send(':x: There are no open lobbies on this server.');

            // add lobbies to the list
            for(l in tabooGames[message.guild.id]) {
                let lobby = tabooGames[message.guild.id][l];

                if(lobby.public) lobbyList.addField('\u200B', `${lobby.name} (public)`);
                else lobbyList.addField('\u200B', `${lobby.name} (private)`);
            }

            // send lobby-list
            message.channel.send(lobbyList);
        }
        //<< show local stats <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        else if(args[0] === 'stats')
        {
            // coming soon
            message.channel.send(':construction_worker: Comming soon!');
        }
        //<< show global stats <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        else if(args[0] === 'gstats')
        {
            // coming soon
            message.channel.send(':construction_worker: Comming soon!');
        }
    }
}



//== helper functions =======================================================================================================================================================================

async function joinLobby(playerId, lobbyName, guild, errChannel, client)
{
    // check if lobby exists
    if(!(guild.id in tabooGames) || !(lobbyName in tabooGames[guild.id])) return errChannel.send(`:x: This lobby doesn't exist.`);

    // check if player is already a member of the lobby
    for(p of tabooGames[guild.id][lobbyName].players) {
        if(p.id === playerId) return errChannel.send(':x: You are already a member of this lobby.');
    }

    // check if player is banned
    for(p of tabooGames[guild.id][lobbyName].bannedPlayers) {
        if(p.id === playerId) return errChannel.send(':x: You are banned from this lobby.');
    }

    // check if player is already a member of another lobby
    for(g in tabooGames) {
        for(lobby in tabooGames[g]) {
            for(p of tabooGames[g][lobby].players) {
                if(p.id === playerId) return errChannel.send(':x: You are already playing in another lobby.');
            }
        }
    }

    // add player to the lobby
    let player = guild.members.cache.get(playerId).user;
    tabooGames[guild.id][lobbyName].players.push(player);

    // add lobby channel permissions for the player
    let channel = await client.channels.fetch(tabooGames[guild.id][lobbyName].channelId)
    channel.overwritePermissions([{
        id : playerId,
        allow : ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
        deny : ['SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'MENTION_EVERYONE']
    }]);

    // send confirmation message
    channel.send(`:arrow_forward: ${idToMention(playerId)} joined the lobby.`);
}

async function addPlayer(playerId, lobby, guild, client)
{
    // get player from id
    let player = guild.members.cache.get(playerId).user;

    // ask player if he wants to join lobby
    player.send(`:bell: You've got asked to join the taboo lobby '${lobby.name}' on the server '${guild.name}' by '${lobby.owner.username}'`);
    player.send('Do you want to join? (y/n)')

    // wait for answer
    client.on('message', message => {
        if(!(message.channel.type === 'dm')) return;
        if(!(message.channel.recipient.id === playerId) || message.author.bot) return;

        if(message.content.toLowerCase() === 'y' || message.content.toLowerCase() === 'yes') {
            joinLobby(playerId, lobby.name, guild, player, client);
        }
        else {
            player.send(':x: You have rejected the invitations.');
        }
    })
}



//== game ===================================================================================================================================================================================

async function playGame(guildId, lobbyName, client)
{
    const tabooWords = JSON.parse(fs.readFileSync('data/tabooWords.json'));
    let lobby = tabooGames[guildId][lobbyName];
    const channel = await client.channels.fetch(lobby.channelId);

    //== game loop ==========================================================================================================================================================================

    let answer;

    waitForGameStart();
    async function waitForGameStart()
    {
        answer = await catchMessage(channel, (m) => m.content.toLowerCase() === '-start' && m.author.id === lobby.owner.id, client);

        // don't start if there are less then 2 player
        if(lobby.players.length < 2) {
            channel.send(':x: There have to be at least two players to start the game.');
            waitForGameStart();
            return;
        }

        // else start the game
        startGame(0)
    }

    async function startGame(turn)
    {
        let explainingPlayer = lobby.players[turn];
        let wordToExplain = tabooWords[randomInt(0, tabooWords.length)];
        const tabooCard = new Discord.MessageEmbed()
            .setColor('#7c10c9')
            .setAuthor('Taboo Card')
            .setTitle(wordToExplain.word)
            .addFields(
                {name : 'taboos:', value : `${wordToExplain.taboo1} \n ${wordToExplain.taboo2} \n ${wordToExplain.taboo3} \n ${wordToExplain.taboo4}`}
            );

        // send word to explain to the explaining player
        explainingPlayer.send(tabooCard);
        channel.send(`${idToMention(explainingPlayer.id)} has to start explaining.`);

        // catch the message with the right answer and send a message with who won
        const filter = (m) => (m.content.toLowerCase() === wordToExplain.word.toLowerCase() && !(m.author.bot));
        answer = await catchMessage(channel, filter, client);

        channel.send(`:white_check_mark: ${idToMention(answer.author.id)} guessed the word correctly.`);
        channel.send('The card was:');
        channel.send(tabooCard);
        explainingPlayer.send(`:white_check_mark: The word was guessed.`);

        // if the round isn't over start the next turn
        if(turn < lobby.players.length - 1) return startGame(turn + 1);

        // else ask if they want to play another round
        askForNewRound();
    }

    async function askForNewRound()
    {
        channel.send('Do you want to play another round? (y/n)');

        answer = await catchMessage(channel, (m) => (m.content.toLowerCase() === 'y' || m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'n' || m.content.toLowerCase() === 'no') && m.author.id === lobby.owner.id, client);

        // if answer is yes start a new round
        if(answer.content.toLowerCase() === 'y' || answer.content.toLowerCase() === 'yes') return startGame(0);

        // if answer is no delete the lobby and channel
        if(answer.content.toLowerCase() === 'n' || answer.content.toLowerCase() === 'no') {
            delete tabooGames[guildId][lobbyName];
            channel.delete();
            return;
        }
    }

    //== ingame command collector ===========================================================================================================================================================

    const prefix = '-';

    client.on('message', message => {
        // only collect messages from within the lobby channel
        if(message.channel != channel || message.author.bot) return;

        // delete every meassage which is not from a lobby member
        let isInLobby;
        for(player of lobby.players) {
            if(player.id === message.author.id) {
                isInLobby = true;
                break;
            }
        }
        if(!isInLobby) return message.delete();

        // only collect messages starting with the prefix
        if(!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).split(' ');
        const instruction = args.shift().toLowerCase();

        if(instruction === 'leave')
        {
            // check if player is in lobby
            for(player of lobby.players) {
                if(player.id === message.author.id) {
                    leaveLobby(player.id);
                    return;
                }
            }

            // if not send error message#
            channel.send(':x: You are not a member of this lobby.');
        }
        else if(instruction === 'kick')
        {
            // check if message comes from owner
            if(message.author != lobby.owner) return channel.send(':warning: Only the owner of the lobby can kick players.')

            playerId = mentionToId(args[0])

            // check if player is in lobby
            for(player of lobby.players) {
                if(player.id === playerId) {
                    kickPlayer(playerId);
                    return;
                }
            }

            // if not send error message
            channel.send(':x: This user is not a member of this lobby.');
        }
        else if(instruction === 'unban')
        {
            // check if message comes from owner
            if(message.author != lobby.owner) return channel.send(':warning: Only the owner of the lobby can unban players.')

            playerId = mentionToId(args[0])

            // check if player is in banned in the lobby
            for(player of lobby.bannedPlayers) {
                if(player.id === playerId) {
                    unbanPlayer(playerId);
                    return;
                }
            }

            // if not send error message
            channel.send(':x: This user is not a player who is banned in this lobby.');
        }
        else if(instruction === 'add')
        {
            // check if someone got added
            if(!args[0] || (!args[0].startsWith('<') && !args[0].endsWith('>'))) return message.channel.send(':x: You need to @ someone.')

            // ask player to join
            addPlayer(mentionToId(args[0]), lobby, message.guild, client);
        }
    })

    //== ingame commands ====================================================================================================================================================================

    async function leaveLobby(playerId)
    {
        // remove player permissions from channel
        channel.updateOverwrite(player, {
            VIEW_CHANNEL : null,
            SEND_MESSAGES : null,
            READ_MESSAGE_HISTORY : null
        });

        // remove player from the lobby
        for(let i = 0; i < lobby.players.length; i++) {
            if(lobby.players[i].id === playerId) tabooGames[guildId][lobbyName].players.splice(i, 1);
            channel.send(`:arrow_backward: ${idToMention(playerId)} left the lobby.`)
            return;
        }
    }

    async function kickPlayer(playerId)
    {
        // get user of playerID
        player = client.users.cache.find(user => user.id === playerId);

        if(!player) return channel.send(':x: You need to mention the person to kick them');

        // remove player permissions from channel
        channel.updateOverwrite(player, {
            VIEW_CHANNEL : null,
            SEND_MESSAGES : null,
            READ_MESSAGE_HISTORY : null
        });

        // remove player from the lobby
        for(let i = 0; i < lobby.players.length; i++) {
            if(lobby.players[i].id === player.id) {
                tabooGames[guildId][lobbyName].players.splice(i, 1);
                tabooGames[guildId][lobbyName].bannedPlayers.push(player);
                channel.send(`:arrow_backward: ${idToMention(playerId)} was kicked out of the lobby. You will never see him again.`);
                return;
            }
        }
    }

    async function unbanPlayer(playerId)
    {
        // remove player from banned list of the lobby
        for(let i = 0; i < lobby.bannedPlayers.length; i++) {
            if(lobby.bannedPlayers[i].id === playerId) {
                tabooGames[guildId][lobbyName].bannedPlayers.splice(i, 1);
                channel.send(`:unlock: ${idToMention(playerId)} was unbanned from this lobby.`);
                return;
            }
        }
    }
    //=======================================================================================================================================================================================
}