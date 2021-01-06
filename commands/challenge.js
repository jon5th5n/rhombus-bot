const { Client } = require("discord.js");
const { mentionIsRole, mentionToId, idToMention, isMention, catchMessageFrom, whiteFrameNumber, equals3, calculateSumInScope } = require("../functions");
const tictactoeBoard = require("../data/tictactoeBoard");
const connectfourBoard = require("../data/connectfourBoard");

module.exports = 
{
    name: 'challenge',
    description: 'you can challenge someone to a specific game.',
    challenges: ['tictactoe', 'connectfour'],
    
    async execute(message, args, client, Discord)
    {
        if(args[0] === undefined)
        {
            message.channel.send(':x: You need to specify against who you want to play and what game it should be.');
            return;
        }
        else if(!isMention(args[0]))
        {
            message.channel.send(':x: You need to mention a user first.');
            return;
        }
        else if(args[1] === undefined)
        {
            message.channel.send(':x: You need to specify what game you want to play.');
            return;
        }
        else if(!(this.challenges.includes(args[1].toLowerCase())))
        {
            message.channel.send(':x: You need to pick a valid game.');
            return;
        }

        const challenger = message.author.id;
        let opponent;
        if(!mentionIsRole(args[0]))
        {
            opponent = mentionToId(args[0]);
        }
        else
        {
            message.channel.send(':x: Please mention a user. Not a role.');
            return;
        }
        const challengerUser = await message.guild.members.fetch(challenger).then(guildMember => guildMember.user)
        const opponentUser = await message.guild.members.fetch(opponent).then(guildMember => guildMember.user)
        const game = args[1].toLowerCase();
        
        if(challenger === opponent)
        {
            message.channel.send(':x: You can not play against yourself')
            return
        }



        if(game == 'tictactoe') //>>Tic-Tac-Toe>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        {
            if(opponent === client.user.id) //==PvAI=================================================================================================================================
            {
                message.channel.send('You want to challange me to a game of Tic-Tac-Toe? So be it.')

                let turningPlayer = opponent
                const crossEmote = '<:Cross:792046790828359700>'
                const circleEmote = '<:Circle:792046790639484928>'
                const emoteOfPlayer = {
                    [opponent] : crossEmote,
                    [challenger] : circleEmote
                }

                if(!(tictactoeBoard.hasOwnProperty(message.guild.id)))
                {
                    tictactoeBoard[message.guild.id] = [
                        [whiteFrameNumber[0], whiteFrameNumber[1], whiteFrameNumber[2]],
                        [whiteFrameNumber[3], whiteFrameNumber[4], whiteFrameNumber[5]],
                        [whiteFrameNumber[6], whiteFrameNumber[7], whiteFrameNumber[8]],
                    ]
                }

                let available = []
                for(let i = 0; i < tictactoeBoard[message.guild.id].length; i++)
                {
                    for(let j = 0; j < tictactoeBoard[message.guild.id].length; j++)
                    {
                        available.push([i, j])
                    }
                }

                let tttEmbed = new Discord.MessageEmbed()
                .setColor('#F7740D')
                .setTitle('Tic-Tac-Toe')
                .setURL('https://de.wikipedia.org/wiki/Tic-Tac-Toe')
                .setDescription('Turn: ' + idToMention(opponent))
                .addFields(
                    {name: '\u200b', value: tictactoeBoard[message.guild.id][0][0] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][0] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][0], inline: true},
                    {name: '\u200b', value: tictactoeBoard[message.guild.id][0][1] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][1] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][1], inline: true},
                    {name: '\u200b', value: tictactoeBoard[message.guild.id][0][2] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][2] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][2], inline: true}
                )

                gameLoop()
                async function gameLoop()
                {
                    try
                    {
                        if(turningPlayer === opponent) //--AI's turn----------------------------------------------------------------------------------------------------------------
                        {
                            let bestScore = -Infinity
                            let move;
                            for(let i = 0; i < tictactoeBoard[message.guild.id].length; i++)
                            {
                                for(let j = 0; j < tictactoeBoard[message.guild.id].length; j++)
                                {
                                    if(whiteFrameNumber.includes(tictactoeBoard[message.guild.id][i][j]))
                                    {
                                        const fieldBefore = tictactoeBoard[message.guild.id][i][j]
                                        tictactoeBoard[message.guild.id][i][j] = crossEmote
                                        const score = minimax(tictactoeBoard[message.guild.id], 0, false)
                                        // console.log(score)
                                        tictactoeBoard[message.guild.id][i][j] = fieldBefore
                                        if(score > bestScore)
                                        {
                                            bestScore = score
                                            move = {i, j}
                                        }
                                    }
                                }
                            }
                            tictactoeBoard[message.guild.id][move.i][move.j] = crossEmote
                        }
                        else //--Player's turn--------------------------------------------------------------------------------------------------------------------------------------
                        {
                            const answer = await catchMessageFrom(turningPlayer, message.guild.id, client)
                            if(!(parseInt(answer) > 0 && parseInt(answer) <= 9))
                            {
                                if(answer === 'stop')
                                {
                                    message.channel.send(':exclamation: You stoped the game.')
                                }
                                else
                                {
                                    message.channel.send(':x: You need to select a number between 1 and 9.')
                                    gameLoop()
                                }
                                return
                            }

                            let row = (Math.ceil(answer/3) - 1)
                            let col = calculateSumInScope((answer % 3), -1, 0, 2)
                            if(whiteFrameNumber.includes(tictactoeBoard[message.guild.id][row][col]))
                            {
                                tictactoeBoard[message.guild.id][row][col] = emoteOfPlayer[turningPlayer]
                            }
                            else
                            {   
                                message.channel.send(':x: You have to pick an emty field.')
                                gameLoop()
                                return
                            }
                        }

                        available = []
                        for(let i = 0; i < tictactoeBoard[message.guild.id].length; i++)
                        {
                            for(let j = 0; j < tictactoeBoard[message.guild.id].length; j++)
                            {
                                if(whiteFrameNumber.includes(tictactoeBoard[message.guild.id][i][j]))
                                {
                                    available.push([i, j])
                                }
                            }
                        }

                        if(turningPlayer === opponent) tttEmbed.description = 'Turn: ' + idToMention(challenger)
                        else tttEmbed.description = 'Turn: ' + idToMention(opponent)
                        tttEmbed.fields[0].value = tictactoeBoard[message.guild.id][0][0] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][0] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][0]
                        tttEmbed.fields[1].value = tictactoeBoard[message.guild.id][0][1] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][1] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][1]
                        tttEmbed.fields[2].value = tictactoeBoard[message.guild.id][0][2] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][2] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][2]

                        message.channel.send(tttEmbed)

                        const winner = checkWinner(tictactoeBoard[message.guild.id], available)
                        if(winner !== 'noone won')
                        {
                            if(winner !== 'tie') message.channel.send(winner + ' ' + idToMention(turningPlayer) + ' won!')
                            else message.channel.send("It's a tie.")
                            message.channel.send('Try it again... Maybe you will win next time :zany_face:')
                            delete tictactoeBoard[message.guild.id]
                        }
                        else
                        {
                            if(turningPlayer === opponent) turningPlayer = challenger
                            else turningPlayer = opponent
                            gameLoop()
                        }
                    }
                    catch(err)
                    {
                        console.log(err)
                    }
                }

                function minimax(boardi, depth, isMaximizing)
                {
                    const result = checkWinner(boardi, available)
                    if(result !== 'noone won')
                    {
                        let score
                        if(result === crossEmote) score = 1
                        else if(result === circleEmote) score = -1
                        else if(result === 'tie') score = 0
                        return score
                    }

                    if(isMaximizing)
                    {
                        let bestScore = -Infinity
                        for(let i = 0; i < boardi.length; i++)
                        {
                            for(let j = 0; j < boardi.length; j++)
                            {
                                if(whiteFrameNumber.includes(boardi[i][j]))
                                {
                                    const fieldBefore = boardi[i][j]
                                    boardi[i][j] = crossEmote
                                    const score = minimax(boardi, depth + 1, false)
                                    boardi[i][j] = fieldBefore
                                    bestScore = Math.max(score, bestScore)
                                }
                            }
                        }
                        return bestScore
                    }
                    else
                    {
                        let bestScore = Infinity
                        for(let i = 0; i < boardi.length; i++)
                        {
                            for(let j = 0; j < boardi.length; j++)
                            {
                                if(whiteFrameNumber.includes(boardi[i][j]))
                                {
                                    const fieldBefore = boardi[i][j]
                                    boardi[i][j] = circleEmote
                                    const score = minimax(boardi, depth + 1, true)
                                    boardi[i][j] = fieldBefore
                                    bestScore = Math.min(score, bestScore)
                                }
                            }
                        }
                        return bestScore
                    }
                }
            }
            else //==PvP=============================================================================================================================================================
            {
                message.channel.send(idToMention(opponent) + ' you got challenged by ' + idToMention(challenger) + ' to play a game of Tic-Tac-Toe!');
                message.channel.send('Do you want to participate?');

                waitForAccept()
                async function waitForAccept()
                {
                    try
                    {
                        const answer = await catchMessageFrom(opponent, message.guild.id, client)
                        if(answer === 'yes')
                        {
                            message.channel.send('The challenge got accepted!')
                            startTicTacToe()
                        }
                        else
                        {
                            message.channel.send('The challenge got rejected!')
                            return
                        }
                    }
                    catch(err)
                    {
                        console.log(err)
                    }
                }
    
                function startTicTacToe()
                {
                    message.channel.send("Let's Play!")
    
                    let turningPlayer = opponent
                    const crossEmote = '<:Cross:792046790828359700>'
                    const circleEmote = '<:Circle:792046790639484928>'
                    const emoteOfPlayer = {
                        [opponent] : crossEmote,
                        [challenger] : circleEmote
                    }
    
                    if(!(tictactoeBoard.hasOwnProperty(message.guild.id)))
                    {
                        tictactoeBoard[message.guild.id] = [
                            [whiteFrameNumber[0], whiteFrameNumber[1], whiteFrameNumber[2]],
                            [whiteFrameNumber[3], whiteFrameNumber[4], whiteFrameNumber[5]],
                            [whiteFrameNumber[6], whiteFrameNumber[7], whiteFrameNumber[8]],
                        ]
                    }
    
                    let available = []
                    for(let i = 0; i < tictactoeBoard[message.guild.id].length; i++)
                    {
                        for(let j = 0; j < tictactoeBoard[message.guild.id].length; j++)
                        {
                            available.push([i, j])
                        }
                    }
    
                    let tttEmbed = new Discord.MessageEmbed()
                    .setColor('#F7740D')
                    .setTitle('Tic-Tac-Toe')
                    .setURL('https://de.wikipedia.org/wiki/Tic-Tac-Toe')
                    .setDescription('Turn: ' + idToMention(opponent))
                    .addFields(
                        {name: '\u200b', value: tictactoeBoard[message.guild.id][0][0] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][0] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][0], inline: true},
                        {name: '\u200b', value: tictactoeBoard[message.guild.id][0][1] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][1] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][1], inline: true},
                        {name: '\u200b', value: tictactoeBoard[message.guild.id][0][2] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][2] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][2], inline: true}
                    )
                    
                    message.channel.send(tttEmbed)
                    
                    gameLoop()
                    async function gameLoop()
                    {
                        try
                        {
                            const answer = await catchMessageFrom(turningPlayer, message.guild.id, client)
                            if(!(parseInt(answer) > 0 && parseInt(answer) <= 9))
                            {
                                if(answer === 'stop')
                                {
                                    message.channel.send(':exclamation: You stoped the game.')
                                }
                                else
                                {
                                    message.channel.send(':x: You need to select a number between 1 and 9.')
                                    gameLoop()
                                }
                                return
                            }
    
                            let row = (Math.ceil(answer/3) - 1)
                            let col = calculateSumInScope((answer % 3), -1, 0, 2)
                            if(whiteFrameNumber.includes(tictactoeBoard[message.guild.id][row][col]))
                            {
                                tictactoeBoard[message.guild.id][row][col] = emoteOfPlayer[turningPlayer]
                            }
                            else
                            {   
                                message.channel.send(':x: You have to pick an emty field.')
                                gameLoop()
                                return
                            }

                            available = []
                            for(let i = 0; i < tictactoeBoard[message.guild.id].length; i++)
                            {
                                for(let j = 0; j < tictactoeBoard[message.guild.id].length; j++)
                                {
                                    if(whiteFrameNumber.includes(tictactoeBoard[message.guild.id][i][j]))
                                    {
                                        available.push([i, j])
                                    }
                                }
                            }
                            if(turningPlayer === opponent) tttEmbed.description = 'Turn: ' + idToMention(challenger)
                            else tttEmbed.description = 'Turn: ' + idToMention(opponent)
                            tttEmbed.fields[0].value = tictactoeBoard[message.guild.id][0][0] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][0] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][0]
                            tttEmbed.fields[1].value = tictactoeBoard[message.guild.id][0][1] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][1] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][1]
                            tttEmbed.fields[2].value = tictactoeBoard[message.guild.id][0][2] + '\n\u200b\n' + tictactoeBoard[message.guild.id][1][2] + '\n\u200b\n' + tictactoeBoard[message.guild.id][2][2]
    
                            message.channel.send(tttEmbed)

                            const winner = checkWinner(tictactoeBoard[message.guild.id], available)
                            if(winner !== 'noone won')
                            {
                                if(winner !== 'tie') message.channel.send(winner + ' ' + idToMention(turningPlayer) + ' won!')
                                else message.channel.send("It's a tie.")
                                delete tictactoeBoard[message.guild.id]
                            }
                            else
                            {
                                if(turningPlayer === opponent) turningPlayer = challenger
                                else turningPlayer = opponent
                                gameLoop()
                            }
                        }
                        catch(err)
                        {
                            console.log(err)
                        }
                    }
                }
            }
            
            function checkWinner(boardi, available)
            {
                for(let i = 0; i < boardi.length; i++)
                {
                    if(equals3(boardi[i][0], boardi[i][1], boardi[i][2]))
                    {
                        if(!whiteFrameNumber.includes(boardi[i][0]))
                        {
                            return boardi[i][0]
                        }
                    }
                    if(equals3(boardi[0][i], boardi[1][i], boardi[2][i]))
                    {
                        if(!whiteFrameNumber.includes(boardi[0][i]))
                        {
                            return boardi[0][i]
                        }
                    }
                }
                if(equals3(boardi[0][0], boardi[1][1], boardi[2][2]))
                {
                    if(!whiteFrameNumber.includes(boardi[0][0]))
                        {
                            return boardi[0][0]
                        }
                }
                if(equals3(boardi[2][0], boardi[1][1], boardi[0][2]))
                {
                    if(!whiteFrameNumber.includes(boardi[2][0]))
                        {
                            return boardi[2][0]
                        }
                }
                if(available.length <= 0)
                {
                    return 'tie'
                }
                return 'noone won'
            }
        } //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

        else if(game === 'connectfour') //>>Connect Four>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        {
            if(opponent === client.user.id) //==PvAI=====================================================================================================================================
            {
                message.channel.send('You want to challange me to a game of Connect Four? So be it.')
                return
            }
            else //==PvP=================================================================================================================================================================
            {
                message.channel.send(idToMention(opponent) + ' you got challenged by ' + idToMention(challenger) + ' to play a game of Connect Four!');
                message.channel.send('Do you want to participate?');

                waitForAccept()
                async function waitForAccept()
                {
                    try
                    {
                        const answer = await catchMessageFrom(opponent, message.guild.id, client)
                        if(answer === 'yes')
                        {
                            message.channel.send('The challenge got accepted!')
                            startConnectFour()
                        }
                        else
                        {
                            message.channel.send('The challenge got rejected!')
                            return
                        }
                    }
                    catch(err)
                    {
                        console.log(err)
                    }
                }

                function startConnectFour()
                {
                    message.channel.send("Let's Play!")
    
                    let turningPlayer = opponent
                    const redCircle = ':red_circle:'
                    const blueCircle = ':blue_circle:'
                    const emoteOfPlayer = {
                        [opponent] : redCircle,
                        [challenger] : blueCircle
                    }
                    let challengerStones = 21
                    let opponentStones = 21

                    if(!(connectfourBoard.hasOwnProperty(message.guild.id)))
                    {
                        connectfourBoard[message.guild.id] = [
                            [':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:'],
                            [':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:'],
                            [':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:'],
                            [':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:'],
                            [':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:'],
                            [':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:'],
                            [':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:', ':black_circle:']
                        ]
                    }

                    let cfEmbed = new Discord.MessageEmbed()
                    .setColor('#F7740D')
                    .setTitle('Connect Four')
                    .setURL('https://en.wikipedia.org/wiki/Connect_Four')
                    .setDescription('Turn: ' + idToMention(opponent))
                    .addFields(
                        {name: '<:white_one:796153361283416105><:white_two:796153370721255434><:white_three:796153371320385576><:white_four:796153365896888350><:white_five:796153369793396766><:white_six:796153371211202612><:white_seven:796153366567845888>',
                        value:
                        '<:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106>' + '\n' +
                        connectfourBoard[message.guild.id][0][0] + connectfourBoard[message.guild.id][1][0] + connectfourBoard[message.guild.id][2][0] + connectfourBoard[message.guild.id][3][0] + connectfourBoard[message.guild.id][4][0] + connectfourBoard[message.guild.id][5][0] + connectfourBoard[message.guild.id][6][0] + '\n' +
                        connectfourBoard[message.guild.id][0][1] + connectfourBoard[message.guild.id][1][1] + connectfourBoard[message.guild.id][2][1] + connectfourBoard[message.guild.id][3][1] + connectfourBoard[message.guild.id][4][1] + connectfourBoard[message.guild.id][5][1] + connectfourBoard[message.guild.id][6][1] + '\n' +
                        connectfourBoard[message.guild.id][0][2] + connectfourBoard[message.guild.id][1][2] + connectfourBoard[message.guild.id][2][2] + connectfourBoard[message.guild.id][3][2] + connectfourBoard[message.guild.id][4][2] + connectfourBoard[message.guild.id][5][2] + connectfourBoard[message.guild.id][6][2] + '\n' +
                        connectfourBoard[message.guild.id][0][3] + connectfourBoard[message.guild.id][1][3] + connectfourBoard[message.guild.id][2][3] + connectfourBoard[message.guild.id][3][3] + connectfourBoard[message.guild.id][4][3] + connectfourBoard[message.guild.id][5][3] + connectfourBoard[message.guild.id][6][3] + '\n' +
                        connectfourBoard[message.guild.id][0][4] + connectfourBoard[message.guild.id][1][4] + connectfourBoard[message.guild.id][2][4] + connectfourBoard[message.guild.id][3][4] + connectfourBoard[message.guild.id][4][4] + connectfourBoard[message.guild.id][5][4] + connectfourBoard[message.guild.id][6][4] + '\n' +
                        connectfourBoard[message.guild.id][0][5] + connectfourBoard[message.guild.id][1][5] + connectfourBoard[message.guild.id][2][5] + connectfourBoard[message.guild.id][3][5] + connectfourBoard[message.guild.id][4][5] + connectfourBoard[message.guild.id][5][5] + connectfourBoard[message.guild.id][6][5]
                    })
                    .setFooter(opponentUser.username + ': ' + opponentStones + ' | ' + challengerUser.username + ': ' + challengerStones)
                    
                    message.channel.send(cfEmbed)

                    gameLoop()
                    async function gameLoop()
                    {
                        try
                        {
                            const answer = await catchMessageFrom(turningPlayer, message.guild.id, client)
                            if(!(parseInt(answer) > 0 && parseInt(answer) <= 7))
                            {
                                if(answer === 'stop')
                                {
                                    message.channel.send(':exclamation: You stoped the game.')
                                }
                                else
                                {
                                    message.channel.send(':x: You need to select a number between 1 and 7.')
                                    gameLoop()
                                }
                                return
                            }

                            let row = 0
                            for(let i = connectfourBoard[message.guild.id][answer - 1].length - 1; i >= 0; i--)
                            {
                                if(!(connectfourBoard[message.guild.id][answer - 1][i] === ':black_circle:'))
                                {
                                    row = i + 1
                                    break
                                }
                            }

                            const piece = {
                                col: answer - 1,
                                row: row,
                                emote: emoteOfPlayer[turningPlayer]
                            }

                            connectfourBoard[message.guild.id][piece.col][piece.row] = piece.emote
                            if(turningPlayer === opponent) opponentStones -= 1
                            if(turningPlayer === challenger) challengerStones -= 1

                            if(turningPlayer === opponent) cfEmbed.description = 'Turn: ' + idToMention(challenger)
                            else cfEmbed.description = 'Turn: ' + idToMention(opponent)
                            cfEmbed.fields[0].value = '<:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106><:white_arrow_down:796153329980932106>' + '\n' +
                                                        connectfourBoard[message.guild.id][0][5] + connectfourBoard[message.guild.id][1][5] + connectfourBoard[message.guild.id][2][5] + connectfourBoard[message.guild.id][3][5] + connectfourBoard[message.guild.id][4][5] + connectfourBoard[message.guild.id][5][5] + connectfourBoard[message.guild.id][6][5] + '\n' +
                                                        connectfourBoard[message.guild.id][0][4] + connectfourBoard[message.guild.id][1][4] + connectfourBoard[message.guild.id][2][4] + connectfourBoard[message.guild.id][3][4] + connectfourBoard[message.guild.id][4][4] + connectfourBoard[message.guild.id][5][4] + connectfourBoard[message.guild.id][6][4] + '\n' +
                                                        connectfourBoard[message.guild.id][0][3] + connectfourBoard[message.guild.id][1][3] + connectfourBoard[message.guild.id][2][3] + connectfourBoard[message.guild.id][3][3] + connectfourBoard[message.guild.id][4][3] + connectfourBoard[message.guild.id][5][3] + connectfourBoard[message.guild.id][6][3] + '\n' +
                                                        connectfourBoard[message.guild.id][0][2] + connectfourBoard[message.guild.id][1][2] + connectfourBoard[message.guild.id][2][2] + connectfourBoard[message.guild.id][3][2] + connectfourBoard[message.guild.id][4][2] + connectfourBoard[message.guild.id][5][2] + connectfourBoard[message.guild.id][6][2] + '\n' +
                                                        connectfourBoard[message.guild.id][0][1] + connectfourBoard[message.guild.id][1][1] + connectfourBoard[message.guild.id][2][1] + connectfourBoard[message.guild.id][3][1] + connectfourBoard[message.guild.id][4][1] + connectfourBoard[message.guild.id][5][1] + connectfourBoard[message.guild.id][6][1] + '\n' +
                                                        connectfourBoard[message.guild.id][0][0] + connectfourBoard[message.guild.id][1][0] + connectfourBoard[message.guild.id][2][0] + connectfourBoard[message.guild.id][3][0] + connectfourBoard[message.guild.id][4][0] + connectfourBoard[message.guild.id][5][0] + connectfourBoard[message.guild.id][6][0]
                            cfEmbed.footer.text = String(opponentUser.username + ': ' + opponentStones + ' | ' + challengerUser.username + ': ' + challengerStones)
                            message.channel.send(cfEmbed)

                            const winner = checkWinner(connectfourBoard[message.guild.id], opponentStones, challengerStones)
                            if(winner !== 'noone won')
                            {
                                if(winner !== 'tie') message.channel.send(winner + ' ' + idToMention(turningPlayer) + ' won!')
                                else message.channel.send("It's a tie.")
                                delete connectfourBoard[message.guild.id]
                            }
                            else
                            {
                                if(turningPlayer === opponent) turningPlayer = challenger
                                else turningPlayer = opponent
                                gameLoop()
                            }
                        }
                        catch(err)
                        {
                            console.log(err)
                        }
                    }
                }
            }

            function checkWinner(board, opponentStones, challengerStones)
            {
                if(challengerStones === 0 && opponentStones === 0) return 'tie'

                for(let i = 0; i < board.length; i++)
                {
                    for(let j = 0; j < board[i].length; j++)
                    {
                        if(p(i, j, board) !== 0 && p(i, j, board) !== ':black_circle:' && p(i, j, board) === p(i + 1, j, board) && p(i, j, board) === p(i + 2, j, board) && p(i, j, board) === p(i + 3, j, board))
                        {
                            return p(i, j, board)
                        }
                        else if(p(i, j, board) !== 0 && p(i, j, board) !== ':black_circle:' && p(i, j, board) === p(i, j + 1, board) && p(i, j, board) === p(i, j + 2, board) && p(i, j, board) === p(i, j + 3, board))
                        {
                            return p(i, j, board)
                        }
                        else if(p(i, j, board) !== 0 && p(i, j, board) !== ':black_circle:' && p(i, j, board) === p(i + 1, j + 1, board) && p(i, j, board) === p(i + 2, j + 2, board) && p(i, j, board) === p(i + 3, j + 3, board))
                        {
                            return p(i, j, board)
                        }
                        else if(p(i, j, board) !== 0 && p(i, j, board) !== ':black_circle:' && p(i, j, board) === p(i + 1, j - 1, board) && p(i, j, board) === p(i + 2, j - 2, board) && p(i, j, board) === p(i + 3, j - 3, board))
                        {
                            return p(i, j, board)
                        }
                    }
                }

                return 'noone won'
            }
            function p(col, row, board)
            {
                if(col < 0 || row < 0 || col >= 7 || row >= 6) return 0
                else return board[col][row]
            }
        }
    }
}