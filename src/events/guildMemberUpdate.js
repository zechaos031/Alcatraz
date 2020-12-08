const { MessageEmbed } = require('discord.js');

module.exports = (client, oldMember, newMember) => {
  let embed ={}
 Object.assign({
   embed:{
     author: {
       name: member.guild.name,
       icon_url: member.guild.iconURL({dynamic: true})
     },
     timestamp: new Date(),
     color:oldMember.guild.me.displayHexColor
   }
 },embed)

  if (oldMember.nickname !== newMember.nickname) {
    const nicknameLogId = client.db.settings.selectNicknameLogId.pluck().get(oldMember.guild.id);
    const nicknameLog = oldMember.guild.channels.cache.get(nicknameLogId);
    if (
      nicknameLog &&
      nicknameLog.viewable &&
      nicknameLog.permissionsFor(oldMember.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
    ) {
      const oldNickname = oldMember.nickname || '`Aucun`';
      const newNickname = newMember.nickname || '`Aucun`';
      Object.assign({
        embed:{
          title:"Mise à jour des membres: `Pseudo`",
          description:`${newMember} ton surnom a été modifié.`,
          field:[{
            name:'Surnom',
            value: `${oldNickname} ➔ ${newNickname}`
          }]
        }
      })
      nicknameLog.send(embed);
    }
  }

  if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    const roleLogId = client.db.settings.selectRoleLogId.pluck().get(oldMember.guild.id);
    const roleLog = oldMember.guild.channels.cache.get(roleLogId);
    if (
      roleLog &&
      roleLog.viewable &&
      roleLog.permissionsFor(oldMember.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
    ) {
      const role = newMember.roles.cache.difference(oldMember.roles.cache).first();
      embed
        .setTitle('Mise à jour des membres: `Rôle ajouter`')
        .setDescription(`${newMember} as reçu le rôle ${role}.`);
      roleLog.send(embed);
    }
  }

  // Role remove
  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    // Get role log
    const roleLogId = client.db.settings.selectRoleLogId.pluck().get(oldMember.guild.id);
    const roleLog = oldMember.guild.channels.cache.get(roleLogId);
    if (
      roleLog &&
      roleLog.viewable &&
      roleLog.permissionsFor(oldMember.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
    ) {
      const role = oldMember.roles.cache.difference(newMember.roles.cache).first();
      embed
        .setTitle('Mise à jour des membres: `Rôle supprimer`')
        .setDescription(`${newMember} as perdu le rôle ${role}.`);
      roleLog.send(embed);
    }
  }
};
