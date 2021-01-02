const { Client } = require("discord.js");
const { mentionIsRole, mentionToId, idToMention, isMention, catchMessageFrom, whiteFrameNumber, equals3, calculateSumInScope } = require("../functions");

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
            if(opponent === client.user.id)
            {
                message.channel.send('You want to challenge me? So be it.');
            }
            else
            {
                message.channel.send(idToMention(opponent) + ' you got challanged by ' + idToMention(challenger) + ' to play a game of Tic-Tac-Toe!');
                message.channel.send('Do you want to participate?');
            }
            
            function checkWinner(board, available)
            {
                return new Promise((resolve, reject) =>
                {
                    for(i = 0; i < board.length; i++)
                    {
                        if(equals3(board[i][0], board[i][1], board[i][2]))
                        {
                            if(!whiteFrameNumber.includes(board[i][0]))
                            {
                                resolve(board[i][0])
                            }
                        }
                        if(equals3(board[0][i], board[1][i], board[2][i]))
                        {
                            if(!whiteFrameNumber.includes(board[0][i]))
                            {
                                resolve(board[0][i])
                            }
                        }
                    }
                    if(equals3(board[0][0], board[1][1], board[2][2]))
                    {
                        if(!whiteFrameNumber.includes(board[0][0]))
                            {
                                resolve(board[0][0])
                            }
                    }
                    if(equals3(board[2][0], board[1][1], board[0][2]))
                    {
                        if(!whiteFrameNumber.includes(board[2][0]))
                            {
                                resolve(board[2][0])
                            }
                    }
                    if(available.length <= 0)
                    {
                        resolve('tie')
                    }
                    reject('noone won')
                })
            }

            waitForAccept()
            async function waitForAccept()
            {
                try
                {
                    const answer = await catchMessageFrom(opponent, client)
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
                let board = [
                    [whiteFrameNumber[0], whiteFrameNumber[1], whiteFrameNumber[2]],
                    [whiteFrameNumber[3], whiteFrameNumber[4], whiteFrameNumber[5]],
                    [whiteFrameNumber[6], whiteFrameNumber[7], whiteFrameNumber[8]],
                ]
                let available = []
                for(i = 0; i < board.length; i++)
                {
                    for(j = 0; j < board.length; j++)
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
                    {name: '\u200b', value: board[0][0] + '\n\u200b\n' + board[1][0] + '\n\u200b\n' + board[2][0], inline: true},
                    {name: '\u200b', value: board[0][1] + '\n\u200b\n' + board[1][1] + '\n\u200b\n' + board[2][1], inline: true},
                    {name: '\u200b', value: board[0][2] + '\n\u200b\n' + board[1][2] + '\n\u200b\n' + board[2][2], inline: true}
                )
                
                message.channel.send(tttEmbed)
                
                gameLoop()
                async function gameLoop()
                {
                    try
                    {
                        const answer = await catchMessageFrom(turningPlayer, client)
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
                        if(whiteFrameNumber.includes(board[row][col]))
                        {
                            board[row][col] = emoteOfPlayer[turningPlayer]
                        }
                        else
                        {   
                            message.channel.send(':x: You have to pick an emty field.')
                            gameLoop()
                            return
                        }                   
                        available = []
                        for(i = 0; i < board.length; i++)
                        {
                            for(j = 0; j < board.length; j++)
                            {
                                if(whiteFrameNumber.includes(board[i][j]))
                                {
                                    available.push([i, j])
                                }
                            }
                        }
                        if(turningPlayer === opponent) tttEmbed.description = 'Turn: ' + idToMention(challenger)
                        else tttEmbed.description = 'Turn: ' + idToMention(opponent)
                        tttEmbed.fields[0].value = board[0][0] + '\n\u200b\n' + board[1][0] + '\n\u200b\n' + board[2][0]
                        tttEmbed.fields[1].value = board[0][1] + '\n\u200b\n' + board[1][1] + '\n\u200b\n' + board[2][1]
                        tttEmbed.fields[2].value = board[0][2] + '\n\u200b\n' + board[1][2] + '\n\u200b\n' + board[2][2]

                        message.channel.send(tttEmbed)
                        const winner = await checkWinner(board, available)
                        if(winner)
                        {
                            if(winner !== 'tie') message.channel.send(winner + ' ' + idToMention(turningPlayer) + ' won!')
                            else message.channel.send("It's a tie.")
                        }
                    }
                    catch(err)
                    {
                        if(err === 'noone won')
                        {
                            if(turningPlayer === opponent) turningPlayer = challenger
                            else turningPlayer = opponent
                            gameLoop()
                        }
                    }
                }
            }
        }
    }
}