// #taboo          create          public          [lobby-name]          ([max. player])          : creates a public game lobby
// #taboo          join            [lobby-name]                                                   : joins a public lobby

// #taboo          create          private         [@member]                                      : creates a private lobby and asks everyone added to join
// #taboo          add             [@member]                                                      : asks the one added to join the private lobby

// #taboo          kick            [@member]                                                      : kicks the one added from the game lobby and prevents him from joining again if public
// #taboo          leave                                                                          : leaves the game lobby

// #taboo          list                                                                           : lists all the puplic game lobbys on the server right now
// #taboo          list            [lobby-name]                                                   : lists everyone playing in the game lobby
// #taboo          stats                                                                          : shows your own game stats
// #taboo          stats           [@member]                                                      : shows the game stats of the one added
// #taboo          gstats                                                                         : shows your own global game stats
// #taboo          gstats          [@member]                                                      : shows the global game stats of the one added