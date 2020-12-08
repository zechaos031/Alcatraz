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
module.exports = (client, member) => {

  if (member.user === client.user) return;

  const memberLogId = client.db.settings.selectMemberLogId.pluck().get(member.guild.id);
  const memberLog = member.guild.channels.cache.get(memberLogId);
  if (
    memberLog &&
    memberLog.viewable &&
    memberLog.permissionsFor(member.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
  ) {
    memberLog.send({
      embed: {
        title: "Nouveau membre nous a quitté",
        thumbnail: {
          url: member.user.displayAvatarURL({dynamic: true})
        },
        author: {
          name: member.guild.name,
          icon_url: member.guild.iconURL({dynamic: true})
        },
        description: `${member} (**${member.user.tag}**)`
      },
      field: [
        {
          name: "Compte créé le",
          value: moment(member.user.createdAt).format('DD/MM/YYYY')
        }
      ],
      color: member.guild.me.displayHexColor
    })
  }

  let { leave_channel_id: leaveChannelId, leave_message: leaveMessage } =
    client.db.settings.selectLeaves.get(member.guild.id);
  const leaveChannel = member.guild.channels.cache.get(leaveChannelId);

  if (
    leaveChannel &&
    leaveChannel.viewable &&
    leaveChannel.permissionsFor(member.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS']) &&
    leaveMessage
  ) {
    leaveMessage = leaveMessage
      .replace(/`?\?member`?/g, member)
      .replace(/`?\?username`?/g, member.user.username)
      .replace(/`?\?tag`?/g, member.user.tag)
      .replace(/`?\?size`?/g, member.guild.members.cache.size);
    leaveChannel.send({
      embed:{
        description:leaveMessage,
        footer:{
          text:client.config.footer
        },
        image:{
          url:"https://i.imgur.com/OccZQPj.png"
        },
        color:"#2f3136"
      }
    })
  }

  client.db.users.updateCurrentMember.run(0, member.id, member.guild.id);
  client.db.users.wipeTotalPoints.run(member.id, member.guild.id);

};
