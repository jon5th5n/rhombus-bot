module.exports = 
{
    whiteFrameNumber: ['<:White_Frame_1:792023762642927657>', '<:White_Frame_2:792024592457400342>', '<:White_Frame_3:792024593019568148>', '<:White_Frame_4:792024591177744426>', '<:White_Frame_5:792024592587030578>', '<:White_Frame_6:792024593044471848>', '<:White_Frame_7:792024591114436628>', '<:White_Frame_8:792024588103450624>', '<:White_Frame_9:792024567987961866>'],
    playDispatcher: [],

    idToMention: function(id)   // returns a mention string which can be used to mention the user with the specified ID
    {
        return String('<@!' + id + '>');
    },

    mentionToId: function(at)   // returns a ID string which got constructet from a mention string
    {
        if(at.includes('&'))
        {
            return String(at.slice(3, -1));
        }
        else if(at.includes('!'))
        {
            return String(at.slice(3, -1));
        }
        else
        {
            return String(at.slice(2, -1));
        }
    },

    mentionIsRole: function(at)  // is true if the mention is a server role
    {
        if(at.includes('&')) return true;
    },

    isMention: function(string)  // is true if the string is a mention
    {
        if(string.includes('<') && string.includes('>', string.length - 1) && string.includes('@', 1)) return true;
        else return false;
    },

    equals3 : function(a, b, c)
    {
        return (a==b && b==c && a==c)
    },

    calculateSumInScope: function(num, addend, scopemin, scopemax)
    {
        if(num + addend < scopemin)
        {
            return (scopemax + 1) + ((num + addend) - scopemin)
        }
        else if(num + addend > scopemax)
        {
            return (scopemin - 1) + ((num + addend) - scopemax)
        }
        else
        {
            return num + addend
        }

    },

    seperateNumber: function(num)
    {
        if(typeof num !== 'string')
        {
            num = String(num)
        }
        let numi = num
        for(i = 3; i <= num.length - 1; i += 3)
        {
           numi = [numi.slice(0, num.length - i), ',', numi.slice(num.length - i)].join('') 
        }
        return(numi)
    },

    catchMessageFrom: function(userid, guild, client)
    {
        return new Promise((resolve, reject) =>
        {
            client.on('message', message =>
            {
                if((message.author.bot || message.author.id !== userid) || message.guild.id !== guild) return
                resolve(message.content)
            })
        })
    },

    randomInt: function(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }
}