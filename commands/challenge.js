const { Client } = require("discord.js");
const { mentionIsRole, mentionToId, idToMention, isMention, catchMessageFrom, whiteFrameNumber, equals3, calculateSumInScope } = require("../functions");
const board = require("../data/tictactoeBoard");

module.exports = 
{
    name: 'challenge',
    description: 'you can challenge someone to a specific game.',
    challenges: ['tictactoe'],
    
    execute(message, args, client, Discord)
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
        const game = args[1].toLowerCase();
        
        if(challenger === opponent)
        {
            message.channel.send(':x: You can not play against yourself')
            return
        }



        if(game == 'tictactoe')
        {
            if(opponent === client.user.id) //==PvAI=================================================================================================================================
            {
                message.channel.send('You want to challenge me? So be it.');

                let turningPlayer = opponent
                const crossEmote = '<:Cross:792046790828359700>'
                const circleEmote = '<:Circle:792046790639484928>'
                const emoteOfPlayer = {
                    [opponent] : crossEmote,
                    [challenger] : circleEmote
                }

                if(!(board.hasOwnProperty(message.guild.id)))
                {
                    board[message.guild.id] = [
                        [whiteFrameNumber[0], whiteFrameNumber[1], whiteFrameNumber[2]],
                        [whiteFrameNumber[3], whiteFrameNumber[4], whiteFrameNumber[5]],
                        [whiteFrameNumber[6], whiteFrameNumber[7], whiteFrameNumber[8]],
                    ]
                }

                let available = []
                for(let i = 0; i < board[message.guild.id].length; i++)
                {
                    for(let j = 0; j < board[message.guild.id].length; j++)
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
                    {name: '\u200b', value: board[message.guild.id][0][0] + '\n\u200b\n' + board[message.guild.id][1][0] + '\n\u200b\n' + board[message.guild.id][2][0], inline: true},
                    {name: '\u200b', value: board[message.guild.id][0][1] + '\n\u200b\n' + board[message.guild.id][1][1] + '\n\u200b\n' + board[message.guild.id][2][1], inline: true},
                    {name: '\u200b', value: board[message.guild.id][0][2] + '\n\u200b\n' + board[message.guild.id][1][2] + '\n\u200b\n' + board[message.guild.id][2][2], inline: true}
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
                            for(let i = 0; i < board[message.guild.id].length; i++)
                            {
                                for(let j = 0; j < board[message.guild.id].length; j++)
                                {
                                    if(whiteFrameNumber.includes(board[message.guild.id][i][j]))
                                    {
                                        const fieldBefore = board[message.guild.id][i][j]
                                        board[message.guild.id][i][j] = crossEmote
                                        const score = minimax(board[message.guild.id], 0, false)
                                        // console.log(score)
                                        board[message.guild.id][i][j] = fieldBefore
                                        if(score > bestScore)
                                        {
                                            bestScore = score
                                            move = {i, j}
                                        }
                                    }
                                }
                            }
                            board[message.guild.id][move.i][move.j] = crossEmote
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
                            if(whiteFrameNumber.includes(board[message.guild.id][row][col]))
                            {
                                board[message.guild.id][row][col] = emoteOfPlayer[turningPlayer]
                            }
                            else
                            {   
                                message.channel.send(':x: You have to pick an emty field.')
                                gameLoop()
                                return
                            }
                        }

                        available = []
                        for(let i = 0; i < board[message.guild.id].length; i++)
                        {
                            for(let j = 0; j < board[message.guild.id].length; j++)
                            {
                                if(whiteFrameNumber.includes(board[message.guild.id][i][j]))
                                {
                                    available.push([i, j])
                                }
                            }
                        }

                        if(turningPlayer === opponent) tttEmbed.description = 'Turn: ' + idToMention(challenger)
                        else tttEmbed.description = 'Turn: ' + idToMention(opponent)
                        tttEmbed.fields[0].value = board[message.guild.id][0][0] + '\n\u200b\n' + board[message.guild.id][1][0] + '\n\u200b\n' + board[message.guild.id][2][0]
                        tttEmbed.fields[1].value = board[message.guild.id][0][1] + '\n\u200b\n' + board[message.guild.id][1][1] + '\n\u200b\n' + board[message.guild.id][2][1]
                        tttEmbed.fields[2].value = board[message.guild.id][0][2] + '\n\u200b\n' + board[message.guild.id][1][2] + '\n\u200b\n' + board[message.guild.id][2][2]

                        message.channel.send(tttEmbed)

                        const winner = checkWinner(board[message.guild.id], available)
                        if(winner !== 'noone won')
                        {
                            if(winner !== 'tie') message.channel.send(winner + ' ' + idToMention(turningPlayer) + ' won!')
                            else message.channel.send("It's a tie.")
                            message.channel.send('Try it again... Maybe you will win next time :zany_face:')
                            delete board[message.guild.id]
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
    
                    if(!(board.hasOwnProperty(message.guild.id)))
                    {
                        board[message.guild.id] = [
                            [whiteFrameNumber[0], whiteFrameNumber[1], whiteFrameNumber[2]],
                            [whiteFrameNumber[3], whiteFrameNumber[4], whiteFrameNumber[5]],
                            [whiteFrameNumber[6], whiteFrameNumber[7], whiteFrameNumber[8]],
                        ]
                    }
    
                    let available = []
                    for(let i = 0; i < board[message.guild.id].length; i++)
                    {
                        for(let j = 0; j < board[message.guild.id].length; j++)
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
                        {name: '\u200b', value: board[message.guild.id][0][0] + '\n\u200b\n' + board[message.guild.id][1][0] + '\n\u200b\n' + board[message.guild.id][2][0], inline: true},
                        {name: '\u200b', value: board[message.guild.id][0][1] + '\n\u200b\n' + board[message.guild.id][1][1] + '\n\u200b\n' + board[message.guild.id][2][1], inline: true},
                        {name: '\u200b', value: board[message.guild.id][0][2] + '\n\u200b\n' + board[message.guild.id][1][2] + '\n\u200b\n' + board[message.guild.id][2][2], inline: true}
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
                            if(whiteFrameNumber.includes(board[message.guild.id][row][col]))
                            {
                                board[message.guild.id][row][col] = emoteOfPlayer[turningPlayer]
                            }
                            else
                            {   
                                message.channel.send(':x: You have to pick an emty field.')
                                gameLoop()
                                return
                            }

                            available = []
                            for(let i = 0; i < board[message.guild.id].length; i++)
                            {
                                for(let j = 0; j < board[message.guild.id].length; j++)
                                {
                                    if(whiteFrameNumber.includes(board[message.guild.id][i][j]))
                                    {
                                        available.push([i, j])
                                    }
                                }
                            }
                            if(turningPlayer === opponent) tttEmbed.description = 'Turn: ' + idToMention(challenger)
                            else tttEmbed.description = 'Turn: ' + idToMention(opponent)
                            tttEmbed.fields[0].value = board[message.guild.id][0][0] + '\n\u200b\n' + board[message.guild.id][1][0] + '\n\u200b\n' + board[message.guild.id][2][0]
                            tttEmbed.fields[1].value = board[message.guild.id][0][1] + '\n\u200b\n' + board[message.guild.id][1][1] + '\n\u200b\n' + board[message.guild.id][2][1]
                            tttEmbed.fields[2].value = board[message.guild.id][0][2] + '\n\u200b\n' + board[message.guild.id][1][2] + '\n\u200b\n' + board[message.guild.id][2][2]
    
                            message.channel.send(tttEmbed)

                            const winner = checkWinner(board[message.guild.id], available)
                            if(winner !== 'noone won')
                            {
                                if(winner !== 'tie') message.channel.send(winner + ' ' + idToMention(turningPlayer) + ' won!')
                                else message.channel.send("It's a tie.")
                                delete board[message.guild.id]
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
        }
    }
}