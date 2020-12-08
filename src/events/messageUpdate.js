//  ______   __                      __
// /      \ |  \                    |  \
//|  $$$$$$\| $$  _______  ______  _| $$_     ______   ______   ________
//| $$__| $$| $$ /       \|      \|   $$ \   /      \ |      \ |        \
//| $$    $$| $$|  $$$$$$$ \$$$$$$\\$$$$$$  |  $$$$$$\ \$$$$$$\ \$$$$$$$$
//| $$$$$$$$| $$| $$      /      $$ | $$ __ | $$   \$$/      $$  /    $$
//| $$  | $$| $$| $$_____|  $$$$$$$ | $$|  \| $$     |  $$$$$$$ /  $$$$_
//| $$  | $$| $$ \$$     \\$$    $$  \$$  $$| $$      \$$    $$|  $$    \
// \$$   \$$ \$$  \$$$$$$$ \$$$$$$$   \$$$$  \$$       \$$$$$$$ \$$$$$$$$
//=======================================================================
//● Crée par GalackQSM#0895 le 09 novembre 2020
//● Serveur Discord: https://discord.gg/HPtTfqDdMr
//● Github: https://github.com/GalackQSM/Alcatraz
//=======================================================================
module.exports = (client, oldMessage, newMessage) => {
let embed ={}
  if (newMessage.webhookID) return;

  if (
    newMessage.member &&
    newMessage.id === newMessage.member.lastMessageID &&
    !oldMessage.command
  ) {
    client.emit('message', newMessage);
  }

  Object.assign({
    embed:{
      author:{
        name:newMessage.author.tag,
        icon_url:newMessage.author.displayAvatarURL({ dynamic: true })
      },
      timestamp: new Date(),
      color:newMessage.guild.me.displayHexColor
    }

  })

  if (oldMessage.content !== newMessage.content) {

    const starboardChannelId = client.db.settings.selectStarboardChannelId.pluck().get(newMessage.guild.id);
    const starboardChannel = newMessage.guild.channels.cache.get(starboardChannelId);
    if (newMessage.channel === starboardChannel) return;

    const messageEditLogId = client.db.settings.selectMessageEditLogId.pluck().get(newMessage.guild.id);
    const messageEditLog = newMessage.guild.channels.cache.get(messageEditLogId);
    if (
      messageEditLog &&
      messageEditLog.viewable &&
      messageEditLog.permissionsFor(newMessage.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
    ) {

      if (newMessage.content.length > 1024) newMessage.content = newMessage.content.slice(0, 1021) + '...';
      if (oldMessage.content.length > 1024) oldMessage.content = oldMessage.content.slice(0, 1021) + '...';
      Object.assign({
        embed:{
          title:'Mise à jour du message: `Modifier`',
          description:`Le message de ${newMessage.member} dans ${newMessage.channel} a été modifié. [Voir le message!](${newMessage.url})`,
          field:[{
            name:'Avant',
            value:oldMessage.content
          },
            {
              name:'Après',
              value:newMessage.content
            }]
        }

      },embed)
      messageEditLog.send(embed);
    }
  }

  if (oldMessage.embeds.length > newMessage.embeds.length) {
    const messageDeleteLogId = client.db.settings.selectMessageDeleteLogId.pluck().get(newMessage.guild.id);
    const messageDeleteLog = newMessage.guild.channels.cache.get(messageDeleteLogId);
    if (
      messageDeleteLog &&
      messageDeleteLog.viewable &&
      messageDeleteLog.permissionsFor(newMessage.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
    ) {
      Object.assign({
        embed:{
          title:"Mise à jour du message: `Supprimer`",
        }
      },embed)
      if (oldMessage.embeds.length > 1)
        Object.assign({
          embed:{
            description:`Le message de ${newMessage.member} dans ${newMessage.channel} ont été supprimés.`,
          }
        },embed)
      else
        Object.assign({
          embed:{
            description:`Le message de ${newMessage.member} dans ${newMessage.channel} a été supprimée.`,
          }
        },embed)
      messageDeleteLog.send(embed);
    }
  }
};
